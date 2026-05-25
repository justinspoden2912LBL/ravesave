import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/voice-token")({
  server: {
    handlers: {
      POST: async () => {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        const agentId = process.env.ELEVENLABS_AGENT_ID;
        if (!apiKey || !agentId) {
          return new Response(
            JSON.stringify({ error: "Voice agent not configured" }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          );
        }
        try {
          const res = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`,
            { headers: { "xi-api-key": apiKey } },
          );
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            console.error("[voice-token] ElevenLabs error", res.status, text);
            return new Response(
              JSON.stringify({ error: "Voice token unavailable" }),
              { status: 502, headers: { "Content-Type": "application/json" } },
            );
          }
          const { token } = await res.json();
          return Response.json({ token, agentId });
        } catch (e) {
          return new Response(
            JSON.stringify({ error: "Token request failed" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
