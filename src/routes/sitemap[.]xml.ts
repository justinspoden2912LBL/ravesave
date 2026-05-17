import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SUBSTANCES } from "@/lib/substances";

const BASE_URL = "https://ravesave.lovable.app";

const PATHS = [
  "/",
  "/log",
  "/mix",
  "/risks",
  "/substances",
  "/knigge",
  "/chat",
  "/stats",
  "/about",
  "/settings",
  "/onboarding",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticUrls = PATHS.map(
          (p) =>
            `  <url>\n    <loc>${BASE_URL}${p}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`,
        );
        const substanceUrls = SUBSTANCES.map(
          (s) =>
            `  <url>\n    <loc>${BASE_URL}/substances/${s.id}</loc>\n    <changefreq>monthly</changefreq>\n  </url>`,
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...staticUrls,
          ...substanceUrls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
