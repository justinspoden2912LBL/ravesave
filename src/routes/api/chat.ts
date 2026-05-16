import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { SUBSTANCES, CATEGORY_LABEL } from "@/lib/substances";

const substanceContext = SUBSTANCES.map(
  (s) =>
    `- ${s.name} (${CATEGORY_LABEL[s.category]}) — ${s.shortDescription} Onset ${s.onset}, Dauer ${s.duration}.`,
).join("\n");

const SYSTEM_PROMPT = `Du bist "trace", ein nüchterner, faktenbasierter Harm-Reduction-Assistent.
Sprich Deutsch. Sei direkt, ohne Belehrung, ohne moralische Wertung, ohne Über-Dramatisierung.
Quellen: PsychonautWiki, TripSit, EMCDDA, peer-reviewed Literatur.

Wenn der/die User:in Dateien hochlädt, fasse zusammen oder analysiere sie sachlich.
Wenn nach Dosierung, Wechselwirkungen oder Pharmakologie gefragt wird, antworte konkret.
Sag immer dazu: individuelle Verträglichkeit unterscheidet sich, Reinheit ist unbekannt — Drug-Checking empfehlen.
Notfall: 112.

Du kennst u.a. diese Substanzen aus der App-Datenbank:
${substanceContext}`;

type ChatBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { messages } = (await request.json()) as ChatBody;
        if (!Array.isArray(messages)) return new Response("messages required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        try {
          const result = streamText({
            model,
            system: SYSTEM_PROMPT,
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
