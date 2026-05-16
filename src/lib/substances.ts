// Harm reduction data. Sources referenced inline (TripSit, PsychonautWiki, EMCDDA, peer-reviewed lit).
// Doses are general ranges for oral/insufflated (where common). Always start LOW.

export type SubstanceCategory =
  | "psychedelic"
  | "stimulant"
  | "cathinone"
  | "depressant"
  | "opioid"
  | "dissociative"
  | "cannabinoid"
  | "empathogen"
  | "benzodiazepine"
  | "neuroleptic"
  | "alcohol"
  | "other";

export interface DoseRange {
  route: string; // e.g. "oral", "insufflated"
  threshold?: string;
  light?: string;
  common?: string;
  strong?: string;
  heavy?: string;
  notes?: string;
}

export interface Substance {
  id: string;
  name: string;
  aliases: string[];
  category: SubstanceCategory;
  shortDescription: string;
  mechanism: string;
  duration: string;
  onset: string;
  doses: DoseRange[];
  evidence: { label: string; url: string }[];
  warnings: string[];
}

export const SUBSTANCES: Substance[] = [
  // ───── Psychedelics ─────
  {
    id: "lsd",
    name: "LSD",
    aliases: ["Acid", "Lucy", "Pappe"],
    category: "psychedelic",
    shortDescription: "Klassisches Serotonin-Psychedelikum, sehr potent.",
    mechanism: "5-HT2A Partialagonist.",
    onset: "20–60 min",
    duration: "8–12 h",
    doses: [{ route: "oral", threshold: "10 µg", light: "25–50 µg", common: "50–150 µg", strong: "150–300 µg", heavy: "300+ µg" }],
    evidence: [
      { label: "Nichols 2016 – Psychedelics (Pharm. Rev.)", url: "https://pharmrev.aspetjournals.org/content/68/2/264" },
      { label: "PsychonautWiki LSD", url: "https://psychonautwiki.org/wiki/LSD" },
    ],
    warnings: ["HPPD-Risiko bei häufigem Gebrauch", "Set & Setting maßgeblich", "Kreuztoleranz zu anderen 5-HT2A-Agonisten"],
  },
  {
    id: "psilocybin",
    name: "Psilocybin (Pilze)",
    aliases: ["Shrooms", "Magic Mushrooms"],
    category: "psychedelic",
    shortDescription: "Aktiver Wirkstoff in 'Magic Mushrooms'.",
    mechanism: "Prodrug für Psilocin, 5-HT2A Agonist.",
    onset: "20–60 min",
    duration: "4–6 h",
    doses: [{ route: "oral", threshold: "0.2 g", light: "0.5–1 g", common: "1–2.5 g", strong: "2.5–5 g", heavy: "5+ g", notes: "getrocknete P. cubensis" }],
    evidence: [
      { label: "Carhart-Harris 2021 – Trial of Psilocybin vs Escitalopram (NEJM)", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032994" },
    ],
    warnings: ["Pilzbestimmung kritisch – Verwechslungsgefahr", "Übelkeit häufig"],
  },
  {
    id: "dmt",
    name: "DMT",
    aliases: ["N,N-DMT", "Geist-Molekül"],
    category: "psychedelic",
    shortDescription: "Sehr kurze, intensive psychedelische Wirkung.",
    mechanism: "5-HT2A Agonist; oral inaktiv ohne MAOI.",
    onset: "Sekunden (vap.)",
    duration: "5–20 min (vap.)",
    doses: [{ route: "vaporisiert", threshold: "2 mg", light: "10–20 mg", common: "20–40 mg", strong: "40–60 mg" }],
    evidence: [{ label: "Strassman – DMT Research", url: "https://pubmed.ncbi.nlm.nih.gov/8122957/" }],
    warnings: ["Mit MAO-Hemmern (Ayahuasca) potenziell gefährlich – Serotonin-Syndrom"],
  },
  {
    id: "mescaline",
    name: "Mescalin",
    aliases: ["Peyote", "San Pedro"],
    category: "psychedelic",
    shortDescription: "Phenethylamin-Psychedelikum aus Kakteen.",
    mechanism: "5-HT2A Agonist.",
    onset: "45–90 min",
    duration: "10–14 h",
    doses: [{ route: "oral", threshold: "50 mg", light: "100–200 mg", common: "200–400 mg", strong: "400–800 mg" }],
    evidence: [{ label: "Shulgin – PiHKAL", url: "https://erowid.org/library/books_online/pihkal/pihkal096.shtml" }],
    warnings: ["Starke Übelkeit", "Lange Wirkdauer"],
  },
  {
    id: "2cb",
    name: "2C-B",
    aliases: ["Nexus"],
    category: "psychedelic",
    shortDescription: "Phenethylamin mit psychedelisch-empathogener Wirkung.",
    mechanism: "5-HT2A Partialagonist.",
    onset: "20–60 min",
    duration: "4–6 h",
    doses: [{ route: "oral", threshold: "2 mg", light: "5–10 mg", common: "10–20 mg", strong: "20–30 mg" }],
    evidence: [{ label: "PsychonautWiki 2C-B", url: "https://psychonautwiki.org/wiki/2C-B" }],
    warnings: ["Dosis-Steilheit – kleine Mengenunterschiede = große Wirkung"],
  },

  // ───── Empathogens ─────
  {
    id: "mdma",
    name: "MDMA",
    aliases: ["Ecstasy", "Molly", "Pille"],
    category: "empathogen",
    shortDescription: "Empathogen mit stimulierender Komponente.",
    mechanism: "Serotonin/Dopamin/Noradrenalin-Releaser.",
    onset: "30–60 min",
    duration: "3–5 h",
    doses: [{ route: "oral", threshold: "30 mg", light: "50–75 mg", common: "75–125 mg", strong: "125–175 mg", heavy: "175+ mg", notes: "Faustregel: max ~1.5 mg/kg" }],
    evidence: [
      { label: "Mitchell 2021 – MDMA-PTSD Phase 3 (Nature Med.)", url: "https://www.nature.com/articles/s41591-021-01336-3" },
      { label: "DanceSafe MDMA", url: "https://dancesafe.org/mdma/" },
    ],
    warnings: ["Hyperthermie + Hyponatriämie-Risiko", "Mindestens 4–6 Wochen Pause empfohlen", "Drug-Checking nutzen"],
  },

  // ───── Stimulants ─────
  {
    id: "cocaine",
    name: "Kokain",
    aliases: ["Coke", "Koks"],
    category: "stimulant",
    shortDescription: "Kurz wirksamer Monoamin-Wiederaufnahmehemmer.",
    mechanism: "DAT/SERT/NET-Hemmer.",
    onset: "1–5 min (insuf.)",
    duration: "30–90 min",
    doses: [{ route: "insufflated", light: "10–30 mg", common: "30–60 mg", strong: "60–90 mg" }],
    evidence: [{ label: "EMCDDA Cocaine Profile", url: "https://www.emcdda.europa.eu/publications/drug-profiles/cocaine_en" }],
    warnings: ["Kardiotox – Vasospasmus, Infarkt-Risiko", "Mit Alkohol → Cocaethylen (hepato-/kardiotox)"],
  },
  {
    id: "amphetamine",
    name: "Amphetamin",
    aliases: ["Speed", "Pep"],
    category: "stimulant",
    shortDescription: "Klassisches Stimulans, Releaser.",
    mechanism: "Dopamin-/Noradrenalin-Releaser.",
    onset: "20–60 min (oral)",
    duration: "4–6 h",
    doses: [{ route: "oral", threshold: "5 mg", light: "10–20 mg", common: "20–50 mg", strong: "50–100 mg" }],
    evidence: [{ label: "PsychonautWiki Amphetamine", url: "https://psychonautwiki.org/wiki/Amphetamine" }],
    warnings: ["Hoher Blutdruck", "Schlafmangel → Psychose-Risiko"],
  },
  {
    id: "methamphetamine",
    name: "Methamphetamin",
    aliases: ["Crystal", "Meth", "Ice"],
    category: "stimulant",
    shortDescription: "Potenteres, langwirksames Amphetamin.",
    mechanism: "Dopamin-Releaser, ZNS-aktiver als Amphetamin.",
    onset: "5–20 min (insuf.)",
    duration: "6–12 h",
    doses: [{ route: "insufflated", light: "5–10 mg", common: "10–30 mg", strong: "30–50 mg" }],
    evidence: [{ label: "EMCDDA Methamphetamine", url: "https://www.emcdda.europa.eu/publications/drug-profiles/methamphetamine_en" }],
    warnings: ["Hohes Suchtpotenzial", "Neurotox bei chronischem Gebrauch"],
  },
  {
    id: "caffeine",
    name: "Koffein",
    aliases: ["Caffein"],
    category: "stimulant",
    shortDescription: "Adenosin-Antagonist, mildes Stimulans.",
    mechanism: "Adenosin-Rezeptor-Antagonist.",
    onset: "15–45 min",
    duration: "3–6 h",
    doses: [{ route: "oral", light: "40–100 mg", common: "100–250 mg", strong: "250–500 mg", heavy: "500+ mg" }],
    evidence: [{ label: "EFSA Caffeine Safety", url: "https://www.efsa.europa.eu/en/efsajournal/pub/4102" }],
    warnings: ["Über 400 mg/Tag oft schon belastend (Herz, Schlaf)"],
  },

  // ───── Cathinones ─────
  {
    id: "mephedrone",
    name: "Mephedron",
    aliases: ["4-MMC", "Meow"],
    category: "cathinone",
    shortDescription: "Synthetisches Cathinon, MDMA-/Amphetamin-ähnlich.",
    mechanism: "Serotonin-/Dopamin-Releaser.",
    onset: "15–45 min",
    duration: "2–4 h",
    doses: [{ route: "oral", light: "75–150 mg", common: "150–225 mg", strong: "225–350 mg" }],
    evidence: [{ label: "EMCDDA Mephedrone", url: "https://www.emcdda.europa.eu/publications/drug-profiles/synthetic-cathinones_en" }],
    warnings: ["Starkes Craving / Re-Dosing-Drang", "Vasokonstriktion"],
  },
  {
    id: "3mmc",
    name: "3-MMC",
    aliases: ["Metaphedron"],
    category: "cathinone",
    shortDescription: "Strukturisomer von Mephedron.",
    mechanism: "Monoamin-Releaser.",
    onset: "15–45 min",
    duration: "2–4 h",
    doses: [{ route: "oral", light: "50–100 mg", common: "100–200 mg", strong: "200–300 mg" }],
    evidence: [{ label: "EMCDDA 3-MMC Risk Assessment", url: "https://www.emcdda.europa.eu/publications/risk-assessment/3-mmc_en" }],
    warnings: ["Starkes Re-Dose-Verlangen", "Wenig Langzeitdaten"],
  },
  {
    id: "alpha-pvp",
    name: "α-PVP",
    aliases: ["Flakka"],
    category: "cathinone",
    shortDescription: "Pyrrolidinophenon, sehr potenter Stim.",
    mechanism: "DAT/NET-Hemmer.",
    onset: "10–30 min",
    duration: "3–5 h (oft länger)",
    doses: [{ route: "oral", threshold: "3 mg", light: "5–10 mg", common: "10–20 mg", strong: "20–40 mg" }],
    evidence: [{ label: "Marusich 2014 – α-PVP Pharmacology", url: "https://pubmed.ncbi.nlm.nih.gov/24373893/" }],
    warnings: ["Hohes Psychose-/Exzitations-Risiko", "Hyperthermie"],
  },
  {
    id: "mdpv",
    name: "MDPV",
    aliases: ["Bath Salts"],
    category: "cathinone",
    shortDescription: "Pyrrolidinophenon-Cathinon, sehr stimulierend.",
    mechanism: "Potenter DAT/NET-Hemmer.",
    onset: "15–30 min",
    duration: "3–6 h",
    doses: [{ route: "oral", threshold: "3 mg", light: "5–10 mg", common: "10–15 mg", strong: "15–25 mg" }],
    evidence: [{ label: "Baumann 2013 – MDPV (Neuropsychopharm.)", url: "https://pubmed.ncbi.nlm.nih.gov/22871476/" }],
    warnings: ["Sehr hohes Psychose-Risiko", "Schmaler therapeutischer Bereich"],
  },

  // ───── Dissociatives ─────
  {
    id: "ketamine",
    name: "Ketamin",
    aliases: ["K", "Keta"],
    category: "dissociative",
    shortDescription: "Dissoziatives Anästhetikum.",
    mechanism: "NMDA-Antagonist.",
    onset: "5–15 min (insuf.)",
    duration: "45–90 min",
    doses: [{ route: "insufflated", light: "15–30 mg", common: "30–75 mg", strong: "75–150 mg", heavy: "150+ mg (K-Hole)" }],
    evidence: [
      { label: "Krystal 2019 – Ketamine for Depression (Am J Psych)", url: "https://ajp.psychiatryonline.org/doi/10.1176/appi.ajp.2018.18020138" },
    ],
    warnings: ["Blasen-Toxizität bei häufigem Gebrauch", "Mit Depressiva → Atemdepression"],
  },
  {
    id: "mxe",
    name: "MXE",
    aliases: ["Methoxetamin"],
    category: "dissociative",
    shortDescription: "Ketamin-Analog, längere Wirkung.",
    mechanism: "NMDA-Antagonist.",
    onset: "20–60 min",
    duration: "2–4 h",
    doses: [{ route: "oral", light: "10–20 mg", common: "20–40 mg", strong: "40–60 mg" }],
    evidence: [{ label: "Corazza 2012 – MXE phenomenon", url: "https://pubmed.ncbi.nlm.nih.gov/23280066/" }],
    warnings: ["Geringer Sicherheitsabstand"],
  },

  // ───── Cannabis ─────
  {
    id: "cannabis",
    name: "Cannabis (THC)",
    aliases: ["Weed", "Gras", "Hash"],
    category: "cannabinoid",
    shortDescription: "Phytocannabinoid, partieller CB1-Agonist.",
    mechanism: "CB1/CB2-Agonist.",
    onset: "0–10 min (rauchen) / 30–120 min (oral)",
    duration: "2–4 h / 4–8 h oral",
    doses: [{ route: "oral", threshold: "1 mg THC", light: "2.5–5 mg", common: "5–15 mg", strong: "15–30 mg" }],
    evidence: [{ label: "NASEM 2017 – Health Effects of Cannabis", url: "https://nap.nationalacademies.org/catalog/24625" }],
    warnings: ["Edibles: lange Anflutung – Geduld!", "Psychose-Risiko bei prädisponierten Personen"],
  },

  // ───── Opioids ─────
  {
    id: "heroin",
    name: "Heroin",
    aliases: ["Diacetylmorphin", "H"],
    category: "opioid",
    shortDescription: "Schnell wirksames Opioid.",
    mechanism: "µ-Opioid-Agonist.",
    onset: "5–10 min",
    duration: "3–5 h",
    doses: [{ route: "insufflated", light: "5–15 mg", common: "15–30 mg", strong: "30+ mg", notes: "Reinheit extrem variabel!" }],
    evidence: [{ label: "EMCDDA Heroin Profile", url: "https://www.emcdda.europa.eu/publications/drug-profiles/heroin_en" }],
    warnings: ["Atemdepression / Überdosis", "Naloxon bereithalten", "Fentanyl-Kontamination möglich"],
  },
  {
    id: "fentanyl",
    name: "Fentanyl",
    aliases: ["Fenta"],
    category: "opioid",
    shortDescription: "Sehr potentes synthetisches Opioid (~100× Morphin).",
    mechanism: "µ-Opioid-Agonist.",
    onset: "1–5 min",
    duration: "1–2 h",
    doses: [{ route: "transdermal/medizinisch", light: "12.5–25 µg/h", notes: "Illegale Pulver praktisch nicht sicher dosierbar" }],
    evidence: [{ label: "CDC Fentanyl Overview", url: "https://www.cdc.gov/stopoverdose/fentanyl/index.html" }],
    warnings: ["Extrem hohes Überdosisrisiko – Naloxon, niemals allein", "Drug-Checking essenziell"],
  },
  {
    id: "oxycodone",
    name: "Oxycodon",
    aliases: ["OxyContin"],
    category: "opioid",
    shortDescription: "Verschreibungspflichtiges Opioid-Analgetikum.",
    mechanism: "µ-Opioid-Agonist.",
    onset: "20–40 min",
    duration: "4–6 h",
    doses: [{ route: "oral", light: "5–10 mg", common: "10–20 mg", strong: "20–40 mg" }],
    evidence: [{ label: "EMA Oxycodon", url: "https://www.ema.europa.eu/en/medicines" }],
    warnings: ["Atemdepression mit Benzos/Alkohol", "Toleranzaufbau schnell"],
  },
  {
    id: "tramadol",
    name: "Tramadol",
    aliases: [],
    category: "opioid",
    shortDescription: "Atypisches Opioid + SNRI-Wirkung.",
    mechanism: "µ-Agonist + Serotonin/Noradrenalin-Wiederaufnahmehemmer.",
    onset: "30–60 min",
    duration: "4–6 h",
    doses: [{ route: "oral", light: "25–50 mg", common: "50–100 mg", strong: "100–200 mg" }],
    evidence: [{ label: "Grond 2004 – Tramadol Review", url: "https://pubmed.ncbi.nlm.nih.gov/15509185/" }],
    warnings: ["Krampfschwelle ↓", "Serotonin-Syndrom mit SSRIs/MDMA"],
  },

  // ───── Depressants ─────
  {
    id: "alcohol",
    name: "Alkohol",
    aliases: ["Ethanol"],
    category: "alcohol",
    shortDescription: "GABA-erges Depressivum.",
    mechanism: "GABA-A positiv allosterisch, NMDA-Antagonist.",
    onset: "10–30 min",
    duration: "1–3 h (pro Einheit)",
    doses: [{ route: "oral", light: "1 Std. Einheit (~10 g)", common: "2–3 Einheiten", strong: "4+ Einheiten" }],
    evidence: [{ label: "WHO Alcohol Fact Sheet", url: "https://www.who.int/news-room/fact-sheets/detail/alcohol" }],
    warnings: ["Mit Opioiden/Benzos lebensgefährlich", "Hepato- und Neurotox"],
  },
  {
    id: "ghb",
    name: "GHB / GBL",
    aliases: ["G", "Liquid Ecstasy"],
    category: "depressant",
    shortDescription: "Kurz wirksames Depressivum, sehr enger Dosisbereich.",
    mechanism: "GHB-/GABA-B-Rezeptor.",
    onset: "10–20 min",
    duration: "1.5–2.5 h",
    doses: [{ route: "oral", light: "0.5–1 g", common: "1–2 g", strong: "2–3 g", notes: "Sehr schmaler Bereich – immer abwiegen / mit Spritze dosieren" }],
    evidence: [{ label: "Brennan 2017 – GHB Overdose (Addiction)", url: "https://pubmed.ncbi.nlm.nih.gov/27859803/" }],
    warnings: ["Mit Alkohol/Benzos: Atemstillstand", "Mindestabstand 2–3 h zwischen Dosen"],
  },

  // ───── Benzodiazepines ─────
  {
    id: "alprazolam",
    name: "Alprazolam",
    aliases: ["Xanax"],
    category: "benzodiazepine",
    shortDescription: "Kurz–mittellang wirksames Benzo.",
    mechanism: "GABA-A positiv allosterisch.",
    onset: "20–40 min",
    duration: "4–8 h",
    doses: [{ route: "oral", threshold: "0.25 mg", light: "0.5 mg", common: "0.5–1 mg", strong: "1–2 mg" }],
    evidence: [{ label: "Ait-Daoud 2018 – Alprazolam Review", url: "https://pubmed.ncbi.nlm.nih.gov/28944752/" }],
    warnings: ["Mit Opioiden/Alkohol Atemdepression", "Schnelle Toleranz, harter Entzug"],
  },
  {
    id: "diazepam",
    name: "Diazepam",
    aliases: ["Valium"],
    category: "benzodiazepine",
    shortDescription: "Langwirksames Benzo, oft als Vergleichsstandard.",
    mechanism: "GABA-A.",
    onset: "30–60 min",
    duration: "6–12 h (Metaboliten länger)",
    doses: [{ route: "oral", light: "2–5 mg", common: "5–15 mg", strong: "15–30 mg" }],
    evidence: [{ label: "Griffin 2013 – Benzodiazepine Pharm.", url: "https://pubmed.ncbi.nlm.nih.gov/24293768/" }],
    warnings: ["Sturzgefahr", "Niemals abrupt absetzen"],
  },

  // ───── Neuroleptics ─────
  {
    id: "quetiapine",
    name: "Quetiapin",
    aliases: ["Seroquel"],
    category: "neuroleptic",
    shortDescription: "Atypisches Neuroleptikum, stark sedierend in niedriger Dosis.",
    mechanism: "D2/5-HT2A/H1-Antagonist.",
    onset: "30–90 min",
    duration: "6–12 h",
    doses: [{ route: "oral", light: "25 mg", common: "50–150 mg", strong: "150–300 mg", notes: "Verschreibungsbereich für Psychose: 300–800 mg" }],
    evidence: [{ label: "DeVane 2001 – Quetiapine Pharm.", url: "https://pubmed.ncbi.nlm.nih.gov/11463130/" }],
    warnings: ["NICHT als 'Down' missbrauchen – orthostatische Hypotonie, QT-Verlängerung", "Mit Stims: kardiale Belastung"],
  },
  {
    id: "olanzapine",
    name: "Olanzapin",
    aliases: ["Zyprexa"],
    category: "neuroleptic",
    shortDescription: "Atypisches Neuroleptikum, antipsychotisch + antiemetisch.",
    mechanism: "D2/5-HT2A-Antagonist.",
    onset: "30–60 min",
    duration: "12–24 h",
    doses: [{ route: "oral", light: "2.5 mg", common: "5–10 mg", strong: "10–20 mg" }],
    evidence: [{ label: "Bymaster 1996 – Olanzapine", url: "https://pubmed.ncbi.nlm.nih.gov/8930802/" }],
    warnings: ["Beendet psychedelische Trips – aber dämpft auch Atmung/Kreislauf bei Mischkonsum"],
  },

  // ───── Other meds ─────
  {
    id: "pregabalin",
    name: "Pregabalin",
    aliases: ["Lyrica"],
    category: "depressant",
    shortDescription: "Gabapentinoid, ZNS-dämpfend.",
    mechanism: "α2δ-Untereinheit spannungsabhängiger Ca-Kanäle.",
    onset: "30–90 min",
    duration: "5–8 h",
    doses: [{ route: "oral", light: "75 mg", common: "150–300 mg", strong: "300–600 mg" }],
    evidence: [{ label: "Schifano 2014 – Pregabalin Misuse", url: "https://pubmed.ncbi.nlm.nih.gov/24595873/" }],
    warnings: ["Mit Opioiden: Atemdepression / Todesfälle dokumentiert"],
  },

  // ───── Research Chemicals ─────
  {
    id: "mdphp",
    name: "MDPHP",
    aliases: ["3',4'-Methylenedioxy-α-PHP"],
    category: "cathinone",
    shortDescription: "Pyrrolidinophenon-Cathinon, sehr potenter Stim, MDPV-ähnlich.",
    mechanism: "Potenter Dopamin-/Noradrenalin-Wiederaufnahmehemmer (DAT/NET).",
    onset: "10–30 min",
    duration: "3–5 h (Nachwirkungen länger)",
    doses: [{ route: "oral/insufflated", threshold: "3 mg", light: "5–10 mg", common: "10–20 mg", strong: "20–30 mg", notes: "Sehr schmaler Bereich – immer mg-Waage" }],
    evidence: [
      { label: "EMCDDA – Synthetic Cathinones", url: "https://www.emcdda.europa.eu/publications/drug-profiles/synthetic-cathinones_en" },
      { label: "Costa 2022 – MDPHP toxicity (Forensic Toxicol.)", url: "https://pubmed.ncbi.nlm.nih.gov/35190940/" },
    ],
    warnings: ["Hohes Psychose-/Exzitations-Risiko", "Compulsive Re-Dose", "Lange Nachwirkungen → Schlafmangel"],
  },
  {
    id: "a-php",
    name: "α-PHP",
    aliases: ["alpha-PHP", "PV-7"],
    category: "cathinone",
    shortDescription: "Pyrrolidinophenon, α-PVP-Homologes.",
    mechanism: "DAT/NET-Hemmer.",
    onset: "10–30 min",
    duration: "3–5 h",
    doses: [{ route: "oral", threshold: "5 mg", light: "10–15 mg", common: "15–25 mg", strong: "25–40 mg" }],
    evidence: [{ label: "Wojcieszak 2018 – α-PHP", url: "https://pubmed.ncbi.nlm.nih.gov/29488104/" }],
    warnings: ["Stark suchterzeugend", "Hyperthermie, Tachykardie"],
  },
  {
    id: "2cb-fly",
    name: "2C-B-FLY",
    aliases: [],
    category: "psychedelic",
    shortDescription: "Benzodifuran-Analogon von 2C-B, längere Wirkdauer.",
    mechanism: "5-HT2A Partialagonist.",
    onset: "45–90 min",
    duration: "6–10 h",
    doses: [{ route: "oral", threshold: "3 mg", light: "5–10 mg", common: "10–20 mg", strong: "20–30 mg" }],
    evidence: [{ label: "PsychonautWiki 2C-B-FLY", url: "https://psychonautwiki.org/wiki/2C-B-FLY" }],
    warnings: ["NICHT mit dem hochtoxischen Bromo-DragonFLY verwechseln!"],
  },
  {
    id: "2ci",
    name: "2C-I",
    aliases: [],
    category: "psychedelic",
    shortDescription: "Phenethylamin, visueller als 2C-B.",
    mechanism: "5-HT2A Agonist.",
    onset: "45–90 min",
    duration: "6–10 h",
    doses: [{ route: "oral", threshold: "5 mg", light: "10–15 mg", common: "15–25 mg", strong: "25–35 mg" }],
    evidence: [{ label: "Shulgin – PiHKAL #33", url: "https://erowid.org/library/books_online/pihkal/pihkal033.shtml" }],
    warnings: ["Lange Wirkdauer, oft körperlich belastend"],
  },
  {
    id: "25i-nbome",
    name: "25I-NBOMe",
    aliases: ["N-Bomb"],
    category: "psychedelic",
    shortDescription: "NBOMe-Reihe, hochpotent, schmaler Sicherheitsabstand.",
    mechanism: "Sehr potenter 5-HT2A Agonist.",
    onset: "15–60 min (sublingual)",
    duration: "6–10 h",
    doses: [{ route: "sublingual", threshold: "50 µg", light: "200–500 µg", common: "500–800 µg", strong: "800–1200 µg" }],
    evidence: [
      { label: "Wood 2015 – NBOMe Toxicity (Clin Tox.)", url: "https://pubmed.ncbi.nlm.nih.gov/25652258/" },
    ],
    warnings: ["Mehrere dokumentierte Todesfälle", "Vasokonstriktion + Krampfanfälle möglich", "Oral wenig aktiv – Risiko Überdosis durch Schlucken"],
  },
  {
    id: "1p-lsd",
    name: "1P-LSD",
    aliases: ["1-Propionyl-LSD"],
    category: "psychedelic",
    shortDescription: "LSD-Prodrug, sehr ähnliche Wirkung.",
    mechanism: "Wird in vivo zu LSD verstoffwechselt; 5-HT2A Agonist.",
    onset: "30–60 min",
    duration: "8–12 h",
    doses: [{ route: "oral", threshold: "20 µg", light: "50–100 µg", common: "100–150 µg", strong: "150–250 µg" }],
    evidence: [{ label: "Brandt 2017 – 1P-LSD Pharm.", url: "https://pubmed.ncbi.nlm.nih.gov/27338605/" }],
    warnings: ["Wie LSD: HPPD-Risiko, Set & Setting maßgeblich"],
  },
  {
    id: "4-aco-dmt",
    name: "4-AcO-DMT",
    aliases: ["O-Acetylpsilocin", "Psilacetin"],
    category: "psychedelic",
    shortDescription: "Synthetisches Psilocybin-Analog, sehr ähnliche Wirkung.",
    mechanism: "Prodrug zu Psilocin; 5-HT2A Agonist.",
    onset: "15–45 min",
    duration: "4–7 h",
    doses: [{ route: "oral", threshold: "5 mg", light: "10–20 mg", common: "20–30 mg", strong: "30–50 mg" }],
    evidence: [{ label: "PsychonautWiki 4-AcO-DMT", url: "https://psychonautwiki.org/wiki/4-AcO-DMT" }],
    warnings: ["Sehr potent – mg-Waage zwingend"],
  },
  {
    id: "2-fdck",
    name: "2-FDCK",
    aliases: ["Fluoroketamin", "2-Fluorodeschloroketamin"],
    category: "dissociative",
    shortDescription: "Ketamin-Analog, etwas weniger potent, längere Dauer.",
    mechanism: "NMDA-Antagonist.",
    onset: "10–30 min",
    duration: "1.5–3 h",
    doses: [{ route: "insufflated", light: "20–40 mg", common: "40–80 mg", strong: "80–150 mg" }],
    evidence: [{ label: "Tang 2020 – 2-FDCK detection", url: "https://pubmed.ncbi.nlm.nih.gov/32294787/" }],
    warnings: ["Wie Ketamin: Blasenrisiko", "Wenig Langzeitdaten"],
  },
  {
    id: "3-meo-pcp",
    name: "3-MeO-PCP",
    aliases: [],
    category: "dissociative",
    shortDescription: "PCP-Analog, lange Wirkdauer.",
    mechanism: "NMDA-Antagonist + σ-Rezeptor-Aktivität.",
    onset: "20–60 min",
    duration: "4–7 h",
    doses: [{ route: "oral", threshold: "2 mg", light: "5–10 mg", common: "10–15 mg", strong: "15–25 mg" }],
    evidence: [{ label: "PsychonautWiki 3-MeO-PCP", url: "https://psychonautwiki.org/wiki/3-MeO-PCP" }],
    warnings: ["Sehr schmaler Sicherheitsbereich – mehrere Todesfälle", "Manie/Psychose-Risiko"],
  },
  {
    id: "etizolam",
    name: "Etizolam",
    aliases: [],
    category: "benzodiazepine",
    shortDescription: "Thienodiazepin (Benzo-Analog), als RC weit verbreitet.",
    mechanism: "GABA-A positiv allosterisch.",
    onset: "30–60 min",
    duration: "5–8 h",
    doses: [{ route: "oral", threshold: "0.25 mg", light: "0.5–1 mg", common: "1–2 mg", strong: "2–4 mg" }],
    evidence: [{ label: "EMCDDA – Designer Benzodiazepines", url: "https://www.emcdda.europa.eu/publications/rapid-communications/designer-benzodiazepines_en" }],
    warnings: ["Hohes Abhängigkeitspotenzial", "Mit Opioiden/Alkohol Atemdepression"],
  },
  {
    id: "o-dsmt",
    name: "O-DSMT",
    aliases: ["Desmethyltramadol"],
    category: "opioid",
    shortDescription: "Aktiver Metabolit von Tramadol, als RC verkauft.",
    mechanism: "µ-Agonist.",
    onset: "30–90 min",
    duration: "4–6 h",
    doses: [{ route: "oral", threshold: "10 mg", light: "20–40 mg", common: "40–80 mg", strong: "80–120 mg" }],
    evidence: [{ label: "PsychonautWiki O-DSMT", url: "https://psychonautwiki.org/wiki/O-DSMT" }],
    warnings: ["Atemdepression mit Depressiva", "Krampfschwelle ↓"],
  },

  // ───── Weitere Research Chemicals ─────
  {
    id: "5-meo-dmt",
    name: "5-MeO-DMT",
    aliases: ["Bufo", "Toad"],
    category: "psychedelic",
    shortDescription: "Sehr potentes, kurzes Tryptamin mit White-Out-Charakter.",
    mechanism: "Starker 5-HT1A/5-HT2A Agonist.",
    onset: "10–60 s (inhaliert)",
    duration: "10–30 min (inhaliert), 1–2 h (oral mit MAOI)",
    doses: [
      { route: "inhaliert", threshold: "1 mg", light: "2–5 mg", common: "5–10 mg", strong: "10–15 mg", notes: "Sehr schmaler Bereich – mg-Waage zwingend" },
      { route: "intranasal", threshold: "2 mg", light: "4–8 mg", common: "8–15 mg", strong: "15–25 mg" },
    ],
    evidence: [
      { label: "Davis 2019 – 5-MeO-DMT survey (Front. Psychiatry)", url: "https://pubmed.ncbi.nlm.nih.gov/31636571/" },
      { label: "PsychonautWiki 5-MeO-DMT", url: "https://psychonautwiki.org/wiki/5-MeO-DMT" },
    ],
    warnings: ["NIEMALS mit MAO-Hemmern oder SSRIs – Serotonin-Syndrom", "Body-Load und Bewusstlosigkeit häufig – Sitter zwingend", "Schwer auseinanderzuhalten von hochtoxischen NBOMes"],
  },
  {
    id: "5-meo-mipt",
    name: "5-MeO-MiPT",
    aliases: ["Moxy"],
    category: "psychedelic",
    shortDescription: "Tryptamin mit empathogen-psychedelischem Charakter.",
    mechanism: "5-HT2A/5-HT1A Agonist, leichte Monoamin-Freisetzung.",
    onset: "20–60 min",
    duration: "4–6 h",
    doses: [{ route: "oral", threshold: "2 mg", light: "4–8 mg", common: "8–15 mg", strong: "15–25 mg" }],
    evidence: [{ label: "Shulgin – TiHKAL #38", url: "https://erowid.org/library/books_online/tihkal/tihkal38.shtml" }],
    warnings: ["Schmaler Dosisbereich", "Serotonerge Last – nicht mit MAOI/SSRI"],
  },
  {
    id: "dom",
    name: "DOM",
    aliases: ["STP"],
    category: "psychedelic",
    shortDescription: "Substituiertes Amphetamin-Psychedelikum, sehr lange Wirkdauer.",
    mechanism: "5-HT2A Partialagonist mit langer Halbwertszeit.",
    onset: "60–120 min",
    duration: "14–20 h",
    doses: [{ route: "oral", threshold: "1 mg", light: "2–4 mg", common: "4–7 mg", strong: "7–10 mg" }],
    evidence: [{ label: "Shulgin – PiHKAL #68", url: "https://erowid.org/library/books_online/pihkal/pihkal068.shtml" }],
    warnings: ["Extrem lange Wirkdauer", "Hohes Risiko für Angst/Psychose", "Stimulierende Komponente belastet Herz/Kreislauf"],
  },
  {
    id: "doc",
    name: "DOC",
    aliases: [],
    category: "psychedelic",
    shortDescription: "Chlor-substituiertes Amphetamin-Psychedelikum, sehr lang.",
    mechanism: "5-HT2A Agonist.",
    onset: "1–3 h",
    duration: "12–24 h",
    doses: [{ route: "oral", threshold: "0.5 mg", light: "1–2 mg", common: "2–4 mg", strong: "4–7 mg" }],
    evidence: [{ label: "PsychonautWiki DOC", url: "https://psychonautwiki.org/wiki/DOC" }],
    warnings: ["Sehr lange Wirkdauer – Schlafmangel garantiert", "Vasokonstriktion"],
  },
  {
    id: "2c-e",
    name: "2C-E",
    aliases: [],
    category: "psychedelic",
    shortDescription: "Phenethylamin mit starkem Body-Load.",
    mechanism: "5-HT2A Agonist.",
    onset: "30–90 min",
    duration: "6–10 h",
    doses: [{ route: "oral", threshold: "2 mg", light: "5–10 mg", common: "10–20 mg", strong: "20–30 mg" }],
    evidence: [{ label: "Shulgin – PiHKAL #28", url: "https://erowid.org/library/books_online/pihkal/pihkal028.shtml" }],
    warnings: ["Übelkeit, körperliche Belastung häufig"],
  },
  {
    id: "2c-p",
    name: "2C-P",
    aliases: [],
    category: "psychedelic",
    shortDescription: "Sehr potentes, lang wirksames 2C-x.",
    mechanism: "5-HT2A Agonist.",
    onset: "1–3 h",
    duration: "10–16 h",
    doses: [{ route: "oral", threshold: "1 mg", light: "3–6 mg", common: "6–10 mg", strong: "10–16 mg" }],
    evidence: [{ label: "PsychonautWiki 2C-P", url: "https://psychonautwiki.org/wiki/2C-P" }],
    warnings: ["Late-Onset → Risiko Re-Dose", "Hohe körperliche Belastung"],
  },
  {
    id: "25c-nbome",
    name: "25C-NBOMe",
    aliases: [],
    category: "psychedelic",
    shortDescription: "NBOMe-Variante, schmaler Sicherheitsbereich.",
    mechanism: "Sehr potenter 5-HT2A Agonist.",
    onset: "15–60 min (sublingual)",
    duration: "6–10 h",
    doses: [{ route: "sublingual", threshold: "100 µg", light: "300–600 µg", common: "600–900 µg", strong: "900–1500 µg" }],
    evidence: [{ label: "Suzuki 2015 – NBOMe Review (Drug Alc. Dep.)", url: "https://pubmed.ncbi.nlm.nih.gov/26049203/" }],
    warnings: ["Krampfanfälle, Vasokonstriktion, Todesfälle dokumentiert", "Oral kaum aktiv – Verschlucken kann Überdosis verschleiern"],
  },
  {
    id: "4-ho-met",
    name: "4-HO-MET",
    aliases: ["Metocin"],
    category: "psychedelic",
    shortDescription: "Tryptamin, sanfter/visueller als Psilocin.",
    mechanism: "5-HT2A Agonist.",
    onset: "20–45 min",
    duration: "4–6 h",
    doses: [{ route: "oral", threshold: "5 mg", light: "10–15 mg", common: "15–25 mg", strong: "25–40 mg" }],
    evidence: [{ label: "PsychonautWiki 4-HO-MET", url: "https://psychonautwiki.org/wiki/4-HO-MET" }],
    warnings: ["Wenig Langzeitdaten"],
  },
  {
    id: "ald-52",
    name: "ALD-52",
    aliases: ["1-Acetyl-LSD"],
    category: "psychedelic",
    shortDescription: "LSD-Prodrug, etwas weicher als LSD.",
    mechanism: "Wird zu LSD metabolisiert; 5-HT2A Agonist.",
    onset: "30–90 min",
    duration: "8–12 h",
    doses: [{ route: "oral", threshold: "25 µg", light: "50–100 µg", common: "100–175 µg", strong: "175–300 µg" }],
    evidence: [{ label: "Brandt 2017 – ALD-52 charakterisiert", url: "https://pubmed.ncbi.nlm.nih.gov/28733692/" }],
    warnings: ["Wie LSD: HPPD-Risiko"],
  },

  // ───── Cathinone / Pyrrolidinophenone (RC) ─────
  {
    id: "4-cmc",
    name: "4-CMC",
    aliases: ["Clephedrone"],
    category: "cathinone",
    shortDescription: "Substituiertes Cathinon, mephedron-ähnlich aber harziger.",
    mechanism: "DAT/SERT-Substrat (Releaser).",
    onset: "15–45 min",
    duration: "3–5 h",
    doses: [{ route: "oral/insufflated", threshold: "20 mg", light: "50–100 mg", common: "100–200 mg", strong: "200–300 mg" }],
    evidence: [{ label: "EMCDDA – 4-CMC profile", url: "https://www.emcdda.europa.eu/publications/drug-profiles/synthetic-cathinones_en" }],
    warnings: ["Compulsive Re-Dose", "Lange Nachwirkungen, Schlafmangel"],
  },
  {
    id: "n-ethyl-hexedrone",
    name: "N-Ethylhexedrone",
    aliases: ["Hexen", "NEH"],
    category: "cathinone",
    shortDescription: "Pyrrolidinophenon-naher Stim, deutlich potenter als Mephedron.",
    mechanism: "DAT/NET-Hemmer.",
    onset: "10–30 min",
    duration: "2–4 h (Nachwirkungen länger)",
    doses: [{ route: "oral/insufflated", threshold: "5 mg", light: "10–20 mg", common: "20–40 mg", strong: "40–70 mg" }],
    evidence: [{ label: "EMCDDA – N-Ethylhexedrone", url: "https://www.emcdda.europa.eu/publications/drug-profiles/synthetic-cathinones_en" }],
    warnings: ["Sehr stark suchterzeugend", "Hyperthermie, Vasokonstriktion"],
  },
  {
    id: "eutylone",
    name: "Eutylone",
    aliases: ["bk-EBDB"],
    category: "cathinone",
    shortDescription: "MDMA-Surrogat – aber stimulierend und schlechter erträglich.",
    mechanism: "Monoamin-Releaser/Hemmer mit Cathinon-Profil.",
    onset: "20–60 min",
    duration: "4–6 h, Nachwirkungen 12+ h",
    doses: [{ route: "oral", threshold: "30 mg", light: "60–100 mg", common: "100–180 mg", strong: "180–250 mg" }],
    evidence: [{ label: "Krotulski 2021 – Eutylone Adulterant", url: "https://pubmed.ncbi.nlm.nih.gov/33403402/" }],
    warnings: ["Oft als MDMA verkauft – Test-Kits sind nicht eindeutig", "Schlafmangel und Angst-Nachwirkungen"],
  },
  {
    id: "nep",
    name: "NEP",
    aliases: ["N-Ethylpentedrone"],
    category: "cathinone",
    shortDescription: "Stimulierendes Cathinon, ähnlich α-PVP.",
    mechanism: "DAT/NET-Hemmer.",
    onset: "10–30 min",
    duration: "2–4 h",
    doses: [{ route: "oral/insufflated", threshold: "5 mg", light: "10–20 mg", common: "20–40 mg", strong: "40–60 mg" }],
    evidence: [{ label: "PsychonautWiki NEP", url: "https://psychonautwiki.org/wiki/NEP" }],
    warnings: ["Compulsive Re-Dose", "Wenig Humandaten"],
  },

  // ───── Dissoziativa (RC) ─────
  {
    id: "dck",
    name: "Deschloroketamin",
    aliases: ["DCK", "DXE"],
    category: "dissociative",
    shortDescription: "Ketamin-Analog, längere und intensivere Wirkung.",
    mechanism: "NMDA-Antagonist.",
    onset: "15–45 min",
    duration: "2–4 h",
    doses: [{ route: "oral", threshold: "20 mg", light: "40–80 mg", common: "80–150 mg", strong: "150–250 mg" }],
    evidence: [{ label: "Theofel 2017 – DCK Identifikation", url: "https://pubmed.ncbi.nlm.nih.gov/28182304/" }],
    warnings: ["Sehr abhängigkeitsfördernd", "Blasenrisiko wie Ketamin"],
  },
  {
    id: "3-ho-pcp",
    name: "3-HO-PCP",
    aliases: [],
    category: "dissociative",
    shortDescription: "PCP-Analog mit zusätzlicher µ-opioider Komponente.",
    mechanism: "NMDA-Antagonist + µ-Opioid-Agonismus.",
    onset: "30–90 min",
    duration: "4–8 h",
    doses: [{ route: "oral", threshold: "1 mg", light: "3–6 mg", common: "6–10 mg", strong: "10–15 mg" }],
    evidence: [{ label: "PsychonautWiki 3-HO-PCP", url: "https://psychonautwiki.org/wiki/3-HO-PCP" }],
    warnings: ["Atemdepression durch Opioid-Anteil", "Sehr enger Sicherheitsbereich"],
  },
  {
    id: "mxp",
    name: "Methoxphenidin",
    aliases: ["MXP", "2-MeO-Diphenidin"],
    category: "dissociative",
    shortDescription: "Diphenidin-Reihe, lange dissoziative Wirkung.",
    mechanism: "NMDA-Antagonist.",
    onset: "30–90 min",
    duration: "5–8 h",
    doses: [{ route: "oral", threshold: "30 mg", light: "50–100 mg", common: "100–150 mg", strong: "150–200 mg" }],
    evidence: [{ label: "Helander 2015 – MXP Vergiftungen", url: "https://pubmed.ncbi.nlm.nih.gov/25590446/" }],
    warnings: ["Kardiovaskuläre Belastung", "Late-Onset → Re-Dose-Risiko"],
  },

  // ───── Designer Benzos ─────
  {
    id: "clonazolam",
    name: "Clonazolam",
    aliases: ["Clam"],
    category: "benzodiazepine",
    shortDescription: "Designer-Triazolam-Analog, extrem potent.",
    mechanism: "GABA-A positiv allosterisch.",
    onset: "20–45 min",
    duration: "6–10 h",
    doses: [{ route: "oral/sublingual", threshold: "100 µg", light: "250–500 µg", common: "500 µg–1 mg", strong: "1–2 mg", notes: "Volumetrisch dosieren" }],
    evidence: [{ label: "Moosmann 2015 – Designer Benzos", url: "https://pubmed.ncbi.nlm.nih.gov/26487708/" }],
    warnings: ["Amnesie, Blackouts schon bei niedriger Dosis", "Extrem hohes Abhängigkeitspotenzial"],
  },
  {
    id: "flualprazolam",
    name: "Flualprazolam",
    aliases: [],
    category: "benzodiazepine",
    shortDescription: "Fluoriertes Alprazolam-Analog, sehr potent.",
    mechanism: "GABA-A positiv allosterisch.",
    onset: "20–45 min",
    duration: "10–14 h",
    doses: [{ route: "oral", threshold: "100 µg", light: "250–500 µg", common: "500 µg–1 mg", strong: "1–2 mg" }],
    evidence: [{ label: "EMCDDA – Flualprazolam", url: "https://www.emcdda.europa.eu/publications/rapid-communications/flualprazolam_en" }],
    warnings: ["Mehrere Todesfälle in Kombination mit Opioiden", "Sehr lange Halbwertszeit"],
  },
  {
    id: "bromazolam",
    name: "Bromazolam",
    aliases: [],
    category: "benzodiazepine",
    shortDescription: "Aktuell weit verbreitetes Designer-Benzo, häufig in Strassen-Opioiden gefunden.",
    mechanism: "GABA-A positiv allosterisch.",
    onset: "20–45 min",
    duration: "8–12 h",
    doses: [{ route: "oral", threshold: "100 µg", light: "250–500 µg", common: "500 µg–1.5 mg", strong: "1.5–3 mg" }],
    evidence: [{ label: "Krotulski 2022 – Bromazolam Surveillance", url: "https://pubmed.ncbi.nlm.nih.gov/35452102/" }],
    warnings: ["Wird als Streckmittel in Fentanyl/Nitazenen gefunden", "Atemdepression in Kombination häufig tödlich"],
  },

  // ───── Designer Opioide (Nitazene) ─────
  {
    id: "isotonitazene",
    name: "Isotonitazene",
    aliases: ["Iso"],
    category: "opioid",
    shortDescription: "Nitazen-Designer-Opioid, potenter als Fentanyl.",
    mechanism: "Hoch-affiner µ-Opioid-Agonist.",
    onset: "5–15 min (insufflated)",
    duration: "3–6 h",
    doses: [{ route: "oral/insufflated", threshold: "50 µg", light: "100–250 µg", common: "250–500 µg", strong: "500 µg+", notes: "Dosierung NUR mit µg-Waage – Überdosis innerhalb weniger 100 µg" }],
    evidence: [
      { label: "Krotulski 2020 – Isotonitazene Charakterisierung", url: "https://pubmed.ncbi.nlm.nih.gov/32390075/" },
      { label: "EMCDDA – Isotonitazene Risk Assessment", url: "https://www.emcdda.europa.eu/publications/risk-assessments/isotonitazene_en" },
    ],
    warnings: ["Naloxon bereithalten (ggf. mehrere Dosen)", "Niemals allein konsumieren", "Schon Spuren können tödlich sein"],
  },
  {
    id: "metonitazene",
    name: "Metonitazene",
    aliases: [],
    category: "opioid",
    shortDescription: "Nitazen-Opioid, in Toten-Toxikologie zunehmend gefunden.",
    mechanism: "µ-Opioid-Agonist.",
    onset: "5–20 min",
    duration: "3–6 h",
    doses: [{ route: "oral", threshold: "100 µg", light: "200–500 µg", common: "500 µg–1 mg", strong: "1 mg+" }],
    evidence: [{ label: "Krotulski 2021 – Metonitazene Cases", url: "https://pubmed.ncbi.nlm.nih.gov/34427925/" }],
    warnings: ["Naloxon bereithalten", "Lebensgefahr mit jedem Depressivum"],
  },
  {
    id: "brorphine",
    name: "Brorphine",
    aliases: [],
    category: "opioid",
    shortDescription: "Piperidin-Designer-Opioid mit fentanyl-ähnlicher Potenz.",
    mechanism: "µ-Opioid-Agonist.",
    onset: "10–30 min",
    duration: "3–6 h",
    doses: [{ route: "oral", threshold: "100 µg", light: "200–500 µg", common: "500 µg–1.5 mg", strong: "1.5 mg+" }],
    evidence: [{ label: "Verougstraete 2020 – Brorphine Identifikation", url: "https://pubmed.ncbi.nlm.nih.gov/33124679/" }],
    warnings: ["Naloxon oft mehrfach nötig", "Hohe Atemdepression"],
  },

  // ───── Synthetische Cannabinoide ─────
  {
    id: "mdmb-4en-pinaca",
    name: "MDMB-4en-PINACA",
    aliases: ["Spice (Gen 5)"],
    category: "cannabinoid",
    shortDescription: "Hochpotenter synthetischer Cannabinoid-Vollagonist, dominiert Spice-Märkte.",
    mechanism: "CB1-Vollagonist (im Gegensatz zu THC = Partialagonist).",
    onset: "1–5 min (geraucht)",
    duration: "1–3 h",
    doses: [{ route: "inhaliert", threshold: "<100 µg", light: "100–300 µg", common: "300–700 µg", notes: "Praktisch undosierbar als Kraut-Spray – extrem ungleichmäßig" }],
    evidence: [
      { label: "EMCDDA – Synthetic Cannabinoids", url: "https://www.emcdda.europa.eu/publications/drug-profiles/synthetic-cannabinoids_en" },
      { label: "Angerer 2018 – Cannabinoid Vollagonisten Tox.", url: "https://pubmed.ncbi.nlm.nih.gov/29148145/" },
    ],
    warnings: ["Krampfanfälle, Psychosen, Todesfälle dokumentiert", "Wirkung NICHT wie THC – kein Vergleich zu Cannabis", "Hot-Spots in Kräutermischungen"],
  },
  {
    id: "adb-butinaca",
    name: "ADB-BUTINACA",
    aliases: [],
    category: "cannabinoid",
    shortDescription: "Aktuell verbreiteter synthetischer Cannabinoid-Vollagonist.",
    mechanism: "CB1-Vollagonist.",
    onset: "1–5 min",
    duration: "1–3 h",
    doses: [{ route: "inhaliert", threshold: "<100 µg", light: "100–300 µg", common: "300–700 µg" }],
    evidence: [{ label: "Haschimi 2022 – ADB-BUTINACA Marktanalyse", url: "https://pubmed.ncbi.nlm.nih.gov/35385893/" }],
    warnings: ["Tachykardie, Psychose, Krampfanfälle", "Nicht mit Cannabis vergleichbar"],
  },
];

// ───────── Interaction matrix ─────────
// Anlehnung an TripSit Combo Chart (https://combo.tripsit.me/) + EMCDDA.
export type RiskLevel = "safe" | "caution" | "unsafe" | "danger" | "synergy" | "unknown";

export interface RiskInfo {
  level: RiskLevel;
  reason: string;
}

const CAT = (id: string) => SUBSTANCES.find((s) => s.id === id)!.category;

function pairKey(a: string, b: string) {
  return [a, b].sort().join("|");
}

// Category-level baseline + specific overrides.
const CATEGORY_MATRIX: Record<string, RiskInfo> = {
  // depressant combos
  "depressant|depressant": { level: "danger", reason: "Verstärkte Atemdepression. Hohes Überdosisrisiko." },
  "alcohol|depressant": { level: "danger", reason: "GABA-Synergie – Atemstillstand möglich." },
  "alcohol|opioid": { level: "danger", reason: "Massive Atemdepression. Häufigste tödliche Kombination." },
  "alcohol|benzodiazepine": { level: "danger", reason: "Synergistische Sedierung, Blackouts, Atemstillstand." },
  "opioid|benzodiazepine": { level: "danger", reason: "Atemdepression – dokumentiert häufig tödlich." },
  "opioid|depressant": { level: "danger", reason: "Additive Atemdepression." },
  "opioid|opioid": { level: "danger", reason: "Überdosisrisiko, ohne Toleranzkenntnis lebensgefährlich." },
  "benzodiazepine|depressant": { level: "danger", reason: "Atemdepression, Bewusstlosigkeit." },
  "benzodiazepine|benzodiazepine": { level: "unsafe", reason: "Additive Sedierung ohne klinischen Nutzen." },

  // dissociative + depressant
  "dissociative|opioid": { level: "danger", reason: "Atemdepression, schwer einschätzbar." },
  "dissociative|benzodiazepine": { level: "unsafe", reason: "Atemdepression möglich." },
  "dissociative|alcohol": { level: "unsafe", reason: "Erbrechen + Bewusstlosigkeit – Aspirationsgefahr." },
  "dissociative|depressant": { level: "unsafe", reason: "Sedierung verstärkt." },

  // stimulant combos
  "stimulant|stimulant": { level: "unsafe", reason: "Additive kardiovaskuläre Belastung, Hyperthermie, Psychose." },
  "stimulant|cathinone": { level: "unsafe", reason: "Kardiotox-Additivität, Re-Dose-Schleifen." },
  "cathinone|cathinone": { level: "unsafe", reason: "Vasokonstriktion und Hyperthermie addieren sich." },
  "stimulant|empathogen": { level: "unsafe", reason: "Erhöhter Blutdruck, Hyperthermie." },
  "cathinone|empathogen": { level: "unsafe", reason: "Serotonerge und kardiale Belastung addieren sich." },
  "empathogen|empathogen": { level: "unsafe", reason: "Serotonin-Last steigt – Hyperthermie/Tox." },

  // stimulant + depressant masking
  "stimulant|alcohol": { level: "caution", reason: "Sedierung wird maskiert – Risiko Alkoholvergiftung." },
  "stimulant|opioid": { level: "unsafe", reason: "Speedball – nach Abklingen Stim hohe Atemdepressions-Gefahr." },
  "cathinone|opioid": { level: "unsafe", reason: "Speedball-Effekt, plötzliche Atemdepression möglich." },
  "stimulant|depressant": { level: "caution", reason: "Effekte maskieren sich gegenseitig." },

  // psychedelics
  "psychedelic|psychedelic": { level: "caution", reason: "Wirkung schwer vorhersagbar, intensivere Erfahrung." },
  "psychedelic|stimulant": { level: "caution", reason: "Ängstliche/psychotische Reaktionen häufiger." },
  "psychedelic|cathinone": { level: "caution", reason: "Erhöhte Angst-/Psychose-Wahrscheinlichkeit." },
  "psychedelic|empathogen": { level: "synergy", reason: "'Candy-Flip' – beliebt aber serotonerge Last erhöht." },
  "psychedelic|dissociative": { level: "caution", reason: "Sehr unvorhersehbare Trips." },
  "psychedelic|cannabinoid": { level: "caution", reason: "Kann Trip stark verstärken / kippen lassen." },

  // empathogen + dissociative / opioid
  "empathogen|dissociative": { level: "caution", reason: "Stark verstärkende Effekte." },
  "empathogen|opioid": { level: "unsafe", reason: "Serotonin + Atemdepression." },
  "empathogen|alcohol": { level: "caution", reason: "Dehydrierung, Lebertoxizität." },

  // cannabis as wildcard
  "cannabinoid|opioid": { level: "caution", reason: "Sedierung verstärkt." },
  "cannabinoid|alcohol": { level: "caution", reason: "Übelkeit, 'Greenout'." },
  "cannabinoid|dissociative": { level: "caution", reason: "Sehr intensive dissoziative Erfahrung." },
  "cannabinoid|stimulant": { level: "caution", reason: "Tachykardie, Angst." },

  // neuroleptics
  "neuroleptic|psychedelic": { level: "caution", reason: "Beendet meist den Trip – aber selbst kreislaufbelastend." },
  "neuroleptic|stimulant": { level: "unsafe", reason: "QT-Verlängerung, kardiale Belastung." },
  "neuroleptic|cathinone": { level: "unsafe", reason: "Kardiale Belastung, antagonistische Effekte." },
  "neuroleptic|opioid": { level: "danger", reason: "Atemdepression, Hypotonie." },
  "neuroleptic|alcohol": { level: "danger", reason: "Atemdepression, schwere Hypotonie." },
  "neuroleptic|benzodiazepine": { level: "unsafe", reason: "Verstärkte Sedierung." },
  "neuroleptic|depressant": { level: "unsafe", reason: "Sedierung addiert sich." },
  "neuroleptic|empathogen": { level: "caution", reason: "Reduziert MDMA-Wirkung; aber Kreislaufrisiko." },
  "neuroleptic|dissociative": { level: "caution", reason: "Sedierung verstärkt." },
  "neuroleptic|neuroleptic": { level: "unsafe", reason: "EPS-Risiko, QT-Verlängerung." },
};

// Specific id-pair overrides where category logic is too coarse.
const SPECIFIC_OVERRIDES: Record<string, RiskInfo> = {
  [pairKey("mdma", "tramadol")]: { level: "danger", reason: "Serotonin-Syndrom-Risiko (Tramadol ist auch SNRI)." },
  [pairKey("mdma", "alcohol")]: { level: "caution", reason: "Dehydrierung + Leber- und Herzbelastung." },
  [pairKey("cocaine", "alcohol")]: { level: "unsafe", reason: "Bildet Cocaethylen – hepato- und kardiotoxisch." },
  [pairKey("ghb", "alcohol")]: { level: "danger", reason: "Atemdepression, Bewusstlosigkeit, Aspirationsgefahr." },
  [pairKey("fentanyl", "alcohol")]: { level: "danger", reason: "Extrem hohes Atemstillstand-Risiko." },
  [pairKey("lsd", "lithium")]: { level: "danger", reason: "Krampfanfälle dokumentiert." },
  [pairKey("dmt", "mdma")]: { level: "caution", reason: "Serotonerge Last erhöht." },

  // 5-MeO-DMT – schon kleinste serotonerge Zusatzbelastung kann Serotonin-Syndrom auslösen.
  [pairKey("5-meo-dmt", "mdma")]: { level: "danger", reason: "Massive serotonerge Synergie – Serotonin-Syndrom-Risiko." },
  [pairKey("5-meo-dmt", "tramadol")]: { level: "danger", reason: "Serotonin-Syndrom-Risiko (Tramadol = SNRI)." },
  [pairKey("5-meo-dmt", "o-dsmt")]: { level: "danger", reason: "Serotonin-Syndrom-Risiko." },
  [pairKey("5-meo-mipt", "mdma")]: { level: "danger", reason: "Serotonerge Synergie – Serotonin-Syndrom möglich." },

  // 3-HO-PCP: dissoziativ + opioid in einer Substanz → bei Mischung wie zwei Opioide rechnen.
  [pairKey("3-ho-pcp", "alcohol")]: { level: "danger", reason: "Atemdepression durch µ-Anteil + GABA-Last." },
  [pairKey("3-ho-pcp", "heroin")]: { level: "danger", reason: "Atemdepression additiv – wie Opioid + Opioid." },
  [pairKey("3-ho-pcp", "fentanyl")]: { level: "danger", reason: "Atemdepression additiv – wie Opioid + Opioid." },

  // Nitazene (Iso, Meto, Brorphine) – schon mit „üblichen" Mengen Alkohol tödlich.
  [pairKey("isotonitazene", "alcohol")]: { level: "danger", reason: "Extremes Atemstillstand-Risiko. Naloxon bereithalten." },
  [pairKey("metonitazene", "alcohol")]: { level: "danger", reason: "Extremes Atemstillstand-Risiko. Naloxon bereithalten." },
  [pairKey("brorphine", "alcohol")]: { level: "danger", reason: "Extremes Atemstillstand-Risiko." },
  [pairKey("isotonitazene", "bromazolam")]: { level: "danger", reason: "Häufige Streckmittel-Kombi – sehr viele Tote in Surveillance-Daten." },
  [pairKey("metonitazene", "bromazolam")]: { level: "danger", reason: "Atemstillstand-Risiko, in Strassen-Proben dokumentiert." },

  // Designer-Benzos + Opioide – häufigste Todesursache im aktuellen NPS-Markt.
  [pairKey("clonazolam", "heroin")]: { level: "danger", reason: "Atemstillstand. Designer-Benzos verstärken Opioid-Wirkung massiv." },
  [pairKey("flualprazolam", "heroin")]: { level: "danger", reason: "Atemstillstand. Sehr lange Halbwertszeit – kein Aufwachen." },
  [pairKey("bromazolam", "fentanyl")]: { level: "danger", reason: "In Drogen-Proben oft gemeinsam – kumulative Atemdepression." },

  // NBOMe – Vasokonstriktion + Stim potenziert Krampf- und Herz-Risiko.
  [pairKey("25i-nbome", "cocaine")]: { level: "danger", reason: "Vasokonstriktion addiert sich – Infarkt/Krampfanfall-Risiko." },
  [pairKey("25c-nbome", "cocaine")]: { level: "danger", reason: "Vasokonstriktion addiert sich – Infarkt/Krampfanfall-Risiko." },
  [pairKey("25i-nbome", "amphetamine")]: { level: "unsafe", reason: "Vasokonstriktion + sympathomimetische Last." },

  // DOx (DOM/DOC) – sehr lange Stim + Psychedelikum in einem.
  [pairKey("dom", "mdma")]: { level: "unsafe", reason: "Lange serotonerge + sympathische Last – Hyperthermie-Risiko." },
  [pairKey("doc", "mdma")]: { level: "unsafe", reason: "Lange serotonerge + sympathische Last – Hyperthermie-Risiko." },

  // Synthetische Cannabinoide – kein Vergleich zu THC.
  [pairKey("mdmb-4en-pinaca", "alcohol")]: { level: "unsafe", reason: "Übelkeit, Synkope, Krampfanfälle berichtet." },
  [pairKey("adb-butinaca", "alcohol")]: { level: "unsafe", reason: "Übelkeit, Synkope, Krampfanfälle berichtet." },
  [pairKey("mdmb-4en-pinaca", "amphetamine")]: { level: "unsafe", reason: "Tachykardie und Psychose-Risiko." },

  // Cathinon-RCs mit Empathogenen / Stim – Eutylone wird oft als MDMA verkauft.
  [pairKey("eutylone", "mdma")]: { level: "unsafe", reason: "Verstärkte serotonerge + kardiale Last, Schlafmangel." },
  [pairKey("n-ethyl-hexedrone", "cocaine")]: { level: "unsafe", reason: "Massive kardiovaskuläre Belastung." },
  [pairKey("4-cmc", "mdma")]: { level: "unsafe", reason: "Additive Monoamin-Freisetzung." },
};

export function assessPair(idA: string, idB: string): RiskInfo {
  if (idA === idB) return { level: "caution", reason: "Re-Dose erhöht Toleranz und Belastung." };
  const k = pairKey(idA, idB);
  if (SPECIFIC_OVERRIDES[k]) return SPECIFIC_OVERRIDES[k];

  const a = CAT(idA);
  const b = CAT(idB);
  const ck1 = `${a}|${b}`;
  const ck2 = `${b}|${a}`;
  const sorted = [a, b].sort().join("|");
  return (
    CATEGORY_MATRIX[ck1] ||
    CATEGORY_MATRIX[ck2] ||
    CATEGORY_MATRIX[sorted] || { level: "unknown", reason: "Keine etablierten Daten – Vorsicht." }
  );
}

export function overallRisk(ids: string[]): RiskInfo {
  if (ids.length < 2) return { level: "safe", reason: "Keine Kombination." };
  const pairs: RiskInfo[] = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      pairs.push(assessPair(ids[i], ids[j]));
    }
  }
  const order: RiskLevel[] = ["danger", "unsafe", "caution", "unknown", "synergy", "safe"];
  for (const lvl of order) {
    const hit = pairs.find((p) => p.level === lvl);
    if (hit) return hit;
  }
  return { level: "safe", reason: "Keine bekannten Risiken." };
}

