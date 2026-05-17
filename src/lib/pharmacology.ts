// Pharmakologische Profile pro Substanz: Risk-Flags, CYP-Interaktionen, Rezeptor-Targets,
// Transmitter-Profil (DAT/NET/SERT/VMAT2) und subjektives Effekt-Profil.

import {
  Flame,
  HeartPulse,
  Wind,
  Zap,
  Brain,
  Activity,
  Thermometer,
  Droplet,
  Eye,
  type LucideIcon,
} from "lucide-react";

// ─── Risk Flags ──────────────────────────────────────────────────────────

export type RiskFlag =
  | "serotonergic"
  | "qtProlongation"
  | "seizure"
  | "respiratoryDepression"
  | "psychosis"
  | "vasoconstriction"
  | "hyperthermia"
  | "hepatotoxic"
  | "cardiotoxic";

export const RISK_FLAG_META: Record<
  RiskFlag,
  { label: string; short: string; icon: LucideIcon; token: string; blurb: string }
> = {
  serotonergic: {
    label: "Serotonerges Risiko",
    short: "5-HT",
    icon: Brain,
    token: "var(--flag-serotonergic)",
    blurb: "Kann zu Serotonin-Syndrom beitragen (besonders mit MAOI/SSRI/anderen Releasern).",
  },
  qtProlongation: {
    label: "QT-Verlängerung",
    short: "QT↑",
    icon: HeartPulse,
    token: "var(--flag-qt)",
    blurb: "Verlängert das QT-Intervall — Risiko für Torsade de Pointes.",
  },
  seizure: {
    label: "Krampfrisiko",
    short: "Krampf",
    icon: Zap,
    token: "var(--flag-seizure)",
    blurb: "Senkt die Krampfschwelle.",
  },
  respiratoryDepression: {
    label: "Atemdepression",
    short: "Atmung",
    icon: Wind,
    token: "var(--flag-respiratory)",
    blurb: "Drückt den Atemantrieb — additiv mit Opioiden/Benzos/Alkohol lebensgefährlich.",
  },
  psychosis: {
    label: "Psychoserisiko",
    short: "Psy",
    icon: Eye,
    token: "var(--flag-psychosis)",
    blurb: "Kann Psychosen oder Wahn auslösen — besonders bei Schlafentzug/Veranlagung.",
  },
  vasoconstriction: {
    label: "Vasokonstriktion",
    short: "Vaso",
    icon: Activity,
    token: "var(--flag-vaso)",
    blurb: "Verengt Gefäße — Risiko für Vasospasmus, Infarkt, kalte Extremitäten.",
  },
  hyperthermia: {
    label: "Hyperthermie",
    short: "Hitze",
    icon: Thermometer,
    token: "var(--flag-hyperthermia)",
    blurb: "Treibt Körpertemperatur hoch — kritisch in Clubs/heißer Umgebung.",
  },
  hepatotoxic: {
    label: "Lebertoxizität",
    short: "Leber",
    icon: Droplet,
    token: "var(--flag-hepatotoxic)",
    blurb: "Belastet die Leber, akut oder chronisch.",
  },
  cardiotoxic: {
    label: "Kardiotoxizität",
    short: "Herz",
    icon: Flame,
    token: "var(--flag-cardiotoxic)",
    blurb: "Direkter Schaden am Herzmuskel oder Rhythmusstörungen.",
  },
};

// ─── CYP ─────────────────────────────────────────────────────────────────

export type CypEnzyme = "CYP2D6" | "CYP3A4" | "CYP1A2" | "CYP2C9" | "CYP2C19" | "CYP2B6" | "CYP2E1";
export type CypRole = "substrate" | "inhibitor" | "inducer";
export type CypInteraction = { enzyme: CypEnzyme; role: CypRole };

export const CYP_ROLE_META: Record<CypRole, { symbol: string; label: string; tone: string }> = {
  substrate: { symbol: "→", label: "Substrat (wird abgebaut)", tone: "text-muted-foreground border-border" },
  inhibitor: { symbol: "⇩", label: "Hemmer (verzögert Abbau anderer Stoffe)", tone: "text-[color:var(--flag-vaso)] border-[color:var(--flag-vaso)]/40" },
  inducer:   { symbol: "⇧", label: "Induktor (beschleunigt Abbau anderer Stoffe)", tone: "text-[color:var(--flag-serotonergic)] border-[color:var(--flag-serotonergic)]/40" },
};

