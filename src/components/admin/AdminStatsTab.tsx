import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Globe2,
  Activity,
  RefreshCw,
} from "lucide-react";
import { adminGetStats } from "@/lib/adminContent.functions";

type Stats = Awaited<ReturnType<typeof adminGetStats>>;

const RANGES = [
  { days: 7, label: "7 Tage" },
  { days: 30, label: "30 Tage" },
  { days: 90, label: "90 Tage" },
];

const COUNTRY_NAMES: Record<string, string> = {
  DE: "Deutschland",
  AT: "Österreich",
  CH: "Schweiz",
  NL: "Niederlande",
  FR: "Frankreich",
  IT: "Italien",
  ES: "Spanien",
  GB: "UK",
  US: "USA",
  PL: "Polen",
  CZ: "Tschechien",
  BE: "Belgien",
  DK: "Dänemark",
  SE: "Schweden",
};

function flag(cc: string): string {
  if (!cc || cc.length !== 2) return "🏳️";
  const codePoints = [...cc.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function AdminStatsTab() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load(d: number) {
    setLoading(true);
    setErr(null);
    try {
      const res = await adminGetStats({ data: { days: d } });
      setStats(res);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(days);
  }, [days]);

  const maxByDay = useMemo(
    () => Math.max(1, ...(stats?.byDay ?? []).map((d) => d.count)),
    [stats],
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        {RANGES.map((r) => (
          <button
            key={r.days}
            onClick={() => setDays(r.days)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              days === r.days
                ? "bg-primary text-primary-foreground"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
        <button
          onClick={() => load(days)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Aktualisieren
        </button>
      </div>

      {err && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {err}
        </div>
      )}
      {loading && !stats ? (
        <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
          Lade Statistiken…
        </div>
      ) : !stats ? null : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Card icon={<BarChart3 className="h-4 w-4" />} label="Aufrufe" value={stats.totals.views} />
            <Card icon={<Activity className="h-4 w-4" />} label="Sessions" value={stats.totals.sessions} />
            <Card icon={<BarChart3 className="h-4 w-4" />} label="Events" value={stats.totals.events} />
          </div>

          {stats.byDay.length > 0 && (
            <section className="rounded-2xl glass p-4">
              <h3 className="text-sm font-semibold mb-3">Verlauf</h3>
              <div className="flex items-end gap-1 h-28">
                {stats.byDay.map((d) => (
                  <div
                    key={d.day}
                    className="flex-1 bg-primary/40 hover:bg-primary/70 rounded-t-sm relative group"
                    style={{ height: `${(d.count / maxByDay) * 100}%` }}
                    title={`${d.day}: ${d.count}`}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
                <span>{stats.byDay[0]?.day}</span>
                <span>{stats.byDay[stats.byDay.length - 1]?.day}</span>
              </div>
            </section>
          )}

          <section className="rounded-2xl glass p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Top Routen
            </h3>
            {stats.topPaths.length === 0 ? (
              <p className="text-xs text-muted-foreground">Noch keine Daten.</p>
            ) : (
              <ul className="space-y-1.5">
                {stats.topPaths.map((p) => (
                  <Bar key={p.key} label={p.key} value={p.count} max={stats.topPaths[0].count} />
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl glass p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Globe2 className="h-4 w-4" /> Länder
            </h3>
            {stats.topCountries.length === 0 ? (
              <p className="text-xs text-muted-foreground">Keine Länder erkannt (lokal/Preview?).</p>
            ) : (
              <ul className="space-y-1.5">
                {stats.topCountries.map((c) => (
                  <Bar
                    key={c.key}
                    label={`${flag(c.key)} ${COUNTRY_NAMES[c.key] ?? c.key}`}
                    value={c.count}
                    max={stats.topCountries[0].count}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl glass p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Funktions-Events
            </h3>
            {stats.topEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground">Noch keine Events.</p>
            ) : (
              <ul className="space-y-1.5">
                {stats.topEvents.map((e) => (
                  <Bar key={e.key} label={e.key} value={e.count} max={stats.topEvents[0].count} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Card({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl glass p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value.toLocaleString("de-DE")}</div>
    </div>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <li className="text-xs">
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <span className="truncate">{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}
