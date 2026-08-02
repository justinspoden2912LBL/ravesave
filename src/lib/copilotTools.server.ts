/**
 * Copilot-Tools: die einzigen Änderungen, die der Admin-Copilot vornehmen darf.
 *
 * Kein Freitext-SQL, keine Dateizugriffe, keine Löschungen von Nutzerdaten.
 * Jedes Tool ist eng validiert; unbekannte Tools/Werte werden verworfen.
 */
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { THEME_KEYS } from "@/lib/theme";

export type Proposal = {
  tool: string;
  target: string;
  old_value: string | null;
  new_value: string;
  summary: string;
};

const cssValue = z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9().,%#\s/_-]+$/, "ungültiger Wert");

export const TOOL_SCHEMAS = {
  set_theme_token: z.object({
    key: z.enum(THEME_KEYS as [string, ...string[]]),
    value: cssValue,
  }),
  set_feature_flag: z.object({
    key: z.string().trim().min(1).max(80),
    enabled: z.boolean(),
  }),
  set_ui_text: z.object({
    key: z.string().trim().min(1).max(160),
    value: z.string().max(2000),
  }),
  set_site_content: z.object({
    key: z.string().trim().min(1).max(160),
    content: z.string().max(20000),
  }),
  set_substance_override: z.object({
    slug: z.string().trim().min(1).max(80),
    field: z.enum(["shortDescription", "safetyNote", "onset", "duration", "afterEffects"]),
    value: z.string().max(2000),
  }),
  update_ai_rules: z.object({
    extra_rules: z.string().max(4000).optional(),
    blocked_topics: z.string().max(2000).optional(),
    answer_style: z.enum(["einfach", "normal", "experte"]).optional(),
  }),
} as const;

export type ToolName = keyof typeof TOOL_SCHEMAS;

