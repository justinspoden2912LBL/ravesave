/**
 * Reagent-Test-Reaktionen. Quellen: dancesafe.org, ec-test.eu,
 * reagent-tests.uk, EZ-Test Dokumentation. Konsens-Reaktionen bei
 * unverdünnter Probe; Mischsubstanzen können das Bild verfälschen.
 */

export type Reagent = "marquis" | "mecke" | "mandelin" | "simons" | "folin" | "liebermann" | "morris";

export interface ReagentReaction {
  reagent: Reagent;
  /** Beobachtete Farbentwicklung. */
  color: string;
  /** Optionaler Hex für UI-Vorschau (zwei Stops für Verlauf). */
  swatch?: [string, string];
  notes?: string;
}

export const REAGENT_LABEL: Record<Reagent, string> = {
  marquis: "Marquis",
  mecke: "Mecke",
  mandelin: "Mandelin",
  simons: "Simon's",
  folin: "Folin",
  liebermann: "Liebermann",
  morris: "Morris",
};

export const REAGENT_INTRO: Record<Reagent, string> = {
  marquis: "Universaltest. Klassisch für MDMA/Amphetamin/Opiate. Schnelle Farbreaktion (~30 s).",
  mecke: "Selen-basiert. Trennt Opiate (grün/blau) von 2C-x (gelbgrün) und MDMA (dunkelblau→schwarz).",
  mandelin: "Ammoniumvanadat. Sensitiv für PMA/PMMA und Ketamin. Risikomarker bei Ecstasy-Pillen.",
  simons: "Zweistufig. Unterscheidet sekundäre Amine (MDMA → tiefblau) von primären (Amphetamin → keine Reaktion).",
  folin: "Detektiert Piperazine (BZP/TFMPP) — relevant bei verfälschten Pillen.",
  liebermann: "Erkennt 2C-B/2C-x und Mescalin; nützlich als Zweittest neben Marquis.",
  morris: "Ergänzungstest u. a. für Ketamin (klar→grün).",
};

export interface ReagentEntry {
  /** Substance.id aus substances.ts */
  substanceId: string;
  reactions: ReagentReaction[];
}

