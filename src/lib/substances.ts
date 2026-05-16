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

  // ───── Verschreibungspflichtige Medikamente mit Missbrauchspotenzial ─────
  {
    id: "tilidin",
    name: "Tilidin",
    aliases: ["Valoron", "Tilidin/Naloxon"],
    category: "opioid",
    shortDescription: "Prodrug-Opioid (Valoron N enthält Naloxon als Abuse-Deterrent).",
    mechanism: "Prodrug → Nortilidin (µ-Agonist). Bei oraler Einnahme von Tilidin/Naloxon wird Naloxon hepatisch weitgehend metabolisiert; bei i.v.-Missbrauch blockiert es den µ-Rezeptor.",
    onset: "10–30 min (oral)",
    duration: "4–6 h",
    doses: [{ route: "oral", light: "50 mg", common: "100 mg", strong: "150–200 mg", notes: "Therapeutisch 50–100 mg alle 4 h" }],
    evidence: [
      { label: "Fachinfo Valoron N", url: "https://www.gelbe-liste.de/produkte/Valoron-N-50mg-4mg_513051" },
      { label: "BfArM – Tilidin Missbrauchspotenzial", url: "https://www.bfarm.de/" },
    ],
    warnings: ["Hohes Missbrauchs- und Abhängigkeitspotenzial trotz Naloxon-Anteil", "Krampfschwelle ↓ in hohen Dosen", "Kreuztoleranz zu anderen µ-Opioiden", "Entzug klassisch opioid (Schwitzen, RLS, Diarrhö)"],
  },
  {
    id: "codeine",
    name: "Codein",
    aliases: ["Codipront", "Lean (mit Promethazin)"],
    category: "opioid",
    shortDescription: "Schwaches Opioid, häufig in Hustensäften — Hauptbestandteil von 'Lean/Purple Drank'.",
    mechanism: "Prodrug, CYP2D6 demethyliert ~10% zu Morphin. Bei CYP2D6-Ultra-Rapid-Metabolizern stark erhöhte Wirkung/Toxizität.",
    onset: "30–60 min",
    duration: "4–6 h",
    doses: [{ route: "oral", light: "20–40 mg", common: "60–120 mg", strong: "150–300 mg", notes: "Therapeutisch 30–60 mg" }],
    evidence: [{ label: "EMA – Codein bei Kindern (CYP2D6)", url: "https://www.ema.europa.eu/en/medicines/human/referrals/codeine-containing-medicinal-products" }],
    warnings: ["CYP2D6-Polymorphismus → unvorhersehbare Wirkung", "Mit Promethazin ('Lean') deutlich erhöhte Atemdepressions-Gefahr", "Obstipation, Histamin-Freisetzung"],
  },
  {
    id: "tapentadol",
    name: "Tapentadol",
    aliases: ["Palexia", "Nucynta"],
    category: "opioid",
    shortDescription: "Atypisches Opioid: µ-Agonist + Noradrenalin-Reuptake-Hemmer.",
    mechanism: "µ-Agonist (schwächer als Morphin) + NRI. Kein aktiver Metabolit, kein CYP2D6-Effekt.",
    onset: "30 min",
    duration: "4–6 h (Retard: 12 h)",
    doses: [{ route: "oral", light: "50 mg", common: "75–100 mg", strong: "150–200 mg" }],
    evidence: [{ label: "Tzschentke 2007 – Tapentadol Pharmakologie", url: "https://pubmed.ncbi.nlm.nih.gov/17431135/" }],
    warnings: ["Krampfschwelle ↓", "MAOI kontraindiziert", "Wachsendes Missbrauchsprofil"],
  },
  {
    id: "methylphenidate",
    name: "Methylphenidat",
    aliases: ["Ritalin", "Concerta", "Medikinet"],
    category: "stimulant",
    shortDescription: "ADHS-Medikament, Stim mit hohem Missbrauchspotenzial (insb. nasal/i.v.).",
    mechanism: "Dopamin- und Noradrenalin-Reuptake-Hemmer (DAT/NET). Keine Freisetzung wie Amphetamine.",
    onset: "20–60 min (oral); 2–5 min (nasal)",
    duration: "3–5 h (IR); 8–12 h (Retard)",
    doses: [{ route: "oral", light: "5–10 mg", common: "10–30 mg", strong: "30–60 mg", notes: "Therapeutisch titriert" }],
    evidence: [{ label: "Volkow 2002 – MPH Dopamin-Bindung (PET)", url: "https://pubmed.ncbi.nlm.nih.gov/11823252/" }],
    warnings: ["Retardpräparate niemals zerstoßen — Dose-Dumping mit kardialem Risiko", "Vasokonstriktion, RR/HF ↑", "Toleranz, Schlafentzug, Psychose-Risiko bei Dauergebrauch"],
  },
  {
    id: "lisdexamfetamine",
    name: "Lisdexamfetamin",
    aliases: ["Elvanse", "Vyvanse"],
    category: "stimulant",
    shortDescription: "Amphetamin-Prodrug (L-Lysin-Konjugat), nur oral aktiv — Abuse-Deterrent-Design.",
    mechanism: "Wird im Blut durch Erythrozyten-Hydrolyse zu D-Amphetamin gespalten. Geschwindigkeit der Spaltung limitiert Peaks.",
    onset: "60–120 min",
    duration: "10–13 h",
    doses: [{ route: "oral", light: "20–30 mg", common: "40–60 mg", strong: "70 mg" }],
    evidence: [{ label: "Pennick 2010 – Lisdexamfetamin Pharmakokinetik", url: "https://pubmed.ncbi.nlm.nih.gov/20881878/" }],
    warnings: ["Nasal/IV bringt keinen schnelleren Peak (Prodrug-Spaltung passiert im Blut)", "Klassisches Amphetamin-Risiko bei Überdosis"],
  },
  {
    id: "modafinil",
    name: "Modafinil",
    aliases: ["Vigil", "Provigil"],
    category: "stimulant",
    shortDescription: "Wachhaltendes Mittel (Narkolepsie), geringes aber relevantes Missbrauchspotenzial.",
    mechanism: "Schwacher DAT-Hemmer + Wirkung auf Orexin/Histamin-Systeme. Geringe euphorisierende Wirkung.",
    onset: "30–60 min",
    duration: "10–15 h",
    doses: [{ route: "oral", light: "50–100 mg", common: "100–200 mg", strong: "200–400 mg" }],
    evidence: [{ label: "Volkow 2009 – Modafinil DAT-Bindung", url: "https://pubmed.ncbi.nlm.nih.gov/19293415/" }],
    warnings: ["Reduziert Wirksamkeit hormoneller Kontrazeptiva (CYP3A4-Induktion)", "Kopfschmerz, Angst, Schlaflosigkeit", "Stevens-Johnson-Syndrom (selten)"],
  },
  {
    id: "zolpidem",
    name: "Zolpidem",
    aliases: ["Stilnox", "Bikalm"],
    category: "depressant",
    shortDescription: "Z-Substanz, GABAerges Hypnotikum mit ausgeprägtem Missbrauchspotenzial.",
    mechanism: "Selektiver Agonist an α1-Untereinheit des GABA_A-Rezeptors.",
    onset: "15–30 min",
    duration: "4–6 h",
    doses: [{ route: "oral", light: "5 mg", common: "10 mg", strong: "20 mg", notes: "Therapeutisch max. 10 mg" }],
    evidence: [{ label: "Sanger 2004 – Z-Drugs Pharmakologie", url: "https://pubmed.ncbi.nlm.nih.gov/15102352/" }],
    warnings: ["Komplexe Schlafverhaltensweisen (Schlafwandeln, Sleep-Driving, Sleep-Eating)", "Anterograde Amnesie", "Schnelle Toleranz- und Abhängigkeitsentwicklung", "Atemdepression mit Opioiden/Alkohol"],
  },
  {
    id: "zopiclone",
    name: "Zopiclon",
    aliases: ["Ximovan", "Imovane"],
    category: "depressant",
    shortDescription: "Z-Substanz, ähnlich Zolpidem, etwas breiteres Rezeptor-Profil.",
    mechanism: "Cyclopyrrolon, Agonist mehrerer GABA_A-Untereinheiten (α1/α2/α3/α5).",
    onset: "20–30 min",
    duration: "6–8 h",
    doses: [{ route: "oral", light: "3.75 mg", common: "7.5 mg", strong: "15 mg" }],
    evidence: [{ label: "Hajak 2003 – Zopiclon Review", url: "https://pubmed.ncbi.nlm.nih.gov/12865017/" }],
    warnings: ["Bitterer Metallgeschmack typisch", "Toleranz/Abhängigkeit nach 2–4 Wochen täglich dokumentiert", "Hangover, Sturzgefahr bei Älteren"],
  },
  {
    id: "promethazine",
    name: "Promethazin",
    aliases: ["Atosil", "Phenergan"],
    category: "depressant",
    shortDescription: "Sedierendes Antihistaminikum, Schlüsselzutat in 'Lean/Purple Drank' (mit Codein).",
    mechanism: "H1-Antagonist + starke Anticholinergie + α1-Blockade + D2-Antagonismus.",
    onset: "20–60 min",
    duration: "6–12 h",
    doses: [{ route: "oral", light: "12.5–25 mg", common: "25–50 mg", strong: "75–100 mg" }],
    evidence: [{ label: "FDA Black Box – Promethazin bei Kindern <2", url: "https://www.fda.gov/" }],
    warnings: ["QT-Verlängerung in hohen Dosen", "Atemdepression in Kombi mit Opioiden ('Lean')", "Anticholinerges Delir bei Überdosis", "EPS-Risiko bei Daueranwendung"],
  },
  {
    id: "dxm",
    name: "Dextromethorphan",
    aliases: ["DXM", "Wick MediNait", "Robitussin"],
    category: "dissociative",
    shortDescription: "Hustenstiller mit dissoziativer Wirkung in höheren Dosen (Plateau-Konsum).",
    mechanism: "NMDA-Antagonist (über Metabolit Dextrorphan) + SRI + Sigma-1-Agonist.",
    onset: "30–90 min",
    duration: "3–6 h (Plateau-abhängig)",
    doses: [
      { route: "oral", threshold: "30 mg", light: "100–200 mg (1. Plateau)", common: "200–400 mg (2.–3. Plateau)", strong: "400–700 mg (4. Plateau)", notes: "CYP2D6-Polymorphismus → starke interindividuelle Unterschiede" },
    ],
    evidence: [{ label: "Bem 1992 – DXM Toxicology Review", url: "https://pubmed.ncbi.nlm.nih.gov/1356381/" }],
    warnings: ["Niemals Kombi-Präparate mit Paracetamol für Dosis-Konsum — Lebertoxizität", "Serotonin-Syndrom mit SSRIs/MAOIs/MDMA", "Brompheniramin/CPM in 'Robotrip'-Säften zusätzlich gefährlich"],
  },
  {
    id: "lorazepam",
    name: "Lorazepam",
    aliases: ["Tavor", "Ativan"],
    category: "benzodiazepine",
    shortDescription: "Mittellang wirksames Benzo, klinisch häufig bei Angst/Status epilepticus.",
    mechanism: "GABA_A-PAM (BZD-Bindungsstelle, alle α-Untereinheiten außer α4/α6).",
    onset: "20–40 min (oral); 5 min (sublingual)",
    duration: "6–8 h",
    doses: [{ route: "oral", light: "0.5 mg", common: "1–2 mg", strong: "2.5–5 mg" }],
    evidence: [{ label: "Greenblatt 1991 – Lorazepam Pharmakokinetik", url: "https://pubmed.ncbi.nlm.nih.gov/1672037/" }],
    warnings: ["Keine CYP-Interaktionen (Glucuronidierung) — sicherer bei Leberschaden, aber kein 'mildes' Benzo", "Hohe Abhängigkeitsgeschwindigkeit", "Entzug: Krampfanfall-Risiko, langsam ausschleichen"],
  },

  // ═══════════════════════════════════════════════════════════════
  // Erweiterung: PsychonautWiki-orientierte Substanzen
  // ═══════════════════════════════════════════════════════════════

  // ───── Empathogene / MDxx-Reihe ─────
  {
    id: "mda",
    name: "MDA",
    aliases: ["Sass", "Tenamfetamin"],
    category: "empathogen",
    shortDescription: "Empathogen-Psychedelikum, MDMA-Vorgänger mit visuellem Anteil.",
    mechanism: "Serotonin-/Dopamin-/Noradrenalin-Releaser + leichte 5-HT2A-Aktivität.",
    onset: "30–60 min",
    duration: "6–8 h",
    doses: [{ route: "oral", threshold: "20 mg", light: "40–75 mg", common: "75–150 mg", strong: "150–200 mg" }],
    evidence: [{ label: "PsychonautWiki MDA", url: "https://psychonautwiki.org/wiki/MDA" }],
    warnings: ["Stärker neurotoxisch als MDMA (Tiermodelle)", "Lange Wirkdauer, hohe Herz-/Hitze-Last"],
  },
  {
    id: "methylone",
    name: "Methylon",
    aliases: ["bk-MDMA", "M1"],
    category: "cathinone",
    shortDescription: "MDMA-Analog mit Cathinon-Grundgerüst, kürzer und stimulierender.",
    mechanism: "Monoamin-Releaser (SERT/DAT/NET), schwächer serotonerg als MDMA.",
    onset: "20–45 min",
    duration: "2.5–4 h",
    doses: [{ route: "oral", threshold: "50 mg", light: "100–150 mg", common: "150–225 mg", strong: "225–325 mg" }],
    evidence: [{ label: "PsychonautWiki Methylone", url: "https://psychonautwiki.org/wiki/Methylone" }],
    warnings: ["Re-Dose-Druck", "Häufig fälschlich als MDMA verkauft"],
  },
  {
    id: "6-apb",
    name: "6-APB",
    aliases: ["Benzofury"],
    category: "empathogen",
    shortDescription: "Benzofuran-Empathogen, MDMA-ähnlich, längere Wirkdauer.",
    mechanism: "Monoamin-Releaser + partieller 5-HT2B-Agonist (Herzklappen-Risiko).",
    onset: "60–120 min",
    duration: "8–14 h",
    doses: [{ route: "oral", threshold: "20 mg", light: "50–80 mg", common: "80–130 mg", strong: "130–180 mg" }],
    evidence: [{ label: "PsychonautWiki 6-APB", url: "https://psychonautwiki.org/wiki/6-APB" }],
    warnings: ["5-HT2B-Aktivität → Kardiotox bei wiederholtem Gebrauch", "Late-Onset → Re-Dose-Falle"],
  },

  // ───── Psychedelika (Erweiterung) ─────
  {
    id: "1cp-lsd",
    name: "1cP-LSD",
    aliases: ["1-Cyclopropionyl-LSD"],
    category: "psychedelic",
    shortDescription: "LSD-Prodrug, in vivo zu LSD; populärer Legal-RC.",
    mechanism: "Prodrug → LSD; 5-HT2A-Partialagonist.",
    onset: "30–90 min",
    duration: "8–12 h",
    doses: [{ route: "oral", threshold: "20 µg", light: "50–100 µg", common: "100–175 µg", strong: "175–300 µg" }],
    evidence: [{ label: "PsychonautWiki 1cP-LSD", url: "https://psychonautwiki.org/wiki/1cP-LSD" }],
    warnings: ["Wie LSD: HPPD-Risiko, Set & Setting maßgeblich"],
  },
  {
    id: "1v-lsd",
    name: "1V-LSD",
    aliases: ["Valerie"],
    category: "psychedelic",
    shortDescription: "LSD-Prodrug, neuere Generation Legal-RC.",
    mechanism: "Prodrug → LSD; 5-HT2A-Partialagonist.",
    onset: "30–90 min",
    duration: "8–12 h",
    doses: [{ route: "oral", threshold: "20 µg", light: "50–100 µg", common: "100–175 µg", strong: "175–300 µg" }],
    evidence: [{ label: "PsychonautWiki 1V-LSD", url: "https://psychonautwiki.org/wiki/1V-LSD" }],
    warnings: ["Wie LSD"],
  },
  {
    id: "4-ho-mipt",
    name: "4-HO-MiPT",
    aliases: ["Miprocin"],
    category: "psychedelic",
    shortDescription: "Tryptamin, klarer und visueller als Psilocin.",
    mechanism: "5-HT2A-Agonist.",
    onset: "20–45 min",
    duration: "4–6 h",
    doses: [{ route: "oral", threshold: "5 mg", light: "10–17 mg", common: "17–28 mg", strong: "28–40 mg" }],
    evidence: [{ label: "PsychonautWiki 4-HO-MiPT", url: "https://psychonautwiki.org/wiki/4-HO-MiPT" }],
    warnings: ["Wenig Langzeitdaten"],
  },
  {
    id: "lsa",
    name: "LSA",
    aliases: ["Ergin", "Morning Glory", "Hawaiian Baby Woodrose"],
    category: "psychedelic",
    shortDescription: "Lyserg-Säure-Amid aus Samen; psychedelisch + stark sedierend.",
    mechanism: "5-HT2A-Partialagonist, α-Adrenerg.",
    onset: "30–120 min",
    duration: "6–10 h",
    doses: [{ route: "oral", threshold: "0.5 mg LSA", light: "1–2 mg", common: "2–5 mg", strong: "5–10 mg", notes: "Samen-Dosis stark schwankend" }],
    evidence: [{ label: "PsychonautWiki LSA", url: "https://psychonautwiki.org/wiki/LSA" }],
    warnings: ["Starke Übelkeit/Vasokonstriktion durch andere Ergot-Alkaloide", "Samen oft mit Pestiziden behandelt"],
  },
  {
    id: "salvia",
    name: "Salvia divinorum",
    aliases: ["Salvinorin A", "Wahrsagesalbei"],
    category: "psychedelic",
    shortDescription: "Atypisches Psychedelikum über κ-Opioid-Rezeptor.",
    mechanism: "Selektiver κ-Opioid-Agonist (kein 5-HT2A).",
    onset: "<1 min (geraucht)",
    duration: "5–15 min",
    doses: [{ route: "inhaliert", light: "100–250 µg Salvinorin A", common: "250–750 µg", strong: "750 µg–1.5 mg" }],
    evidence: [{ label: "PsychonautWiki Salvia", url: "https://psychonautwiki.org/wiki/Salvia" }],
    warnings: ["Realitätsverlust, oft beängstigend", "Sitter Pflicht – Sturz-/Verletzungsrisiko"],
  },
  {
    id: "ibogaine",
    name: "Ibogain",
    aliases: ["Tabernanthe iboga"],
    category: "psychedelic",
    shortDescription: "Atypisches Psychedelikum, anti-suchtwirksam, aber kardiotox.",
    mechanism: "NMDA-Antagonist, σ-, κ-Opioid-, 5-HT-Modulation, hERG-Blockade.",
    onset: "30–90 min",
    duration: "24–36 h",
    doses: [{ route: "oral", light: "100–300 mg", common: "300–800 mg (psychoaktiv)", strong: "10–20 mg/kg (Suchttherapie)" }],
    evidence: [{ label: "PsychonautWiki Ibogaine", url: "https://psychonautwiki.org/wiki/Ibogaine" }],
    warnings: ["QT-Verlängerung → Torsade-de-pointes, Todesfälle dokumentiert", "Nur mit EKG-Monitoring", "Kontraindiziert bei Herzerkrankungen / SSRI"],
  },
  {
    id: "2c-d",
    name: "2C-D",
    aliases: [],
    category: "psychedelic",
    shortDescription: "Mildes 2C-x, oft als 'Forschungs-Dosis' beschrieben.",
    mechanism: "5-HT2A-Agonist.",
    onset: "45–90 min",
    duration: "4–6 h",
    doses: [{ route: "oral", threshold: "10 mg", light: "15–25 mg", common: "25–50 mg", strong: "50–75 mg" }],
    evidence: [{ label: "Shulgin – PiHKAL #27", url: "https://erowid.org/library/books_online/pihkal/pihkal027.shtml" }],
    warnings: ["Steile Dosis-Wirkungs-Kurve in höherem Bereich"],
  },
  {
    id: "25b-nbome",
    name: "25B-NBOMe",
    aliases: [],
    category: "psychedelic",
    shortDescription: "NBOMe-Variante, sehr potent, schmaler Sicherheitsbereich.",
    mechanism: "Hochpotenter 5-HT2A-Agonist.",
    onset: "15–60 min (sublingual)",
    duration: "6–10 h",
    doses: [{ route: "sublingual", threshold: "100 µg", light: "200–500 µg", common: "500–900 µg", strong: "900–1500 µg" }],
    evidence: [{ label: "PsychonautWiki 25B-NBOMe", url: "https://psychonautwiki.org/wiki/25B-NBOMe" }],
    warnings: ["Krampfanfälle, Vasokonstriktion, Todesfälle dokumentiert", "Oral kaum aktiv → Überdosis-Risiko"],
  },

  // ───── Dissoziativa (Erweiterung) ─────
  {
    id: "nitrous",
    name: "Lachgas",
    aliases: ["N₂O", "Whippets", "NOS"],
    category: "dissociative",
    shortDescription: "Kurzes Dissoziativ-Inhalans, weit verbreitet.",
    mechanism: "NMDA-Antagonist + κ-Opioid-modulation.",
    onset: "<30 s",
    duration: "1–3 min",
    doses: [{ route: "inhaliert", light: "1 Kapsel (~8 g)", common: "1–2 Kapseln in Ballon", strong: "Mehrfach hintereinander – riskant" }],
    evidence: [{ label: "PsychonautWiki Nitrous", url: "https://psychonautwiki.org/wiki/Nitrous" }],
    warnings: ["Vitamin-B12-Inaktivierung → Neuropathien bei häufigem Gebrauch", "Sauerstoffmangel – nie aus Druckflasche direkt, immer im Sitzen", "Erstickungsgefahr mit Maske/Tüte"],
  },
  {
    id: "pcp",
    name: "PCP",
    aliases: ["Phencyclidin", "Angel Dust"],
    category: "dissociative",
    shortDescription: "Klassisches Dissoziativ-Anästhetikum, hohes Risikoprofil.",
    mechanism: "NMDA-Antagonist + σ-Rezeptor, schwache DA/5-HT-Wirkung.",
    onset: "15–60 min",
    duration: "4–8 h",
    doses: [{ route: "oral", threshold: "1 mg", light: "3–5 mg", common: "5–10 mg", strong: "10–20 mg" }],
    evidence: [{ label: "PsychonautWiki PCP", url: "https://psychonautwiki.org/wiki/PCP" }],
    warnings: ["Aggressivität, Selbst-/Fremdverletzung", "Lange Nachwirkungen, Psychose-Risiko"],
  },
  {
    id: "mxipr",
    name: "MXiPr",
    aliases: ["Methoxisopropamin"],
    category: "dissociative",
    shortDescription: "Arylcyclohexylamin, Ketamin-Analog mit längerer Wirkdauer.",
    mechanism: "NMDA-Antagonist.",
    onset: "15–45 min",
    duration: "2–4 h",
    doses: [{ route: "insufflated", light: "15–30 mg", common: "30–60 mg", strong: "60–100 mg" }],
    evidence: [{ label: "PsychonautWiki MXiPr", url: "https://psychonautwiki.org/wiki/MXiPr" }],
    warnings: ["Wenig Humandaten", "Blasenrisiko wie Ketamin vermutet"],
  },

  // ───── Opioide (Erweiterung) ─────
  {
    id: "morphine",
    name: "Morphin",
    aliases: ["MST", "Sevredol"],
    category: "opioid",
    shortDescription: "Klassisches Opioid-Analgetikum, Referenzsubstanz.",
    mechanism: "µ-Opioid-Agonist.",
    onset: "20–45 min (oral)",
    duration: "4–6 h",
    doses: [{ route: "oral", light: "10–20 mg", common: "20–40 mg", strong: "40–60 mg", notes: "Therapeutisch titriert" }],
    evidence: [{ label: "PsychonautWiki Morphine", url: "https://psychonautwiki.org/wiki/Morphine" }],
    warnings: ["Atemdepression mit Benzos/Alkohol", "Histamin-Freisetzung – Juckreiz, Hypotonie"],
  },
  {
    id: "methadone",
    name: "Methadon",
    aliases: ["Polamidon"],
    category: "opioid",
    shortDescription: "Langwirksames Opioid, Substitution + Analgesie.",
    mechanism: "µ-Opioid-Vollagonist + NMDA-Antagonist.",
    onset: "30–60 min",
    duration: "24–36 h (HWZ noch länger)",
    doses: [{ route: "oral", light: "2.5–5 mg (opioidnaiv)", common: "5–15 mg", strong: "Therapeutisch 60–120 mg/d in Substitution" }],
    evidence: [{ label: "PsychonautWiki Methadone", url: "https://psychonautwiki.org/wiki/Methadone" }],
    warnings: ["Akkumulation → späte Atemdepression (Tag 3–5)", "QT-Verlängerung", "Niemals mit Benzos/Alkohol"],
  },
  {
    id: "buprenorphine",
    name: "Buprenorphin",
    aliases: ["Subutex", "Suboxone", "Temgesic"],
    category: "opioid",
    shortDescription: "Partieller µ-Agonist mit Ceiling-Effekt auf Atemdepression.",
    mechanism: "µ-Partial-Agonist, κ-Antagonist; hohe Rezeptor-Affinität.",
    onset: "30–60 min (sublingual)",
    duration: "8–24 h",
    doses: [{ route: "sublingual", light: "0.2–0.4 mg", common: "2–8 mg (Substitution)", strong: "8–24 mg/d" }],
    evidence: [{ label: "PsychonautWiki Buprenorphine", url: "https://psychonautwiki.org/wiki/Buprenorphine" }],
    warnings: ["Präzipitierter Entzug bei aktivem Vollagonisten (Heroin, Methadon)", "Mit Benzos dennoch Atemdepression möglich"],
  },
  {
    id: "kratom",
    name: "Kratom",
    aliases: ["Mitragynin", "Mitragyna speciosa"],
    category: "opioid",
    shortDescription: "Pflanze mit atypischen Opioid-Alkaloiden (Mitragynin, 7-OH-Mitragynin).",
    mechanism: "Partieller µ-Agonist + α2-adrenerg + 5-HT-Modulation.",
    onset: "20–60 min",
    duration: "4–6 h",
    doses: [{ route: "oral", threshold: "1 g", light: "2–4 g (stim.)", common: "4–8 g (gemischt)", strong: "8–12 g (sedativ/opioid)" }],
    evidence: [{ label: "PsychonautWiki Kratom", url: "https://psychonautwiki.org/wiki/Kratom" }],
    warnings: ["Abhängigkeitspotenzial mit echtem Opioid-Entzug", "Lebertoxizität in Fallberichten", "Mit echten Opioiden / Benzos additive Atemdepression"],
  },

  // ───── Depressiva (Erweiterung) ─────
  {
    id: "phenibut",
    name: "Phenibut",
    aliases: ["β-Phenyl-GABA"],
    category: "depressant",
    shortDescription: "GABA-B-Agonist, anxiolytisch, hohes Toleranz-/Entzugsrisiko.",
    mechanism: "GABA-B-Agonist + α2δ-Untereinheit-Modulation.",
    onset: "1–4 h",
    duration: "8–24 h",
    doses: [{ route: "oral", light: "250–500 mg", common: "500–1000 mg", strong: "1000–1500 mg", notes: "Niemals täglich – schwerer GABA-B-Entzug nach wenigen Tagen" }],
    evidence: [{ label: "PsychonautWiki Phenibut", url: "https://psychonautwiki.org/wiki/Phenibut" }],
    warnings: ["Entzug klinisch wie Benzo-Entzug (Krämpfe, Psychose) – langsam ausschleichen", "Mit Alkohol/Benzos Atemdepression"],
  },
  {
    id: "gabapentin",
    name: "Gabapentin",
    aliases: ["Neurontin"],
    category: "depressant",
    shortDescription: "Gabapentinoid, schwächer als Pregabalin, weniger missbrauchsanfällig.",
    mechanism: "α2δ-Untereinheit spannungsabhängiger Ca-Kanäle.",
    onset: "60–120 min",
    duration: "5–8 h",
    doses: [{ route: "oral", light: "200–400 mg", common: "400–900 mg", strong: "900–1800 mg" }],
    evidence: [{ label: "PsychonautWiki Gabapentin", url: "https://psychonautwiki.org/wiki/Gabapentin" }],
    warnings: ["Mit Opioiden Atemdepression dokumentiert", "Sättigbare Resorption – Wirkung nicht linear"],
  },

  // ───── Cannabinoide (Erweiterung) ─────
  {
    id: "hhc",
    name: "HHC",
    aliases: ["Hexahydrocannabinol"],
    category: "cannabinoid",
    shortDescription: "Halb-synthetisches Cannabinoid, THC-ähnlich, rechtl. Graubereich.",
    mechanism: "Partieller CB1-Agonist, schwächer als THC.",
    onset: "5–20 min (inhaliert) / 30–120 min (oral)",
    duration: "2–4 h / 4–8 h oral",
    doses: [{ route: "oral", threshold: "2 mg", light: "5–10 mg", common: "10–25 mg", strong: "25–50 mg" }],
    evidence: [{ label: "PsychonautWiki HHC", url: "https://psychonautwiki.org/wiki/HHC" }],
    warnings: ["Qualitätskontrolle in 'Legal-Highs' fehlt – oft Verunreinigungen", "Wenig Langzeitdaten"],
  },
  {
    id: "thcp",
    name: "THCP",
    aliases: ["Δ9-THCP"],
    category: "cannabinoid",
    shortDescription: "Natürliches Cannabinoid, deutlich höhere CB1-Affinität als THC.",
    mechanism: "CB1/CB2-Agonist, ~30× CB1-Affinität von THC.",
    onset: "5–20 min (inhaliert)",
    duration: "3–6 h",
    doses: [{ route: "inhaliert", threshold: "<0.5 mg", light: "0.5–2 mg", common: "2–5 mg", strong: "5–10 mg" }],
    evidence: [{ label: "Citti 2019 – Δ9-THCP Identifikation (Sci Rep)", url: "https://www.nature.com/articles/s41598-019-56785-1" }],
    warnings: ["Sehr potent – Edibles oft unterdosiert markiert", "Stärkere Angst/Tachykardie als THC"],
  },

  // ───── Stimulanzien (Erweiterung) ─────
  {
    id: "nicotine",
    name: "Nikotin",
    aliases: ["Tabak", "Vape", "Snus"],
    category: "stimulant",
    shortDescription: "Cholinerges Stimulans, höchstes legales Suchtpotenzial.",
    mechanism: "Nikotinerger Acetylcholin-Rezeptor-Agonist.",
    onset: "<1 min (inhaliert)",
    duration: "30–60 min (Peak), Craving-Zyklen 1–2 h",
    doses: [{ route: "inhaliert/oral", light: "0.5–1 mg", common: "1–2 mg", strong: "2–4 mg", notes: "LD-Bereich ab ~30–60 mg oral; Snus/Pouches ~6–20 mg pro Stück" }],
    evidence: [{ label: "WHO Tobacco", url: "https://www.who.int/health-topics/tobacco" }],
    warnings: ["Vasokonstriktion + Tachykardie addieren sich zu Stimulanzien", "Sehr schnelle Toleranz/Abhängigkeit"],
  },
  {
    id: "mdai",
    name: "MDAI",
    aliases: ["5,6-Methylendioxy-2-Aminoindan"],
    category: "empathogen",
    shortDescription: "Nicht-neurotoxisches MDMA-Analog, weniger euphorisch.",
    mechanism: "Selektiver SERT-Substrat-Releaser (geringe DA-Komponente).",
    onset: "30–90 min",
    duration: "4–6 h",
    doses: [{ route: "oral", light: "75–125 mg", common: "125–200 mg", strong: "200–300 mg" }],
    evidence: [{ label: "PsychonautWiki MDAI", url: "https://psychonautwiki.org/wiki/MDAI" }],
    warnings: ["Hyperthermie-Fälle dokumentiert trotz 'sicher' Image", "Wenig Langzeitdaten"],
  },

  // ───── Neuroleptika / weitere Medikamente ─────
  {
    id: "mirtazapine",
    name: "Mirtazapin",
    aliases: ["Remergil"],
    category: "neuroleptic",
    shortDescription: "Tetrazyklisches Antidepressivum mit starker H1-Sedierung.",
    mechanism: "α2-Antagonist + 5-HT2A/2C/3-Antagonist + H1-Blockade.",
    onset: "30–90 min",
    duration: "10–20 h",
    doses: [{ route: "oral", light: "7.5 mg (sedierend)", common: "15–30 mg", strong: "45 mg", notes: "Paradoxe Sedierung: niedrigere Dosis stärker sedierend" }],
    evidence: [{ label: "PsychonautWiki Mirtazapine", url: "https://psychonautwiki.org/wiki/Mirtazapine" }],
    warnings: ["Mit Opioiden additive Sedierung", "Antiserotonerg → kappt MDMA-Wirkung, ohne Herz-/Hitze-Last zu mindern"],
  },
];

