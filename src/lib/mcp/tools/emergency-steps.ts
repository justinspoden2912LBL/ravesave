import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const SCENARIOS = {
  unconscious: {
    title: "Person reagiert nicht / ist bewusstlos",
    steps: [
      "Laut ansprechen, an der Schulter rütteln. Keine Reaktion? Sofort 112 rufen (Handy laut stellen).",
      "Atmung prüfen: Kopf leicht überstrecken, 10 Sekunden auf Brustkorb und Atemgeräusche achten.",
      "Atmet die Person: stabile Seitenlage, Mund nach unten, Kopf überstreckt, bis Hilfe da ist.",
      "Atmet sie nicht oder nur schnappend: sofort Herzdruckmassage, 100–120/min, Mitte des Brustkorbs, bis der Rettungsdienst übernimmt.",
      "Bei Opioid-Verdacht (Fentanyl, Nitazene, Heroin, Atemfrequenz unter 10/min, blaue Lippen, stecknadelkleine Pupillen): Naloxon-Nasenspray geben, nach 2–3 Minuten wiederholen, wenn keine Besserung.",
      "Dem Rettungsdienst ehrlich sagen, was konsumiert wurde — das ist entscheidend für die Behandlung und bringt niemanden ins Gefängnis.",
    ],
  },
  overheating: {
    title: "Überhitzung / Hyperthermie",
    steps: [
      "Sofort raus aus Hitze und Menge, an einen kühlen, ruhigen Ort.",
      "Überflüssige Kleidung ausziehen, Nacken, Achseln und Leisten mit kühlem (nicht eiskaltem) Wasser kühlen.",
      "Kleine Schlucke Wasser, nicht literweise auf einmal — bei MDMA droht sonst Wasservergiftung (Hyponatriämie).",
      "Warnzeichen für 112: über 39 °C, Verwirrtheit, Krampf, Muskelsteifheit, kein Schwitzen mehr, dunkler Urin.",
    ],
  },
  panic: {
    title: "Panik / schwerer Trip / Angst",
    steps: [
      "Reizarme Umgebung: weniger Licht, weniger Ton, weniger Menschen.",
      "Talkdown: ruhige Stimme, kurze Sätze, erinnern, dass es die Substanz ist und wieder vergeht.",
      "Atmung führen: 4 Sekunden ein, 6 Sekunden aus, gemeinsam mitzählen.",
      "Erden: Füße spüren, kaltes Wasser an den Händen, fünf Dinge benennen, die sichtbar sind.",
      "Nicht allein lassen, nicht festhalten, nicht diskutieren. Kein Nachlegen.",
      "112 bei Krampf, Brustschmerz, Bewusstseinstrübung, Selbst- oder Fremdgefährdung.",
    ],
  },
  chest_pain: {
    title: "Brustschmerz / Herzrasen",
    steps: [
      "Sofort aufhören, hinsetzen oder halb sitzend lagern, nichts mehr konsumieren.",
      "112 rufen — Brustschmerz nach Stimulanzien wird immer als Notfall behandelt.",
      "Ruhig atmen lassen, Kleidung öffnen, kühlen, nicht laufen lassen.",
      "Bewusstlosigkeit oder Atemstillstand: Herzdruckmassage starten.",
    ],
  },
  ghb: {
    title: "GHB/GBL-Überdosis (auch mit Alkohol)",
    steps: [
      "Niemals 'ausschlafen lassen' — der Übergang von Schlaf zu Atemstillstand ist fließend.",
      "Bewusstlos: 112 rufen, stabile Seitenlage, Atmung dauerhaft beobachten.",
      "Sitter bleibt daneben, weckt alle paar Minuten und prüft die Atemfrequenz.",
      "Kein weiteres GHB, kein Alkohol, keine Benzos.",
    ],
  },
} as const;

export default defineTool({
  name: "emergency_steps",
  title: "Notfall-Schritte",
  description:
    "Liefert die Erste-Hilfe-Schritte aus dem Rave-Safe-Notfallbereich für typische Notlagen (Bewusstlosigkeit, Überhitzung, Panik, Brustschmerz, GHB). Ersetzt keinen Notruf.",
  inputSchema: {
    scenario: z
      .enum(["unconscious", "overheating", "panic", "chest_pain", "ghb"])
      .describe("Notfallszenario."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ scenario }) => {
    const s = SCENARIOS[scenario];
    const text = [
      `NOTFALL: ${s.title}`,
      "Im Zweifel immer zuerst 112 (EU-weit) rufen.",
      ...s.steps.map((step, i) => `${i + 1}. ${step}`),
      "Diese Schritte ersetzen keine medizinische Hilfe.",
    ].join("\n");

    return {
      content: [{ type: "text" as const, text }],
      structuredContent: { scenario, title: s.title, steps: s.steps, emergencyNumber: "112" },
    };
  },
});
