import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { getPostBySlug, formatDate, type Post } from "@/lib/posts";

export const Route = createFileRoute("/erfahrungen/$slug")({
  component: PostDetailPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold">Beitrag nicht gefunden</h1>
      <p className="text-muted-foreground">
        Dieser Erfahrungsbericht existiert nicht oder ist nicht (mehr) veröffentlicht.
      </p>
      <Link
        to="/erfahrungen"
        className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Zur Übersicht
      </Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold text-destructive">Fehler</h1>
      <p className="text-muted-foreground">{error.message}</p>
      <button onClick={() => reset()} className="rounded-full glass px-4 py-2 text-sm">
        Erneut versuchen
      </button>
    </div>
  ),
  head: ({ params }) => ({
    meta: [
      { title: `Erfahrungsbericht — ${params.slug} — Rave Safe, have Fun` },
      { name: "description", content: "Persönlicher Erfahrungsbericht von Justin." },
    ],
  }),
});

function PostDetailPage() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<Post | null | undefined>(undefined);

  useEffect(() => {
    getPostBySlug(slug).then((p) => {
      // RLS hides drafts → null for non-admin readers
      setPost(p && p.published ? p : null);
    });
  }, [slug]);

  if (post === undefined) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground text-sm">
        Lade Beitrag…
      </div>
    );
  }
  if (post === null) {
    throw notFound();
  }

  return (
    <article className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <Link
        to="/erfahrungen"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Alle Beiträge
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <time dateTime={post.published_at ?? post.created_at}>
            {formatDate(post.published_at ?? post.created_at)}
          </time>
          {post.category && (
            <span className="rounded-full bg-secondary/15 text-secondary px-2 py-0.5">
              {post.category}
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
        )}
      </header>

      <div className="prose prose-invert prose-neutral max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-secondary prose-strong:text-foreground prose-p:leading-relaxed text-[15px]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      <aside className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
        <div className="flex items-center gap-2 font-semibold text-destructive">
          <ShieldAlert className="h-4 w-4" /> Disclaimer
        </div>
        <p className="mt-2 text-foreground/90">
          Persönliche Erfahrungen ersetzen keine medizinische Beratung.
          Im Notfall immer <strong>112</strong> wählen.
        </p>
      </aside>
    </article>
  );
}
