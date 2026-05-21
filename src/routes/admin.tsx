import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Save,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listAllPostsAdmin, slugify, type Post } from "@/lib/posts";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — Rave Safe, have Fun" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type Mode = { type: "list" } | { type: "edit"; post: Post } | { type: "new" };

function AdminPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setIsAdmin(null);
      return;
    }
    // Use the user_roles RLS policy (users can read their own roles)
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [userId]);

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground text-sm">Lade…</div>;
  }

  if (!userId) {
    return <LoginCard />;
  }

  if (isAdmin === null) {
    return <div className="p-10 text-center text-muted-foreground text-sm">Prüfe Berechtigung…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <ShieldCheck className="h-10 w-10 mx-auto text-destructive" />
        <h1 className="text-xl font-bold">Kein Admin-Zugang</h1>
        <p className="text-sm text-muted-foreground">
          Dein Account ist eingeloggt, aber nicht als Admin freigeschaltet.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm"
        >
          <LogOut className="h-4 w-4" /> Abmelden
        </button>
      </div>
    );
  }

  return <Dashboard />;
}

function LoginCard() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setInfo(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        setInfo(
          "Account angelegt. Bestätige ggf. die E-Mail. Bitte dann den Account in der Cloud-Konsole als Admin hinterlegen.",
        );
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Login fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={submit} className="rounded-2xl glass p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-secondary" />
          <h1 className="text-xl font-bold">Admin-Bereich</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Nur für autorisierte Redaktion. Normale Nutzer:innen brauchen keinen Login.
        </p>

        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1">E-Mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-input px-3 py-2 text-sm"
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1">Passwort</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-input px-3 py-2 text-sm"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </label>

        {err && <p className="text-xs text-destructive">{err}</p>}
        {info && <p className="text-xs text-secondary">{info}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-aurora animate-aurora py-2.5 text-sm font-semibold text-primary-foreground glow disabled:opacity-50"
        >
          <LogIn className="h-4 w-4" />
          {mode === "signin" ? "Einloggen" : "Account anlegen"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setErr(null);
            setInfo(null);
          }}
          className="w-full text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "Erst-Setup: Account anlegen" : "Schon registriert? Einloggen"}
        </button>
      </form>
    </div>
  );
}

function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [mode, setMode] = useState<Mode>({ type: "list" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      setPosts(await listAllPostsAdmin());
      setErr(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function remove(id: string) {
    if (!confirm("Beitrag wirklich löschen?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    refresh();
  }

  async function togglePublish(p: Post) {
    const next = !p.published;
    const { error } = await supabase
      .from("posts")
      .update({
        published: next,
        published_at: next ? (p.published_at ?? new Date().toISOString()) : p.published_at,
      })
      .eq("id", p.id);
    if (error) {
      alert(error.message);
      return;
    }
    refresh();
  }

  if (mode.type === "new" || mode.type === "edit") {
    return (
      <PostEditor
        initial={mode.type === "edit" ? mode.post : null}
        onCancel={() => setMode({ type: "list" })}
        onSaved={() => {
          setMode({ type: "list" });
          refresh();
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beiträge</h1>
          <p className="text-sm text-muted-foreground">
            Erstellen, bearbeiten und veröffentlichen.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode({ type: "new" })}
            className="inline-flex items-center gap-2 rounded-full bg-aurora animate-aurora px-4 py-2 text-sm font-semibold text-primary-foreground glow"
          >
            <Plus className="h-4 w-4" /> Neuer Beitrag
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="inline-flex items-center gap-2 rounded-full glass px-3 py-2 text-xs"
          >
            <LogOut className="h-3.5 w-3.5" /> Abmelden
          </button>
        </div>
      </header>

      {err && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {err}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">Lade…</div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-muted-foreground">
          Noch keine Beiträge.
        </div>
      ) : (
        <ul className="space-y-2">
          {posts.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl glass p-4 flex items-start gap-4 flex-wrap"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{p.title}</span>
                  <span
                    className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 ${
                      p.published
                        ? "bg-secondary/20 text-secondary"
                        : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {p.published ? "veröffentlicht" : "Entwurf"}
                  </span>
                  {p.category && (
                    <span className="text-[10px] rounded-full bg-primary/15 text-primary px-2 py-0.5">
                      {p.category}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  /{p.slug} · zuletzt {new Date(p.updated_at).toLocaleString("de-DE")}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => togglePublish(p)}
                  className="rounded-full p-2 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                  title={p.published ? "Unveröffentlichen" : "Veröffentlichen"}
                  aria-label={p.published ? "Unveröffentlichen" : "Veröffentlichen"}
                >
                  {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setMode({ type: "edit", post: p })}
                  className="rounded-full p-2 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                  aria-label="Bearbeiten"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="rounded-full p-2 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                  aria-label="Löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PostEditor({
  initial,
  onCancel,
  onSaved,
}: {
  initial: Post | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const effectiveSlug = useMemo(
    () => (slugTouched ? slug : slugify(title)),
    [slug, slugTouched, title],
  );

  async function save(publishNow: boolean) {
    setBusy(true);
    setErr(null);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const author_id = userRes.user?.id ?? null;
      const finalSlug = effectiveSlug || slugify(title);
      if (!title.trim() || !finalSlug) {
        throw new Error("Titel und Slug sind erforderlich.");
      }
      const payload = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim() || null,
        category: category.trim() || null,
        content,
        published: publishNow,
        published_at: publishNow
          ? (initial?.published_at ?? new Date().toISOString())
          : initial?.published_at ?? null,
        author_id,
      };
      if (initial) {
        const { error } = await supabase.from("posts").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("posts").insert(payload);
        if (error) throw error;
      }
      onSaved();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-5">
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Zurück
      </button>

      <h1 className="text-2xl font-bold">{initial ? "Beitrag bearbeiten" : "Neuer Beitrag"}</h1>

      <div className="rounded-2xl glass p-6 space-y-4">
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1">Titel</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg bg-input px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1">
            Slug (URL-Pfad)
          </span>
          <input
            value={effectiveSlug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            className="w-full rounded-lg bg-input px-3 py-2 text-sm font-mono"
            placeholder="meine-erste-erfahrung"
          />
          <span className="text-[11px] text-muted-foreground mt-1 block">
            /erfahrungen/{effectiveSlug || "…"}
          </span>
        </label>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1">
              Kategorie / Tag (optional)
            </span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg bg-input px-3 py-2 text-sm"
              placeholder="Reflexion, Safer Use, Event…"
            />
          </label>
          <label className="flex items-end gap-2 text-sm pb-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-muted-foreground">Beim Speichern veröffentlichen</span>
          </label>
        </div>

        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1">
            Kurzvorschau (Excerpt)
          </span>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full rounded-lg bg-input px-3 py-2 text-sm resize-none"
            placeholder="1–2 Sätze für die Übersicht."
          />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1">
            Inhalt (Markdown)
          </span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="w-full rounded-lg bg-input px-3 py-2 text-sm font-mono resize-y"
            placeholder="## Überschrift&#10;&#10;Text in **Markdown** …"
          />
        </label>

        {err && <p className="text-xs text-destructive">{err}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => save(false)}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Als Entwurf speichern
          </button>
          <button
            onClick={() => save(true)}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-aurora animate-aurora px-4 py-2 text-sm font-semibold text-primary-foreground glow disabled:opacity-50"
          >
            <Eye className="h-4 w-4" /> Veröffentlichen
          </button>
        </div>
      </div>
    </div>
  );
}
