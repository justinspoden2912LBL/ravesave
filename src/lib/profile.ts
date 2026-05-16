// User self-assessment profile — stored locally only.
// Used to give the AI context and to soften/sharpen warnings.

export type UsageContext = "party" | "social" | "alone" | "functional" | "creative" | "therapeutic" | "spiritual" | "sleep";
export type Frequency = "never" | "tried_once" | "rare" | "monthly" | "weekly" | "daily";
export type RouteForm = "oral" | "nasal" | "inhaled" | "smoked" | "rectal" | "iv" | "im" | "sublingual" | "transdermal";
export type Motivation = "fun" | "curiosity" | "coping" | "selfmed" | "performance" | "connection" | "escape" | "research";

export interface SubstanceExperience {
  substance: string;
  frequency: Frequency;
  routes: RouteForm[];
  lastUse?: string; // ISO date (optional)
}

export interface UserProfile {
  version: 1;
  createdAt: string;
  updatedAt: string;
  nickname?: string;
  ageRange?: "u18" | "18-24" | "25-34" | "35-44" | "45+";
  bodyWeightKg?: number;
  experiences: SubstanceExperience[];
  contexts: UsageContext[];
  motivations: Motivation[];
  // Frequency / pattern
  typicalInterval?: "daily" | "weekly" | "monthly" | "occasional" | "rare";
  // Health
  medications: string; // free text
  preexistingConditions: string; // free text (mental + physical)
  pastAddiction: "none" | "past" | "current" | "unsure";
  inTreatment: boolean;
  // Goals
  saferUseGoals: string; // free text
  // Consent
  shareWithAI: boolean;
}

const KEY = "trace.profile.v1";
const DISMISS_KEY = "trace.profile.dismissed";

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: UserProfile) {
  localStorage.setItem(KEY, JSON.stringify({ ...p, updatedAt: new Date().toISOString() }));
}

export function clearProfile() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(DISMISS_KEY);
}

export function dismissOnboarding() {
  localStorage.setItem(DISMISS_KEY, "1");
}
export function isDismissed() {
  return typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1";
}

export function emptyProfile(): UserProfile {
  const now = new Date().toISOString();
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    experiences: [],
    contexts: [],
    motivations: [],
    medications: "",
    preexistingConditions: "",
    pastAddiction: "none",
    inTreatment: false,
    saferUseGoals: "",
    shareWithAI: true,
  };
}

const FREQ_LABEL: Record<Frequency, string> = {
  never: "nie",
  tried_once: "einmal probiert",
  rare: "selten",
  monthly: "monatlich",
  weekly: "wöchentlich",
  daily: "täglich",
};
const CONTEXT_LABEL: Record<UsageContext, string> = {
  party: "Party",
  social: "sozial",
  alone: "allein",
  functional: "funktional/Alltag",
  creative: "kreativ",
  therapeutic: "therapeutisch",
  spiritual: "spirituell",
  sleep: "Schlaf",
};
const MOT_LABEL: Record<Motivation, string> = {
  fun: "Spaß",
  curiosity: "Neugier",
  coping: "Bewältigung von Stress",
  selfmed: "Selbstmedikation",
  performance: "Leistung",
  connection: "Verbindung",
  escape: "Eskapismus",
  research: "Selbsterforschung",
};

/** Plain-text summary handed to the AI as additional system context. */
export function summarizeProfile(p: UserProfile): string {
  if (!p.shareWithAI) return "";
  const lines: string[] = ["NUTZER:IN-PROFIL (Selbsteinschätzung, lokal gespeichert):"];
  if (p.nickname) lines.push(`Name: ${p.nickname}`);
  if (p.ageRange) lines.push(`Alter: ${p.ageRange}`);
  if (p.bodyWeightKg) lines.push(`Gewicht: ${p.bodyWeightKg} kg`);

  if (p.experiences.length > 0) {
    lines.push("Erfahrung:");
    for (const e of p.experiences) {
      const routes = e.routes.length ? ` [${e.routes.join("/")}]` : "";
      lines.push(`  • ${e.substance}: ${FREQ_LABEL[e.frequency]}${routes}`);
    }
  }
  if (p.contexts.length) lines.push(`Settings: ${p.contexts.map((c) => CONTEXT_LABEL[c]).join(", ")}`);
  if (p.motivations.length) lines.push(`Motivation: ${p.motivations.map((m) => MOT_LABEL[m]).join(", ")}`);
  if (p.typicalInterval) lines.push(`Typisches Intervall: ${p.typicalInterval}`);
  if (p.medications.trim()) lines.push(`Medikamente: ${p.medications.trim()}`);
  if (p.preexistingConditions.trim()) lines.push(`Vorerkrankungen: ${p.preexistingConditions.trim()}`);
  lines.push(
    `Suchtgeschichte: ${
      { none: "keine", past: "in Vergangenheit", current: "aktuell", unsure: "unsicher" }[p.pastAddiction]
    }${p.inTreatment ? " (aktuell in Behandlung)" : ""}`,
  );
  if (p.saferUseGoals.trim()) lines.push(`Eigene Safer-Use-Ziele: ${p.saferUseGoals.trim()}`);

  lines.push(
    "",
    "Beziehe diese Angaben sachlich ein: passe Dosis-Hinweise an Erfahrung & Gewicht an, weise auf relevante Wechselwirkungen mit genannten Medikamenten hin, vermeide Belehrung, kein Moralisieren.",
  );
  return lines.join("\n");
}