// ───────── Interaction matrix ─────────
// Anlehnung an TripSit Combo Chart (https://combo.tripsit.me/) + EMCDDA.
export type RiskLevel = "safe" | "caution" | "unsafe" | "danger" | "synergy" | "unknown";

export interface RiskInfo {
  level: RiskLevel;
  /** Kurze Laien-Erklärung. */
  reason: string;
  /** Optional: physiologischer Mechanismus in 1–2 Sätzen (intermediate). */
  mechanism?: string;
  /** Optional: Fachebene — Rezeptoren/Enzyme/Kontraindikationen (expert). */
  expert?: string;
}

/** Formatiert das Risiko entsprechend dem Detail-Level des Users. */
export function explainRisk(
  info: RiskInfo,
  level: "lay" | "intermediate" | "expert" = "lay",
): { headline: string; detail?: string; expert?: string } {
  if (level === "lay" || (!info.mechanism && !info.expert)) {
    return { headline: info.reason };
  }
  if (level === "intermediate") {
    return { headline: info.reason, detail: info.mechanism };
  }
  return { headline: info.reason, detail: info.mechanism, expert: info.expert ?? info.mechanism };
}

const CAT = (id: string) => SUBSTANCES.find((s) => s.id === id)!.category;

function pairKey(a: string, b: string) {
  return [a, b].sort().join("|");
}

