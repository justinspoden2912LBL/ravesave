import { createServerFn } from "@tanstack/react-start";
import { useSession as getTanstackSession } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { loadAiSettings, isGroqHealthy, invalidateAiSettingsCache } from "@/lib/aiSettings.server";
import { GROQ_BASE_URL, GROQ_DEFAULT_MODEL } from "@/lib/groq-provider";
import {
  OPENAI_TOOLS,
  TOOL_SCHEMAS,
  executeTool,
  readCurrent,
  revertChange,
  type Proposal,
  type ToolName,
} from "@/lib/copilotTools.server";
import { THEME_KEYS } from "@/lib/theme";

type AdminSession = { admin?: boolean; loginAt?: number };
const SESSION_MAX_AGE = 60 * 60 * 24;

function sessionConfig() {
  const password = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!password || password.length < 32) throw new Error("Server session secret missing");
  return {
    password,
    name: "rs_admin",
    maxAge: SESSION_MAX_AGE,
    cookie: { httpOnly: true, sameSite: "lax" as const, secure: true, path: "/" },
  };
}

async function isAdmin(): Promise<boolean> {
  try {
    const s = await getTanstackSession<AdminSession>(sessionConfig());
    if (!s.data.admin) return false;
    if (s.data.loginAt && Date.now() - s.data.loginAt > SESSION_MAX_AGE * 1000) {
      await s.clear();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Nicht angemeldet");
}

/* ------------------------------------------------------------------ Theme */

export const copilotGetTheme = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAdmin())) return null;
  const { data } = await supabaseAdmin.from("site_theme").select("key, value, label, category");
  const rows = (data ?? []) as { key: string; value: string | null; label: string | null; category: string }[];
  return rows.filter((r) => THEME_KEYS.includes(r.key));
});

const ThemeInput = z.object({
  values: z.record(z.string(), z.string().max(80)),
});

export const copilotSaveTheme = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ThemeInput.parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const now = new Date().toISOString();
    for (const [key, value] of Object.entries(data.values)) {
      if (!THEME_KEYS.includes(key)) continue;
      await supabaseAdmin.from("site_theme").upsert({ key, value, updated_at: now }, { onConflict: "key" });
    }
    return { ok: true };
  });

/* --------------------------------------------------------------- Historie */

export const copilotHistory = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAdmin())) return null;
  const { data } = await supabaseAdmin
    .from("admin_change_log")
    .select("id, tool, target, old_value, new_value, summary, reverted, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as {
    id: string;
    tool: string;
    target: string;
    old_value: string | null;
    new_value: string | null;
    summary: string | null;
    reverted: boolean;
    created_at: string;
  }[];
});

export const copilotRevert = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { data: row } = await supabaseAdmin
      .from("admin_change_log")
      .select("id, tool, target, old_value, reverted")
      .eq("id", data.id)
      .maybeSingle();
    if (!row) throw new Error("Eintrag nicht gefunden");
    await revertChange(row as { tool: string; target: string; old_value: string | null });
    await supabaseAdmin.from("admin_change_log").update({ reverted: true }).eq("id", data.id);
    invalidateAiSettingsCache();
    return { ok: true };
  });

/* ---------------------------------------------------------------- Copilot */

type ToolCall = { id?: string; function?: { name?: string; arguments?: string } };

async function callModel(messages: { role: string; content: string }[]) {
  const settings = await loadAiSettings();
  const groqKey = process.env.GROQ_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;

  const attempts: { url: string; headers: Record<string, string>; model: string; extra?: Record<string, unknown> }[] = [];
  if (settings.provider !== "lovable" && groqKey && (await isGroqHealthy(groqKey))) {
    attempts.push({
      url: `${GROQ_BASE_URL}/chat/completions`,
      headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
      model: settings.model || GROQ_DEFAULT_MODEL,
    });
  }
  if (settings.provider !== "groq" && lovableKey) {
    attempts.push({
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      headers: { "Lovable-API-Key": lovableKey, "Content-Type": "application/json" },
      model: "openai/gpt-5.6-sol",
      extra: { reasoning_effort: "none" },
    });
  }
  if (attempts.length === 0) throw new Error("Kein KI-Anbieter verfügbar. Manuelle Regler funktionieren weiterhin.");

  let lastError = "KI nicht erreichbar";
  for (const a of attempts) {
    try {
      const res = await fetch(a.url, {
        method: "POST",
        headers: a.headers,
        body: JSON.stringify({
          model: a.model,
          messages,
          tools: OPENAI_TOOLS,
          tool_choice: "auto",
          temperature: 0.2,
          ...(a.extra ?? {}),
        }),
      });
      if (!res.ok) {
        lastError = res.status === 429 ? "Zu viele Anfragen — kurz warten." : `KI-Fehler (${res.status})`;
        continue;
      }
      const json = (await res.json()) as {
        choices?: { message?: { content?: string | null; tool_calls?: ToolCall[] } }[];
      };
      const msg = json.choices?.[0]?.message;
      return { content: msg?.content ?? "", toolCalls: msg?.tool_calls ?? [] };
    } catch {
      lastError = "KI nicht erreichbar";
    }
  }
  throw new Error(lastError);
}

