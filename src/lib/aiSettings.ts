/**
 * Zentrale KI-Einstellungen für Marleen (im Admin-Panel editierbar).
 *
 * Ziel: Marleen läuft immer über ein kostenfreies Modell (Groq) und ist
 * unabhängig von Credits verfügbar. Der Admin steuert Modell, Ton, eigene
 * Regeln, gesperrte Themen und Limits — ohne Deploy.
 */

export type AiSettings = {
  enabled: boolean;
  provider: "auto" | "groq" | "lovable";
  model: string;
  fallback_model: string;
  temperature: number;
  max_messages: number;
  rate_limit_per_min: number;
  answer_style: "einfach" | "normal" | "experte";
  extra_rules: string;
  blocked_topics: string;
  disabled_message: string;
};

export const DEFAULT_AI_SETTINGS: AiSettings = {
  enabled: true,
  provider: "auto",
  model: "llama-3.3-70b-versatile",
  fallback_model: "google/gemini-2.5-flash",
  temperature: 0.6,
  max_messages: 60,
  rate_limit_per_min: 20,
  answer_style: "normal",
  extra_rules: "",
  blocked_topics: "",
  disabled_message:
    "Marleen ist gerade offline. Die Infos in der App bleiben verfügbar — bei akuter Gefahr: 112.",
};

/** Kostenfrei nutzbare Groq-Modelle (Free-Tier, keine Credits nötig). */
export const FREE_GROQ_MODELS: Array<{ id: string; label: string; hint: string }> = [
  {
    id: "llama-3.3-70b-versatile",
    label: "Llama 3.3 70B (Standard)",
    hint: "Bestes Verhältnis aus Qualität und Tempo — Empfehlung.",
  },
  {
    id: "llama-3.1-8b-instant",
    label: "Llama 3.1 8B Instant",
    hint: "Sehr schnell, höhere Limits, etwas flacher in der Tiefe.",
  },
  {
    id: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B",
    hint: "Stärkstes freies Modell, etwas langsamer.",
  },
  {
    id: "openai/gpt-oss-20b",
    label: "GPT-OSS 20B",
    hint: "Kompakt und schnell.",
  },
  {
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    label: "Llama 4 Scout 17B",
    hint: "Neuer, guter Allrounder.",
  },
  {
    id: "qwen/qwen3-32b",
    label: "Qwen3 32B",
    hint: "Alternative, wenn Llama gedrosselt ist.",
  },
];

export function normalizeAiSettings(row: Partial<AiSettings> | null | undefined): AiSettings {
  const s = { ...DEFAULT_AI_SETTINGS, ...(row ?? {}) } as AiSettings;
  return {
    enabled: !!s.enabled,
    provider: s.provider === "groq" || s.provider === "lovable" ? s.provider : "auto",
    model: (s.model || DEFAULT_AI_SETTINGS.model).slice(0, 120),
    fallback_model: (s.fallback_model || DEFAULT_AI_SETTINGS.fallback_model).slice(0, 120),
    temperature: Math.min(1.2, Math.max(0, Number(s.temperature) || 0.6)),
    max_messages: Math.min(200, Math.max(2, Math.round(Number(s.max_messages) || 60))),
    rate_limit_per_min: Math.min(120, Math.max(1, Math.round(Number(s.rate_limit_per_min) || 20))),
    answer_style:
      s.answer_style === "einfach" || s.answer_style === "experte" ? s.answer_style : "normal",
    extra_rules: String(s.extra_rules ?? "").slice(0, 4000),
    blocked_topics: String(s.blocked_topics ?? "").slice(0, 2000),
    disabled_message: String(s.disabled_message || DEFAULT_AI_SETTINGS.disabled_message).slice(
      0,
      500,
    ),
  };
}
