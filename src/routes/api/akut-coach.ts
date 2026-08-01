import { createFileRoute } from "@tanstack/react-router";
import { loadAiSettings, isGroqHealthy } from "@/lib/aiSettings.server";

const SYSTEM_PROMPT = `Du bist Marleen, eine ruhige, evidenzbasierte Harm-Reduction-Begleiterin in der App "Rave Safe, have Fun".
Eine Person beschreibt eine akute Situation auf einem Rave / im Konsumkontext. Sie ist (noch) kein medizinischer Notfall — sonst würden wir sofort 112 sagen.

Deine Aufgabe: erstelle eine kurze, beruhigende, sehr konkrete Erste-Hilfe-Antwort im JSON-Format des Tools "akut_advice".

Regeln:
- Sprich Deutsch, du-Form, ruhig, nicht moralisierend, nicht alarmistisch.
- 3 bis 5 Schritte. Jeder Schritt ein einzelner, sofort umsetzbarer Satz. Reihenfolge = was zuerst hilft.
- "title": kurz, max. 6 Wörter, ohne Anführungszeichen.
- "subtitle": ein halber Satz, beruhigend, max. 60 Zeichen.
- "deeper": 1–3 Sätze Hintergrund (Physiologie/Pharmakologie/Setting-Effekt). Nur Fakten, kein Geschwafel. Optional weglassen, wenn es nichts Substanzielles zu sagen gibt.
- "redFlags": optionale Liste von Warnzeichen, bei denen die Person wirklich 112 rufen soll. Maximal 4 kurze Punkte. Nur aufnehmen, wenn die Situation das hergibt.
- KEINE Dosierungs-Empfehlungen, keine Medikamenten-Empfehlungen außer Wasser/Elektrolyte/Naloxon (wenn klar Opioid-Kontext).
- KEINE Diagnosen.
- Wenn die Beschreibung nach echtem Notfall klingt (Bewusstlosigkeit, Krampf, blaue Lippen, Atemstillstand, Brustschmerz, sehr hohes Fieber): erster Schritt MUSS lauten "Ruf jetzt 112 an — Schweigepflicht gilt." und redFlags ausführlich.
- Wenn die Eingabe nichts mit der Situation zu tun hat oder leer ist, gib einen sanften Default-Schritt-Plan ("durchatmen, Reize runter, Wasser, Person ansprechen").`;

const TOOL = {
  type: "function" as const,
  function: {
    name: "akut_advice",
    description: "Strukturierte Erste-Hilfe-Antwort für eine akute, nicht-lebensbedrohliche Situation.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Kurze Überschrift, max. 6 Wörter." },
        subtitle: { type: "string", description: "Beruhigender Halbsatz, max. 60 Zeichen." },
        steps: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          items: { type: "string" },
          description: "Konkrete, sofort umsetzbare Schritte in Reihenfolge.",
        },
        deeper: {
          type: "string",
          description: "1–3 Sätze Hintergrund, optional.",
        },
        redFlags: {
          type: "array",
          maxItems: 4,
          items: { type: "string" },
          description: "Warnzeichen, bei denen 112 gerufen werden muss.",
        },
      },
      required: ["title", "subtitle", "steps"],
      additionalProperties: false,
    },
  },
};

type Body = {
  scenario?: unknown;
  customText?: unknown;
  mode?: unknown;
};

const PRESETS: Record<string, string> = {
  overwhelm: "Mir wird gerade alles zu viel — zu laut, zu hell, zu viele Leute. Ich bin nicht in Lebensgefahr, aber ich brauche Schritte, um runterzukommen.",
  bad_trip: "Ich habe einen schlechten Trip / starke Angst nach Psychedelikum oder Dissoziativum. Bewusstsein klar, aber ich erlebe Panik / verzerrte Wahrnehmung.",
  comedown: "Comedown / Crash nach Stimulanzien (z. B. MDMA, Speed). Erschöpft, leer, frösteln, Stimmung im Keller.",
  hot: "Mir ist sehr heiß und schwindelig auf der Tanzfläche, ich schwitze stark, Herz rast.",
  cold: "Mir ist plötzlich kalt, ich zittere, Lippen leicht bläulich, fühle mich schwach. Noch ansprechbar.",
  someone_unwell: "Eine Freundin / ein Freund neben mir geht es nicht gut — wirkt verwirrt, blass, weniger ansprechbar als sonst, atmet aber.",
  cant_sleep: "Ich komme nach dem Konsum nicht runter und nicht zur Ruhe, will eigentlich schlafen.",
};

