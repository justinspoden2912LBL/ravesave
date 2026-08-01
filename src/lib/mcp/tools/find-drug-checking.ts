import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { COUNTRY_LABEL, DRUG_CHECK_SITES, SITE_TYPE_LABEL } from "@/lib/drugCheckingSites";

export default defineTool({
  name: "find_drug_checking",
  title: "Drug-Checking-Stellen finden",
  description:
    "Listet Drug-Checking- und Beratungsstellen in Deutschland, Österreich, der Schweiz und der EU, optional gefiltert nach Land oder Stadt.",
  inputSchema: {
    country: z
      .enum(["DE", "AT", "CH", "EU", "ALL"])
      .describe("Land filtern: DE, AT, CH, EU oder ALL für alle."),
    city: z.string().trim().describe("Optionaler Stadt-/Ortsfilter. Leerer String = kein Filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ country, city }) => {
    const c = city.toLowerCase();
    const sites = DRUG_CHECK_SITES.filter(
      (s) =>
        (country === "ALL" || s.country === country) &&
        (!c || JSON.stringify(s).toLowerCase().includes(c)),
    );

    return {
      content: [
        {
          type: "text" as const,
          text: sites.length
            ? sites
                .map(
                  (s) =>
                    `${s.name} (${COUNTRY_LABEL[s.country]}, ${SITE_TYPE_LABEL[s.type]})` +
                    (s.url ? ` — ${s.url}` : ""),
                )
                .join("\n")
            : "Keine passenden Stellen gefunden.",
        },
      ],
      structuredContent: { count: sites.length, sites },
    };
  },
});