export const RISK_META: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  safe: { label: "Sicher", color: "text-risk-safe", bg: "bg-risk-safe/15 border-risk-safe/40" },
  synergy: { label: "Synergie", color: "text-secondary", bg: "bg-secondary/15 border-secondary/40" },
  caution: { label: "Vorsicht", color: "text-risk-caution", bg: "bg-risk-caution/15 border-risk-caution/40" },
  unsafe: { label: "Unsicher", color: "text-risk-unsafe", bg: "bg-risk-unsafe/15 border-risk-unsafe/40" },
  danger: { label: "Lebensgefährlich", color: "text-risk-danger", bg: "bg-risk-danger/15 border-risk-danger/40" },
  unknown: { label: "Unbekannt", color: "text-muted-foreground", bg: "bg-muted/40 border-border" },
};

export const CATEGORY_LABEL: Record<SubstanceCategory, string> = {
  psychedelic: "Psychedelika",
  stimulant: "Stimulanzien",
  cathinone: "Cathinone / Pyrrolidinophenone",
  depressant: "Depressiva",
  opioid: "Opioide",
  dissociative: "Dissoziativa",
  cannabinoid: "Cannabinoide",
  empathogen: "Empathogene",
  benzodiazepine: "Benzodiazepine",
  neuroleptic: "Neuroleptika",
  alcohol: "Alkohol",
  other: "Andere",
};
