import { useEffect, useState } from "react";
import { Activity, RefreshCw, Globe2, User, Pill } from "lucide-react";
import { adminGetActiveSessions } from "@/lib/adminContent.functions";

type Data = Awaited<ReturnType<typeof adminGetActiveSessions>>;

function relTime(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.round(diff / 1000);
  if (s < 60) return `vor ${s}s`;
  const m = Math.round(s / 60);
  return `vor ${m}min`;
}

function flag(cc: string | null): string {
  if (!cc || cc.length !== 2) return "🏳️";
  const cps = [...cc.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0));
  return String.fromCodePoint(...cps);
}

export function AdminSessionsTab() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await adminGetActiveSessions();
      setData(res);
      if (res.authRequired) setErr("Admin-Sitzung abgelaufen. Bitte neu einloggen.");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted-foreground flex-1">
          Aktualisiert sich alle 15 Sekunden. Live-Besucher = aktiv in den letzten 5 Minuten.
        </p>
        <button
          onClick={() => void load()}
          className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Aktualisieren
        </button>
      </div>

      {err && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {err}
        </div>
      )}

      {!data ? (
        <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
          Lade Live-Daten…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Card icon={<Globe2 className="h-4 w-4" />} label="Live-Besucher" value={data.liveVisitors.length} />
            <Card icon={<User className="h-4 w-4" />} label="Eingeloggt" value={data.authUsers.length} />
            <Card icon={<Pill className="h-4 w-4" />} label="Substanz-Sessions" value={data.substanceSessions.length} />
          </div>

          <section className="rounded-2xl glass p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Globe2 className="h-4 w-4" /> Live-Besucher (≤ 5 Min)
            </h3>
            {data.liveVisitors.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aktuell niemand online.</p>
            ) : (
              <ul className="space-y-1.5">
                {data.liveVisitors.map((v) => (
                  <li key={v.sid} className="flex items-center gap-2 text-xs rounded-lg bg-muted/20 px-2 py-1.5">
                    <span className="text-base">{flag(v.country)}</span>
                    <span className="truncate flex-1 font-mono">{v.path}</span>
                    <span className="text-muted-foreground tabular-nums">{v.views}× · {relTime(v.lastSeen)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl glass p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" /> Eingeloggte Accounts (≤ 30 Min)
            </h3>
            {data.authUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground">Niemand kürzlich eingeloggt.</p>
            ) : (
              <ul className="space-y-1.5">
                {data.authUsers.map((u) => (
                  <li key={u.id} className="flex items-center gap-2 text-xs rounded-lg bg-muted/20 px-2 py-1.5">
                    <span className="truncate flex-1">{u.email ?? u.id}</span>
                    {u.lastSignIn && (
                      <span className="text-muted-foreground">{relTime(u.lastSignIn)}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl glass p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Pill className="h-4 w-4" /> Aktive Substanz-Sessions
            </h3>
            {data.substanceSessions.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Aktuell keine aktive Konsum-Session gemeldet.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {data.substanceSessions.map((s, i) => (
                  <li
                    key={`${s.sid}-${i}`}
                    className="flex items-center gap-2 text-xs rounded-lg bg-muted/20 px-2 py-1.5"
                  >
                    <Activity className="h-3.5 w-3.5 text-secondary animate-pulse" />
                    <span className="font-medium flex-1">{s.substance}</span>
                    <span className="text-muted-foreground">{relTime(s.lastSeen)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl glass p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