// ─── Rezeptor-Targets ────────────────────────────────────────────────────

export type ReceptorTarget =
  | "5HT2A" | "5HT1A" | "5HT2C" | "SERT"
  | "DAT" | "NET" | "VMAT2"
  | "MOR" | "KOR" | "DOR"
  | "NMDA" | "Sigma1"
  | "GABA-A" | "GABA-B"
  | "CB1" | "CB2"
  | "α4β2" | "H1" | "D2";

export type TargetAction =
  | "agonist" | "partialAgonist" | "antagonist"
  | "inhibitor" | "releaser" | "substrate"
  | "positiveModulator" | "negativeModulator";

export type ReceptorBinding = { target: ReceptorTarget; action: TargetAction; strength?: 1 | 2 | 3 };

export type TargetFamily = "monoamine" | "opioid" | "glutamate" | "gaba" | "cannabinoid" | "other";

export const TARGET_META: Record<
  ReceptorTarget,
  { label: string; family: TargetFamily; token: string }
> = {
  "5HT2A":  { label: "5-HT2A", family: "monoamine", token: "var(--target-monoamine)" },
  "5HT1A":  { label: "5-HT1A", family: "monoamine", token: "var(--target-monoamine)" },
  "5HT2C":  { label: "5-HT2C", family: "monoamine", token: "var(--target-monoamine)" },
  "SERT":   { label: "SERT",   family: "monoamine", token: "var(--target-monoamine)" },
  "DAT":    { label: "DAT",    family: "monoamine", token: "var(--target-monoamine)" },
  "NET":    { label: "NET",    family: "monoamine", token: "var(--target-monoamine)" },
  "VMAT2":  { label: "VMAT2",  family: "monoamine", token: "var(--target-monoamine)" },
  "D2":     { label: "D2",     family: "monoamine", token: "var(--target-monoamine)" },
  "MOR":    { label: "µ (MOR)", family: "opioid", token: "var(--target-opioid)" },
  "KOR":    { label: "κ (KOR)", family: "opioid", token: "var(--target-opioid)" },
  "DOR":    { label: "δ (DOR)", family: "opioid", token: "var(--target-opioid)" },
  "NMDA":   { label: "NMDA",   family: "glutamate", token: "var(--target-glutamate)" },
  "Sigma1": { label: "σ1",     family: "glutamate", token: "var(--target-glutamate)" },
  "GABA-A": { label: "GABA-A", family: "gaba", token: "var(--target-gaba)" },
  "GABA-B": { label: "GABA-B", family: "gaba", token: "var(--target-gaba)" },
  "CB1":    { label: "CB1",    family: "cannabinoid", token: "var(--target-cannabinoid)" },
  "CB2":    { label: "CB2",    family: "cannabinoid", token: "var(--target-cannabinoid)" },
  "α4β2":   { label: "α4β2",   family: "other", token: "var(--target-cholinergic)" },
  "H1":     { label: "H1",     family: "other", token: "var(--target-cholinergic)" },
};

export const ACTION_SYMBOL: Record<TargetAction, string> = {
  agonist: "▲",
  partialAgonist: "△",
  antagonist: "▽",
  inhibitor: "○",
  releaser: "◆",
  substrate: "·",
  positiveModulator: "＋",
  negativeModulator: "−",
};

export const ACTION_LABEL: Record<TargetAction, string> = {
  agonist: "Agonist",
  partialAgonist: "Partialagonist",
  antagonist: "Antagonist",
  inhibitor: "Hemmer",
  releaser: "Releaser",
  substrate: "Substrat",
  positiveModulator: "Pos. Modulator",
  negativeModulator: "Neg. Modulator",
};

// ─── Transmitter Profile (DAT/NET/SERT/VMAT2) ────────────────────────────
// Signed scale -3..+3. Positive = release/agonism, Negative = reuptake inhibition.

export interface TransmitterProfile {
  DAT: number;   // Dopamin transporter activity (release+ / inhibit-)
  NET: number;   // Noradrenalin
  SERT: number;  // Serotonin
  VMAT2: number; // Vesicular monoamine transporter interaction
}

// ─── Subjective Effect Profile (0..3) ────────────────────────────────────

