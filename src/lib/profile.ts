// User self-assessment profile — stored locally only.
// Used to give the AI context and to soften/sharpen warnings.

export type UsageContext = "party" | "social" | "alone" | "functional" | "creative" | "therapeutic" | "spiritual" | "sleep";
export type Frequency = "never" | "tried_once" | "rare" | "monthly" | "weekly" | "daily";
export type RouteForm = "oral" | "nasal" | "inhaled" | "smoked" | "rectal" | "iv" | "im" | "sublingual" | "transdermal";
export type Motivation = "fun" | "curiosity" | "coping" | "selfmed" | "performance" | "connection" | "escape" | "research";

/** Selbsteinschätzung Pharmakologie-/Safer-Use-Wissen. */
export type ExpertiseLevel = "none" | "casual" | "experienced" | "expert";
/** Beruflicher Hintergrund — beeinflusst Detailtiefe und Fachsprache. */
export type Profession =
  | "none"
  | "medical"        // Arzt/Ärztin, Pflege, Rettungsdienst
  | "pharmacy"       // Apotheker:in, PTA
  | "psychology"     // Psychotherapie, Psychiatrie
  | "harm_reduction" // Drogenhilfe, Streetwork, Checkit-Projekte
  | "research"       // Pharmakologie / Toxikologie
  | "other";

export interface SubstanceExperience {
  substance: string;
  frequency: Frequency;
  routes: RouteForm[];
  lastUse?: string;
}

export interface UserProfile {
  version: 1;
  createdAt: string;
  updatedAt: string;
  nickname?: string;
  ageRange?: "u18" | "18-24" | "25-34" | "35-44" | "45+";
  bodyWeightKg?: number;
  /** Wie tief sollen Erklärungen gehen? */
  expertiseLevel?: ExpertiseLevel;
  /** Beruflicher Kontext (optional, lokal). */
  profession?: Profession;
  experiences: SubstanceExperience[];
  contexts: UsageContext[];
  motivations: Motivation[];
  typicalInterval?: "daily" | "weekly" | "monthly" | "occasional" | "rare";
  medications: string;
  preexistingConditions: string;
  pastAddiction: "none" | "past" | "current" | "unsure";
  inTreatment: boolean;
  saferUseGoals: string;
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
    expertiseLevel: "casual",
    profession: "none",
    experiences: [],
    contexts: [],
    motivations: [],
    medications: "",
    preexistingConditions: "",
    pastAddiction: "none",
    inTreatment: false,
    saferUseGoals: "",
    // Opt-in: sensitive health data (medication, conditions, addiction history)
    // is only sent to the AI after explicit consent.
    shareWithAI: false,
  };
}

/** Detailtiefe für Erklärungen — abgeleitet aus Beruf + Selbsteinschätzung. */
export type DetailLevel = "lay" | "intermediate" | "expert";

export function getDetailLevel(p: UserProfile | null | undefined): DetailLevel {
  if (!p) return "lay";
  if (p.profession === "medical" || p.profession === "pharmacy" || p.profession === "research") {
    return "expert";
  }
  if (p.profession === "psychology" || p.profession === "harm_reduction") {
    return p.expertiseLevel === "expert" ? "expert" : "intermediate";
  }
  switch (p.expertiseLevel) {
    case "expert": return "expert";
    case "experienced": return "intermediate";
    default: return "lay";
  }
}

export const PROFESSION_LABEL: Record<Profession, string> = {
  none: "keine Angabe",
  medical: "Medizin (Arzt/Pflege/Rettung)",
  pharmacy: "Pharmazie / Apotheke",
  psychology: "Psychologie / Psychotherapie",
  harm_reduction: "Drogenhilfe / Streetwork",
  research: "Forschung (Pharma/Tox)",
  other: "anderer Fachbereich",
};

export const EXPERTISE_LABEL: Record<ExpertiseLevel, string> = {
  none: "keine Vorkenntnisse",
  casual: "Grundwissen / Freizeit",
  experienced: "erfahren, kenne Wirkmechanismen grob",
  expert: "Fachwissen / pharmakologisch versiert",
};

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

  const detail = getDetailLevel(p);
  if (p.profession && p.profession !== "none") lines.push(`Beruflicher Hintergrund: ${PROFESSION_LABEL[p.profession]}`);
  if (p.expertiseLevel) lines.push(`Selbsteinschätzung Wissen: ${EXPERTISE_LABEL[p.expertiseLevel]}`);
  lines.push(`Gewünschte Detailtiefe: ${detail}`);

  const styleInstruction = {
    lay: "Antworte in einfacher Alltagssprache, vermeide Fachbegriffe oder erkläre sie kurz in Klammern. Kein Pharmakologie-Jargon.",
    intermediate: "Verwende gängige pharmakologische Begriffe (Rezeptor-Klassen, Halbwertszeit, Tachyphylaxie) ohne sie jedes Mal zu definieren. Erkläre Mechanismen knapp.",
    expert: "Schreibe auf Fachniveau (medizinische Fachkraft): konkrete Rezeptor-Subtypen, CYP-Enzyme, Halbwertszeiten, klinische Kontraindikationen, relevante Studien. Keine Vereinfachung, keine moralisierenden Disclaimer wenn nicht nötig.",
  }[detail];

  lines.push(
    "",
    "Beziehe diese Angaben sachlich ein: passe Dosis-Hinweise an Erfahrung & Gewicht an, weise auf relevante Wechselwirkungen mit genannten Medikamenten hin, vermeide Belehrung, kein Moralisieren.",
    styleInstruction,
  );
  return lines.join("\n");
}
