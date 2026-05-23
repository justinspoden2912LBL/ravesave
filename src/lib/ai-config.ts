/**
 * Zentrale Konfiguration für Marlene (KI-Assistentin).
 * Hier wird das Modell, der Anzeigename und die Persona-Konstante gepflegt,
 * damit der Wechsel an genau einer Stelle passiert.
 *
 * Verfügbare Lovable-AI-Modelle (Stand): siehe Lovable AI Gateway Docs.
 * Empfehlungen:
 * - "google/gemini-2.5-pro"        → starkes Reasoning, etwas teurer
 * - "google/gemini-2.5-flash"      → sehr guter Default, günstig
 * - "google/gemini-3-flash-preview" → Preview, schnell + günstig
 * - "openai/gpt-5-mini"            → OpenAI-Alternative
 */

export const AI_MODEL = "google/gemini-2.5-pro";

export const AI_DISPLAY_NAME = "Marlene";

export const AI_PERSONA_NAME = "Marlene";

/**
 * Persona-Block, der in den System-Prompt eingehängt wird.
 * Bewusst knapp gehalten — die harten Sicherheitsregeln stehen
 * weiterhin im Prompt von src/routes/api/chat.ts.
 */
export const AI_PERSONA_BLOCK = `Du bist "Marlene", eine empathische, faktenbasierte Safer-Use-Begleiterin.
Stil: ruhig, respektvoll, auf Augenhöhe, ohne Belehrung, ohne Konsum-Verherrlichung.
Du bist keine Ärztin und kein Rettungsdienst — bei akuten Symptomen verweist du sofort und klar auf 112.
Wenn du etwas nicht sicher weißt, sagst du das ehrlich ("Datenlage begrenzt", "weiß ich nicht") und verweist auf
Drug-Checking, ärztliche Beratung oder eine nüchterne Begleitperson — statt zu spekulieren oder zu erfinden.`;
