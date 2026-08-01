import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Save,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { slugify, type Post } from "@/lib/posts";
import {
  adminLogin,
  adminLogout,
  adminWhoami,
  adminListPosts,
  adminUpsertPost,
  adminTogglePublish,
  adminDeletePost,
} from "@/lib/admin.functions";
import {
  readAdminAudit,
  logAdminAudit,
  clearAdminAudit,
  labelFor as auditLabel,
  type AdminAuditEntry,
} from "@/lib/adminAudit";
import { AdminStatsTab } from "@/components/admin/AdminStatsTab";
import { AdminTextsTab } from "@/components/admin/AdminTextsTab";
import { AdminSubstancesTab } from "@/components/admin/AdminSubstancesTab";
import { AdminPagesTab } from "@/components/admin/AdminPagesTab";
import { AdminSessionsTab } from "@/components/admin/AdminSessionsTab";
import { AdminSiteContentTab } from "@/components/admin/AdminSiteContentTab";
import { AdminDevTab } from "@/components/admin/AdminDevTab";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminSubmissionsTab } from "@/components/admin/AdminSubmissionsTab";
import { AdminAiTab } from "@/components/admin/AdminAiTab";


const ADMIN_FAILED_KEY = "ravesave_admin_failed_count";
const ADMIN_LOCKOUT_KEY = "ravesave_admin_lockout_until";
const ADMIN_LOCKOUT_MS = 15 * 60 * 1000; // 15min
const ADMIN_MAX_ATTEMPTS = 5;

