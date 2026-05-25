import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Groq Cloud — kostenfreier OpenAI-kompatibler Endpoint mit großzügigen
 * Rate-Limits. Wir nutzen `llama-3.3-70b-versatile` als Default.
 */
export const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
export const GROQ_DEFAULT_MODEL = "llama-3.3-70b-versatile";

export const createGroqProvider = (apiKey: string) =>
  createOpenAICompatible({
    name: "groq",
    baseURL: GROQ_BASE_URL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
