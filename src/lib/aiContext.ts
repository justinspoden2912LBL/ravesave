// Zentraler App-Kontext für den KI-Assistenten.
// - Module-level Store mit useSyncExternalStore
// - Pages registrieren via useRegisterAiContext(partial); Cleanup beim Unmount
// - Modus (Einfach / Normal / Experte) wird persistiert
import { useEffect, useSyncExternalStore } from "react";

export type AiMode = "einfach" | "normal" | "experte";

export type AiAppContext = {
  /** Aktuelle Route, wird automatisch gesetzt. */
  route?: string;
  /** Aktuell offenes Wiki-Item (Substanz-Detail). */
  wikiSubstance?: { id: string; name: string; category?: string };
  /** Im Mix-Checker gewählte Substanzen. */
  mixSelected?: { id: string; name: string }[];
  /** Höchstes Risiko-Ergebnis im Mix-Checker. */
  mixRisk?: { level: string; summary?: string };
  /** Aktuell eingegebene Log-Form-Werte (nichts wird gespeichert). */
  logForm?: { substance?: string; dose?: string; unit?: string; route?: string; mood?: number };
  /** Kurzzusammenfassung der letzten Log-Einträge. */
  recentLogSummary?: string;
  /** True, wenn Notfall-UI gerade offen ist. */
  emergencyActive?: boolean;
};

type Listener = () => void;
const listeners = new Set<Listener>();
let snapshot: AiAppContext = {};

function emit() {
  for (const l of listeners) l();
}

export function getAiContext(): AiAppContext {
  return snapshot;
}

export function setAiContext(partial: Partial<AiAppContext>) {
  snapshot = { ...snapshot, ...partial };
  emit();
}

