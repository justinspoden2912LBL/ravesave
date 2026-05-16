import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { SUBSTANCES, CATEGORY_LABEL } from "@/lib/substances";

const substanceContext = SUBSTANCES.map((s) => {
  const ev = s.evidence?.length
    ? "\n    Quellen: " + s.evidence.map((e) => `[${e.label}](${e.url})`).join(" · ")
    : "";
  return `- ${s.name} (${CATEGORY_LABEL[s.category]}) — ${s.shortDescription} Onset ${s.onset}, Dauer ${s.duration}.${ev}`;
}).join("\n");

const SYSTEM_PROMPT = `Du bist "trace", ein nüchterner, faktenbasierter Harm-Reduction-Assistent.
Sprich Deutsch. Sei direkt, ohne Belehrung, ohne moralische Wertung, ohne Über-Dramatisierung.
Antworte in Markdown (Listen, Fett, Links).

Quellen-Regel — WICHTIG:
- Wenn die Frage Studienlage, Evidenz, Risiken, Nebenwirkungen, Wechselwirkungen, Toxizität, Pharmakologie oder Sicherheit einer Substanz aus der untenstehenden Datenbank betrifft, MUSST du am Ende einen Abschnitt "**Quellen**" als Markdown-Bullet-Liste anhängen — mit den passenden Links aus dem Substance-Context (Format: \`- [Label](URL)\`).
- Zitiere im Fließtext zusätzlich inline mit Markdown-Links, wo es passt.
- Wenn keine substanz-spezifische Quelle vorliegt, verweise auf PsychonautWiki / TripSit / EMCDDA und sag, dass keine spezifische Studie in der App-DB hinterlegt ist.
- Erfinde keine URLs. Nutze ausschließlich Links aus dem unten gelisteten Substance-Context.

Wenn der/die User:in Dateien hochlädt, fasse zusammen oder analysiere sie sachlich.
Wenn nach Dosierung, Wechselwirkungen oder Pharmakologie gefragt wird, antworte konkret.
Sag knapp dazu: individuelle Verträglichkeit unterscheidet sich, Reinheit ist unbekannt — Drug-Checking empfehlen.
Notfall: 112.

Substance-Context (App-Datenbank, mit Quellen):
${substanceContext}`;

type ChatBody = { messages?: unknown; profile?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { messages, profile } = (await request.json()) as ChatBody;
        if (!Array.isArray(messages)) return new Response("messages required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const profileBlock =
          typeof profile === "string" && profile.trim().length > 0
            ? `\n\n${profile.slice(0, 4000)}`
            : "";

        try {
          const result = streamText({
            model,
            system: SYSTEM_PROMPT + profileBlock,
            messages: await convertToModelMessages(messages as UIMessage[]),
          });
          return result.toUIMessageStreamResponse({ originalMessages: messages as UIMessage[] });
        } catch (e: any) {
          const msg = e?.message ?? "AI Gateway error";
          const status = e?.statusCode ?? 500;
          return new Response(msg, { status });
        }
      },
    },
  },
});