// Category-level baseline + specific overrides.
const CATEGORY_MATRIX: Record<string, RiskInfo> = {
  // depressant combos
  "depressant|depressant": {
    level: "danger",
    reason: "Verstärkte Atemdepression. Hohes Überdosisrisiko.",
    mechanism: "Zwei Dämpfer wirken auf dasselbe System (GABA/Glutamat) und addieren ihre atemhemmende Wirkung — die Atmung kann unbemerkt aussetzen.",
    expert: "Additive positive allosterische Modulation am GABA_A-Rezeptor + ggf. NMDA-Antagonismus → supralineare Suppression des prä-Bötzinger-Komplexes. LD-Schwellen sinken deutlich; klinisch häufige Ursache für hypoxische Hirnschäden.",
  },
  "alcohol|depressant": {
    level: "danger",
    reason: "GABA-Synergie – Atemstillstand möglich.",
    mechanism: "Alkohol und andere Dämpfer verstärken denselben hemmenden Botenstoff (GABA). Die Atmung wird stärker gedämpft als die Summe der Einzelwirkungen.",
    expert: "Ethanol moduliert GABA_A allosterisch und NMDA antagonistisch; in Kombination mit weiteren CNS-Depressiva entsteht synergistische Atemdepression. Aspirations- und Hypothermie-Risiko erhöht.",
  },
  "alcohol|opioid": {
    level: "danger",
    reason: "Massive Atemdepression. Häufigste tödliche Kombination.",
    mechanism: "Opioide drosseln die Atemfrequenz, Alkohol drückt zusätzlich auf das Atemzentrum. Schon übliche Mengen können tödlich sein.",
    expert: "µ-Opioid-Agonismus reduziert CO₂-Antwort der Chemorezeptoren; Ethanol senkt diese zusätzlich über GABA_A-Potenzierung. Synergie nicht additiv. Häufigste Todesursache in Opioid-Mortalitätsstatistiken (CDC, EMCDDA). Naloxon bereithalten.",
  },
  "alcohol|benzodiazepine": {
    level: "danger",
    reason: "Synergistische Sedierung, Blackouts, Atemstillstand.",
    mechanism: "Beide verstärken denselben hemmenden Rezeptor — die Wirkung multipliziert sich, statt sich nur zu addieren.",
    expert: "Ethanol + BZD beide am GABA_A; BZDs erhöhen Öffnungsfrequenz, Ethanol potenziert allosterisch. Klinisch: anterograde Amnesie, Ataxie, Atemdepression. Flumazenil reversiert nur BZD-Anteil, riskant bei Mischintox.",
  },
  "opioid|benzodiazepine": {
    level: "danger",
    reason: "Atemdepression – dokumentiert häufig tödlich.",
    mechanism: "Opioide nehmen den Atemreiz weg, Benzos schalten die Schutzreflexe ab — keine Warnsymptome vor dem Atemstillstand.",
    expert: "FDA Black Box Warning (2016): Co-Präskription erhöht OD-Mortalität ~10×. Mechanistisch µ-vermittelte CO₂-Hyporesponsivität + GABAerge Suppression supraspinaler Atemzentren. Kontraindiziert außer in palliativen Settings.",
  },
  "opioid|depressant": { level: "danger", reason: "Additive Atemdepression.", mechanism: "Doppelte Dämpfung der Atmung — Atemzentrum bekommt von zwei Seiten weniger Input." },
  "opioid|opioid": {
    level: "danger",
    reason: "Überdosisrisiko, ohne Toleranzkenntnis lebensgefährlich.",
    mechanism: "Toleranz ist substanz- und rezeptor-spezifisch — die Toleranz gegen eines schützt nicht voll gegen ein anderes.",
    expert: "Inkomplette Kreuztoleranz zwischen µ-Voll- und Partial-Agonisten (z.B. Methadon ↔ Heroin). Unterschiedliche intrinsic activity → unvorhersehbare Wirkung trotz Konvertierungstabellen. Long-acting + short-acting Mix besonders riskant.",
  },
  "benzodiazepine|depressant": { level: "danger", reason: "Atemdepression, Bewusstlosigkeit." },
  "benzodiazepine|benzodiazepine": { level: "unsafe", reason: "Additive Sedierung ohne klinischen Nutzen.", mechanism: "Mehrere Benzos zugleich erhöhen nur Risiko und Halbwertszeit, nicht den erwünschten Effekt." },

  // dissociative + depressant
  "dissociative|opioid": {
    level: "danger",
    reason: "Atemdepression, schwer einschätzbar.",
    mechanism: "Dissoziativa nehmen die Wahrnehmung für die eigene Atmung weg — du merkst nicht, dass das Opioid zu viel war.",
    expert: "NMDA-Antagonismus reduziert kortikale Wahrnehmung von Dyspnoe; µ-Agonismus suprimiert Atemantrieb. Klinisch oft Aspiration durch Ketamin-induzierten Würgereflex-Verlust + Opioid-Sedierung.",
  },
  "dissociative|benzodiazepine": { level: "unsafe", reason: "Atemdepression möglich.", mechanism: "GABAerge Sedierung + NMDA-Blockade → Bewusstsein und Atemreflexe sinken zusammen." },
  "dissociative|alcohol": { level: "unsafe", reason: "Erbrechen + Bewusstlosigkeit – Aspirationsgefahr.", mechanism: "Ketamin/PCP induzieren häufig Erbrechen, Alkohol legt Schutzreflexe lahm — Erbrochenes kann in die Lunge gelangen." },
  "dissociative|depressant": { level: "unsafe", reason: "Sedierung verstärkt." },

  // stimulant combos
  "stimulant|stimulant": {
    level: "unsafe",
    reason: "Additive kardiovaskuläre Belastung, Hyperthermie, Psychose.",
    mechanism: "Zwei Stimulanzien feuern dasselbe Stresssystem an: Herz schlägt schneller, Körpertemperatur steigt, Risiko für Panik/Psychose wächst.",
    expert: "Additive Freisetzung/Re-Uptake-Hemmung von Dopamin und Noradrenalin → sympathomimetische Krise: Tachyarrhythmien, hypertensive Spitzen, Vasokonstriktion (Koronarspasmus möglich), zentrale Hyperthermie via 5-HT2A/dopaminerge Dysregulation.",
  },
  "stimulant|cathinone": { level: "unsafe", reason: "Kardiotox-Additivität, Re-Dose-Schleifen.", mechanism: "Cathinone haben kurze Halbwertszeit → Re-Dose-Druck addiert sich zur Stim-Last." },
  "cathinone|cathinone": { level: "unsafe", reason: "Vasokonstriktion und Hyperthermie addieren sich." },
  "stimulant|empathogen": {
    level: "unsafe",
    reason: "Erhöhter Blutdruck, Hyperthermie.",
    mechanism: "MDMA wirkt schon stark auf Herz und Temperatur — ein zusätzlicher Stim verdoppelt diese Last.",
    expert: "MDMA-induzierte Serotonin-/NA-Freisetzung + zusätzliche DA/NA-Freisetzung → synergistische sympathomimetische Toxizität; CYP2D6-Hemmung durch MDMA verlangsamt zudem den Abbau einiger Stimulanzien.",
  },
  "cathinone|empathogen": { level: "unsafe", reason: "Serotonerge und kardiale Belastung addieren sich." },
  "empathogen|empathogen": {
    level: "unsafe",
    reason: "Serotonin-Last steigt – Hyperthermie/Tox.",
    mechanism: "Beide schwemmen Serotonin frei — Risiko für Serotonin-Syndrom (Zittern, Hitze, Verwirrung) steigt deutlich.",
    expert: "Additive SERT-Substrat-Wirkung → 5-HT-Flut + Erschöpfung der Vesikelspeicher. Risiko serotonerger Toxizität nach Sternbach/Hunter-Kriterien, besonders bei CYP2D6-Slow-Metabolizern.",
  },

  // stimulant + depressant masking
  "stimulant|alcohol": {
    level: "caution",
    reason: "Sedierung wird maskiert – Risiko Alkoholvergiftung.",
    mechanism: "Stims überdecken das 'Ich bin betrunken'-Gefühl. Du trinkst weiter, obwohl der Körper schon überfordert ist.",
    expert: "Sympathische Aktivierung kompensiert subjektiv die Ethanol-bedingte Sedierung, ohne BAC oder hepatische Toxizität zu beeinflussen. Nach Abklingen des Stim plötzliche Demaskierung der Intoxikation.",
  },
  "stimulant|opioid": {
    level: "unsafe",
    reason: "Speedball – nach Abklingen Stim hohe Atemdepressions-Gefahr.",
    mechanism: "Stim hält wach, Opioid drosselt Atmung. Wenn der Stim zuerst nachlässt, kippt die Balance — viele OD-Fälle so erklärbar.",
    expert: "Klassischer 'Speedball': Cocain HWZ ~30–90 min, Heroin/Fentanyl-Atemdepression hält länger an. Nach Wegfall der sympathischen Gegenregulation kommt es zur ungeschützten µ-vermittelten Apnoe. Hauptursache der Speedball-Mortalität (Belushi, Farley, Hoffman).",
  },
  "cathinone|opioid": { level: "unsafe", reason: "Speedball-Effekt, plötzliche Atemdepression möglich." },
  "stimulant|depressant": { level: "caution", reason: "Effekte maskieren sich gegenseitig." },

  // psychedelics
  "psychedelic|psychedelic": { level: "caution", reason: "Wirkung schwer vorhersagbar, intensivere Erfahrung.", mechanism: "Mehrere 5-HT2A-Agonisten gleichzeitig → unvorhersehbare Synergie, oft länger und intensiver als erwartet." },
  "psychedelic|stimulant": { level: "caution", reason: "Ängstliche/psychotische Reaktionen häufiger.", mechanism: "Stim-bedingte Übererregung + 5-HT2A-Aktivität → Schwelle für Angst/Paranoia sinkt." },
  "psychedelic|cathinone": { level: "caution", reason: "Erhöhte Angst-/Psychose-Wahrscheinlichkeit." },
  "psychedelic|empathogen": {
    level: "synergy",
    reason: "'Candy-Flip' – beliebt aber serotonerge Last erhöht.",
    mechanism: "Bekannte Kombi mit angenehmem Profil, aber MDMA + 5-HT2A-Agonist erhöht Hitze/Herz-Risiko und neurotoxisches Potenzial.",
    expert: "MDMA-getriebener 5-HT-Efflux + 5-HT2A-Postsynapse-Aktivierung → potenziell höhere 5-HT2A-Downstream-Signalisierung (PLC/IP3). In Tiermodellen Hinweise auf erhöhte 5-HT-Neurotoxizität bei Co-Administration.",
  },
  "psychedelic|dissociative": { level: "caution", reason: "Sehr unvorhersehbare Trips." },
  "psychedelic|cannabinoid": { level: "caution", reason: "Kann Trip stark verstärken / kippen lassen.", mechanism: "CB1-Aktivierung verstärkt die Wahrnehmungsveränderungen — angenehme Trips können kippen." },

  // empathogen + dissociative / opioid
  "empathogen|dissociative": { level: "caution", reason: "Stark verstärkende Effekte." },
  "empathogen|opioid": { level: "unsafe", reason: "Serotonin + Atemdepression.", mechanism: "MDMA macht wach und drückt den Blutdruck hoch — wenn das Opioid die Atmung dämpft, fällt diese Schutzwirkung weg." },
  "empathogen|alcohol": { level: "caution", reason: "Dehydrierung, Lebertoxizität.", mechanism: "MDMA + Alkohol = doppelte Belastung für Leber und Wasserhaushalt." },

  // cannabis as wildcard
  "cannabinoid|opioid": { level: "caution", reason: "Sedierung verstärkt." },
  "cannabinoid|alcohol": { level: "caution", reason: "Übelkeit, 'Greenout'." },
  "cannabinoid|dissociative": { level: "caution", reason: "Sehr intensive dissoziative Erfahrung." },
  "cannabinoid|stimulant": { level: "caution", reason: "Tachykardie, Angst." },

  // neuroleptics
  "neuroleptic|psychedelic": { level: "caution", reason: "Beendet meist den Trip – aber selbst kreislaufbelastend.", mechanism: "5-HT2A-Antagonisten kappen die psychedelische Wirkung; Antipsychotika belasten aber selbst Herz und Kreislauf." },
  "neuroleptic|stimulant": { level: "unsafe", reason: "QT-Verlängerung, kardiale Belastung.", expert: "Viele Antipsychotika (z.B. Haloperidol, Quetiapin) verlängern QTc; in Kombination mit sympathomimetischer Stim-Last → Torsade-de-pointes-Risiko." },
  "neuroleptic|cathinone": { level: "unsafe", reason: "Kardiale Belastung, antagonistische Effekte." },
  "neuroleptic|opioid": { level: "danger", reason: "Atemdepression, Hypotonie.", expert: "α1-Blockade + µ-Agonismus → schwere orthostatische Hypotonie; H1/M1-Sedierung addiert sich zur opioiden Atemdepression." },
  "neuroleptic|alcohol": { level: "danger", reason: "Atemdepression, schwere Hypotonie." },
  "neuroleptic|benzodiazepine": { level: "unsafe", reason: "Verstärkte Sedierung." },
  "neuroleptic|depressant": { level: "unsafe", reason: "Sedierung addiert sich." },
  "neuroleptic|empathogen": { level: "caution", reason: "Reduziert MDMA-Wirkung; aber Kreislaufrisiko.", expert: "5-HT2A-Blockade hebt einen Teil der MDMA-Wirkung auf, ohne periphere sympathomimetische Effekte (HF, BD, Hyperthermie) zu mindern → riskante Asymmetrie." },
  "neuroleptic|dissociative": { level: "caution", reason: "Sedierung verstärkt." },
  "neuroleptic|neuroleptic": { level: "unsafe", reason: "EPS-Risiko, QT-Verlängerung.", expert: "Additive D2-Blockade → erhöhtes EPS- und MNS-Risiko; kumulative QTc-Verlängerung." },
};