/** OpenAI-kompatible Tool-Definitionen für das Modell. */
export const OPENAI_TOOLS = [
  {
    type: "function",
    function: {
      name: "set_theme_token",
      description:
        "Ändert einen Design-Wert der Website (CSS-Variable). Farben als CSS-Farbe (z. B. '#ff8a3d', 'oklch(0.78 0.22 320)'), radius z. B. '1.25rem', font-scale z. B. '1.05', glass-opacity z. B. '0.35'.",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string", enum: THEME_KEYS },
          value: { type: "string" },
        },
        required: ["key", "value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_feature_flag",
      description: "Schaltet eine Seite oder Funktion öffentlich frei oder sperrt sie.",
      parameters: {
        type: "object",
        properties: { key: { type: "string" }, enabled: { type: "boolean" } },
        required: ["key", "enabled"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_ui_text",
      description: "Ändert einen Oberflächentext (Überschrift, Button-Label) anhand seines Keys.",
      parameters: {
        type: "object",
        properties: { key: { type: "string" }, value: { type: "string" } },
        required: ["key", "value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_site_content",
      description: "Ersetzt einen längeren redaktionellen Inhalt (Info-/Wissenstext) anhand seines Keys.",
      parameters: {
        type: "object",
        properties: { key: { type: "string" }, content: { type: "string" } },
        required: ["key", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_substance_override",
      description: "Passt ein einzelnes Feld einer Substanz an (Override, überschreibt den Standardtext).",
      parameters: {
        type: "object",
        properties: {
          slug: { type: "string" },
          field: {
            type: "string",
            enum: ["shortDescription", "safetyNote", "onset", "duration", "afterEffects"],
          },
          value: { type: "string" },
        },
        required: ["slug", "field", "value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_ai_rules",
      description: "Ändert Marleens Regeln: Zusatzregeln, gesperrte Themen oder Antwortstil.",
      parameters: {
        type: "object",
        properties: {
          extra_rules: { type: "string" },
          blocked_topics: { type: "string" },
          answer_style: { type: "string", enum: ["einfach", "normal", "experte"] },
        },
      },
    },
  },
] as const;

/** Aktuellen Wert lesen, damit die UI ein Vorher/Nachher zeigen kann. */
export async function readCurrent(tool: ToolName, args: Record<string, unknown>): Promise<string | null> {
  try {
    if (tool === "set_theme_token") {
      const { data } = await supabaseAdmin
        .from("site_theme")
        .select("value")
        .eq("key", String(args.key))
        .maybeSingle();
      return (data?.value as string) ?? null;
    }
    if (tool === "set_feature_flag") {
      const { data } = await supabaseAdmin
        .from("feature_flags")
        .select("enabled")
        .eq("key", String(args.key))
        .maybeSingle();
      return data ? String(data.enabled) : null;
    }
    if (tool === "set_ui_text") {
      const { data } = await supabaseAdmin
        .from("ui_texts")
        .select("value")
        .eq("key", String(args.key))
        .maybeSingle();
      return (data?.value as string) ?? null;
    }
    if (tool === "set_site_content") {
      const { data } = await supabaseAdmin
        .from("site_content")
        .select("content")
        .eq("key", String(args.key))
        .maybeSingle();
      return (data?.content as string) ?? null;
    }
    if (tool === "set_substance_override") {
      const { data } = await supabaseAdmin
        .from("substance_overrides")
        .select("patch")
        .eq("slug", String(args.slug))
        .maybeSingle();
      const patch = (data?.patch ?? {}) as Record<string, unknown>;
      const v = patch[String(args.field)];
      return typeof v === "string" ? v : null;
    }
    if (tool === "update_ai_rules") {
      const { data } = await supabaseAdmin
        .from("ai_settings")
        .select("extra_rules, blocked_topics, answer_style")
        .eq("id", "default")
        .maybeSingle();
      return data ? JSON.stringify(data) : null;
    }
  } catch {
    return null;
  }
  return null;
}

/** Führt ein Tool aus. Gibt eine kurze Zusammenfassung zurück. */
export async function executeTool(tool: ToolName, rawArgs: unknown): Promise<{ target: string; new_value: string }> {
  const args = TOOL_SCHEMAS[tool].parse(rawArgs) as Record<string, never>;
  const now = new Date().toISOString();

  if (tool === "set_theme_token") {
    const { key, value } = args as unknown as { key: string; value: string };
    const { error } = await supabaseAdmin
      .from("site_theme")
      .upsert({ key, value, updated_at: now }, { onConflict: "key" });
    if (error) throw new Error("Theme konnte nicht gespeichert werden");
    return { target: `theme.${key}`, new_value: value };
  }

  if (tool === "set_feature_flag") {
    const { key, enabled } = args as unknown as { key: string; enabled: boolean };
    const { data: existing } = await supabaseAdmin
      .from("feature_flags")
      .select("key")
      .eq("key", key)
      .maybeSingle();
    if (!existing) throw new Error(`Unbekannte Funktion: ${key}`);
    const { error } = await supabaseAdmin
      .from("feature_flags")
      .update({ enabled, updated_at: now })
      .eq("key", key);
    if (error) throw new Error("Flag konnte nicht gespeichert werden");
    return { target: `flag.${key}`, new_value: String(enabled) };
  }

  if (tool === "set_ui_text") {
    const { key, value } = args as unknown as { key: string; value: string };
    const { error } = await supabaseAdmin
      .from("ui_texts")
      .upsert({ key, value, updated_at: now }, { onConflict: "key" });
    if (error) throw new Error("Text konnte nicht gespeichert werden");
    return { target: `text.${key}`, new_value: value };
  }

  if (tool === "set_site_content") {
    const { key, content } = args as unknown as { key: string; content: string };
    const { error } = await supabaseAdmin
      .from("site_content")
      .upsert({ key, content, updated_at: now }, { onConflict: "key" });
    if (error) throw new Error("Inhalt konnte nicht gespeichert werden");
    return { target: `content.${key}`, new_value: content };
  }

  if (tool === "set_substance_override") {
    const { slug, field, value } = args as unknown as { slug: string; field: string; value: string };
    const { data } = await supabaseAdmin
      .from("substance_overrides")
      .select("patch")
      .eq("slug", slug)
      .maybeSingle();
    const patch = { ...((data?.patch ?? {}) as Record<string, string>), [field]: value };
    const { error } = await supabaseAdmin
      .from("substance_overrides")
      .upsert({ slug, patch, updated_at: now }, { onConflict: "slug" });
    if (error) throw new Error("Substanz-Override konnte nicht gespeichert werden");
    return { target: `substanz.${slug}.${field}`, new_value: value };
  }

  const patch = args as unknown as Record<string, string>;
  const update: Record<string, string> = { updated_at: now };
  for (const k of ["extra_rules", "blocked_topics", "answer_style"]) {
    if (typeof patch[k] === "string") update[k] = patch[k];
  }
  const { error } = await supabaseAdmin
    .from("ai_settings")
    .upsert({ id: "default", ...update }, { onConflict: "id" });
  if (error) throw new Error("KI-Regeln konnten nicht gespeichert werden");
  return { target: "ki.regeln", new_value: JSON.stringify(update) };
}

/** Setzt eine geloggte Änderung wieder zurück. */
export async function revertChange(row: {
  tool: string;
  target: string;
  old_value: string | null;
}): Promise<void> {
  const [kind, ...rest] = row.target.split(".");
  const id = rest.join(".");
  const old = row.old_value ?? "";
  const now = new Date().toISOString();

  if (kind === "theme") {
    await supabaseAdmin.from("site_theme").upsert({ key: id, value: old, updated_at: now }, { onConflict: "key" });
    return;
  }
  if (kind === "flag") {
    await supabaseAdmin.from("feature_flags").update({ enabled: old === "true", updated_at: now }).eq("key", id);
    return;
  }
  if (kind === "text") {
    await supabaseAdmin.from("ui_texts").upsert({ key: id, value: old, updated_at: now }, { onConflict: "key" });
    return;
  }
  if (kind === "content") {
    await supabaseAdmin.from("site_content").upsert({ key: id, content: old, updated_at: now }, { onConflict: "key" });
    return;
  }
  if (kind === "substanz") {
    const [slug, field] = id.split(".");
    const { data } = await supabaseAdmin.from("substance_overrides").select("patch").eq("slug", slug).maybeSingle();
    const patch = { ...((data?.patch ?? {}) as Record<string, string>) };
    if (old) patch[field] = old;
    else delete patch[field];
    await supabaseAdmin.from("substance_overrides").upsert({ slug, patch, updated_at: now }, { onConflict: "slug" });
    return;
  }
  if (kind === "ki") {
    try {
      const prev = JSON.parse(old || "{}") as Record<string, string>;
      await supabaseAdmin.from("ai_settings").upsert({ id: "default", ...prev, updated_at: now }, { onConflict: "id" });
    } catch {
      /* ignore */
    }
  }
}
