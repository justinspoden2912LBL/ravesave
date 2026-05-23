import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { listPublishedPosts, formatDate, type Post } from "@/lib/posts";

export const Route = createFileRoute("/erfahrungen")({
  component: ExperiencesPage,
  head: () => ({
    meta: [
      { title: "Meine Erfahrungen — Rave Safe, have Fun" },
      {
        name: "description",
        content:
          "Persönliche Erfahrungsberichte, Reflexionen und Safer-Use-Notizen von Justin — Lessons Learned aus dem echten Leben.",
      },
      { property: "og:title", content: "Meine Erfahrungen — Rave Safe, have Fun" },
      {
        property: "og:description",
        content: "Persönliche Erfahrungsberichte und Safer-Use-Notizen.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ravesave.fun/erfahrungen" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.fun/erfahrungen" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Meine Erfahrungen — Ravesave",
          description:
            "Persönliche Erfahrungsberichte, Reflexionen und Safer-Use-Notizen von Justin.",
          url: "https://ravesave.fun/erfahrungen",
          inLanguage: "de-DE",
        }),
      },
    ],
  }),
});

function ExperiencesPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPublishedPosts()
      .then(setPosts)
      .catch((e) => setError(e.message ?? "Konnte Beiträge nicht laden."));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-secondary" /> Erfahrungsberichte
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Meine Erfahrungen</h1>
        <p className="text-lg text-muted-foreground">
          Persönliche Reflexionen, Safer-Use-Notizen und längere Gedanken rund um
          Konsum, Rave-Kultur und das, was ich unterwegs gelernt habe.
        </p>
      </header>

      <aside className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
        <div className="flex items-center gap-2 font-semibold text-destructive">
          <ShieldAlert className="h-4 w-4" /> Wichtig
        </div>
        <p className="mt-2 text-foreground/90">
          Persönliche Erfahrungen ersetzen keine medizinische Beratung.
          Im Notfall immer <strong>112</strong> wählen.
        </p>
      </aside>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!posts && !error && (
        <div className="rounded-2xl glass p-8 text-center text-muted-foreground text-sm">
          Lade Beiträge…
        </div>
      )}

      {posts && posts.length === 0 && (
        <div className="rounded-2xl glass p-10 text-center text-muted-foreground">
          <BookOpen className="h-6 w-6 mx-auto mb-2 opacity-60" />
          Noch keine veröffentlichten Beiträge. Schau bald wieder vorbei.
        </div>
      )}

      <ul className="space-y-4">
        {posts?.map((p) => (
          <li key={p.id}>
            <Link
              to="/erfahrungen/$slug"
              params={{ slug: p.slug }}
              className="block rounded-2xl glass p-6 hover:border-primary/40 hover:bg-muted/10 transition group"
            >
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <time dateTime={p.published_at ?? p.created_at}>
                  {formatDate(p.published_at ?? p.created_at)}
                </time>
                {p.category && (
                  <span className="rounded-full bg-secondary/15 text-secondary px-2 py-0.5">
                    {p.category}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold tracking-tight group-hover:text-secondary transition">
                {p.title}
              </h2>
              {p.excerpt && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {p.excerpt}
                </p>
              )}
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-secondary">
                Weiterlesen <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
