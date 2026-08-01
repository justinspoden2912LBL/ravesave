import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  HARM_REDUCTION,
  RISK_META,
  SUBSTANCES,
  assessPair,
  overallRisk,
} from "@/lib/substances";

function resolve(input: string) {
  const q = input.trim().toLowerCase();
  return (
    SUBSTANCES.find((x) => x.id.toLowerCase() === q || x.name.toLowerCase() === q) ??
    SUBSTANCES.find((x) => x.aliases.some((a) => a.toLowerCase() === q)) ??
    SUBSTANCES.find((x) => x.name.toLowerCase().includes(q))
  );
}

export default defineTool({
  name: "check_mix",
  title: "Mischkonsum prüfen",
  description:
    "Bewertet die Kombination von zwei oder mehr Substanzen mit der Rave-Safe-Ampel (sicher bis lebensgefährlich), inklusive Mechanismus und Harm-Reduction-Checkliste.",
  inputSchema: {
    substances: z
      .array(z.string().trim().min(1))
      .describe("Zwei oder mehr Substanznamen, IDs oder Slangbegriffe, z. B. ['mdma','alkohol']."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ substances }) => {
    if (substances.length < 2) throw new ToolError("Bitte mindestens zwei Substanzen angeben.");

    const resolved = substances.map((raw) => {
      const s = resolve(raw);
      if (!s) throw new ToolError(`Unbekannte Substanz: "${raw}".`);
      return s;
    });

    const ids = resolved.map((s) => s.id);
    const overall = overallRisk(ids);
    const meta = RISK_META[overall.level];
    const checklist = HARM_REDUCTION[overall.level];

    const pairs: Array<{ a: string; b: string; level: string; reason: string; mechanism?: string }> = [];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const info = assessPair(ids[i], ids[j]);
        pairs.push({
          a: resolved[i].name,
          b: resolved[j].name,
          level: info.level,
          reason: info.reason,
          ...(info.mechanism ? { mechanism: info.mechanism } : {}),
        });
      }
    }

    const text = [
      `Gesamt-Ampel: ${meta.label.toUpperCase()} — ${overall.reason}`,
      overall.mechanism ? `Mechanismus: ${overall.mechanism}` : null,
      "Paarweise:",
      pairs
        .map(
          (p) =>
            `- ${p.a} + ${p.b}: ${RISK_META[p.level as keyof typeof RISK_META].label} — ${p.reason}`,
        )
        .join("\n"),
      checklist ? `Ziel: ${checklist.intent}` : null,
      checklist?.abort.length ? `Abbruchkriterien:\n${checklist.abort.map((x) => `- ${x}`).join("\n")}` : null,
      checklist?.warningSigns.length
        ? `Warnzeichen:\n${checklist.warningSigns.map((x) => `- ${x}`).join("\n")}`
        : null,
      checklist?.actions.length ? `Sofort umsetzbar:\n${checklist.actions.map((x) => `- ${x}`).join("\n")}` : null,
      "Bei Atemnot, Bewusstlosigkeit, Krampf oder Brustschmerz: sofort 112 rufen.",
    ]
      .filter(Boolean)
      .join("\n\n");

    return {
      content: [{ type: "text" as const, text }],
      structuredContent: {
        overall: { level: overall.level, label: meta.label, reason: overall.reason },
        pairs,
        checklist,
      },
    };
  },
});
