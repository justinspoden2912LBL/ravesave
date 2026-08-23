import { createServerFn } from "@tanstack/react-start";
import { useSession as getTanstackSession } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { loadAiSettings, isGroqHealthy } from "@/lib/aiSettings.server";
import { GROQ_BASE_URL, GROQ_DEFAULT_MODEL } from "@/lib/groq-provider";
import {
  getRepoFile,
  githubReady,
  isAllowedPath,
  listRepoPath,
  pushRepoFile,
  GithubPushError,
} from "@/lib/githubPush.server";

type AdminSession = { admin?: boolean; loginAt?: number };
const SESSION_MAX_AGE = 60 * 60 * 24;

function sessionConfig() {
  const password = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!password || password.length < 32) throw new Error("Server session secret missing");
  return {
    name: "ravesave-admin",
    password,
    maxAge: SESSION_MAX_AGE,
    cookie: { httpOnly: true, sameSite: "lax" as const, secure: true },
  };
}

async function requireAdmin() {
  const s = await getTanstackSession<AdminSession>(sessionConfig());
  if (!s.data.admin) throw new Error("Nicht autorisiert.");
}

const SYSTEM_PROMPT = `Du bist der Design-Copilot von RaveSave. Antworte NUR als JSON:
{"path":"src/routes/....tsx","message":"kurze commit message","reason":"kurze Begründung","content":"vollständiger neuer Dateiinhalt"}
Regeln:
- Ändere nur die angegebene Datei.
- Gib immer den vollständigen Dateiinhalt zurück, nie Diffs oder Platzhalter.
- Behalte bestehende Logik, Imports und Funktionen.
- Keine Secrets, keine neuen Dependencies, kein Löschen der Datei.
- Nur Design-, Layout-, Text- oder Harm-Reduction-UI-Änderungen.`;

function parseJsonObject(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI hat kein JSON geliefert.");
  return JSON.parse(raw.slice(start, end + 1)) as {
    path?: string;
    message?: string;
    reason?: string;
    content?: string;
  };
}

export const designStudioStatus = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return { githubReady: githubReady() };
});

export const designStudioList = createServerFn({ method: "GET" })
  .validator(z.object({ path: z.string().default("src/routes") }))
  .handler(async ({ data }) => {
    await requireAdmin();
    return listRepoPath(data.path);
  });

export const designStudioRead = createServerFn({ method: "GET" })
  .validator(z.object({ path: z.string() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    return getRepoFile(data.path);
  });

export const designStudioPropose = createServerFn({ method: "POST" })
  .validator(z.object({ path: z.string(), prompt: z.string().min(8).max(2000) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    if (!isAllowedPath(data.path)) throw new Error("Datei nicht erlaubt.");
    const file = await getRepoFile(data.path);
    const settings = await loadAiSettings();
    const apiKey = process.env.GROQ_API_KEY?.trim() || "";
    if (!apiKey) throw new Error("Kein Groq-API-Key hinterlegt.");
    if (!(await isGroqHealthy(apiKey))) throw new Error("Groq ist gerade nicht erreichbar.");

    const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: settings.model || GROQ_DEFAULT_MODEL,
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Datei: ${file.path}\nAuftrag: ${data.prompt}\n\nAktueller Inhalt:\n${file.content}`,
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Groq-Fehler ${res.status}`);
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const parsed = parseJsonObject(json.choices?.[0]?.message?.content ?? "");
    if (!parsed.content || parsed.path !== file.path) {
      throw new Error("AI-Vorschlag ist ungültig oder betrifft die falsche Datei.");
    }
    return {
      path: file.path,
      sha: file.sha,
      oldContent: file.content,
      newContent: parsed.content,
      reason: parsed.reason ?? "Design-Änderung",
      message: parsed.message ?? data.prompt.slice(0, 72),
    };
  });

export const designStudioPush = createServerFn({ method: "POST" })
  .validator(
    z.object({
      path: z.string(),
      sha: z.string(),
      content: z.string().min(20),
      message: z.string().min(4).max(120),
      prompt: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    try {
      const result = await pushRepoFile(data.path, data.content, data.message, data.sha);
      await supabaseAdmin.from("admin_change_log").insert({
        tool: "design_studio_push",
        target: data.path,
        summary: data.prompt ?? data.message,
        new_value: result.sha ?? null,
      });
      return result;
    } catch (error) {
      const message = error instanceof GithubPushError ? error.message : "Push fehlgeschlagen.";
      throw new Error(message);
    }
  });
