/**
 * Cooldown- & Toleranz-Empfehlungen pro Substanz.
 * Konsens aus Harm-Reduction-Leitfäden (Saferparty, checkit!, PsychonautWiki).
 */
import { loadEntries, type LogEntry } from "./log";
import { SUBSTANCES } from "./substances";

export interface Cooldown {
  /** Empfohlener Mindestabstand in Tagen */
  minDays: number;
  /** Idealer Abstand */
  idealDays: number;
  /** Kurze Begründung */
  reason: string;
}

export const COOLDOWNS: Record<string, Cooldown> = {
  mdma: { minDays: 30, idealDays: 90, reason: "Serotonerge Erholung & Neurotoxizitätsschutz (Drei-Monats-Regel)." },
  mda: { minDays: 30, idealDays: 90, reason: "Wie MDMA — serotonerge Belastung." },
  lsd: { minDays: 7, idealDays: 14, reason: "5-HT2A-Toleranz baut sich rasch auf, normalisiert nach ~14 Tagen." },
  psilocybin: { minDays: 7, idealDays: 14, reason: "Kreuztoleranz mit anderen 5-HT2A-Agonisten." },
  "2c-b": { minDays: 7, idealDays: 14, reason: "5-HT2A-Toleranz." },
  amphetamine: { minDays: 3, idealDays: 7, reason: "Dopaminerge Erholung; Schlaf wichtig." },
  methamphetamine: { minDays: 7, idealDays: 14, reason: "Höhere Neurotoxizität, längere Erholung nötig." },
  cocaine: { minDays: 2, idealDays: 7, reason: "Schnelle Toleranz; Suchtdynamik bei häufigem Gebrauch." },
  mephedrone: { minDays: 14, idealDays: 30, reason: "Kombinierte sero/dopa-Toleranz; Craving-Risiko." },
  ketamine: { minDays: 7, idealDays: 14, reason: "Bladder-Toxizität bei häufigem Gebrauch (K-bladder)." },
  ghb: { minDays: 3, idealDays: 7, reason: "Hohes Abhängigkeitspotenzial bei täglicher Anwendung." },
  alcohol: { minDays: 2, idealDays: 3, reason: "Lebererholung." },
};

export type Status = "go" | "watch" | "wait";

export interface ToleranceStatus {
  status: Status;
  daysSinceLast: number | null;
  cooldown?: Cooldown;
  message: string;
}

/** Letztes Datum eines Substanzkonsums aus dem Log. */
export function lastUseDays(substanceId: string, entries?: LogEntry[]): number | null {
  const list = entries ?? loadEntries();
  const last = list
    .filter((e) => e.substanceId === substanceId)
    .sort((a, b) => b.timestamp - a.timestamp)[0];
  if (!last) return null;
  return Math.floor((Date.now() - last.timestamp) / 86400000);
}

export function getToleranceStatus(substanceId: string, entries?: LogEntry[]): ToleranceStatus {
  const days = lastUseDays(substanceId, entries);
  const cd = COOLDOWNS[substanceId];
  if (days === null) {
    return { status: "go", daysSinceLast: null, cooldown: cd, message: "Kein Eintrag im Log." };
  }
  if (!cd) {
    return { status: "go", daysSinceLast: days, message: `Letztes Mal vor ${days} Tagen. Keine spezifische Cooldown-Regel hinterlegt.` };
  }
  if (days < cd.minDays) return { status: "wait", daysSinceLast: days, cooldown: cd, message: `Letztes Mal vor ${days} Tagen — empfohlen mindestens ${cd.minDays} Tage.` };
  if (days < cd.idealDays) return { status: "watch", daysSinceLast: days, cooldown: cd, message: `Vor ${days} Tagen — Mindestpause erfüllt, ideal wären ${cd.idealDays} Tage.` };
  return { status: "go", daysSinceLast: days, cooldown: cd, message: `Vor ${days} Tagen — gut erholt.` };
}

export function STATUS_META(s: Status) {
  if (s === "go") return { label: "OK", color: "text-emerald-300", bg: "bg-emerald-500/15", ring: "ring-emerald-500/30" };
  if (s === "watch") return { label: "Achtsam", color: "text-amber-300", bg: "bg-amber-500/15", ring: "ring-amber-500/30" };
  return { label: "Lieber warten", color: "text-rose-300", bg: "bg-rose-500/15", ring: "ring-rose-500/30" };
}

/** Sortierte Liste aller Substanzen, für die wir eine Cooldown-Empfehlung haben + Status aus Log. */
export function allToleranceStatuses(): { id: string; name: string; status: ToleranceStatus }[] {
  const entries = loadEntries();
  return Object.keys(COOLDOWNS)
    .map((id) => {
      const sub = SUBSTANCES.find((s) => s.id === id);
      return sub ? { id, name: sub.name, status: getToleranceStatus(id, entries) } : null;
    })
    .filter((x): x is { id: string; name: string; status: ToleranceStatus } => x !== null)
    .sort((a, b) => {
      const order = { wait: 0, watch: 1, go: 2 } as const;
      return order[a.status.status] - order[b.status.status];
    });
}