export const Route = createFileRoute("/api/akut-coach")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = (await request.json()) as Body;
          const groqKey = process.env.GROQ_API_KEY;
          const lovableKey = process.env.LOVABLE_API_KEY;
          if (!groqKey && !lovableKey) {
            return new Response("Missing AI provider key", { status: 500 });
          }

          const sanitize = (v: unknown, max: number) =>
            typeof v === "string"
              ? v.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").slice(0, max)
              : "";

          const scenarioKey = sanitize(body.scenario, 64);
          const custom = sanitize(body.customText, 600);
          const mode = body.mode === "expert" ? "expert" : body.mode === "extended" ? "extended" : "basic";

          let userPrompt: string;
          if (custom.trim().length > 0) {
            userPrompt = `Eigene Beschreibung der Situation:\n\n${custom.trim()}`;
          } else if (scenarioKey && PRESETS[scenarioKey]) {
            userPrompt = `Vorgefertigtes Szenario "${scenarioKey}":\n\n${PRESETS[scenarioKey]}`;
          } else {
            return new Response(JSON.stringify({ error: "scenario or customText required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const modeHint =
            mode === "basic"
              ? "\n\nAntwort-Tiefe = BASIS: kurze Sätze, Alltagssprache, kein Fachjargon. 'deeper' nur wenn es wirklich hilft."
              : mode === "extended"
                ? "\n\nAntwort-Tiefe = MEHR: Mechanismus / Setting-Effekt darf in 'deeper' kurz erklärt werden."
                : "\n\nAntwort-Tiefe = EXPERTE: 'deeper' darf pharmakologisch / physiologisch konkret werden (Rezeptoren, Vagus, Sympathikus, Halbwertszeit).";

          // Bevorzugt Lovable AI (Gemini 2.5 Flash — günstig, großer Context,
          // Gratis-Quota). Groq nur als Fallback (12k TPM auf Free-Tier).
          // Bevorzugt das kostenfreie Modell (Admin-Einstellung), Fallback nur,
          // wenn der Free-Anbieter gerade nicht erreichbar ist.
          const aiSettings = await loadAiSettings();
          const useGroq =
            aiSettings.provider !== "lovable" && !!groqKey && (await isGroqHealthy(groqKey));
          const endpoint = useGroq
            ? "https://api.groq.com/openai/v1/chat/completions"
            : "https://ai.gateway.lovable.dev/v1/chat/completions";
          const modelName = useGroq ? aiSettings.model : aiSettings.fallback_model;
          const authKey = useGroq ? groqKey! : lovableKey!;
          if (!authKey) {
            return new Response(JSON.stringify({ error: "unavailable" }), {
              status: 503,
              headers: { "Content-Type": "application/json" },
            });
          }

          const resp = await fetch(endpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                { role: "system", content: SYSTEM_PROMPT + modeHint },
                { role: "user", content: userPrompt },
              ],
              tools: [TOOL],
              tool_choice: { type: "function", function: { name: "akut_advice" } },
            }),
          });

          if (!resp.ok) {
            if (resp.status === 429)
              return new Response(JSON.stringify({ error: "rate_limit" }), {
                status: 429,
                headers: { "Content-Type": "application/json" },
              });
            if (resp.status === 402)
              return new Response(JSON.stringify({ error: "credits" }), {
                status: 402,
                headers: { "Content-Type": "application/json" },
              });
            const t = await resp.text();
            console.error("[akut-coach] gateway error", resp.status, t);
            return new Response(JSON.stringify({ error: "gateway_error" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const data = (await resp.json()) as {
            choices?: { message?: { tool_calls?: { function?: { arguments?: string } }[] } }[];
          };
          const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
          if (!args) {
            return new Response(JSON.stringify({ error: "no_tool_call" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }
          let parsed: unknown;
          try {
            parsed = JSON.parse(args);
          } catch {
            return new Response(JSON.stringify({ error: "invalid_json" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify(parsed), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("[akut-coach] error", e);
          return new Response(JSON.stringify({ error: "server_error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
