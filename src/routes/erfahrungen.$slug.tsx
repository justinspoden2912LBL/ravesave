import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { getPostBySlug, formatDate, type Post } from "@/lib/posts";

export const Route = createFileRoute("/erfahrungen/$slug")({
  component: PostDetailPage,
  loader: async ({ params }) => {
    try {
      const post = await getPostBySlug(params.slug);
      return { post: post && post.published ? post : null };
    } catch {
      return { post: null };
    }
  },
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
  head: ({ params, loaderData }) => {
    const post = loaderData?.post;
    const url = `https://ravesave.fun/erfahrungen/${params.slug}`;
    const title = post
      ? `${post.title} — Erfahrungsbericht — Rave Safe, have Fun`
      : `Erfahrungsbericht — Rave Safe, have Fun`;
    const rawDesc =
      post?.excerpt ||
      (post?.content
        ? post.content.replace(/[#*_>`\-]/g, "").replace(/\s+/g, " ").trim().slice(0, 200)
        : "");
    const description = rawDesc
      ? rawDesc.length > 160
        ? rawDesc.slice(0, 157).trimEnd() + "…"
        : rawDesc.length < 50
          ? `${rawDesc} — Persönlicher Erfahrungsbericht zu Rave, Konsum und Harm Reduction auf Ravesave.`
          : rawDesc
      : "Persönlicher Erfahrungsbericht zu Rave, Konsum und Harm Reduction — geteilt auf Ravesave.";

    const meta = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: post?.title ?? "Erfahrungsbericht" },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
    ];
    const links = [{ rel: "canonical", href: url }];
    const scripts = post
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: post.title,
              description,
              datePublished: post.published_at ?? post.created_at,
              dateModified: post.updated_at ?? post.published_at ?? post.created_at,
              author: { "@type": "Person", name: "Justin" },
              mainEntityOfPage: url,
            }),
          },
        ]
      : [];
    return { meta, links, scripts };
  },
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

      <div className="text-[15px] leading-relaxed space-y-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_a]:text-secondary [&_a]:underline [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-secondary/40 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted/40 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_hr]:border-border [&_hr]:my-6">
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
