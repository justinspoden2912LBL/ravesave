/**
 * Aktive Session-Logik. Berechnet Phasen aus Substanz-Daten + Log-Timestamp.
 * Lokal-first; aktive Session-IDs in localStorage.
 */
import { SUBSTANCES, type Substance } from "./substances";
import { loadEntries, type LogEntry } from "./log";

const ACTIVE_KEY = "ravesave.active_sessions.v1";

export type Phase = "anflug" | "peak" | "comedown" | "afterglow" | "done";

export interface PhaseInfo {
  phase: Phase;
  label: string;
  /** 0..1 progress within active window (excluding afterglow) */
  progress: number;
  /** minutes since dose */
  elapsedMin: number;
  /** total expected duration in minutes (peak end) */
  totalMin: number;
  onsetEndMin: number;
  peakEndMin: number;
  afterglowEndMin: number;
  nextEvent?: { label: string; inMin: number };
}

const PHASE_LABEL: Record<Phase, string> = {
  anflug: "Anflug",
  peak: "Peak",
  comedown: "Runterkommen",
  afterglow: "Afterglow",
  done: "Abgeklungen",
};

/** Parses strings like "20–60 min", "8–12 h", "Sekunden", "5–20 min (vap.)". Returns minutes range. */
export function parseRangeToMinutes(s?: string): { min: number; max: number } | null {
  if (!s) return null;
  const lower = s.toLowerCase();
  if (lower.includes("sekunde")) return { min: 0.1, max: 1 };
  // capture first two numbers
  const nums = (s.match(/\d+(?:[.,]\d+)?/g) || []).map((n) => parseFloat(n.replace(",", ".")));
  if (nums.length === 0) return null;
  const isHour = /\bh\b|stund/i.test(s);
  const factor = isHour ? 60 : 1;
  const min = nums[0] * factor;
  const max = (nums[1] ?? nums[0]) * factor;
  return { min, max };
}

function midpoint(r: { min: number; max: number } | null, fallback: number): number {
  if (!r) return fallback;
  return (r.min + r.max) / 2;
}

export interface SessionDurationModel {
  onsetMin: number; // minutes from dose to peak start
  peakEndMin: number; // minutes from dose to peak end
  afterglowEndMin: number; // minutes from dose to afterglow end (may equal peakEnd)
}

export function modelForSubstance(sub: Substance, route?: string): SessionDurationModel {
  const dose = sub.doses.find((d) => !route || d.route === route) ?? sub.doses[0];
  const onsetStr = dose?.onset ?? sub.onset;
  const totalStr = dose?.total ?? sub.duration;
  const peakStr = dose?.peak;
  const afterStr = dose?.afterglow ?? sub.afterEffects;

  const onsetR = parseRangeToMinutes(onsetStr);
  const totalR = parseRangeToMinutes(totalStr);
  const peakR = parseRangeToMinutes(peakStr);
  const afterR = parseRangeToMinutes(afterStr);

  const onsetMin = midpoint(onsetR, 30);
  const peakEndMin = midpoint(totalR, onsetMin + 120);
  // peakR is duration of peak — if present use onset + peakDuration, else total
  const peakEndFromPeak = peakR ? onsetMin + midpoint(peakR, 60) : peakEndMin;
  const peakEnd = Math.min(peakEndMin, peakEndFromPeak);
  const afterEnd = afterR ? peakEnd + midpoint(afterR, 60) : peakEnd;

  return {
    onsetMin: Math.max(1, onsetMin),
    peakEndMin: Math.max(onsetMin + 5, peakEnd),
    afterglowEndMin: Math.max(peakEnd + 1, afterEnd),
  };
}

export function getPhaseInfo(entry: LogEntry, now: number = Date.now()): PhaseInfo | null {
  const sub = SUBSTANCES.find((s) => s.id === entry.substanceId);
  if (!sub) return null;
  const m = modelForSubstance(sub, entry.route);
  const elapsedMin = (now - entry.timestamp) / 60000;
  let phase: Phase;
  if (elapsedMin < 0) phase = "anflug";
  else if (elapsedMin < m.onsetMin) phase = "anflug";
  else if (elapsedMin < m.peakEndMin * 0.7) phase = "peak";
  else if (elapsedMin < m.peakEndMin) phase = "comedown";
  else if (elapsedMin < m.afterglowEndMin) phase = "afterglow";
  else phase = "done";

  const progress = Math.max(0, Math.min(1, elapsedMin / m.peakEndMin));

  let nextEvent: { label: string; inMin: number } | undefined;
  if (phase === "anflug") nextEvent = { label: "Peak", inMin: Math.max(0, m.onsetMin - elapsedMin) };
  else if (phase === "peak") nextEvent = { label: "Comedown", inMin: Math.max(0, m.peakEndMin * 0.7 - elapsedMin) };
  else if (phase === "comedown") nextEvent = { label: "Ende Wirkung", inMin: Math.max(0, m.peakEndMin - elapsedMin) };
  else if (phase === "afterglow") nextEvent = { label: "Vollständig abgeklungen", inMin: Math.max(0, m.afterglowEndMin - elapsedMin) };

  return {
    phase,
    label: PHASE_LABEL[phase],
    progress,
    elapsedMin,
    totalMin: m.peakEndMin,
    onsetEndMin: m.onsetMin,
    peakEndMin: m.peakEndMin,
    afterglowEndMin: m.afterglowEndMin,
    nextEvent,
  };
}

/** Returns log entries tagged as active (manually toggled) and not yet expired. */
export function getActiveSessions(now: number = Date.now()): { entry: LogEntry; info: PhaseInfo }[] {
  const ids = loadActiveIds();
  if (ids.length === 0) return [];
  const entries = loadEntries();
  const out: { entry: LogEntry; info: PhaseInfo }[] = [];
  for (const id of ids) {
    const e = entries.find((x) => x.id === id);
    if (!e) continue;
    const info = getPhaseInfo(e, now);
    if (!info) continue;
    if (info.phase === "done") continue;
    out.push({ entry: e, info });
  }
  return out;
}

export function loadActiveIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_KEY) || "[]");
  } catch {
    return [];
  }
}
export function saveActiveIds(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("ravesave:active-changed"));
}
export function markActive(id: string) {
  const ids = new Set(loadActiveIds());
  ids.add(id);
  saveActiveIds(Array.from(ids));
}
export function unmarkActive(id: string) {
  saveActiveIds(loadActiveIds().filter((x) => x !== id));
}
export function isActive(id: string): boolean {
  return loadActiveIds().includes(id);
}

export function formatMin(min: number): string {
  if (min < 1) return "<1 min";
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const rest = Math.round(min - h * 60);
  return rest === 0 ? `${h} h` : `${h} h ${rest} min`;
}
