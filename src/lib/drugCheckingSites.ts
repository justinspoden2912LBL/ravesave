/**
 * Kuratierte Drug-Checking-Anlaufstellen DE/AT/CH.
 * Stand 2025 — Öffnungszeiten / Adressen ändern sich; immer auf der
 * verlinkten Webseite verifizieren bevor du hingehst.
 */

export type Country = "DE" | "AT" | "CH" | "EU";

export interface DrugCheckSite {
  id: string;
  name: string;
  city: string;
  country: Country;
  type: "stationär" | "mobil" | "anonym-versand" | "festival";
  hours?: string;
  address?: string;
  url: string;
  description: string;
  free: boolean;
  /** Gibt Ergebnisse online zurück */
  remoteResults?: boolean;
}

export const DRUG_CHECK_SITES: DrugCheckSite[] = [
  // ─── Deutschland ─────────────────────────────────────────
  {
    id: "drugchecking-berlin",
    name: "drugchecking.berlin (Modellprojekt)",
    city: "Berlin",
    country: "DE",
    type: "stationär",
    hours: "Termine über Webseite",
    url: "https://drugchecking.berlin/",
    description: "Erstes legales Drug-Checking Deutschlands. Gratis, anonym, mit psychosozialem Beratungsgespräch. Erweitertes Spektrum (HPLC).",
    free: true,
    remoteResults: true,
  },
  {
    id: "saferparty-saarbruecken",
    name: "drogenhilfe.de Saar — Drugchecking-Konsultation",
    city: "Saarbrücken",
    country: "DE",
    type: "stationär",
    url: "https://www.drogenhilfe.de/",
    description: "Beratung & Reagenztests; Probenanalyse über Kooperationen. Niederschwellig.",
    free: true,
  },
  {
    id: "evenrave",
    name: "Eve & Rave — Berlin/Münster",
    city: "Berlin/Münster",
    country: "DE",
    type: "mobil",
    url: "https://eve-rave.net/",
    description: "Drug-Checking-Trupps auf Partys & Festivals (mit DJ-Crews). Beratung, Reagenztests, Safer-Use-Material. Eigene Drug-Test-App.",
    free: true,
  },
  {
    id: "alice-frankfurt",
    name: "Alice-Project Frankfurt",
    city: "Frankfurt",
    country: "DE",
    type: "festival",
    url: "https://alice-project.de/",
    description: "Festival-Outreach mit Beratung, Awareness und Reagenz-Tests. Jährlich auf großen DE-Festivals.",
    free: true,
  },
  // ─── Österreich ──────────────────────────────────────────
  {
    id: "checkit-wien",
    name: "checkit! Wien (Suchthilfe Wien)",
    city: "Wien",
    country: "AT",
    type: "stationär",
    hours: "Mo–Fr 14–19 Uhr (Termin)",
    address: "Gumpendorfer Straße 8, 1060 Wien",
    url: "https://checkyourdrugs.at/",
    description: "Gratis-Substanzanalyse (HPLC-DAD, GC-MS), Beratung, Warnungen. Auch mobil auf Festivals (Frequency, Snowbombing, Donauinselfest).",
    free: true,
    remoteResults: true,
  },
  {
    id: "checkit-mobil",
    name: "checkit! Mobil (Festivals AT)",
    city: "Österreichweit",
    country: "AT",
    type: "festival",
    url: "https://checkyourdrugs.at/aktuelles/festival/",
    description: "Mobile Tests auf Festivals — direkt vor Ort Ergebnis innerhalb von ~30 Min.",
    free: true,
  },
  // ─── Schweiz ─────────────────────────────────────────────
  {
    id: "saferparty-zh",
    name: "Saferparty / DIBS Zürich",
    city: "Zürich",
    country: "CH",
    type: "stationär",
    hours: "Di + Do 16–19 Uhr (Termin online)",
    address: "Konradstrasse 32, 8005 Zürich",
    url: "https://saferparty.ch/",
    description: "Gratis-Drug-Checking (Stadt Zürich). Substanzliste, Warnungen, Pillenanalyse. Mobil auch in Clubs (Hive, Zukunft).",
    free: true,
    remoteResults: true,
  },
  {
    id: "drogeninfo-be",
    name: "DIB / Contact — Bern",
    city: "Bern",
    country: "CH",
    type: "stationär",
    url: "https://www.contactmail.ch/dib/",
    description: "Drogeninformation Bern. Substanzanalyse, Beratung, Mobile Tests an Veranstaltungen.",
    free: true,
    remoteResults: true,
  },
  {
    id: "nuit-blanche-bs",
    name: "Nuit Blanche / DROP-IN — Basel",
    city: "Basel",
    country: "CH",
    type: "stationär",
    url: "https://www.nuit-blanche-help.ch/",
    description: "Basler Drug-Checking-Stelle. Anonyme Analysen + Safer-Use-Beratung.",
    free: true,
  },
  {
    id: "raveitsafe-ge",
    name: "Rave it Safe — Genf",
    city: "Genf",
    country: "CH",
    type: "mobil",
    url: "https://nuit-blanche-help.ch/rave-it-safe-geneve/",
    description: "Drug-Checking & Awareness in Genfer Clubs (Audio Club, Le Zoo).",
    free: true,
  },
  // ─── International / Versand ─────────────────────────────
  {
    id: "energy-control",
    name: "Energy Control International (Versand)",
    city: "Spanien (weltweit Versand)",
    country: "EU",
    type: "anonym-versand",
    url: "https://energycontrol-international.org/drug-testing-service/",
    description: "Anonymer Versand-Service: Probe per Brief schicken, Ergebnis online (ca. 100 €, dauert ~3 Wochen). Quantitative GC-MS-Analyse.",
    free: false,
    remoteResults: true,
  },
];

export const COUNTRY_LABEL: Record<Country, string> = {
  DE: "Deutschland",
  AT: "Österreich",
  CH: "Schweiz",
  EU: "Europa / Versand",
};

export const SITE_TYPE_LABEL: Record<DrugCheckSite["type"], string> = {
  stationär: "Stationär",
  mobil: "Mobil",
  "anonym-versand": "Anonym per Versand",
  festival: "Festival-Outreach",
};
