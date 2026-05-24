import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Public, no-auth tracking endpoint.
 * - Country comes from Cloudflare's `cf-ipcountry` header (no IP stored).
 * - Session id is supplied by the client (anonymous, generated locally).
 * - Path is sanitized to prevent log spam / overlong values.
 */
export const Route = createFileRoute("/api/public/track")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            type?: string;
            path?: string;
            event?: string;
            detail?: string;
            sid?: string;
            ref?: string;
          };
          const country =
            request.headers.get("cf-ipcountry") ||
            request.headers.get("x-vercel-ip-country") ||
            null;
          const sid = (body.sid || "").slice(0, 64) || null;

          if (body.type === "pageview") {
            const path = (body.path || "").slice(0, 200);
            if (!path) return Response.json({ ok: false }, { status: 400 });
            await supabaseAdmin.from("page_views").insert({
              path,
              country,
              session_id: sid,
              referrer: (body.ref || "").slice(0, 200) || null,
            });
          } else if (body.type === "event") {
            const ev = (body.event || "").slice(0, 60);
            if (!ev) return Response.json({ ok: false }, { status: 400 });
            await supabaseAdmin.from("usage_events").insert({
              event_type: ev,
              detail: (body.detail || "").slice(0, 200) || null,
              session_id: sid,
            });
          } else {
            return Response.json({ ok: false }, { status: 400 });
          }
          return Response.json(
            { ok: true },
            { headers: { "Access-Control-Allow-Origin": "*" } },
          );
        } catch (e) {
          console.error("track error", e);
          return Response.json(
            { ok: false },
            { status: 500, headers: { "Access-Control-Allow-Origin": "*" } },
          );
        }
      },
    },
  },
});
