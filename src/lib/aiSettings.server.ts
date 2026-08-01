import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DEFAULT_AI_SETTINGS, normalizeAiSettings, type AiSettings } from "@/lib/aiSettings";

let cache: { at: number; value: AiSettings } | null = null;
const TTL_MS = 20_000;

/** Liest die Admin-Einstellungen (mit kurzem Cache); fällt auf Defaults zurück. */
export async function loadAiSettings(): Promise<AiSettings> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;
  try {
    const { data, error } = await supabaseAdmin
      .from("ai_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();
    if (error || !data) throw error ?? new Error("no row");
    const value = normalizeAiSettings(data as Partial<AiSettings>);
    cache = { at: Date.now(), value };
    return value;
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export function invalidateAiSettingsCache() {
  cache = null;
}
