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

/**
 * Prüft (mit 5-Minuten-Cache), ob der kostenfreie Groq-Zugang gerade
 * funktioniert. So kann der Chat bei ungültigem/abgelaufenem Key automatisch
 * auf den Fallback-Anbieter wechseln, statt eine Fehlermeldung zu streamen.
 */
let groqHealth: { at: number; ok: boolean } | null = null;
const HEALTH_TTL_MS = 5 * 60_000;

export async function isGroqHealthy(apiKey: string): Promise<boolean> {
  if (groqHealth && Date.now() - groqHealth.at < HEALTH_TTL_MS) return groqHealth.ok;
  let ok = false;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    ok = res.ok;
  } catch {
    ok = false;
  }
  groqHealth = { at: Date.now(), ok };
  return ok;
}