export interface EffectProfile {
  warmth: number;        // empathogene Wärme
  stimulation: number;   // körperliche/cognitive Stimulation
  compulsiveness: number;// Craving / Re-Dose-Drang
  psychosis: number;     // Psychoserisiko
  neurotoxicity: number; // Neurotoxizitäts-Profil
}

// ─── Profil pro Substanz ─────────────────────────────────────────────────

export interface PharmaProfile {
  flags: RiskFlag[];
  cyp: CypInteraction[];
  targets: ReceptorBinding[];
  transmitter?: TransmitterProfile;
  effects?: EffectProfile;
}

// Helper für kompakte Definition
const p = (
  flags: RiskFlag[],
  targets: ReceptorBinding[],
  cyp: CypInteraction[] = [],
  transmitter?: TransmitterProfile,
  effects?: EffectProfile,
): PharmaProfile => ({ flags, cyp, targets, transmitter, effects });

const tr = (DAT: number, NET: number, SERT: number, VMAT2 = 0): TransmitterProfile =>
  ({ DAT, NET, SERT, VMAT2 });
const ef = (
  warmth: number, stimulation: number, compulsiveness: number,
  psychosis: number, neurotoxicity: number,
): EffectProfile => ({ warmth, stimulation, compulsiveness, psychosis, neurotoxicity });