export const REAGENT_DATA: ReagentEntry[] = [
  {
    substanceId: "mdma",
    reactions: [
      { reagent: "marquis", color: "Lila → schwarz", swatch: ["#5b21b6", "#0a0a0a"] },
      { reagent: "mecke", color: "Dunkelblau → schwarz", swatch: ["#1e3a8a", "#0a0a0a"] },
      { reagent: "mandelin", color: "Dunkelblau → schwarz", swatch: ["#1e3a8a", "#000"] },
      { reagent: "simons", color: "Tiefblau (sofort)", swatch: ["#1d4ed8", "#1e3a8a"], notes: "MDMA = sekundäres Amin → blau. MDA bleibt klar." },
      { reagent: "folin", color: "Keine Reaktion", swatch: ["#fef3c7", "#fef3c7"], notes: "Reaktion = Piperazin-Verdacht (BZP/TFMPP)." },
    ],
  },
  {
    substanceId: "mda",
    reactions: [
      { reagent: "marquis", color: "Lila → schwarz", swatch: ["#5b21b6", "#0a0a0a"] },
      { reagent: "simons", color: "Klar / keine Reaktion", swatch: ["#fef3c7", "#fef3c7"], notes: "Trennt MDA (primär) von MDMA (sekundär)." },
      { reagent: "mecke", color: "Dunkelblau", swatch: ["#1e3a8a", "#312e81"] },
    ],
  },
  {
    substanceId: "amphetamine",
    reactions: [
      { reagent: "marquis", color: "Orange → rotbraun", swatch: ["#f97316", "#7c2d12"] },
      { reagent: "mecke", color: "Keine / leicht gelb", swatch: ["#fef3c7", "#facc15"] },
      { reagent: "simons", color: "Klar / keine Reaktion", swatch: ["#fef3c7", "#fef3c7"], notes: "Methamphetamin reagiert dagegen blau." },
      { reagent: "mandelin", color: "Orange → braun", swatch: ["#fb923c", "#78350f"] },
    ],
  },
  {
    substanceId: "methamphetamine",
    reactions: [
      { reagent: "marquis", color: "Orange → rotbraun", swatch: ["#f97316", "#7c2d12"] },
      { reagent: "simons", color: "Tiefblau", swatch: ["#1d4ed8", "#1e3a8a"], notes: "Unterscheidet Meth (blau) von Amphetamin (klar)." },
    ],
  },
  {
    substanceId: "cocaine",
    reactions: [
      { reagent: "marquis", color: "Keine Reaktion (gelb-Rest)", swatch: ["#fef3c7", "#fde68a"], notes: "Reines Kokain reagiert auf Marquis nicht." },
      { reagent: "mecke", color: "Keine Reaktion", swatch: ["#fef3c7", "#fde68a"] },
      { reagent: "liebermann", color: "Gelb", swatch: ["#fde047", "#facc15"] },
      { reagent: "morris", color: "Gelblich-grün", swatch: ["#bef264", "#65a30d"], notes: "Streckmittel oft sichtbar." },
    ],
  },
  {
    substanceId: "ketamine",
    reactions: [
      { reagent: "mandelin", color: "Orange → braun", swatch: ["#fb923c", "#78350f"] },
      { reagent: "morris", color: "Klar → grün (langsam)", swatch: ["#dcfce7", "#16a34a"], notes: "Beste Bestätigung für Ketamin." },
      { reagent: "marquis", color: "Keine Reaktion", swatch: ["#fef3c7", "#fde68a"] },
    ],
  },
  {
    substanceId: "lsd",
    reactions: [
      { reagent: "marquis", color: "Olivgrün → schwarz (langsam)", swatch: ["#65a30d", "#0a0a0a"], notes: "Pappe in Reagenz tauchen, kein direkter Test auf farbiger Pappe." },
      { reagent: "mecke", color: "Keine / leicht gelb", swatch: ["#fef3c7", "#facc15"] },
    ],
  },
  {
    substanceId: "2c-b",
    reactions: [
      { reagent: "marquis", color: "Gelb → grün", swatch: ["#fde047", "#65a30d"] },
      { reagent: "mecke", color: "Gelbgrün", swatch: ["#bef264", "#65a30d"] },
      { reagent: "mandelin", color: "Grün → dunkelgrün", swatch: ["#22c55e", "#14532d"] },
      { reagent: "liebermann", color: "Orange → rot", swatch: ["#fb923c", "#dc2626"] },
    ],
  },
  {
    substanceId: "mescaline",
    reactions: [
      { reagent: "marquis", color: "Orange → rotbraun (langsam)", swatch: ["#fb923c", "#7c2d12"] },
      { reagent: "liebermann", color: "Gelb-orange", swatch: ["#fde047", "#fb923c"] },
    ],
  },
  {
    substanceId: "psilocybin",
    reactions: [
      { reagent: "ehrlich" as Reagent, color: "Dunkelblau-violett (Ehrlich-Reagenz)", swatch: ["#312e81", "#581c87"], notes: "Marquis/Mandelin reagieren nicht zuverlässig — Ehrlich (separat erhältlich) ist Standard für Tryptamine." },
    ],
  },
  {
    substanceId: "dmt",
    reactions: [
      { reagent: "marquis", color: "Orange → braun", swatch: ["#fb923c", "#78350f"] },
    ],
  },
  {
    substanceId: "mephedrone",
    reactions: [
      { reagent: "marquis", color: "Keine / leicht gelb", swatch: ["#fef3c7", "#facc15"] },
      { reagent: "mecke", color: "Keine Reaktion", swatch: ["#fef3c7", "#fde68a"] },
      { reagent: "simons", color: "Tiefblau (sek. Amin)", swatch: ["#1d4ed8", "#1e3a8a"] },
      { reagent: "liebermann", color: "Gelb → orange", swatch: ["#fde047", "#fb923c"] },
    ],
  },
  {
    substanceId: "ghb",
    reactions: [
      { reagent: "marquis", color: "Keine Reaktion", swatch: ["#fef3c7", "#fde68a"], notes: "GHB ist kein Amin; Reagent-Tests greifen nicht. Spezifische GHB-Tests existieren (Boric/Enzym)." },
    ],
  },
];

export function getReagents(substanceId: string): ReagentReaction[] {
  return REAGENT_DATA.find((r) => r.substanceId === substanceId)?.reactions || [];
}
