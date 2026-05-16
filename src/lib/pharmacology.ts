// Pharmakologische Profile pro Substanz: Risk-Flags, CYP-Interaktionen, Rezeptor-Targets.
// Bewusst als separate Datei: keine Eingriffe in die große SUBSTANCES-Datenmenge.
// Initial nur ~20 wichtigste Substanzen — UI fällt für fehlende sauber zurück.

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

// ─── Profil pro Substanz ─────────────────────────────────────────────────

export interface PharmaProfile {
  flags: RiskFlag[];
  cyp: CypInteraction[];
  targets: ReceptorBinding[];
}

// Helper für kompakte Definition
const p = (
  flags: RiskFlag[],
  targets: ReceptorBinding[],
  cyp: CypInteraction[] = [],
): PharmaProfile => ({ flags, cyp, targets });

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
  ),
  psilocybin: p(
    ["serotonergic", "psychosis"],
    [
      { target: "5HT2A", action: "agonist", strength: 3 },
      { target: "5HT1A", action: "agonist", strength: 2 },
      { target: "5HT2C", action: "agonist", strength: 2 },
    ],
  ),
  dmt: p(
    ["serotonergic"],
    [
      { target: "5HT2A", action: "agonist", strength: 3 },
      { target: "5HT1A", action: "agonist", strength: 2 },
      { target: "Sigma1", action: "agonist", strength: 2 },
    ],
  ),
  "2cb": p(
    ["serotonergic", "vasoconstriction"],
    [
      { target: "5HT2A", action: "partialAgonist", strength: 2 },
      { target: "5HT2C", action: "agonist", strength: 2 },
    ],
    [{ enzyme: "CYP2D6", role: "substrate" }],
  ),
  mescaline: p(
    ["serotonergic"],
    [
      { target: "5HT2A", action: "agonist", strength: 2 },
      { target: "5HT1A", action: "agonist", strength: 1 },
    ],
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
  ),
  amphetamine: p(
    ["psychosis", "hyperthermia", "vasoconstriction", "cardiotoxic"],
    [
      { target: "DAT", action: "releaser", strength: 3 },
      { target: "NET", action: "releaser", strength: 3 },
      { target: "VMAT2", action: "substrate", strength: 2 },
    ],
    [{ enzyme: "CYP2D6", role: "substrate" }],
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
  ),
  caffeine: p(
    ["seizure"],
    [],
    [{ enzyme: "CYP1A2", role: "substrate" }, { enzyme: "CYP1A2", role: "inhibitor" }],
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
  ),
  "3mmc": p(
    ["serotonergic", "vasoconstriction", "hyperthermia"],
    [
      { target: "DAT", action: "releaser", strength: 2 },
      { target: "NET", action: "releaser", strength: 2 },
      { target: "SERT", action: "releaser", strength: 2 },
    ],
  ),
  "alpha-pvp": p(
    ["psychosis", "hyperthermia", "cardiotoxic", "vasoconstriction", "seizure"],
    [
      { target: "DAT", action: "inhibitor", strength: 3 },
      { target: "NET", action: "inhibitor", strength: 3 },
    ],
  ),
  mdpv: p(
    ["psychosis", "hyperthermia", "cardiotoxic", "vasoconstriction"],
    [
      { target: "DAT", action: "inhibitor", strength: 3 },
      { target: "NET", action: "inhibitor", strength: 3 },
    ],
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
  ),
  mxe: p(
    ["respiratoryDepression", "psychosis"],
    [
      { target: "NMDA", action: "antagonist", strength: 3 },
      { target: "Sigma1", action: "agonist", strength: 2 },
      { target: "SERT", action: "inhibitor", strength: 1 },
    ],
  ),

  // Cannabinoid
  cannabis: p(
    ["psychosis", "qtProlongation"],
    [
      { target: "CB1", action: "partialAgonist", strength: 2 },
      { target: "CB2", action: "partialAgonist", strength: 1 },
    ],
    [{ enzyme: "CYP3A4", role: "substrate" }, { enzyme: "CYP2C9", role: "substrate" }],
  ),

  // Opioids
  heroin: p(
    ["respiratoryDepression"],
    [
      { target: "MOR", action: "agonist", strength: 3 },
      { target: "DOR", action: "agonist", strength: 1 },
    ],
    [{ enzyme: "CYP3A4", role: "substrate" }],
  ),
  oxycodone: p(
    ["respiratoryDepression"],
    [
      { target: "MOR", action: "agonist", strength: 3 },
      { target: "KOR", action: "agonist", strength: 1 },
    ],
    [{ enzyme: "CYP3A4", role: "substrate" }, { enzyme: "CYP2D6", role: "substrate" }],
  ),
  fentanyl: p(
    ["respiratoryDepression"],
    [{ target: "MOR", action: "agonist", strength: 3 }],
    [{ enzyme: "CYP3A4", role: "substrate" }],
  ),
  tramadol: p(
    ["respiratoryDepression", "serotonergic", "seizure"],
    [
      { target: "MOR", action: "agonist", strength: 2 },
      { target: "SERT", action: "inhibitor", strength: 2 },
      { target: "NET", action: "inhibitor", strength: 2 },
    ],
    [{ enzyme: "CYP2D6", role: "substrate" }, { enzyme: "CYP3A4", role: "substrate" }],
  ),
  "u-47700": p(
    ["respiratoryDepression"],
    [{ target: "MOR", action: "agonist", strength: 3 }, { target: "KOR", action: "agonist", strength: 1 }],
  ),
  etonitazene: p(
    ["respiratoryDepression"],
    [{ target: "MOR", action: "agonist", strength: 3 }],
  ),

  // Depressants & benzos
  alcohol: p(
    ["respiratoryDepression", "hepatotoxic", "seizure"],
    [
      { target: "GABA-A", action: "positiveModulator", strength: 2 },
      { target: "NMDA", action: "antagonist", strength: 2 },
    ],
    [{ enzyme: "CYP2E1", role: "substrate" }],
  ),
  ghb: p(
    ["respiratoryDepression"],
    [
      { target: "GABA-B", action: "agonist", strength: 3 },
      { target: "GABA-A", action: "positiveModulator", strength: 1 },
    ],
  ),
  alprazolam: p(
    ["respiratoryDepression"],
    [{ target: "GABA-A", action: "positiveModulator", strength: 3 }],
    [{ enzyme: "CYP3A4", role: "substrate" }],
  ),
};

// ─── Aggregations-Helper ─────────────────────────────────────────────────

export function profileFor(id: string): PharmaProfile | undefined {
  return PHARMA[id];
}

export interface FlagLoad {
  flag: RiskFlag;
  score: number; // additiv: 1 pro Beitrag
  contributors: string[]; // substance ids
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
  /** True wenn ≥1 Inhibitor/Induktor + ≥1 Substrat → Plasmaspiegel-Verschiebung */
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
