import { createServerFn } from "@tanstack/react-start";
import { useSession as getTanstackSession } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { invalidateGroqKeyCache } from "@/lib/resolveAiKey.server";

const SESSION_MAX_AGE = 60 * 60 * 24;
type AdminSession = { admin?: boolean; loginAt?: number };

function sessionConfig() {
  const password = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!password || password.length < 32) throw new Error("Server session secret missing");
  return { password, name: "rs_admin", maxAge: SESSION_MAX_AGE, cookie: { httpOnly: true } };
}

async function requireAdmin() {
  const s = await getTanstackSession<AdminSession>(sessionConfig());
  if (!s.data.admin) throw new Error("Nicht angemeldet");
  if (s.data.loginAt && Date.now() - s.data.loginAt > SESSION_MAX_AGE * 1000) throw new Error("Sitzung abgelaufen");
}

export const adminGetAiKeyStatus = createServerFn({ method: "GET" }).handler(async () => {
  try { await requireAdmin(); } catch { return { authenticated: false, hasStoredKey: false, hasEnvKey: false, last4: "" }; }
  const { data } = await supabaseAdmin.from("ai_settings").select("groq_api_key").eq("id", "default").maybeSingle();
  const key = String(data?.groq_api_key ?? "").trim();
  return { authenticated: true, hasStoredKey: key.length > 0, hasEnvKey: Boolean(process.env.GROQ_API_KEY?.trim()), last4: key.length >= 4 ? key.slice(-4) : "" };
});

export const adminSetAiKey = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ groqApiKey: z.string().max(300).optional(), clear: z.boolean().optional() }).parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const next = data.clear ? "" : String(data.groqApiKey ?? "").trim();
    if (!data.clear && next.length < 8) throw new Error("Key ist zu kurz.");
    const { error } = await supabaseAdmin.from("ai_settings").upsert({ id: "default", groq_api_key: next }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    invalidateGroqKeyCache();
    return { ok: true, hasStoredKey: next.length > 0, last4: next.length >= 4 ? next.slice(-4) : "" };
  });

export const adminTestAiKey = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ groqApiKey: z.string().max(300).optional() }).parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    let key = String(data.groqApiKey ?? "").trim();
    if (!key) {
      const { data: row } = await supabaseAdmin.from("ai_settings").select("groq_api_key").eq("id", "default").maybeSingle();
      key = String(row?.groq_api_key ?? "").trim() || process.env.GROQ_API_KEY?.trim() || "";
    }
    if (!key) throw new Error("Kein Key zum Testen hinterlegt.");
    const res = await fetch("https://api.groq.com/openai/v1/models", { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) throw new Error(`Groq antwortet mit Status ${res.status}.`);
    return { ok: true };
  });
