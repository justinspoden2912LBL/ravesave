import { createServerFn } from "@tanstack/react-start";
import { useSession as getTanstackSession } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  DEFAULT_AI_SETTINGS,
  normalizeAiSettings,
  type AiSettings,
} from "@/lib/aiSettings";
import { invalidateAiSettingsCache } from "@/lib/aiSettings.server";

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

async function requireAdmin() {
  const s = await getTanstackSession<AdminSession>(sessionConfig());
  if (!s.data.admin) throw new Error("Nicht angemeldet");
  if (s.data.loginAt && Date.now() - s.data.loginAt > SESSION_MAX_AGE * 1000) {
    await s.clear();
    throw new Error("Sitzung abgelaufen");
  }
}

export const adminGetAiSettings = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { data } = await supabaseAdmin
    .from("ai_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  return normalizeAiSettings((data ?? DEFAULT_AI_SETTINGS) as Partial<AiSettings>);
});

const SettingsSchema = z.object({
  enabled: z.boolean(),
  provider: z.enum(["auto", "groq", "lovable"]),
  model: z.string().min(1).max(120),
  fallback_model: z.string().min(1).max(120),
  temperature: z.number().min(0).max(1.2),
  max_messages: z.number().int().min(2).max(200),
  rate_limit_per_min: z.number().int().min(1).max(120),
  answer_style: z.enum(["einfach", "normal", "experte"]),
  extra_rules: z.string().max(4000),
  blocked_topics: z.string().max(2000),
  disabled_message: z.string().min(1).max(500),
});

export const adminUpdateAiSettings = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SettingsSchema.parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { error } = await supabaseAdmin
      .from("ai_settings")
      .upsert({ id: "default", ...data, updated_at: new Date().toISOString() });
    if (error) throw new Error("Speichern fehlgeschlagen");
    invalidateAiSettingsCache();
    return normalizeAiSettings(data);
  });