export const PHARMA: Record<string, PharmaProfile> = {
  // Psychedelics
  lsd: p(
    ["serotonergic", "psychosis", "vasoconstriction"],
    [
      { target: "5HT2A", action: "partialAgonist", strength: 3 },
      { target: "5HT1A", action: "agonist", strength: 2 },
      { target: "5HT2C", action: "agonist", strength: 2 },
      { target: "D2", action: "partialAgonist", strength: 1 },
    ],
    [],
    tr(0, 0, 0),
    ef(2, 2, 0, 2, 0),
  ),
  psilocybin: p(
    ["serotonergic", "psychosis"],
    [
      { target: "5HT2A", action: "agonist", strength: 3 },
      { target: "5HT1A", action: "agonist", strength: 2 },
      { target: "5HT2C", action: "agonist", strength: 2 },
    ],
    [],
    tr(0, 0, 0),
    ef(2, 1, 0, 2, 0),
  ),
  dmt: p(
    ["serotonergic"],
    [
      { target: "5HT2A", action: "agonist", strength: 3 },
      { target: "5HT1A", action: "agonist", strength: 2 },
      { target: "Sigma1", action: "agonist", strength: 2 },
    ],
    [],
    tr(0, 0, 0),
    ef(1, 1, 0, 2, 0),
  ),
  "2cb": p(
    ["serotonergic", "vasoconstriction"],
    [
      { target: "5HT2A", action: "partialAgonist", strength: 2 },
      { target: "5HT2C", action: "agonist", strength: 2 },
    ],
    [{ enzyme: "CYP2D6", role: "substrate" }],
    tr(0, 0, 0),
    ef(2, 2, 1, 1, 0),
  ),
  mescaline: p(
    ["serotonergic"],
    [
      { target: "5HT2A", action: "agonist", strength: 2 },
      { target: "5HT1A", action: "agonist", strength: 1 },
    ],
    [],
    tr(0, 0, 0),
    ef(2, 1, 0, 1, 0),
  ),

  // Empathogens
  mdma: p(
    ["serotonergic", "hyperthermia", "qtProlongation", "vasoconstriction", "hepatotoxic"],
    [
      { target: "SERT", action: "releaser", strength: 3 },
      { target: "NET", action: "releaser", strength: 2 },
      { target: "DAT", action: "releaser", strength: 2 },
      { target: "VMAT2", action: "substrate", strength: 2 },
      { target: "5HT2A", action: "agonist", strength: 1 },
    ],
    [{ enzyme: "CYP2D6", role: "substrate" }, { enzyme: "CYP2D6", role: "inhibitor" }],
    tr(2, 2, 3, 2),
    ef(3, 2, 2, 1, 3),
  ),

  // Stimulants
  cocaine: p(
    ["vasoconstriction", "cardiotoxic", "qtProlongation", "seizure", "hyperthermia", "psychosis"],
    [
      { target: "DAT", action: "inhibitor", strength: 3 },
      { target: "NET", action: "inhibitor", strength: 3 },
      { target: "SERT", action: "inhibitor", strength: 2 },
      { target: "Sigma1", action: "agonist", strength: 1 },
    ],
    [{ enzyme: "CYP3A4", role: "substrate" }],
    tr(-3, -3, -2, 0),
    ef(0, 3, 3, 2, 2),
  ),
  amphetamine: p(
    ["psychosis", "hyperthermia", "vasoconstriction", "cardiotoxic"],
    [
      { target: "DAT", action: "releaser", strength: 3 },
      { target: "NET", action: "releaser", strength: 3 },
      { target: "VMAT2", action: "substrate", strength: 2 },
    ],
    [{ enzyme: "CYP2D6", role: "substrate" }],
    tr(3, 3, 1, 2),
    ef(0, 3, 2, 2, 2),
  ),
  methamphetamine: p(
    ["psychosis", "hyperthermia", "vasoconstriction", "cardiotoxic", "seizure"],
    [
      { target: "DAT", action: "releaser", strength: 3 },
      { target: "NET", action: "releaser", strength: 3 },
      { target: "SERT", action: "releaser", strength: 1 },
      { target: "VMAT2", action: "substrate", strength: 2 },
      { target: "Sigma1", action: "agonist", strength: 1 },
    ],
    [{ enzyme: "CYP2D6", role: "substrate" }],
    tr(3, 3, 1, 3),
    ef(0, 3, 3, 3, 3),
  ),
  caffeine: p(
    ["seizure"],
    [],
    [{ enzyme: "CYP1A2", role: "substrate" }, { enzyme: "CYP1A2", role: "inhibitor" }],
    tr(0, 1, 0, 0),
    ef(0, 1, 1, 0, 0),
  ),

  // Cathinones
  mephedrone: p(
    ["serotonergic", "vasoconstriction", "hyperthermia", "cardiotoxic"],
    [
      { target: "DAT", action: "releaser", strength: 2 },
      { target: "NET", action: "releaser", strength: 2 },
      { target: "SERT", action: "releaser", strength: 2 },
    ],
    [{ enzyme: "CYP2D6", role: "substrate" }],
    tr(2, 2, 2, 1),
    ef(2, 3, 3, 1, 2),
  ),
  "3mmc": p(
    ["serotonergic", "vasoconstriction", "hyperthermia"],
    [
      { target: "DAT", action: "releaser", strength: 2 },
      { target: "NET", action: "releaser", strength: 2 },
      { target: "SERT", action: "releaser", strength: 2 },
    ],
    [],
    tr(2, 2, 2, 1),
    ef(2, 2, 3, 1, 2),
  ),
  "alpha-pvp": p(
    ["psychosis", "hyperthermia", "cardiotoxic", "vasoconstriction", "seizure"],
    [
      { target: "DAT", action: "inhibitor", strength: 3 },
      { target: "NET", action: "inhibitor", strength: 3 },
    ],
    [],
    tr(-3, -3, 0, 0),
    ef(0, 3, 3, 3, 2),
  ),
  mdpv: p(
    ["psychosis", "hyperthermia", "cardiotoxic", "vasoconstriction"],
    [
      { target: "DAT", action: "inhibitor", strength: 3 },
      { target: "NET", action: "inhibitor", strength: 3 },
    ],
    [],
    tr(-3, -3, 0, 0),
    ef(0, 3, 3, 3, 2),
  ),

  // Dissociatives
  ketamine: p(
    ["respiratoryDepression", "psychosis"],
    [
      { target: "NMDA", action: "antagonist", strength: 3 },
      { target: "Sigma1", action: "agonist", strength: 1 },
      { target: "MOR", action: "agonist", strength: 1 },
    ],
    [{ enzyme: "CYP3A4", role: "substrate" }, { enzyme: "CYP2B6", role: "substrate" }],
    tr(0, 0, 0),
    ef(1, 1, 2, 2, 1),
  ),
  mxe: p(
    ["respiratoryDepression", "psychosis"],
    [
      { target: "NMDA", action: "antagonist", strength: 3 },
      { target: "Sigma1", action: "agonist", strength: 2 },
      { target: "SERT", action: "inhibitor", strength: 1 },
    ],
    [],
    tr(0, 0, -1),
    ef(1, 1, 2, 2, 2),
  ),

  // Cannabinoid
  cannabis: p(
    ["psychosis", "qtProlongation"],
    [
      { target: "CB1", action: "partialAgonist", strength: 2 },
      { target: "CB2", action: "partialAgonist", strength: 1 },
    ],
    [{ enzyme: "CYP3A4", role: "substrate" }, { enzyme: "CYP2C9", role: "substrate" }],
    tr(0, 0, 0),
    ef(1, 0, 1, 1, 0),
  ),

  // Opioids
  heroin: p(
    ["respiratoryDepression"],
    [
      { target: "MOR", action: "agonist", strength: 3 },
      { target: "DOR", action: "agonist", strength: 1 },
    ],
    [{ enzyme: "CYP3A4", role: "substrate" }],
    tr(0, 0, 0),
    ef(2, 0, 3, 0, 0),
  ),
  oxycodone: p(
    ["respiratoryDepression"],
    [
      { target: "MOR", action: "agonist", strength: 3 },
      { target: "KOR", action: "agonist", strength: 1 },
    ],
    [{ enzyme: "CYP3A4", role: "substrate" }, { enzyme: "CYP2D6", role: "substrate" }],
    tr(0, 0, 0),
    ef(2, 0, 3, 0, 0),
  ),
  fentanyl: p(
    ["respiratoryDepression"],
    [{ target: "MOR", action: "agonist", strength: 3 }],
    [{ enzyme: "CYP3A4", role: "substrate" }],
    tr(0, 0, 0),
    ef(1, 0, 3, 0, 0),
  ),
  tramadol: p(
    ["respiratoryDepression", "serotonergic", "seizure"],
    [
      { target: "MOR", action: "agonist", strength: 2 },
      { target: "SERT", action: "inhibitor", strength: 2 },
      { target: "NET", action: "inhibitor", strength: 2 },
    ],
    [{ enzyme: "CYP2D6", role: "substrate" }, { enzyme: "CYP3A4", role: "substrate" }],
    tr(0, -2, -2),
    ef(1, 1, 2, 1, 0),
  ),
  "u-47700": p(
    ["respiratoryDepression"],
    [{ target: "MOR", action: "agonist", strength: 3 }, { target: "KOR", action: "agonist", strength: 1 }],
    [],
    tr(0, 0, 0),
    ef(1, 0, 3, 0, 0),
  ),
  etonitazene: p(
    ["respiratoryDepression"],
    [{ target: "MOR", action: "agonist", strength: 3 }],
    [],
    tr(0, 0, 0),
    ef(1, 0, 3, 0, 0),
  ),

  // Depressants & benzos
  alcohol: p(
    ["respiratoryDepression", "hepatotoxic", "seizure"],
    [
      { target: "GABA-A", action: "positiveModulator", strength: 2 },
      { target: "NMDA", action: "antagonist", strength: 2 },
    ],
    [{ enzyme: "CYP2E1", role: "substrate" }],
    tr(0, 0, 0),
    ef(1, 0, 2, 1, 1),
  ),
  ghb: p(
    ["respiratoryDepression"],
    [
      { target: "GABA-B", action: "agonist", strength: 3 },
      { target: "GABA-A", action: "positiveModulator", strength: 1 },
    ],
    [],
    tr(0, 0, 0),
    ef(2, 0, 3, 0, 0),
  ),
  alprazolam: p(
    ["respiratoryDepression"],
    [{ target: "GABA-A", action: "positiveModulator", strength: 3 }],
    [{ enzyme: "CYP3A4", role: "substrate" }],
    tr(0, 0, 0),
    ef(0, 0, 3, 0, 0),
  ),
};

