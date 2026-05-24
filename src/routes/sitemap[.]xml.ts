import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listPublishedPosts } from "@/lib/posts";

const BASE_URL = "https://ravesave.fun";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/log", changefreq: "monthly", priority: "0.8" },
  { path: "/mix", changefreq: "monthly", priority: "0.9" },
  { path: "/risks", changefreq: "monthly", priority: "0.8" },
  { path: "/substances", changefreq: "weekly", priority: "0.9" },
  { path: "/knigge", changefreq: "monthly", priority: "0.7" },
  { path: "/chat", changefreq: "monthly", priority: "0.6" },
  { path: "/stats", changefreq: "monthly", priority: "0.5" },
  { path: "/about", changefreq: "yearly", priority: "0.5" },
  { path: "/notfall", changefreq: "yearly", priority: "0.7" },
  { path: "/safety-plan", changefreq: "monthly", priority: "0.6" },
  { path: "/erfahrungen", changefreq: "weekly", priority: "0.6" },
  { path: "/onboarding", changefreq: "yearly", priority: "0.4" },
  { path: "/settings", changefreq: "yearly", priority: "0.3" },
  { path: "/aftercare", changefreq: "monthly", priority: "0.7" },
  { path: "/drugchecking", changefreq: "monthly", priority: "0.7" },
  { path: "/reagenztest", changefreq: "monthly", priority: "0.7" },
  { path: "/tolerance", changefreq: "monthly", priority: "0.6" },
  { path: "/session/active", changefreq: "monthly", priority: "0.5" },
  { path: "/akut", changefreq: "monthly", priority: "0.8" },
  { path: "/checkliste", changefreq: "monthly", priority: "0.7" },

];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [...STATIC_ENTRIES];

        try {
          const posts = await listPublishedPosts();
          for (const p of posts) {
            entries.push({
              path: `/erfahrungen/${p.slug}`,
              lastmod: (p.updated_at ?? p.published_at ?? p.created_at)?.slice(0, 10),
              changefreq: "monthly",
              priority: "0.6",
            });
          }
        } catch {
          // If posts can't be fetched, fall back to static entries only.
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
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
