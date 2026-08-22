import { supabaseAdmin } from "@/integrations/supabase/client.server";

let cache: { at: number; value: string } | null = null;
const TTL_MS = 20_000;

export function invalidateGroqKeyCache() { cache = null; }

export async function resolveGroqApiKey(): Promise<string> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;
  const { data } = await supabaseAdmin.from("ai_settings").select("groq_api_key").eq("id", "default").maybeSingle();
  const dbKey = String(data?.groq_api_key ?? "").trim();
  const value = dbKey || process.env.GROQ_API_KEY?.trim() || "";
  cache = { at: Date.now(), value };
  return value;
}
