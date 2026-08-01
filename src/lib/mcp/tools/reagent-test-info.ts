import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { REAGENT_DATA, REAGENT_INTRO, REAGENT_LABEL, getReagents } from "@/lib/reagents";

export default defineTool({
  name: "reagent_test_info",
  title: "Reagenztest-Reaktionen",
  description:
    "Zeigt die erwarteten Farbreaktionen von Reagenztests (Marquis, Mecke, Mandelin, Simon's usw.) für eine Substanz.",
  inputSchema: {
    substance: z
      .string()
      .trim()
      .min(1)
      .describe("Substanz-ID oder Name, z. B. 'mdma', 'ketamin', 'lsd'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ substance }) => {
    const q = substance.toLowerCase();
    const entry =
      REAGENT_DATA.find((e) => e.substanceId.toLowerCase() === q) ??
      REAGENT_DATA.find((e) => e.substanceId.toLowerCase().includes(q));
    const reactions = entry ? getReagents(entry.substanceId) : [];

    const text = reactions.length
      ? [
          `Reagenztests für ${entry?.substanceId}:`,
          ...reactions.map(
            (r) => `- ${REAGENT_LABEL[r.reagent]}: ${r.color}${r.notes ? ` (${r.notes})` : ""}`,
          ),
          "Reagenztests zeigen nur an, ob etwas enthalten sein könnte — sie sagen nichts über Dosis, Reinheit oder Beimengungen. Ein Labor-Drug-Checking ist immer aussagekräftiger.",
        ].join("\n")
      : `Keine Reagenzdaten für "${substance}". Verfügbare Reagenzien: ${Object.values(REAGENT_LABEL).join(", ")}.`;

    return {
      content: [{ type: "text" as const, text }],
      structuredContent: {
        substanceId: entry?.substanceId ?? null,
        reactions,
        reagentIntros: REAGENT_INTRO,
      },
    };
  },
});
