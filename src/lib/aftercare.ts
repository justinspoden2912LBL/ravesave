/**
 * Aftercare / Comedown-Tipps. Allgemein + pro Substanz spezifisch.
 */

export interface AftercareTopic {
  title: string;
  body: string;
}

export const GENERAL_AFTERCARE: AftercareTopic[] = [
  {
    title: "Schlaf zuerst",
    body: "Auch wenn dein Kopf noch dreht: dunkler Raum, Augenmaske, Ohrstöpsel. Wenn nicht möglich, nimm dir Ruhetage am Stück. Schlaf ist mit Abstand der wichtigste Erholungsfaktor.",
  },
  {
    title: "Wasser + Elektrolyte",
    body: "Trinke verteilt über den Tag, nicht in einem Schwung. Magnesium, Natrium, Kalium aus normaler Nahrung oder einer Elektrolyt-Lösung — keine Sport-Liter, sonst kippt der Salzhaushalt.",
  },
  {
    title: "Echtes Essen",
    body: "Eier, Haferflocken, Banane, Avocado, Lachs, Hülsenfrüchte. Tryptophan + B-Vitamine + Omega-3 sind nützlich. Kein Energy-Drink-Frühstück.",
  },
  {
    title: "Tuesday Blues sind normal",
    body: "Stimmungstief 1–3 Tage nach MDMA / Stimulanzien ist neurochemisch erwartbar. Plan keine schweren Gespräche oder Entscheidungen. Sonne, Bewegung, Tageslicht helfen messbar.",
  },
  {
    title: "Bewegung — leicht",
    body: "Spazierengehen, Yoga, Stretching. Kein hartes Training in den ersten 48 h, vor allem nicht nach Stimulanzien (Herz-Belastung).",
  },
  {
    title: "Wann zur Ärzt:in",
    body: "Brustschmerz, anhaltend hoher Puls (>100 in Ruhe nach 24 h), Verwirrtheit, Atemnot, dunkler Urin, anhaltende Suizidgedanken — bitte abklären lassen. Du musst niemand das Gegenteil erzählen, ehrlich gesagt rettet das Zeit.",
  },
  {
    title: "Supplements — nüchtern betrachtet",
    body: "Es gibt keine Studie, die Magnesium+ALA+EGCG (\"Rolling Rolls\") als Schutz vor MDMA-Neurotoxizität klinisch nachweist — die Evidenz ist Tierversuch + Anekdote. Magnesium 200–400 mg vor/während kann gegen Kieferpressen helfen. 5-HTP frühestens 12–24 h nach MDMA und nicht zusammen mit MAOI.",
  },
];

export const SUBSTANCE_AFTERCARE: Record<string, AftercareTopic[]> = {
  mdma: [
    {
      title: "Serotonin auffüllen",
      body: "5-HTP (50–100 mg) frühestens am Tag danach, am besten mit EGCG aus grünem Tee. Zwischen 24 h und 7 Tagen. Niemals zusammen mit MAOI/SSRI.",
    },
    {
      title: "Kiefer & Muskeln",
      body: "Magnesium hilft gegen Kieferpressen — auch noch am Folgetag wenn alles schmerzt. Warmes Bad, sanftes Stretching.",
    },
    {
      title: "Stimmung Tag 2–4",
      body: "Tuesday Blues halten 2–4 Tage. Tageslicht ≥30 min, früh ins Bett, nichts Dramatisches entscheiden.",
    },
  ],
  amphetamine: [
    {
      title: "Schlaf erzwingen",
      body: "Speed-Schlafmangel ist der Hauptschaden. Kein zweiter Tag ohne Schlaf. Falls nötig: Magnesium, Baldrian, Banane — keine Benzos außer ärztlich verordnet.",
    },
    {
      title: "Herz-Check",
      body: "Pulsruhe-Wert ≥100 oder Herzstolpern auch nach 12 h → Ärzt:in. Kein Kaffee bis du wieder normal schläfst.",
    },
  ],
  cocaine: [
    {
      title: "Craving-Falle",
      body: "Der Wunsch nach 'noch eine' am Folgetag ist der gefährlichste Moment. Plan vorher: was machst du Sonntag morgen? Sport, Frühstück mit jemandem, Stadt verlassen.",
    },
    {
      title: "Nase pflegen",
      body: "Salzwasser-Spray (Emser/Mar Plus), kein hartes Schnäuzen. Bei Blutung 24 h Pause vom nasalen Konsum — sonst Schleimhautschäden, im Extrem Septumperforation.",
    },
  ],
  ketamine: [
    {
      title: "Blase schonen",
      body: "Viel Wasser über die Folgetage. Ketamin-Blase kommt schleichend — Schmerzen beim Pinkeln oder Blut sind ein Stoppsignal, sofort längere Pause + Urolog:in.",
    },
  ],
  ghb: [
    {
      title: "Entzugsanzeichen ernst nehmen",
      body: "Zittern, Schwitzen, Schlaflosigkeit, Herzrasen mehrere Stunden nach letzter Dosis können Entzug sein — gefährlich, ärztliche Hilfe holen.",
    },
  ],
  lsd: [
    {
      title: "Integrations-Tag",
      body: "Tag danach in Ruhe, schreiben hilft (Notizbuch oder Sprachmemo). Was war, was bleibt? Keine wichtigen Lebensentscheidungen in den ersten 48 h.",
    },
  ],
  psilocybin: [
    {
      title: "Integration > Dosis",
      body: "Was bleibt vom Trip ist Übungssache. Schreib auf, sprich mit jemandem den du magst, beweg dich draußen.",
    },
  ],
  alcohol: [
    {
      title: "Klassische Hangover-Hilfe",
      body: "Wasser + Salz + Brot. Kein Konter-Alk. Ibuprofen wenn Magen okay; Paracetamol meiden (Leber).",
    },
  ],
  cannabis: [
    {
      title: "Kater-Symptome",
      body: "Trockenheit, Brain-Fog, Antrieb niedrig — Wasser, Sport, kurz raus. Mehr als 1–2 Ruhetage selten nötig.",
    },
  ],
};

export function getAftercare(substanceId: string): AftercareTopic[] {
  return SUBSTANCE_AFTERCARE[substanceId] || [];
}
