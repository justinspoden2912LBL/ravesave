import { useEffect, useState } from "react";
import {
  Users,
  RefreshCw,
  Trash2,
  KeyRound,
  Shield,
  ShieldOff,
  Ban,
  CheckCircle2,
  Database,
  AlertTriangle,
} from "lucide-react";
import {
  adminListAuthUsers,
  adminDeleteAuthUser,
  adminSendPasswordReset,
  adminSetUserBan,
  adminSetAdminRole,
  adminPurgeAnalytics,
  adminAnalyticsSummary,
} from "@/lib/adminContent.functions";
import { toast } from "sonner";

type UsersData = Awaited<ReturnType<typeof adminListAuthUsers>>;
type SummaryData = Awaited<ReturnType<typeof adminAnalyticsSummary>>;

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function AdminUsersTab() {
  const [data, setData] = useState<UsersData | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  // Purge form
  const [purgeDays, setPurgeDays] = useState<string>("90");
  const [purgeSession, setPurgeSession] = useState<string>("");

  async function load() {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([
        adminListAuthUsers({ data: { page: 1, perPage: 200, search } }),
        adminAnalyticsSummary(),
      ]);
      setData(u);
      setSummary(s);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function deleteUser(userId: string, email: string | null) {
    if (
      !window.confirm(
        `Nutzer ${email ?? userId} wirklich endgültig löschen? Inhalte bleiben anonymisiert erhalten.`,
      )
    )
      return;
    setBusy(userId);
    try {
      await adminDeleteAuthUser({ data: { userId } });
      toast.success("Nutzer gelöscht");
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function sendReset(email: string | null) {
    if (!email) return;
    setBusy(email);
    try {
      await adminSendPasswordReset({ data: { email } });
      toast.success(`Passwort-Reset-Link für ${email} erzeugt`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function toggleBan(userId: string, banned: boolean) {
    setBusy(userId);
    try {
      await adminSetUserBan({ data: { userId, banned: !banned } });
      toast.success(banned ? "Nutzer entsperrt" : "Nutzer gesperrt");
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function toggleAdmin(userId: string, isAdmin: boolean) {
    if (
      isAdmin &&
      !window.confirm(
        "Admin-Rolle wirklich entfernen? Der Nutzer verliert allen Admin-Zugriff über sein Konto (Server-Admin-Key bleibt unverändert).",
      )
    )
      return;
    setBusy(userId);
    try {
      await adminSetAdminRole({ data: { userId, isAdmin: !isAdmin } });
      toast.success(isAdmin ? "Admin-Rolle entfernt" : "Admin-Rolle vergeben");
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function purge(mode: "old" | "session" | "all") {
    let confirmMsg = "";
    let payload: { olderThanDays?: number; sessionId?: string; all?: boolean } = {};
    if (mode === "all") {
      confirmMsg =
        "ALLE Analytics-Daten (page_views + usage_events) löschen? Das kann nicht rückgängig gemacht werden.";
      payload = { all: true };
    } else if (mode === "old") {
      const d = parseInt(purgeDays, 10);
      if (!d || d < 1) return toast.error("Tage angeben");
      confirmMsg = `Alle Analytics-Einträge älter als ${d} Tage löschen?`;
      payload = { olderThanDays: d };
    } else {
      if (!purgeSession.trim()) return toast.error("Session-ID angeben");
      confirmMsg = `Daten der Session „${purgeSession}" löschen?`;
      payload = { sessionId: purgeSession.trim() };
    }
    if (!window.confirm(confirmMsg)) return;
    setBusy("purge");
    try {
      const r = await adminPurgeAnalytics({ data: payload });
      if (!r.ok) {
        toast.error("Nicht authentifiziert");
        return;
      }
      toast.success(
        `Gelöscht: ${r.deletedViews} Page-Views · ${r.deletedEvents} Events`,
      );
      void load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const adminSet = new Set(data?.adminIds ?? []);

  return (
    <div className="space-y-5">
      {/* Auth users */}
      <section className="rounded-2xl glass p-5 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold flex-1">Auth-Nutzer</h2>
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Aktualisieren
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void load()}
            placeholder="E-Mail oder User-ID…"
            className="flex-1 min-w-[200px] rounded-lg bg-input px-3 py-2 text-sm"
          />
          <button
            onClick={() => void load()}
            className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold"
          >
            Suchen
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Lade…</p>
        ) : !data || data.users.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Nutzer gefunden.</p>
        ) : (
          <ul className="space-y-2">
            {data.users.map((u) => {
              const isAdmin = adminSet.has(u.id);
              const isBusy = busy === u.id || busy === u.email;
              return (
                <li
                  key={u.id}
                  className="rounded-xl bg-muted/20 p-3 flex items-start gap-3 flex-wrap"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {u.email ?? "(keine E-Mail)"}
                      </span>
                      {isAdmin && (
                        <span className="text-[10px] rounded-full bg-primary/20 text-primary px-2 py-0.5 inline-flex items-center gap-1">
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      )}
                      {u.banned && (
                        <span className="text-[10px] rounded-full bg-destructive/20 text-destructive px-2 py-0.5 inline-flex items-center gap-1">
                          <Ban className="h-3 w-3" /> gesperrt
                        </span>
                      )}
                      {!u.emailConfirmed && (
                        <span className="text-[10px] rounded-full bg-amber-500/20 text-amber-500 px-2 py-0.5">
                          unbestätigt
                        </span>
                      )}
                      {u.provider && u.provider !== "email" && (
                        <span className="text-[10px] rounded-full bg-secondary/20 text-secondary px-2 py-0.5">
                          {u.provider}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 font-mono truncate">
                      {u.id}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Erstellt {fmtDate(u.createdAt)} · zuletzt {fmtDate(u.lastSignIn)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      onClick={() => void toggleAdmin(u.id, isAdmin)}
                      disabled={isBusy}
                      title={isAdmin ? "Admin-Rolle entziehen" : "Admin-Rolle vergeben"}
                      className="rounded-full p-2 hover:bg-primary/15 text-muted-foreground hover:text-primary disabled:opacity-50"
                    >
                      {isAdmin ? (
                        <ShieldOff className="h-4 w-4" />
                      ) : (
                        <Shield className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => void toggleBan(u.id, u.banned)}
                      disabled={isBusy}
                      title={u.banned ? "Entsperren" : "Sperren"}
                      className="rounded-full p-2 hover:bg-destructive/15 text-muted-foreground hover:text-destructive disabled:opacity-50"
                    >
                      {u.banned ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => void sendReset(u.email)}
                      disabled={isBusy || !u.email}
                      title="Passwort-Reset-Link erzeugen"
                      className="rounded-full p-2 hover:bg-muted/40 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => void deleteUser(u.id, u.email)}
                      disabled={isBusy}
                      title="Nutzer löschen"
                      className="rounded-full p-2 hover:bg-destructive/20 text-muted-foreground hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Analytics purge */}
      <section className="rounded-2xl glass p-5 space-y-3 border border-destructive/20">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold">Analytics-Daten löschen (DSGVO)</h2>
        </div>
        {summary && !summary.authRequired && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-muted/30 p-2">
              <div className="font-bold text-base">{summary.views.toLocaleString("de-DE")}</div>
              <div className="text-muted-foreground">Page-Views</div>
            </div>
            <div className="rounded-lg bg-muted/30 p-2">
              <div className="font-bold text-base">{summary.events.toLocaleString("de-DE")}</div>
              <div className="text-muted-foreground">Events</div>
            </div>
            <div className="rounded-lg bg-muted/30 p-2">
              <div className="font-bold text-base">
                {summary.oldestView
                  ? new Date(summary.oldestView).toLocaleDateString("de-DE")
                  : "—"}
              </div>
              <div className="text-muted-foreground">älteste</div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex gap-2 items-center flex-wrap">
            <label className="text-xs text-muted-foreground">Älter als</label>
            <input
              type="number"
              min={1}
              max={3650}
              value={purgeDays}
              onChange={(e) => setPurgeDays(e.target.value)}
              className="w-20 rounded-lg bg-input px-2 py-1.5 text-sm"
            />
            <span className="text-xs text-muted-foreground">Tage</span>
            <button
              onClick={() => void purge("old")}
              disabled={busy === "purge"}
              className="ml-auto rounded-full bg-destructive/20 text-destructive px-3 py-1.5 text-xs font-medium hover:bg-destructive/30 disabled:opacity-50"
            >
              Löschen
            </button>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            <label className="text-xs text-muted-foreground">Session-ID</label>
            <input
              type="text"
              value={purgeSession}
              onChange={(e) => setPurgeSession(e.target.value)}
              placeholder="sess_…"
              className="flex-1 min-w-[180px] rounded-lg bg-input px-2 py-1.5 text-sm font-mono"
            />
            <button
              onClick={() => void purge("session")}
              disabled={busy === "purge"}
              className="rounded-full bg-destructive/20 text-destructive px-3 py-1.5 text-xs font-medium hover:bg-destructive/30 disabled:opacity-50"
            >
              Löschen
            </button>
          </div>

          <button
            onClick={() => void purge("all")}
            disabled={busy === "purge"}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-50"
          >
            <AlertTriangle className="h-4 w-4" />
            ALLE Analytics-Daten löschen
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Wirkt nur auf <code>page_views</code> + <code>usage_events</code>. Inhalte
          (Beiträge, Texte, Substanzen, Flags) bleiben unangetastet.
        </p>
      </section>
    </div>
  );
}
