import { createFileRoute } from "@tanstack/react-router";
import { guardRequest } from "@/lib/apiGuard";

// ElevenLabs TTS — realistische, weibliche deutsche Stimme für Marlene.
// Voice "Sarah" (EXAVITQu4vr4xnSDxMaL) klingt warm, weiblich, multilingual.
// Modell eleven_multilingual_v2 → sehr gutes Deutsch.
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
const MODEL_ID = "eleven_multilingual_v2";

type Body = { text?: unknown };

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const blocked = guardRequest(request, { name: "tts", limit: 10, windowMs: 60_000 });
        if (blocked) return blocked;

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) return new Response("Missing ELEVENLABS_API_KEY", { status: 500 });

        const { text } = (await request.json()) as Body;
        if (typeof text !== "string" || !text.trim()) {
          return new Response("text required", { status: 400 });
        }
        // Hard cap, damit eine einzelne Antwort nicht ewig synthetisiert
        const clean = text.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").slice(0, 2500);

        const r = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "xi-api-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: clean,
              model_id: MODEL_ID,
              voice_settings: {
                stability: 0.45,
                similarity_boost: 0.8,
                style: 0.35,
                use_speaker_boost: true,
                speed: 1.0,
              },
            }),
          },
        );

        if (!r.ok) {
          const err = await r.text().catch(() => "");
          console.error("[TTS] ElevenLabs error", r.status, err);
          return new Response("TTS unavailable", { status: 502 });
        }
        const buf = await r.arrayBuffer();
        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
