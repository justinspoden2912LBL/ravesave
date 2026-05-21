import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://ravesave.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/log", changefreq: "monthly", priority: "0.8" },
  { path: "/mix", changefreq: "monthly", priority: "0.9" },
  { path: "/risks", changefreq: "monthly", priority: "0.8" },
  { path: "/substances", changefreq: "weekly", priority: "0.9" },
  { path: "/knigge", changefreq: "monthly", priority: "0.7" },
  { path: "/chat", changefreq: "monthly", priority: "0.6" },
  { path: "/stats", changefreq: "monthly", priority: "0.5" },
  { path: "/about", changefreq: "yearly", priority: "0.5" },
  { path: "/onboarding", changefreq: "yearly", priority: "0.4" },
  { path: "/settings", changefreq: "yearly", priority: "0.3" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = ENTRIES.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
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
