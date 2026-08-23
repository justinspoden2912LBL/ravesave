/**
 * Der Groq-API-Key kommt ausschliesslich aus serverseitigen Environment
 * Variables. Keine Speicherung in der Datenbank, im Client oder LocalStorage.
 */
export function invalidateGroqKeyCache() {
  /* no cache anymore — kept for API compatibility */
}

export async function resolveGroqApiKey(): Promise<string> {
  return process.env.GROQ_API_KEY?.trim() ?? "";
}