function readLs(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeLs(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

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

type Tab = "pages" | "info" | "sessions" | "stats" | "texts" | "substances" | "posts" | "submissions" | "ai" | "users" | "dev";

function AdminPage() {
  const [authState, setAuthState] = useState<"checking" | "in" | "out">("checking");
  const [tab, setTab] = useState<Tab>("pages");


  async function check() {
    try {
      const r = await adminWhoami();
      setAuthState(r.isAdmin ? "in" : "out");
    } catch {
      setAuthState("out");
    }
  }
  useEffect(() => {
    void check();
  }, []);

  if (authState === "checking") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-muted-foreground">
        Prüfe Admin-Sitzung…
      </div>
    );
  }
  if (authState === "out") {
    return <LoginCard onSuccess={() => setAuthState("in")} />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-5">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <p className="text-xs text-muted-foreground">
            Seiten an-/abschalten · Texte bearbeiten · Statistiken
          </p>
        </div>
        <button
          onClick={async () => {
            try {
              await adminLogout();
            } catch {
              /* ignore */
            }
            logAdminAudit("logout");
            setAuthState("out");
          }}
          className="inline-flex items-center gap-2 rounded-full glass px-3 py-2 text-xs"
        >
          <LogOut className="h-3.5 w-3.5" /> Abmelden
        </button>
      </header>

      <nav className="flex gap-1 overflow-x-auto -mx-4 px-4 pb-1" aria-label="Admin-Bereiche">
        {(
          [
            { id: "pages", label: "Seiten" },
            { id: "info", label: "Info-Texte" },
            { id: "ai", label: "KI (Marleen)" },
            { id: "sessions", label: "Live-Sessions" },
            { id: "stats", label: "Statistik" },
            { id: "texts", label: "Alle Texte" },
            { id: "substances", label: "Substanzen" },
            { id: "posts", label: "Beiträge" },
            { id: "submissions", label: "Einsendungen" },
            { id: "users", label: "Nutzer & Daten" },
            { id: "dev", label: "Entwickler & App" },
          ] as { id: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "pages" && <AdminPagesTab />}
      {tab === "info" && <AdminSiteContentTab />}
      {tab === "ai" && <AdminAiTab />}
      {tab === "sessions" && <AdminSessionsTab />}
      {tab === "stats" && <AdminStatsTab />}
      {tab === "texts" && <AdminTextsTab />}
      {tab === "substances" && <AdminSubstancesTab />}
      {tab === "posts" && <Dashboard onLogout={() => setAuthState("out")} />}
      {tab === "submissions" && <AdminSubmissionsTab />}
      {tab === "users" && <AdminUsersTab />}
      {tab === "dev" && <AdminDevTab />}
    </div>
  );
}


function LoginCard({ onSuccess }: { onSuccess: () => void }) {
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number>(() => {
    const v = Number(readLs(ADMIN_LOCKOUT_KEY) ?? "0");
    return v > Date.now() ? v : 0;
  });
  const [, force] = useState(0);

  useEffect(() => {
    if (!lockedUntil) return;
    const t = setInterval(() => {
      if (Date.now() >= lockedUntil) {
        writeLs(ADMIN_LOCKOUT_KEY, null);
        writeLs(ADMIN_FAILED_KEY, "0");
        setLockedUntil(0);
      } else {
        force((n) => n + 1);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [lockedUntil]);

  function registerFailure() {
    const next = Number(readLs(ADMIN_FAILED_KEY) ?? "0") + 1;
    writeLs(ADMIN_FAILED_KEY, String(next));
    logAdminAudit("login_failure", `Versuch ${next}/${ADMIN_MAX_ATTEMPTS}`);
    if (next >= ADMIN_MAX_ATTEMPTS) {
      const until = Date.now() + ADMIN_LOCKOUT_MS;
      writeLs(ADMIN_LOCKOUT_KEY, String(until));
      setLockedUntil(until);
      logAdminAudit("lockout", `${Math.round(ADMIN_LOCKOUT_MS / 60000)} min`);
    }
  }
  function clearFailures() {
    writeLs(ADMIN_FAILED_KEY, "0");
    writeLs(ADMIN_LOCKOUT_KEY, null);
    setLockedUntil(0);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lockedUntil && Date.now() < lockedUntil) return;
    setBusy(true);
    setErr(null);
    try {
      await adminLogin({ data: { key } });
      logAdminAudit("login_success");
      clearFailures();
      onSuccess();
    } catch (e: unknown) {
      registerFailure();
      setErr(e instanceof Error ? e.message : "Login fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  const lockedSecs = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000)) : 0;
  const isLocked = lockedSecs > 0;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={submit} className="rounded-2xl glass p-6 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-secondary" />
          <h1 className="text-xl font-bold">Admin öffnen</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Gib den Admin-Schlüssel ein. Es ist kein Account nötig — der Zugang läuft
          ausschließlich über den serverseitig geprüften Schlüssel.
        </p>

        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1">
            Admin-Schlüssel
          </span>
          <input
            type="password"
            required
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full rounded-lg bg-input px-3 py-2 text-sm"
            autoComplete="current-password"
            autoFocus
            disabled={isLocked}
          />
        </label>

        {isLocked && (
          <p className="text-xs text-destructive" role="alert">
            Zu viele Fehlversuche. Bitte in {Math.ceil(lockedSecs / 60)} min erneut versuchen.
          </p>
        )}
        {!isLocked && err && (
          <p className="text-xs text-destructive" role="alert">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || isLocked}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-aurora animate-aurora py-2.5 text-sm font-semibold text-primary-foreground glow disabled:opacity-50 min-h-11"
        >
          <KeyRound className="h-4 w-4" /> Admin öffnen
        </button>
      </form>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [mode, setMode] = useState<Mode>({ type: "list" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const data = await adminListPosts();
      setPosts(data as Post[]);
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
    try {
      await adminDeletePost({ data: { id } });
      refresh();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Löschen fehlgeschlagen");
    }
  }

  async function togglePublish(p: Post) {
    try {
      await adminTogglePublish({ data: { id: p.id } });
      refresh();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Statuswechsel fehlgeschlagen");
    }
  }

  async function logout() {
    try {
      await adminLogout();
    } catch {
      /* ignore */
    }
    logAdminAudit("logout");
    onLogout();
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
            onClick={logout}
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

      <AuditLogSection />
    </div>
  );
}

function AuditLogSection() {
  const [entries, setEntries] = useState<AdminAuditEntry[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setEntries(readAdminAudit());
  }, [tick]);

  const counts = useMemo(() => {
    const c = { login_success: 0, login_failure: 0, logout: 0, session_expired: 0 } as Record<
      string,
      number
    >;
    for (const e of entries) c[e.type] = (c[e.type] ?? 0) + 1;
    return c;
  }, [entries]);

  function styleFor(type: AdminAuditEntry["type"]) {
    switch (type) {
      case "login_success":
        return "bg-secondary/15 text-secondary";
      case "login_failure":
      case "lockout":
        return "bg-destructive/15 text-destructive";
      case "session_expired":
        return "bg-amber-500/15 text-amber-500";
      case "logout":
        return "bg-muted/40 text-muted-foreground";
      case "setup":
      case "recovery_request":
        return "bg-primary/15 text-primary";
    }
  }

  return (
    <section className="rounded-2xl glass p-5 space-y-4" aria-labelledby="audit-log-heading">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 id="audit-log-heading" className="text-lg font-semibold">
            Admin-Audit-Log
          </h2>
          <p className="text-xs text-muted-foreground">
            Lokales Protokoll (nur dieses Gerät) – letzte {entries.length} Einträge.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTick((n) => n + 1)}
            className="rounded-full glass px-3 py-1.5 text-xs"
          >
            Aktualisieren
          </button>
          <button
            type="button"
            onClick={() => {
              if (!confirm("Audit-Log wirklich löschen?")) return;
              clearAdminAudit();
              setTick((n) => n + 1);
            }}
            className="rounded-full glass px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive"
          >
            Leeren
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="rounded-xl bg-secondary/10 p-2">
          <dt className="text-muted-foreground">Logins</dt>
          <dd className="font-semibold text-secondary">{counts.login_success ?? 0}</dd>
        </div>
        <div className="rounded-xl bg-destructive/10 p-2">
          <dt className="text-muted-foreground">Fehlversuche</dt>
          <dd className="font-semibold text-destructive">{counts.login_failure ?? 0}</dd>
        </div>
        <div className="rounded-xl bg-muted/30 p-2">
          <dt className="text-muted-foreground">Abmeldungen</dt>
          <dd className="font-semibold">{counts.logout ?? 0}</dd>
        </div>
        <div className="rounded-xl bg-amber-500/10 p-2">
          <dt className="text-muted-foreground">Session-Ende</dt>
          <dd className="font-semibold text-amber-500">{counts.session_expired ?? 0}</dd>
        </div>
      </dl>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Noch keine Ereignisse aufgezeichnet.
        </p>
      ) : (
        <ul className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
          {entries.map((e, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-lg bg-muted/20 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${styleFor(
                    e.type,
                  )}`}
                >
                  {auditLabel(e.type)}
                </span>
                {e.detail && (
                  <span className="truncate text-muted-foreground">{e.detail}</span>
                )}
              </div>
              <time className="shrink-0 text-muted-foreground tabular-nums">
                {new Date(e.ts).toLocaleString("de-DE")}
              </time>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-muted-foreground">
        Hinweis: Das Log wird ausschließlich lokal in diesem Browser gespeichert. Es geht
        verloren, wenn du den Browser-Speicher leerst, und enthält keine Daten von anderen
        Geräten.
      </p>
    </section>
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
      const finalSlug = effectiveSlug || slugify(title);
      if (!title.trim() || !finalSlug) {
        throw new Error("Titel und Slug sind erforderlich.");
      }
      await adminUpsertPost({
        data: {
          id: initial?.id,
          title: title.trim(),
          slug: finalSlug,
          excerpt: excerpt.trim() || null,
          category: category.trim() || null,
          content,
          published: publishNow,
        },
      });
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
