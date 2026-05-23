/**
 * Zentrale AI-Konfiguration für Marlene.
 *
 * → Hier änderst du Modell, Anzeigename, Persona-Prompt und die
 *   sicherheitskritischen Quick-Prompts. Alles Andere zieht sich diese Werte
 *   aus dieser Datei (siehe `src/components/AiAskButton.tsx`,
 *   `src/routes/api/chat.ts`).
 *
 * Modell-Wechsel: einfach `AI_MODEL` anpassen. Verfügbare Modelle siehe
 * Lovable-AI-Gateway-Doku — gängige Optionen:
 *   - "google/gemini-2.5-pro"          starkes Reasoning
 *   - "google/gemini-2.5-flash"        günstiger Default
 *   - "google/gemini-3-flash-preview"  schnell + günstig
 *   - "openai/gpt-5-mini"              OpenAI-Alternative
 */

export const AI_MODEL = "google/gemini-2.5-pro";

export const AI_DISPLAY_NAME = "Marlene";
export const AI_PERSONA_NAME = "Marlene";

/**
 * Persona-Block für den System-Prompt. Bewusst knapp — die harten
 * Sicherheitsregeln stehen weiterhin im Prompt von `src/routes/api/chat.ts`.
 */
export const AI_PERSONA_BLOCK = `Du bist "Marlene", eine empathische, faktenbasierte Safer-Use-Begleiterin für Raver:innen in DE/AT/CH.
Stil: ruhig, respektvoll, auf Augenhöhe, ohne Belehrung, ohne Konsum-Verherrlichung, ohne moralisches Urteilen.
Du bist keine Ärztin und kein Rettungsdienst — bei akuten Symptomen verweist du sofort und klar auf 112.
Wenn du etwas nicht sicher weißt, sagst du das ehrlich ("Datenlage begrenzt", "weiß ich nicht") und verweist auf
Drug-Checking, ärztliche Beratung oder eine nüchterne Begleitperson — statt zu spekulieren oder zu erfinden.
Pushe niemals Konsum. Benenne Risiken klar, ohne Drama. Antworte auf Deutsch in Markdown.`;

/**
 * Fixe Safer-Use-Quick-Prompts, die immer über dem Input sichtbar sind.
 * Reihenfolge = Anzeige-Reihenfolge.
 */
export const SAFER_USE_QUICK_PROMPTS: Array<{ label: string; prompt: string }> = [
  {
    label: "Mir ist schlecht",
    prompt:
      "Mir ist gerade schlecht nach Konsum. Was sollte ich jetzt tun? Wann muss ich 112 rufen? Bitte klar und ruhig, Schritt für Schritt.",
  },
  {
    label: "Freund:in reagiert nicht",
    prompt:
      "Eine Person neben mir reagiert nicht mehr / ist bewusstlos. Was muss ich JETZT tun, in welcher Reihenfolge? Inkl. stabile Seitenlage und 112.",
  },
  {
    label: "Mischkonsum checken",
    prompt:
      "Ich habe X und Y kombiniert (oder will es). Was sind die wichtigsten Risiken bei dieser Kombi und worauf muss ich achten?",
  },
];

/**
 * Safety-Disclaimer unter der Eingabeleiste.
 */
export const AI_SAFETY_FOOTER =
  "Marlene kann Fehler machen. Kein Ersatz für medizinische Hilfe oder Notruf 112.";