// ─── Aggregations-Helper ─────────────────────────────────────────────────

export function profileFor(id: string): PharmaProfile | undefined {
  return PHARMA[id];
}

export interface FlagLoad {
  flag: RiskFlag;
  score: number;
  contributors: string[];
}

export function aggregateFlags(ids: string[]): FlagLoad[] {
  const map = new Map<RiskFlag, FlagLoad>();
  for (const id of ids) {
    const prof = PHARMA[id];
    if (!prof) continue;
    for (const f of prof.flags) {
      const cur = map.get(f) ?? { flag: f, score: 0, contributors: [] };
      cur.score += 1;
      cur.contributors.push(id);
      map.set(f, cur);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.score - a.score);
}

export interface CypConflict {
  enzyme: CypEnzyme;
  inhibitors: string[];
  inducers: string[];
  substrates: string[];
  conflict: boolean;
}

export function aggregateCyp(ids: string[]): CypConflict[] {
  const buckets = new Map<CypEnzyme, CypConflict>();
  for (const id of ids) {
    const prof = PHARMA[id];
    if (!prof) continue;
    for (const c of prof.cyp) {
      const cur =
        buckets.get(c.enzyme) ??
        { enzyme: c.enzyme, inhibitors: [], inducers: [], substrates: [], conflict: false };
      if (c.role === "inhibitor") cur.inhibitors.push(id);
      if (c.role === "inducer") cur.inducers.push(id);
      if (c.role === "substrate") cur.substrates.push(id);
      buckets.set(c.enzyme, cur);
    }
  }
  for (const c of buckets.values()) {
    c.conflict = c.substrates.length > 0 && (c.inhibitors.length > 0 || c.inducers.length > 0);
  }
  return Array.from(buckets.values());
}

// ─── Aggregierte Risiken für Mix-Checker ─────────────────────────────────

export type MixRiskKey =
  | "serotoninSyndrome"
  | "respiratoryDepression"
  | "seizure"
  | "qtProlongation"
  | "psychosis"
  | "cardiovascularStrain"
  | "neurotoxicityAmplification";

export const MIX_RISK_META: Record<MixRiskKey, { label: string; short: string; blurb: string; token: string; icon: LucideIcon }> = {
  serotoninSyndrome: {
    label: "Serotonin-Syndrom",
    short: "5-HT",
    icon: Brain,
    token: "var(--flag-serotonergic)",
    blurb: "Übermaß an Serotonin durch Releaser + Reuptake-Hemmer oder MAOI. Lebensbedrohlich.",
  },
  respiratoryDepression: {
    label: "Atemdepression",
    short: "Atmung",
    icon: Wind,
    token: "var(--flag-respiratory)",
    blurb: "Opioide + Benzos + Alkohol/GHB drücken den Atemantrieb additiv.",
  },
  seizure: {
    label: "Krampfanfälle",
    short: "Krampf",
    icon: Zap,
    token: "var(--flag-seizure)",
    blurb: "Mehrere krampfschwellensenkende Substanzen oder Entzug + Stimulans.",
  },
  qtProlongation: {
    label: "QT-Verlängerung",
    short: "QT↑",
    icon: HeartPulse,
    token: "var(--flag-qt)",
    blurb: "Verlängerung des QT-Intervalls → Torsade de Pointes.",
  },
  psychosis: {
    label: "Psychose",
    short: "Psy",
    icon: Eye,
    token: "var(--flag-psychosis)",
    blurb: "Dopaminerge Überstimulation + Schlafentzug + Veranlagung.",
  },
  cardiovascularStrain: {
    label: "Kardiovaskuläre Last",
    short: "Herz",
    icon: HeartPulse,
    token: "var(--flag-cardiotoxic)",
    blurb: "Vasokonstriktion + Stimulation + QT-Last → Herzinfarkt, Schlaganfall.",
  },
  neurotoxicityAmplification: {
    label: "Neurotoxizität",
    short: "Neuro",
    icon: Brain,
    token: "var(--flag-vaso)",
    blurb: "Hyperthermie + serotonerge/dopaminerge Last → Schaden an Neuronen.",
  },
};

export interface MixRiskScore {
  key: MixRiskKey;
  score: number;       // 0..100
  level: "ok" | "warn" | "danger";
  contributors: string[];
  reason: string;
}

const lvl = (s: number): "ok" | "warn" | "danger" =>
  s >= 65 ? "danger" : s >= 35 ? "warn" : "ok";

export function aggregateMixRisks(ids: string[]): MixRiskScore[] {
  const profiles = ids
    .map((id) => ({ id, p: PHARMA[id] }))
    .filter((x): x is { id: string; p: PharmaProfile } => !!x.p);
  if (profiles.length < 1) return [];

  const has = (id: string, flag: RiskFlag) => profiles.find((x) => x.id === id)?.p.flags.includes(flag);
  const flagCount = (flag: RiskFlag) => profiles.filter((x) => x.p.flags.includes(flag));

  // serotonin syndrome
  const sero = flagCount("serotonergic");
  const seroScore = Math.min(100, sero.length * 30 + (sero.length >= 2 ? 25 : 0));

  // respiratory
  const resp = flagCount("respiratoryDepression");
  const respScore = Math.min(100, resp.length * 35 + (resp.length >= 2 ? 30 : 0));

  // seizure
  const sz = flagCount("seizure");
  const szScore = Math.min(100, sz.length * 30 + (sz.length >= 2 ? 15 : 0));

  // qt
  const qt = flagCount("qtProlongation");
  const qtScore = Math.min(100, qt.length * 35 + (qt.length >= 2 ? 25 : 0));

  // psychosis
  const psy = flagCount("psychosis");
  const psyEffect = profiles.reduce((s, x) => s + (x.p.effects?.psychosis ?? 0), 0);
  const psyScore = Math.min(100, psy.length * 25 + psyEffect * 10);

  // cardiovascular
  const vaso = flagCount("vasoconstriction");
  const cardio = flagCount("cardiotoxic");
  const cvScore = Math.min(100, vaso.length * 20 + cardio.length * 25 + qt.length * 15);

  // neurotoxicity
  const hyp = flagCount("hyperthermia");
  const neuroEffect = profiles.reduce((s, x) => s + (x.p.effects?.neurotoxicity ?? 0), 0);
  const neuroScore = Math.min(100, hyp.length * 20 + sero.length * 15 + neuroEffect * 10);

  const result: MixRiskScore[] = [
    {
      key: "serotoninSyndrome",
      score: seroScore,
      level: lvl(seroScore),
      contributors: sero.map((x) => x.id),
      reason: sero.length >= 2
        ? "Mehrere serotonerge Substanzen — additives 5-HT-Risiko."
        : sero.length === 1
        ? "Eine serotonerge Substanz — Risiko gering, ohne MAOI/SSRI."
        : "Keine serotonergen Substanzen.",
    },
    {
      key: "respiratoryDepression",
      score: respScore,
      level: lvl(respScore),
      contributors: resp.map((x) => x.id),
      reason: resp.length >= 2
        ? "Mehrere atemdepressive Substanzen — lebensgefährlich additiv."
        : resp.length === 1
        ? "Eine atemdepressive Substanz — Wachsamkeit empfohlen."
        : "Keine atemdepressiven Substanzen.",
    },
    {
      key: "seizure",
      score: szScore,
      level: lvl(szScore),
      contributors: sz.map((x) => x.id),
      reason: sz.length >= 2
        ? "Mehrere Substanzen senken Krampfschwelle."
        : sz.length === 1
        ? "Eine krampfschwellensenkende Substanz."
        : "Kein erhöhtes Krampfrisiko aus diesem Mix.",
    },
    {
      key: "qtProlongation",
      score: qtScore,
      level: lvl(qtScore),
      contributors: qt.map((x) => x.id),
      reason: qt.length >= 2
        ? "Mehrere QT-verlängernde Substanzen — Torsade-Risiko."
        : qt.length === 1
        ? "Eine QT-verlängernde Substanz."
        : "Kein bekanntes QT-Risiko.",
    },
    {
      key: "psychosis",
      score: psyScore,
      level: lvl(psyScore),
      contributors: psy.map((x) => x.id),
      reason: psy.length >= 1
        ? `Psychoserisiko durch ${psy.length} Substanz(en) + dopaminerge Last.`
        : "Geringes Psychoserisiko.",
    },
    {
      key: "cardiovascularStrain",
      score: cvScore,
      level: lvl(cvScore),
      contributors: [...new Set([...vaso.map((x) => x.id), ...cardio.map((x) => x.id)])],
      reason: cvScore >= 35
        ? "Vasokonstriktion + Kardio-Belastung addieren sich."
        : "Geringe Herz-Kreislauf-Belastung aus diesem Mix.",
    },
    {
      key: "neurotoxicityAmplification",
      score: neuroScore,
      level: lvl(neuroScore),
      contributors: [...new Set([...hyp.map((x) => x.id), ...sero.map((x) => x.id)])],
      reason: neuroScore >= 35
        ? "Hyperthermie + serotonerge Last erhöhen Neurotoxizität."
        : "Niedriges Neurotoxizitäts-Profil.",
    },
  ];
  // Suppress utility 'has' helper unused warning
  void has;
  return result.sort((a, b) => b.score - a.score);
}