export function clearAiContextKeys(keys: (keyof AiAppContext)[]) {
  const next = { ...snapshot };
  for (const k of keys) delete next[k];
  snapshot = next;
  emit();
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAiContext(): AiAppContext {
  return useSyncExternalStore(subscribe, getAiContext, getAiContext);
}

/**
 * Registriert temporäre Kontext-Felder einer Seite.
 * Beim Unmount oder Wechsel werden die übergebenen Keys wieder entfernt.
 */
export function useRegisterAiContext(partial: Partial<AiAppContext>) {
  // Serialisierter Key, damit Effect nicht bei jedem Render neu feuert
  const key = JSON.stringify(partial);
  useEffect(() => {
    const keys = Object.keys(partial) as (keyof AiAppContext)[];
    setAiContext(partial);
    return () => clearAiContextKeys(keys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

// ---------- Mode (Einfach / Normal / Experte) ----------

const MODE_KEY = "ravesave_ai_mode";
let modeSnapshot: AiMode = "normal";
const modeListeners = new Set<Listener>();

if (typeof window !== "undefined") {
  try {
    const raw = window.localStorage.getItem(MODE_KEY);
    if (raw === "einfach" || raw === "normal" || raw === "experte") modeSnapshot = raw;
  } catch {
    /* ignore */
  }
}

export function getAiMode(): AiMode {
  return modeSnapshot;
}

export function setAiMode(m: AiMode) {
  modeSnapshot = m;
  try {
    window.localStorage.setItem(MODE_KEY, m);
  } catch {
    /* ignore */
  }
  for (const l of modeListeners) l();
}

function subscribeMode(l: Listener) {
  modeListeners.add(l);
  return () => modeListeners.delete(l);
}

export function useAiMode(): AiMode {
  return useSyncExternalStore(subscribeMode, getAiMode, getAiMode);
}

export const MODE_LABEL: Record<AiMode, string> = {
  einfach: "Einfach",
  normal: "Normal",
  experte: "Experte",
};

// ---------- Serialisierung für die KI ----------

/**
 * Kompakter Text-Kontext für den System-Prompt der KI.
 * Wird sanitisiert vom Server (kein Trust). Max ~1500 Zeichen.
 */
export function serializeAiContext(ctx: AiAppContext): string {
  const lines: string[] = [];
  if (ctx.route) lines.push(`Aktuelle Seite: ${ctx.route}`);
  if (ctx.emergencyActive) lines.push("Notfall-UI ist gerade offen — priorisiere Notfallzeichen und 112.");
  if (ctx.wikiSubstance) {
    lines.push(
      `Aktuell geöffnete Substanz: ${ctx.wikiSubstance.name}${ctx.wikiSubstance.category ? ` (${ctx.wikiSubstance.category})` : ""}.`,
    );
  }
  if (ctx.mixSelected && ctx.mixSelected.length > 0) {
    lines.push(`Im Mix-Checker gewählt: ${ctx.mixSelected.map((s) => s.name).join(" + ")}`);
  }
  if (ctx.mixRisk) {
    lines.push(`Aktuelles Mix-Risiko: ${ctx.mixRisk.level}${ctx.mixRisk.summary ? ` — ${ctx.mixRisk.summary}` : ""}`);
  }
  if (ctx.logForm) {
    const parts: string[] = [];
    if (ctx.logForm.substance) parts.push(ctx.logForm.substance);
    if (ctx.logForm.dose) parts.push(`${ctx.logForm.dose}${ctx.logForm.unit ?? ""}`);
    if (ctx.logForm.route) parts.push(ctx.logForm.route);
    if (ctx.logForm.mood != null) parts.push(`Stimmung ${ctx.logForm.mood}/5`);
    if (parts.length) lines.push(`Log-Formular (nicht gespeichert): ${parts.join(", ")}`);
  }
  if (ctx.recentLogSummary) lines.push(`Letzte Einträge: ${ctx.recentLogSummary}`);
  return lines.join("\n").slice(0, 1500);
}

// ---------- Quick-Actions je nach Kontext ----------

export type QuickAction = { label: string; prompt: string };

const GENERAL: QuickAction[] = [
  { label: "Kurz erklären", prompt: "Erklär mir kurz und einfach, was hier auf dieser Seite gerade wichtig ist." },
  { label: "Risiko zusammenfassen", prompt: "Fasse das wichtigste Risiko in 3 Punkten zusammen." },
  { label: "Worauf achten?", prompt: "Was sollte ich beachten? Nenne 3 konkrete Safer-Use-Hinweise." },
  { label: "Notfallzeichen", prompt: "Welche Notfallzeichen sollte ich erkennen können? Wann muss ich 112 rufen?" },
  { label: "Quellen anzeigen", prompt: "Zeige die Quellen aus der App-Datenbank zum aktuellen Thema." },
];

const WIKI: QuickAction[] = [
  { label: "Diese Substanz erklären", prompt: "Erklär mir diese Substanz in der gewählten Detailtiefe." },
  { label: "Wirkdauer", prompt: "Wie ist die Wirkdauer (Onset, Peak, Gesamt) bei dieser Substanz?" },
  { label: "Risiken einfach", prompt: "Erklär mir die Risiken dieser Substanz in einfacher Sprache." },
  { label: "Mehr Details", prompt: "Gib mir mehr pharmakologische Details zu dieser Substanz (Mechanismus, Halbwertszeit)." },
];

const MIX: QuickAction[] = [
  { label: "Kombi erklären", prompt: "Erklär mir die gewählte Kombination und ihr Risikoprofil." },
  { label: "Warum riskant?", prompt: "Warum genau ist diese Kombination riskant? Mechanismus bitte." },
  { label: "Worauf achten?", prompt: "Worauf sollte ich bei dieser Kombination konkret achten?" },
  { label: "Wann Hilfe holen?", prompt: "Bei welchen Zeichen muss ich bei dieser Kombi 112 rufen?" },
];

const LOG: QuickAction[] = [
  { label: "Eintrag erklären", prompt: "Erklär meinen aktuellen Log-Eintrag sachlich — ohne ihn zu speichern oder zu ändern." },
  { label: "Verlauf zusammenfassen", prompt: "Fasse meinen jüngsten Konsumverlauf neutral zusammen." },
  { label: "Warnzeichen prüfen", prompt: "Gibt es in meinem aktuellen Verlauf Warnzeichen, auf die ich achten sollte?" },
];

const EMERGENCY: QuickAction[] = [
  { label: "Notfallzeichen", prompt: "Welche Notfallzeichen muss ich jetzt sofort erkennen?" },
  { label: "Was sagen?", prompt: "Was sage ich dem Rettungsdienst am Telefon?" },
  { label: "Stabile Seitenlage", prompt: "Wie geht die stabile Seitenlage Schritt für Schritt?" },
];

export function quickActionsFor(ctx: AiAppContext): QuickAction[] {
  if (ctx.emergencyActive) return [...EMERGENCY, ...GENERAL.slice(0, 2)];
  if (ctx.mixSelected && ctx.mixSelected.length >= 2) return [...MIX, ...GENERAL.slice(0, 2)];
  if (ctx.wikiSubstance) return [...WIKI, ...GENERAL.slice(0, 2)];
  if (ctx.route?.startsWith("/log")) return [...LOG, ...GENERAL.slice(0, 2)];
  return GENERAL;
}
