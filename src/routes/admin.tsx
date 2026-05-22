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
  KeyRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL_KEY = "ravesave_admin_email";
const ADMIN_SESSION_STARTED_KEY = "ravesave_admin_session_started_at";
const ADMIN_FAILED_KEY = "ravesave_admin_failed_count";
const ADMIN_LOCKOUT_KEY = "ravesave_admin_lockout_until";
const ADMIN_SESSION_MAX_MS = 24 * 60 * 60 * 1000; // 24h
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
import { listAllPostsAdmin, slugify, type Post } from "@/lib/posts";
import {
  readAdminAudit,
  logAdminAudit,
  clearAdminAudit,
  labelFor as auditLabel,
  type AdminAuditEntry,
} from "@/lib/adminAudit";

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
      if (session?.user) {
        if (!readLs(ADMIN_SESSION_STARTED_KEY)) {
          writeLs(ADMIN_SESSION_STARTED_KEY, String(Date.now()));
        }
      } else {
        writeLs(ADMIN_SESSION_STARTED_KEY, null);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        // Enforce 24h max session
        const started = Number(readLs(ADMIN_SESSION_STARTED_KEY) ?? "0");
        if (!started) {
          writeLs(ADMIN_SESSION_STARTED_KEY, String(Date.now()));
        } else if (Date.now() - started > ADMIN_SESSION_MAX_MS) {
          supabase.auth.signOut();
        }
      }
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
  // Setup-Modus, wenn lokal noch keine Admin-E-Mail hinterlegt ist.
  const initialMode: "setup" | "login" = readLs(ADMIN_EMAIL_KEY) ? "login" : "setup";
  const [mode, setMode] = useState<"setup" | "login" | "recovery">(initialMode);
  const [email, setEmail] = useState(readLs(ADMIN_EMAIL_KEY) ?? "");
  const [key, setKey] = useState("");
  const [keyConfirm, setKeyConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [setupDone, setSetupDone] = useState<{ needsConfirm: boolean } | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number>(() => {
    const v = Number(readLs(ADMIN_LOCKOUT_KEY) ?? "0");
    return v > Date.now() ? v : 0;
  });
  const [, force] = useState(0);

  // Tick down the lockout
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
    if (next >= ADMIN_MAX_ATTEMPTS) {
      const until = Date.now() + ADMIN_LOCKOUT_MS;
      writeLs(ADMIN_LOCKOUT_KEY, String(until));
      setLockedUntil(until);
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
      if (mode === "setup") {
        if (key.length < 10) {
          throw new Error("Schlüssel muss mindestens 10 Zeichen lang sein.");
        }
        if (key !== keyConfirm) {
          throw new Error("Die Schlüssel stimmen nicht überein.");
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password: key,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        writeLs(ADMIN_EMAIL_KEY, email);
        const needsConfirm = !data.session;
        if (data.session) {
          writeLs(ADMIN_SESSION_STARTED_KEY, String(Date.now()));
        }
        setSetupDone({ needsConfirm });
        clearFailures();
      } else if (mode === "login") {
        const storedEmail = readLs(ADMIN_EMAIL_KEY);
        if (!storedEmail) {
          // Sollte nicht passieren, aber sicher fallbacken
          setMode("setup");
          throw new Error("Bitte richte zuerst einen Admin-Schlüssel ein.");
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: storedEmail,
          password: key,
        });
        if (error) {
          registerFailure();
          throw new Error("Admin-Schlüssel ungültig.");
        }
        writeLs(ADMIN_SESSION_STARTED_KEY, String(Date.now()));
        clearFailures();
      } else {
        // recovery
        if (!email) throw new Error("Bitte E-Mail-Adresse eingeben.");
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setResetSent(true);
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Aktion fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  if (resetSent) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl glass p-6 space-y-4 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-secondary/15 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-secondary" />
          </div>
          <h1 className="text-xl font-bold">E-Mail unterwegs</h1>
          <p className="text-sm text-muted-foreground">
            Falls ein passender Admin-Account existiert, haben wir einen Link zum Setzen eines
            neuen Admin-Schlüssels geschickt.
          </p>
          <p className="text-[11px] text-muted-foreground">
            Schau auch im Spam-Ordner nach. Der Link ist nur kurze Zeit gültig.
          </p>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setResetSent(false);
              setErr(null);
              setKey("");
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-aurora animate-aurora py-2.5 text-sm font-semibold text-primary-foreground glow min-h-11"
          >
            <ArrowLeft className="h-4 w-4" /> Zurück zum Admin-Login
          </button>
        </div>
      </div>
    );
  }

  if (setupDone) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl glass p-6 space-y-4 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-secondary/15 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-secondary" />
          </div>
          <h1 className="text-xl font-bold">Admin eingerichtet</h1>
          <p className="text-sm text-muted-foreground">
            Bewahre deinen Admin-Schlüssel sicher auf. Er ermöglicht Zugriff auf den
            Admin-Bereich. Die E-Mail-Adresse dient nur zum Zurücksetzen des Schlüssels.
          </p>
          {setupDone.needsConfirm ? (
            <p className="text-xs text-muted-foreground">
              Bitte bestätige zuerst den Link in deiner E-Mail. Danach kannst du dich mit
              deinem Admin-Schlüssel einloggen.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Du kannst dich jetzt mit deinem Admin-Schlüssel einloggen.
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Hinweis: Admin-Rechte werden separat in der Cloud-Konsole vergeben.
          </p>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setKey("");
              setKeyConfirm("");
              setErr(null);
              setSetupDone(null);
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-aurora animate-aurora py-2.5 text-sm font-semibold text-primary-foreground glow min-h-11"
          >
            <KeyRound className="h-4 w-4" /> Zum Admin-Login
          </button>
        </div>
      </div>
    );
  }

  const lockedSecs = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000)) : 0;
  const isLocked = lockedSecs > 0;
  const title =
    mode === "setup"
      ? "Admin-Erst-Setup"
      : mode === "login"
        ? "Admin öffnen"
        : "Admin-Schlüssel zurücksetzen";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={submit} className="rounded-2xl glass p-6 space-y-4">
        <div className="flex items-center gap-2">
          {mode === "login" ? (
            <KeyRound className="h-5 w-5 text-secondary" />
          ) : (
            <ShieldCheck className="h-5 w-5 text-secondary" />
          )}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>

        {mode === "setup" && (
          <p className="text-xs text-muted-foreground">
            Lege deinen persönlichen Admin-Schlüssel fest. Der Schlüssel wird sicher gespeichert
            (nicht im Klartext). Die E-Mail dient nur zum Zurücksetzen.
          </p>
        )}
        {mode === "login" && (
          <p className="text-xs text-muted-foreground">
            Gib deinen persönlichen Admin-Schlüssel ein, um den Admin-Bereich zu öffnen.
          </p>
        )}
        {mode === "recovery" && (
          <p className="text-xs text-muted-foreground">
            Gib die hinterlegte Admin-E-Mail ein. Wir schicken einen Link, mit dem du einen
            neuen Admin-Schlüssel setzen kannst.
          </p>
        )}

        {(mode === "setup" || mode === "recovery") && (
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1">
              {mode === "setup" ? "Admin-E-Mail (nur für Recovery)" : "Admin-E-Mail"}
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-input px-3 py-2 text-sm"
              autoComplete="email"
            />
          </label>
        )}

        {mode === "setup" && (
          <>
            <label className="block">
              <span className="block text-xs font-medium text-muted-foreground mb-1">
                Admin-Schlüssel (mind. 10 Zeichen)
              </span>
              <input
                type="password"
                required
                minLength={10}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full rounded-lg bg-input px-3 py-2 text-sm"
                autoComplete="new-password"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-muted-foreground mb-1">
                Schlüssel bestätigen
              </span>
              <input
                type="password"
                required
                minLength={10}
                value={keyConfirm}
                onChange={(e) => setKeyConfirm(e.target.value)}
                className="w-full rounded-lg bg-input px-3 py-2 text-sm"
                autoComplete="new-password"
              />
            </label>
            <p className="text-[11px] text-muted-foreground">
              Bewahre deinen Schlüssel sicher auf. Bei Verlust kannst du ihn nur über die
              hinterlegte E-Mail zurücksetzen.
            </p>
          </>
        )}

        {mode === "login" && (
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
        )}

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
          {mode === "login" ? <KeyRound className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          {mode === "setup"
            ? "Admin einrichten"
            : mode === "login"
              ? "Admin öffnen"
              : "Reset-Link senden"}
        </button>

        <div className="flex flex-col gap-1.5">
          {mode === "login" && (
            <button
              type="button"
              onClick={() => {
                setMode("recovery");
                setErr(null);
              }}
              className="w-full text-xs text-muted-foreground hover:text-foreground min-h-9"
            >
              Admin-Schlüssel vergessen?
            </button>
          )}
          {mode === "recovery" && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErr(null);
              }}
              className="w-full text-xs text-muted-foreground hover:text-foreground min-h-9"
            >
              Zurück zum Admin-Login
            </button>
          )}
          {mode === "setup" && readLs(ADMIN_EMAIL_KEY) && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErr(null);
              }}
              className="w-full text-xs text-muted-foreground hover:text-foreground min-h-9"
            >
              Zurück zum Admin-Login
            </button>
          )}
        </div>
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
