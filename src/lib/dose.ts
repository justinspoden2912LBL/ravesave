/**
 * Personalisierte Dosis-Empfehlung auf Basis Körpergewicht.
 * Konservativ: nimmt das untere Ende der "common"-Range als Pro-kg-Faktor
 * gegenüber 70 kg Referenzgewicht und skaliert linear.
 */
import { SUBSTANCES, type Substance } from "./substances";
import { loadProfile } from "./profile";

const REFERENCE_KG = 70;

/** Substanzen, bei denen Pro-kg-Skalierung physiologisch sinnvoll ist (oral/nasal). */
const SCALE_MAP: Record<string, true> = {
  mdma: true,
  mda: true,
  amphetamine: true,
  methamphetamine: true,
  cocaine: true,
  ketamine: true,
  mephedrone: true,
  "2c-b": true,
  ghb: true,
  alcohol: true,
};

export interface DoseSuggestion {
  /** Empfohlener Start-Wert in mg (oder ml für GHB), schon gerundet. */
  startMg: number;
  /** Common-Wert in mg für dieses Gewicht. */
  commonMg: number;
  /** Maximaler Single-Dose-Wert (Strong). */
  ceilingMg: number;
  /** Display-Einheit ("mg" / "g" / "ml"). */
  unit: string;
  /** Erläuterung für Anzeige. */
  rationale: string;
}

function parseFirstNumber(s?: string): number | null {
  if (!s) return null;
  const m = s.match(/(\d+(?:[.,]\d+)?)/);
  if (!m) return null;
  return parseFloat(m[1].replace(",", "."));
}

function parseRange(s?: string): { lo: number; hi: number } | null {
  if (!s) return null;
  const nums = (s.match(/\d+(?:[.,]\d+)?/g) || []).map((n) => parseFloat(n.replace(",", ".")));
  if (nums.length === 0) return null;
  return { lo: nums[0], hi: nums[1] ?? nums[0] };
}

function unitFromString(s?: string): string {
  if (!s) return "mg";
  if (/\bg\b|gramm/i.test(s) && !/\bmg\b/i.test(s)) return "g";
  if (/\bml\b/i.test(s)) return "ml";
  if (/µg|mcg/i.test(s)) return "µg";
  return "mg";
}

export function suggestDose(sub: Substance, weightKg?: number): DoseSuggestion | null {
  if (!SCALE_MAP[sub.id]) return null;
  const dose = sub.doses[0];
  if (!dose) return null;
  const lightR = parseRange(dose.light);
  const commonR = parseRange(dose.common);
  const strongR = parseRange(dose.strong);
  if (!commonR) return null;

  const w = weightKg && weightKg > 0 ? weightKg : REFERENCE_KG;
  const factor = w / REFERENCE_KG;

  const start = (lightR?.lo ?? commonR.lo * 0.6) * factor;
  const common = commonR.lo * factor;
  const ceiling = (strongR?.lo ?? commonR.hi) * factor;
  const unit = unitFromString(dose.common);

  // Round sensibly
  const round = (x: number) => {
    if (unit === "g" || unit === "ml") return Math.round(x * 10) / 10;
    if (unit === "µg") return Math.round(x / 5) * 5;
    return Math.round(x / 5) * 5;
  };

  return {
    startMg: round(start),
    commonMg: round(common),
    ceilingMg: round(ceiling),
    unit,
    rationale: `Skaliert auf ${Math.round(w)} kg Körpergewicht (Referenz 70 kg). Beginne immer am unteren Ende — Substanzpurität ist nicht abschätzbar.`,
  };
}

export function getProfileWeightKg(): number | undefined {
  const p = loadProfile();
  return p?.bodyWeightKg;
}