const SYSTEM = `Du bist der Admin-Copilot von "Rave Safe, have Fun".
Der Nutzer ist der Admin der Website und beschreibt in einfacher Sprache, was er ändern will.
Setze Wünsche in Tool-Aufrufe um. Rufe nur Tools auf, die zur Anfrage passen; sonst antworte kurz mit Rückfrage.
Regeln:
- Farben als CSS-Wert (Hex oder oklch). "wärmer/orange" -> z. B. #ff8a3d.
- Nutze exakte Keys aus dem Kontext unten. Erfinde keine Keys.
- Bei Textänderungen liefere den vollständigen neuen Text, nicht nur eine Beschreibung.
- Antworte auf Deutsch, maximal 3 Sätze, und beschreibe, was du vorschlägst.
- Du darfst keine Nutzerdaten, Statistiken oder Einsendungen löschen.`;

async function buildContext(): Promise<string> {
  const [{ data: flags }, { data: texts }, { data: content }] = await Promise.all([
    supabaseAdmin.from("feature_flags").select("key, label, enabled").limit(80),
    supabaseAdmin.from("ui_texts").select("key, value").limit(150),
    supabaseAdmin.from("site_content").select("key").limit(60),
  ]);
  const flagList = (flags ?? []).map((f) => `${f.key} (${f.label}) = ${f.enabled ? "an" : "aus"}`).join("; ");
  const textList = (texts ?? [])
    .map((t) => `${t.key}: ${String(t.value ?? "").slice(0, 60)}`)
    .join("\n");
  const contentList = (content ?? []).map((c) => c.key).join(", ");
  return `Theme-Keys: ${THEME_KEYS.join(", ")}
Feature-Flags: ${flagList}
Inhalt-Keys: ${contentList}
Text-Keys (Auszug):
${textList}`;
}

const PlanInput = z.object({ prompt: z.string().trim().min(2).max(1000) });

/** Erzeugt Änderungsvorschläge — schreibt nichts. */
export const copilotPlan = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlanInput.parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const context = await buildContext();
    const { content, toolCalls } = await callModel([
      { role: "system", content: SYSTEM },
      { role: "system", content: `Aktueller Stand:\n${context}` },
      { role: "user", content: data.prompt },
    ]);

    const proposals: Proposal[] = [];
    for (const call of toolCalls) {
      const name = call.function?.name as ToolName | undefined;
      if (!name || !(name in TOOL_SCHEMAS)) continue;
      let args: unknown;
      try {
        args = JSON.parse(call.function?.arguments ?? "{}");
      } catch {
        continue;
      }
      const parsed = TOOL_SCHEMAS[name].safeParse(args);
      if (!parsed.success) continue;
      const a = parsed.data as Record<string, unknown>;
      const target =
        name === "set_theme_token"
          ? `theme.${a.key}`
          : name === "set_feature_flag"
            ? `flag.${a.key}`
            : name === "set_ui_text"
              ? `text.${a.key}`
              : name === "set_site_content"
                ? `content.${a.key}`
                : name === "set_substance_override"
                  ? `substanz.${a.slug}.${a.field}`
                  : "ki.regeln";
      const newValue =
        name === "set_feature_flag"
          ? String(a.enabled)
          : name === "set_site_content"
            ? String(a.content)
            : name === "update_ai_rules"
              ? JSON.stringify(a)
              : String(a.value);
      proposals.push({
        tool: name,
        target,
        old_value: await readCurrent(name, a),
        new_value: newValue,
        summary: `${target} ändern`,
      });
    }

    return { reply: content || (proposals.length ? "Vorschlag erstellt." : "Keine passende Änderung gefunden."), proposals };
  });

const ApplyInput = z.object({
  proposals: z
    .array(
      z.object({
        tool: z.string(),
        target: z.string(),
        old_value: z.string().nullable(),
        new_value: z.string(),
        summary: z.string(),
      }),
    )
    .min(1)
    .max(20),
});

/** Führt die bestätigten Vorschläge aus und protokolliert sie. */
export const copilotApply = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ApplyInput.parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const results: { target: string; ok: boolean; error?: string }[] = [];

    for (const p of data.proposals) {
      const name = p.tool as ToolName;
      if (!(name in TOOL_SCHEMAS)) {
        results.push({ target: p.target, ok: false, error: "Unbekanntes Tool" });
        continue;
      }
      // Argumente aus target + new_value rekonstruieren
      const [kind, ...rest] = p.target.split(".");
      const id = rest.join(".");
      let args: Record<string, unknown>;
      if (kind === "theme") args = { key: id, value: p.new_value };
      else if (kind === "flag") args = { key: id, enabled: p.new_value === "true" };
      else if (kind === "text") args = { key: id, value: p.new_value };
      else if (kind === "content") args = { key: id, content: p.new_value };
      else if (kind === "substanz") {
        const [slug, field] = id.split(".");
        args = { slug, field, value: p.new_value };
      } else {
        try {
          args = JSON.parse(p.new_value) as Record<string, unknown>;
        } catch {
          args = {};
        }
      }

      try {
        const res = await executeTool(name, args);
        await supabaseAdmin.from("admin_change_log").insert({
          tool: name,
          target: res.target,
          old_value: p.old_value,
          new_value: res.new_value,
          summary: p.summary,
        });
        results.push({ target: p.target, ok: true });
      } catch (e) {
        results.push({ target: p.target, ok: false, error: e instanceof Error ? e.message : "Fehler" });
      }
    }

    invalidateAiSettingsCache();
    return { results };
  });
