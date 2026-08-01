import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CATEGORY_LABEL, SUBSTANCES } from "@/lib/substances";

export default defineTool({
  name: "search_substances",
  title: "Substanzen suchen",
  description:
    "Durchsucht das Rave-Safe-Substanz-Wiki nach Name, Slang/Alias oder Kategorie und liefert passende Treffer mit Kurzbeschreibung.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .describe("Suchbegriff: Substanzname, Slang (z. B. 'Molly', 'Pep') oder Kategorie."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query }) => {
    const q = query.toLowerCase();
    const hits = SUBSTANCES.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (CATEGORY_LABEL[s.category] ?? "").toLowerCase().includes(q) ||
        s.aliases.some((a) => a.toLowerCase().includes(q)),
    ).slice(0, 25);

    const results = hits.map((s) => ({
      id: s.id,
      name: s.name,
      aliases: s.aliases,
      category: CATEGORY_LABEL[s.category] ?? s.category,
      shortDescription: s.shortDescription,
    }));

    return {
      content: [
        {
          type: "text" as const,
          text:
            results.length === 0
              ? `Keine Substanz zu "${query}" gefunden.`
              : results
                  .map((r) => `${r.name} (${r.id}) — ${r.category}: ${r.shortDescription}`)
                  .join("\n"),
        },
      ],
      structuredContent: { count: results.length, results },
    };
  },
});