// Specific id-pair overrides where category logic is too coarse.
const SPECIFIC_OVERRIDES: Record<string, RiskInfo> = {
  [pairKey("mdma", "tramadol")]: {
    level: "danger",
    reason: "Serotonin-Syndrom-Risiko (Tramadol ist auch SNRI).",
    mechanism: "Tramadol erhöht selbst Serotonin im Gehirn. Zusammen mit MDMA wird die Schwelle für ein Serotonin-Syndrom (Hitze, Zittern, Verwirrung) leicht überschritten.",
    expert: "Tramadol = µ-Agonist + SNRI mit zusätzlicher 5-HT-Freisetzung. Kombiniert mit MDMA (SERT-Substrat) → exzessive 5-HT-Akkumulation. Tramadol senkt zudem die Krampfschwelle; CYP2D6-Hemmung durch MDMA erhöht Tramadol-Spiegel.",
  },
  [pairKey("mdma", "alcohol")]: {
    level: "caution",
    reason: "Dehydrierung + Leber- und Herzbelastung.",
    mechanism: "MDMA macht durstig und wach, Alkohol entwässert — der Körper kommt in einen Hitzestress, der oft erst spät auffällt.",
    expert: "Hepatische Belastung durch MDMA-Metaboliten (α-MeDA) + CYP2E1-Induktion durch Ethanol. Erhöhtes Hyperthermie- und Hyponatriämie-Risiko.",
  },
  [pairKey("cocaine", "alcohol")]: {
    level: "unsafe",
    reason: "Bildet Cocaethylen – hepato- und kardiotoxisch.",
    mechanism: "Im Körper entsteht ein neuer Stoff (Cocaethylen), der länger wirkt und das Herz stärker belastet als Kokain allein.",
    expert: "Hepatische Transesterifizierung via Carboxylesterase 1 → Cocaethylen. HWZ 3–4× länger als Cocain, höhere kardiale Affinität, dokumentiert ~18–25× höheres Risiko für plötzlichen Herztod vs. Cocain allein.",
  },
  [pairKey("ghb", "alcohol")]: {
    level: "danger",
    reason: "Atemdepression, Bewusstlosigkeit, Aspirationsgefahr.",
    mechanism: "GHB hat eine sehr steile Dosis-Wirkungs-Kurve. Schon wenig Alkohol verschiebt die Kurve so, dass aus 'angenehm' schnell 'bewusstlos' wird.",
    expert: "GHB-Pharmakokinetik nicht-linear (sättigbare β-Oxidation). Co-Administration mit Ethanol potenziert GABA_B-Agonismus und supprimiert Atem-Schutzreflexe. LD50 sinkt drastisch.",
  },
  [pairKey("fentanyl", "alcohol")]: {
    level: "danger",
    reason: "Extrem hohes Atemstillstand-Risiko.",
    mechanism: "Fentanyl ist 50–100× stärker als Morphin. Mit Alkohol kann schon eine kleinste Menge tödlich sein.",
    expert: "Hohe intrinsische µ-Aktivität + Ethanol-GABAerge Suppression → therapeutischer Index praktisch eliminiert. Naloxon-Dosis oft mehrfach nötig (Lipophilie, Re-Distribution).",
  },
  [pairKey("lsd", "lithium")]: {
    level: "danger",
    reason: "Krampfanfälle dokumentiert.",
    mechanism: "Lithium und LSD zusammen können einen epileptischen Anfall auslösen — auch bei Leuten, die noch nie einen hatten.",
    expert: "Mechanismus nicht final geklärt; vermutet serotonerge + glutamaterge Dysregulation und Senkung der Krampfschwelle. Multiple Case Reports mit Grand-mal trotz therapeutischer Lithium-Spiegel.",
  },
  [pairKey("dmt", "mdma")]: {
    level: "caution",
    reason: "Serotonerge Last erhöht.",
    mechanism: "Beide treiben Serotonin hoch — Risiko für Hitze und Herzbelastung steigt.",
  },

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

  // ───── Verschreibungsmittel-spezifische Risiken ─────
  // Lean / Purple Drank
  [pairKey("codeine", "promethazine")]: {
    level: "danger",
    reason: "'Lean / Purple Drank' – Atemdepression, mehrere Promi-Todesfälle dokumentiert.",
    mechanism: "Opioide Atemdepression + sedierendes Antihistaminikum + α1-Blockade — Schutzreflexe weg, Atmung gedrückt.",
    expert: "µ-Agonismus (Codein → Morphin via CYP2D6) + H1/M1/α1-Antagonismus → ungeschützte Apnoe + Aspirationsrisiko + QT-Verlängerung. Bei CYP2D6-Ultra-Rapid-Metabolizern Morphin-Spiegel unvorhersehbar hoch.",
  },
  [pairKey("codeine", "alcohol")]: { level: "danger", reason: "Opioid + Alkohol – Atemdepression.", mechanism: "Alkohol senkt zusätzlich Atemreiz; bei CYP2D6-URM kann Codein-Anteil als Morphin extrem ausfallen." },
  [pairKey("codeine", "alprazolam")]: { level: "danger", reason: "Opioid + Benzo – Atemstillstand-Risiko." },

  // Tilidin
  [pairKey("tilidin", "alcohol")]: { level: "danger", reason: "Opioid + Alkohol – Atemdepression, häufige Notaufnahme-Konstellation." },
  [pairKey("tilidin", "alprazolam")]: { level: "danger", reason: "Opioid + Benzo – Atemdepression." },
  [pairKey("tilidin", "pregabalin")]: { level: "danger", reason: "Opioid + Pregabalin verstärkt Atemdepression deutlich – MHRA/FDA Warnung." },
  [pairKey("tilidin", "heroin")]: { level: "danger", reason: "Doppel-Opioid – µ-Sättigung, OD-Risiko." },
  [pairKey("tilidin", "tramadol")]: { level: "danger", reason: "Doppel-Opioid + zusätzliche serotonerge Last durch Tramadol." },

  // Tapentadol
  [pairKey("tapentadol", "mdma")]: { level: "danger", reason: "Serotonerge Last + µ-Atemdepression.", expert: "NRI-Komponente + MDMA-induzierter Monoamin-Efflux → erhöhtes Serotonin-Syndrom-Risiko, µ-vermittelte Atemdepression bleibt bestehen." },
  [pairKey("tapentadol", "alcohol")]: { level: "danger", reason: "Opioid + Alkohol – Atemdepression." },

  // Methylphenidat
  [pairKey("methylphenidate", "mdma")]: { level: "unsafe", reason: "Additive sympathomimetische Last – Herz, Hyperthermie.", mechanism: "MPH hemmt DAT/NET, MDMA flutet Monoamine. Zusammen: deutlich erhöhter RR, HF und Körpertemperatur." },
  [pairKey("methylphenidate", "amphetamine")]: { level: "unsafe", reason: "Doppel-Stim – kardiovaskuläre Belastung, Psychose-Risiko." },
  [pairKey("methylphenidate", "cocaine")]: { level: "unsafe", reason: "Doppel-DAT-Wirkung – Vasokonstriktion + Arrhythmie-Risiko." },
  [pairKey("methylphenidate", "alcohol")]: { level: "caution", reason: "Sedierung wird maskiert – Risiko Alkoholvergiftung." },

  // Lisdexamfetamin verhält sich nach Spaltung wie Amphetamin
  [pairKey("lisdexamfetamine", "mdma")]: { level: "unsafe", reason: "Wie Amphetamin + MDMA – Hyperthermie, Herz-Last." },
  [pairKey("lisdexamfetamine", "tramadol")]: { level: "unsafe", reason: "Sympathomimetik + serotonerge Last + Krampfschwelle ↓." },

  // Modafinil – moderat
  [pairKey("modafinil", "mdma")]: { level: "caution", reason: "Verstärkt MDMA-Last leicht; CYP3A4-Induktion durch Modafinil verkürzt MDMA-Wirkung unvorhersehbar." },

  // Z-Substanzen – wie Benzos behandeln
  [pairKey("zolpidem", "alcohol")]: { level: "danger", reason: "GABA-Synergie + komplexe Schlafverhaltensweisen (Sleep-Driving)." },
  [pairKey("zolpidem", "heroin")]: { level: "danger", reason: "GABA + µ-Opioid – Atemstillstand." },
  [pairKey("zolpidem", "tilidin")]: { level: "danger", reason: "Opioid + Z-Hypnotikum – Atemdepression." },
  [pairKey("zolpidem", "alprazolam")]: { level: "danger", reason: "Z + Benzo – additive GABA-Sedierung." },
  [pairKey("zopiclone", "alcohol")]: { level: "danger", reason: "GABA-Synergie – Atemdepression, Bewusstlosigkeit." },
  [pairKey("zopiclone", "heroin")]: { level: "danger", reason: "GABA + µ-Opioid – Atemstillstand." },

  // Promethazin (sedierend, Anticholinergie, QT)
  [pairKey("promethazine", "alcohol")]: { level: "unsafe", reason: "Verstärkte Sedierung + anticholinerge Last + QT-Verlängerung." },
  [pairKey("promethazine", "heroin")]: { level: "danger", reason: "Atemdepression + α1-Blockade → Hypotonie + Aspiration." },
  [pairKey("promethazine", "tilidin")]: { level: "danger", reason: "Opioid + sedierendes Antihistaminikum – wie 'Lean'-Konstellation." },
  [pairKey("promethazine", "methylphenidate")]: { level: "unsafe", reason: "QT-Verlängerung + sympathomimetische Last – Arrhythmie-Risiko." },

  // DXM (NMDA + SRI + Sigma1)
  [pairKey("dxm", "mdma")]: { level: "danger", reason: "Serotonin-Syndrom-Risiko durch DXM-SRI + MDMA-Flut.", expert: "DXM hemmt SERT zusätzlich, Dextrorphan ist NMDA-Antagonist. Mit MDMA potenziell schwere serotonerge Toxizität + Hyperthermie." },
  [pairKey("dxm", "tramadol")]: { level: "danger", reason: "Serotonin-Syndrom + Krampfschwelle massiv gesenkt." },
  [pairKey("dxm", "alcohol")]: { level: "unsafe", reason: "Übelkeit, Bewusstlosigkeit, Aspirationsgefahr – DXM macht erbrechen." },
  [pairKey("dxm", "ketamine")]: { level: "unsafe", reason: "Doppelter NMDA-Antagonismus – sehr unvorhersehbare Dissoziation." },

  // Lorazepam – wie Alprazolam-Risiken
  [pairKey("lorazepam", "alcohol")]: { level: "danger", reason: "Benzo + Alkohol – Atemdepression, Blackouts." },
  [pairKey("lorazepam", "heroin")]: { level: "danger", reason: "Benzo + µ-Opioid – sehr häufige Todesursache." },
  [pairKey("lorazepam", "tilidin")]: { level: "danger", reason: "Opioid + Benzo – Atemstillstand-Risiko." },
  [pairKey("lorazepam", "alprazolam")]: { level: "unsafe", reason: "Doppel-Benzo – nur additive Sedierung und Abhängigkeit, kein Nutzen." },

  // ───── Neu hinzugefügte Substanzen ─────
  // MDA / Methylon / 6-APB – serotonerge Last
  [pairKey("mda", "mdma")]: { level: "unsafe", reason: "Doppelte serotonerge + dopaminerge Flut – Hyperthermie-/Neurotox-Risiko." },
  [pairKey("mda", "tramadol")]: { level: "danger", reason: "Serotonin-Syndrom-Risiko (Tramadol = SNRI)." },
  [pairKey("methylone", "mdma")]: { level: "unsafe", reason: "Additive Monoamin-Freisetzung, Schlafmangel, Herz-Last." },
  [pairKey("6-apb", "mdma")]: { level: "unsafe", reason: "Sehr lange Wirkdauer + 5-HT2B-Last – Hyperthermie, Herzklappen-Risiko." },
  [pairKey("6-apb", "tramadol")]: { level: "danger", reason: "Serotonin-Syndrom-Risiko." },

  // Salvia – atypisch, aber Sturz-/Aspirationsgefahr
  [pairKey("salvia", "alcohol")]: { level: "unsafe", reason: "Realitätsverlust + Sturz/Aspirationsgefahr." },

  // Ibogain – kardiotox, lange QT
  [pairKey("ibogaine", "mdma")]: { level: "danger", reason: "QT-Verlängerung + serotonerge Last – Torsade-de-pointes-Risiko." },
  [pairKey("ibogaine", "methadone")]: { level: "danger", reason: "Beide verlängern QT massiv – mehrere Todesfälle dokumentiert." },
  [pairKey("ibogaine", "cocaine")]: { level: "danger", reason: "Vasokonstriktion + QT-Verlängerung – Herztod-Risiko." },

  // Lachgas – B12, Hypoxie
  [pairKey("nitrous", "ketamine")]: { level: "unsafe", reason: "Doppelte NMDA-Antagonisten – Bewusstlosigkeit, Sturzgefahr." },
  [pairKey("nitrous", "alcohol")]: { level: "unsafe", reason: "Hypoxie + Aspiration – Sitter Pflicht." },

  // PCP – Aggression + Sedativa
  [pairKey("pcp", "alcohol")]: { level: "danger", reason: "Aggressivität + Sedierung – Verletzungs- und Aspirationsgefahr." },
  [pairKey("pcp", "alprazolam")]: { level: "unsafe", reason: "Doppelsedierung, Realitätsverlust + Atemdepression." },

  // Morphin / Methadon / Buprenorphin
  [pairKey("morphine", "alcohol")]: { level: "danger", reason: "Opioid + Alkohol – Atemdepression." },
  [pairKey("morphine", "alprazolam")]: { level: "danger", reason: "Opioid + Benzo – häufigste OD-Konstellation." },
  [pairKey("methadone", "alcohol")]: { level: "danger", reason: "Sehr lange Methadon-HWZ + Alkohol – Atemstillstand auch Tage nach Einnahme möglich." },
  [pairKey("methadone", "alprazolam")]: { level: "danger", reason: "Substitutions-Todesursache Nr. 1 – Benzo + Methadon." },
  [pairKey("methadone", "cocaine")]: { level: "danger", reason: "Beide verlängern QT – Torsade-de-pointes-Risiko." },
  [pairKey("buprenorphine", "heroin")]: { level: "danger", reason: "Buprenorphin verdrängt Heroin am µ-Rezeptor → präzipitierter Entzug." },
  [pairKey("buprenorphine", "methadone")]: { level: "danger", reason: "Präzipitierter Entzug – Buprenorphin verdrängt Methadon." },
  [pairKey("buprenorphine", "alprazolam")]: { level: "unsafe", reason: "Trotz Ceiling-Effekt Atemdepression mit Benzos dokumentiert." },

  // Kratom
  [pairKey("kratom", "alcohol")]: { level: "unsafe", reason: "Opioid-artige + Alkohol-Sedierung – Atemdepression möglich." },
  [pairKey("kratom", "tramadol")]: { level: "danger", reason: "Doppel-Opioid + serotonerge Last – Krampfrisiko, Serotonin-Syndrom." },
  [pairKey("kratom", "heroin")]: { level: "danger", reason: "Additive µ-Last – Atemdepression." },

  // Phenibut / Gabapentin
  [pairKey("phenibut", "alcohol")]: { level: "danger", reason: "GABA-B + GABA-A – tiefe Sedierung, Atemdepression." },
  [pairKey("phenibut", "alprazolam")]: { level: "danger", reason: "GABA-B + Benzo – Bewusstlosigkeit, Atemstillstand." },
  [pairKey("phenibut", "heroin")]: { level: "danger", reason: "Atemdepression – mehrere Todesfälle dokumentiert." },
  [pairKey("gabapentin", "heroin")]: { level: "danger", reason: "Opioid + Gabapentinoid – Atemdepression (MHRA-Warnung)." },
  [pairKey("gabapentin", "alcohol")]: { level: "unsafe", reason: "Verstärkte Sedierung, Ataxie." },

  // Nikotin – kardiale Last
  [pairKey("nicotine", "cocaine")]: { level: "caution", reason: "Doppelte Vasokonstriktion – Koronarspasmus-Risiko." },

  // HHC / THCP – wie THC behandeln, aber THCP deutlich potenter
  [pairKey("thcp", "alcohol")]: { level: "caution", reason: "Sehr potent – Greenout-Risiko." },

  // Mirtazapin – kappt MDMA / serotonerge Wechselwirkung
  [pairKey("mirtazapine", "mdma")]: { level: "unsafe", reason: "Reduziert MDMA-Wirkung subjektiv, Hitze/Herz-Last bleibt – riskante Asymmetrie." },
  [pairKey("mirtazapine", "tramadol")]: { level: "unsafe", reason: "Serotonerge Last + Krampfschwelle ↓." },

  // Nitazene-Erweiterungen
  [pairKey("isotonitazene", "alprazolam")]: { level: "danger", reason: "Nitazen + Benzo – Atemstillstand-Risiko, in Strassen-Proben dokumentiert." },
  [pairKey("metonitazene", "alprazolam")]: { level: "danger", reason: "Nitazen + Benzo – Atemstillstand-Risiko." },
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

export interface HarmReductionChecklist {
  /** Kurzes Intent-Statement für diese Risiko-Kategorie. */
  intent: string;
  /** Wartezeiten / Re-Dosing-Regeln. */
  waiting: string[];
  /** Klare Abbruchkriterien — wenn X passiert, sofort stoppen. */
  abort: string[];
  /** Beobachtbare Warnzeichen am Körper / Bewusstsein. */
  warningSigns: string[];
  /** Sofortige Handlungen, die jeder umsetzen kann. */
  actions: string[];
}

export const HARM_REDUCTION: Record<RiskLevel, HarmReductionChecklist> = {
  danger: {
    intent: "Diese Kombination kann tödlich enden. Plan ist: nicht kombinieren — und falls schon konsumiert, sofortige Schutzmaßnahmen.",
    waiting: [
      "Nicht nachlegen. Kein Re-Dose, egal wie 'wenig' angekommen scheint.",
      "Mindestens 24 h Abstand zwischen den Substanzen, bei Opioiden/Benzos eher 48–72 h.",
      "Niemals allein konsumieren — Sitter mit Handy in Sichtweite, Türe entriegelt.",
    ],
    abort: [
      "Atemfrequenz < 10/min, blaue Lippen oder Fingerspitzen → sofort 112.",
      "Person nicht erweckbar auf lautes Ansprechen oder Schmerzreiz → 112.",
      "Krampfanfall, anhaltendes Erbrechen im Liegen, Brustschmerz → 112.",
      "Bei Opioid-Beteiligung: Naloxon-Nasenspray geben, auch wenn nur Verdacht.",
    ],
    warningSigns: [
      "Schnarchendes, gurgelndes Atmen ('Death Rattle').",
      "Kalte, klamme Haut, Pupillen stecknadelgroß (Opioide) oder weit (Stimulanzien/Serotonin).",
      "Verwirrtheit, Sturz, Bewusstsein flackert weg.",
      "Puls < 50 oder > 140 in Ruhe, Körpertemperatur > 39 °C.",
    ],
    actions: [
      "112 rufen — ehrlich sagen was konsumiert wurde, kein Strafverfolgungs-Risiko für Helfer (§ 323c StGB).",
      "Stabile Seitenlage, Atemwege frei, Person warmhalten.",
      "Naloxon bereitstellen falls Opioid im Spiel — alle 2–3 min nachgeben bis Atmung stabil.",
      "Bei Krampfanfall: Umgebung sichern, nichts in den Mund, Zeit stoppen.",
    ],
  },
  unsafe: {
    intent: "Hohes Risiko. Wenn überhaupt, dann konservativ dosieren, langes Zeitfenster, Sitter Pflicht.",
    waiting: [
      "Wenigstens 6–12 h Abstand zur zweiten Substanz, je nach Halbwertszeit länger.",
      "Erst-Dosis halbieren, mindestens 90 min warten, bevor irgendetwas dazukommt.",
      "Kein Alkohol als 'Beruhiger' dazwischen — addiert sich verdeckt.",
    ],
    abort: [
      "Atmung wird langsam/flach oder Person wirkt zunehmend desorientiert → keine weitere Dosis, Notruf-Bereitschaft.",
      "Herzrasen > 140 in Ruhe oder Engegefühl in der Brust → stoppen, hinlegen, 112 erwägen.",
      "Starke Übelkeit + Schwindel + Schwitzen gleichzeitig (Schock-Trias) → 112.",
    ],
    warningSigns: [
      "Zittern, Zuckungen, Muskelsteifigkeit (Serotonin-Syndrom-Frühzeichen).",
      "Plötzliche Stimmungs-Umschwünge, Panik, Derealisation.",
      "Übermäßiges Schwitzen oder im Gegenteil komplett trockene Haut bei Hitze.",
    ],
    actions: [
      "Wasser in kleinen Schlucken (max. 500 ml/h), kein Sturztrinken.",
      "Sitter informiert lassen welche Substanz, welche Dosis, welche Uhrzeit.",
      "Ruhe, gedämpftes Licht, frische Luft. Reize reduzieren.",
      "Naloxon / Benzo-Notfallplan griffbereit, je nach Substanzklasse.",
    ],
  },
  caution: {
    intent: "Erhöhte Aufmerksamkeit nötig. Mit Plan, niedriger Dosis und Pausen handhabbar.",
    waiting: [
      "Mindestens 2 h zwischen Substanzen, Effekt der ersten muss voll bewertet sein.",
      "Re-Dose frühestens nach 2× Peak-Zeit der ersten Substanz und nur ≤ 50 % der Initialdosis.",
      "Bei MDMA / Stimulanzien: 6+ Wochen Mindestabstand zur letzten Session bleibt davon unberührt.",
    ],
    abort: [
      "Wenn nach 30 min unerwartet starke Effekte → keine weitere Substanz.",
      "Schlafmangel, leerer Magen, Fieber, Infekt → Session abbrechen oder verschieben.",
      "Bei aufkommender Panik, die nicht durch Atmen/Set-Change kippt → stoppen.",
    ],
    warningSigns: [
      "Pulsdruck-Anstieg, Pochen im Kopf, leichte Übelkeit.",
      "Konzentration kippt, Worte verlieren, Tunnelblick.",
      "Hände/Füße werden kalt — Vasokonstriktion.",
    ],
    actions: [
      "Set & Setting prüfen: vertraute Umgebung, keine Termine, Sitter erreichbar.",
      "Boxenatmung (4-4-4-4) bei Anspannung, Elektrolyte bereitstellen.",
      "Notiz machen: Substanz, Dosis, Uhrzeit — fürs Log und für Helfer.",
    ],
  },
  synergy: {
    intent: "Synergie ≠ harmlos. Wirkung wird stärker als die Summe — Dosis runter, Achtsamkeit hoch.",
    waiting: [
      "Beide Substanzen je um 25–50 % reduzieren gegenüber Solo-Dosis.",
      "Versetzt einnehmen: zweite Substanz erst, wenn erste klar einsortiert ist (mind. 45–90 min).",
      "Re-Dose nur an einer der beiden Substanzen, nicht an beiden.",
    ],
    abort: [
      "Wenn die Kombi überraschend intensiv wird → kein Nachlegen, Trip aussitzen.",
      "Anhaltende Dysphorie statt Empathogenie → Session beenden, Sitter dazu.",
    ],
    warningSigns: [
      "Plötzliche Überforderung, Wahrnehmung kippt zu schnell.",
      "Stark beschleunigter Puls trotz ruhigem Setting.",
      "Kiefer-Pressen, Bruxismus deutlich stärker als bei Solo-Dosis.",
    ],
    actions: [
      "Magnesium / Kaugummi gegen Bruxismus, Wasser portionsweise.",
      "Wechsel ins ruhige Setting, Augenbinde, vertraute Musik.",
      "Integration: nach Ende kurze Notiz — Dosis, Wirkung, was tat gut, was nicht.",
    ],
  },
  unknown: {
    intent: "Datenlage dünn. Behandle die Kombi wie potenziell unsicher, bis du es besser weißt.",
    waiting: [
      "Allergologisches Prinzip: 1/4 der üblichen Dosis als Test-Dosis, 2 h warten.",
      "Mindestens 24 h Abstand bis zur zweiten Substanz.",
    ],
    abort: [
      "Jedes ungewöhnliche Symptom (Hautausschlag, Sehstörung, abnorme Müdigkeit) → stoppen.",
      "Bei Unklarheit Giftnotruf (Berlin: 030 19240, Wien: 01 406 43 43) — anonym.",
    ],
    warningSigns: [
      "Effekte, die nicht zu den dokumentierten Solo-Wirkungen passen.",
      "Verzögerter Wirkungseintritt > 2× Erwartung (Hinweis auf Verunreinigung).",
    ],
    actions: [
      "Reagenzien-Test (Marquis/Mecke/Mandelin) vor dem Konsum.",
      "Drug-Checking-Stelle nutzen, falls verfügbar (z. B. Schweiz, Österreich, NL).",
      "Sitter informieren, dass die Kombi 'unbekannt' ist — niedrige Eingreif-Schwelle.",
    ],
  },
  safe: {
    intent: "Nach aktueller Datenlage unproblematisch — Grundregeln gelten trotzdem.",
    waiting: [
      "Re-Dosing wie bei Solo-Konsum, nicht häufiger.",
      "Pausentage zwischen Sessions einhalten (Toleranz/Neuroprotektion).",
    ],
    abort: [
      "Wenn Wirkung untypisch stark/lang → trotzdem stoppen und beobachten.",
      "Bei körperlicher Vorerkrankung (Herz, Leber, Epilepsie) eigenständige Risiko-Abwägung.",
    ],
    warningSigns: [
      "Untypische Symptome ernst nehmen — 'safe' heißt statistisch, nicht garantiert.",
    ],
    actions: [
      "Hydration, Schlaf, Ernährung wie immer mitdenken.",
      "Log führen — auch sichere Kombis dokumentieren, baut persönliche Erfahrungsbasis.",
    ],
  },
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

export type SuperCategory =
  | "hallucinogen"
  | "stimulant_group"
  | "depressant_group"
  | "opioid_group"
  | "empathogen_group"
  | "cannabinoid_group"
  | "other_group";

export const SUPER_CATEGORY_LABEL: Record<SuperCategory, string> = {
  hallucinogen: "Halluzinogene",
  stimulant_group: "Stimulanzien",
  depressant_group: "Depressiva",
  opioid_group: "Opioide",
  empathogen_group: "Empathogene",
  cannabinoid_group: "Cannabinoide",
  other_group: "Andere",
};

export const CATEGORY_TO_SUPER: Record<SubstanceCategory, SuperCategory> = {
  psychedelic: "hallucinogen",
  dissociative: "hallucinogen",
  stimulant: "stimulant_group",
  cathinone: "stimulant_group",
  depressant: "depressant_group",
  benzodiazepine: "depressant_group",
  alcohol: "depressant_group",
  neuroleptic: "depressant_group",
  opioid: "opioid_group",
  empathogen: "empathogen_group",
  cannabinoid: "cannabinoid_group",
  other: "other_group",
};

export const SUPER_CATEGORY_ORDER: SuperCategory[] = [
  "hallucinogen",
  "empathogen_group",
  "stimulant_group",
  "depressant_group",
  "opioid_group",
  "cannabinoid_group",
  "other_group",
];
