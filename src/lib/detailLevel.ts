// Globale Informations-Tiefe (Basis / Erweitert / Experte).
// Wird lokal im Browser persistiert. Synchron mit Marleen-AiMode.
import { useSyncExternalStore } from "react";
import { setAiMode } from "@/lib/aiContext";

export type DetailLevel = "basic" | "extended" | "expert";

const KEY = "ravesave.detailLevel.v1";
const LEGACY_AI_KEY = "ravesave_ai_mode"; // einfach|normal|experte

function readInitial(): DetailLevel {
  if (typeof window === "undefined") return "basic";
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === "basic" || v === "extended" || v === "expert") return v;
    // Migration vom alten AiMode
    const legacy = window.localStorage.getItem(LEGACY_AI_KEY);
    if (legacy === "einfach") return "basic";
    if (legacy === "normal") return "extended";
    if (legacy === "experte") return "expert";
  } catch {
    /* ignore */
  }
  return "basic";
}

let snapshot: DetailLevel = readInitial();
const listeners = new Set<() => void>();

export function getDetailLevel(): DetailLevel {
  return snapshot;
}

export function setDetailLevel(level: DetailLevel) {
  snapshot = level;
  try {
    window.localStorage.setItem(KEY, level);
  } catch {
    /* ignore */
  }
  try {
    setAiMode(level === "basic" ? "einfach" : level === "extended" ? "normal" : "experte");
  } catch {
    /* ignore */
  }
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useDetailLevel(): DetailLevel {
  return useSyncExternalStore(subscribe, getDetailLevel, getDetailLevel);
}

export const DETAIL_LABEL: Record<DetailLevel, string> = {
  basic: "Basis",
  extended: "Mehr",
  expert: "Experte",
};

export const DETAIL_DESCRIPTION: Record<DetailLevel, string> = {
  basic: "Schnelle Übersicht, das Wichtigste in Sekunden.",
  extended: "Mehr Kontext, Dosis-Tabellen, Mechanismus.",
  expert: "Pharmakologische Tiefe, Halbwertszeiten, klinische Marker.",
};

/** Hilfs-Vergleich: gilt der aktuelle Level mindestens als `min`? */
export function levelGte(current: DetailLevel, min: DetailLevel): boolean {
  const order: Record<DetailLevel, number> = { basic: 0, extended: 1, expert: 2 };
  return order[current] >= order[min];
}
