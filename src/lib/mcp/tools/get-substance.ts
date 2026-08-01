import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CATEGORY_LABEL, SUBSTANCES } from "@/lib/substances";

export default defineTool({
  name: "get_substance",
  title: "Substanz-Details",
  description:
    "Liefert das vollständige Harm-Reduction-Profil einer Substanz: Wirkmechanismus, Wirkdauer, Dosisbereiche pro Konsumform, Warnhinweise und Quellen.",
  inputSchema: {
    id: z
      .string()
      .trim()
      .min(1)
      .describe("Substanz-ID, Name oder Slang, z. B. 'mdma', 'Ketamin', 'Molly'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id }) => {
    const q = id.toLowerCase();
    const s =
      SUBSTANCES.find((x) => x.id.toLowerCase() === q || x.name.toLowerCase() === q) ??
      SUBSTANCES.find((x) => x.aliases.some((a) => a.toLowerCase() === q)) ??
      SUBSTANCES.find((x) => x.name.toLowerCase().includes(q));

    if (!s) throw new ToolError(`Keine Substanz gefunden für "${id}".`);

    const doses = s.doses
      .map((d) =>
        [
          `- ${d.route}`,
          d.threshold ? `Schwelle ${d.threshold}` : null,
          d.light ? `leicht ${d.light}` : null,
          d.common ? `üblich ${d.common}` : null,
          d.strong ? `stark ${d.strong}` : null,
          d.heavy ? `sehr stark ${d.heavy}` : null,
          d.notes ?? null,
        ]
          .filter(Boolean)
          .join(" | "),
      )
      .join("\n");

    const text = [
      `${s.name} (${CATEGORY_LABEL[s.category] ?? s.category})`,
      s.aliases.length ? `Auch bekannt als: ${s.aliases.join(", ")}` : null,
      s.shortDescription,
      `Wirkmechanismus: ${s.mechanism}`,
      `Wirkeintritt: ${s.onset} — Dauer: ${s.duration}`,
      s.afterEffects ? `Nachwirkungen: ${s.afterEffects}` : null,
      doses ? `Dosisbereiche (Orientierung, keine Empfehlung):\n${doses}` : null,
      s.warnings.length ? `Warnungen:\n${s.warnings.map((w) => `- ${w}`).join("\n")}` : null,
      s.evidence.length
        ? `Quellen: ${s.evidence.map((e) => `${e.label} (${e.url})`).join(", ")}`
        : null,
      "Hinweis: Angaben sind Orientierungswerte aus Harm-Reduction-Quellen, keine Dosierungsempfehlung. Reinheit, Toleranz, Gewicht und Mischkonsum verändern das Risiko.",
    ]
      .filter(Boolean)
      .join("\n\n");

    return {
      content: [{ type: "text" as const, text }],
      structuredContent: { substance: s },
    };
  },
});
