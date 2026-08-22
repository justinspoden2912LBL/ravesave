import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Globe2,
  Activity,
  RefreshCw,
  Users,
  Repeat,
  MousePointerClick,
  Clock,
  ExternalLink,
  CalendarDays,
  Timer,
  Route as RouteIcon,
  LogIn,
  Smartphone,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { adminGetStats } from "@/lib/adminContent.functions";

type Stats = Awaited<ReturnType<typeof adminGetStats>>;

const RANGES = [
  { days: 7, label: "7 Tage" },
  { days: 30, label: "30 Tage" },
  { days: 90, label: "90 Tage" },
  { days: 365, label: "1 Jahr" },
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

const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
const fmtNum = (n: number) => n.toLocaleString("de-DE", { maximumFractionDigits: 1 });
const fmtDuration = (s: number) => {
  if (!s || s < 1) return "0s";
  const m = Math.floor(s / 60);
  const rest = Math.round(s % 60);
  return m > 0 ? `${m}m ${rest}s` : `${rest}s`;
};

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
      if (res.authRequired) {
        setErr("Admin-Sitzung abgelaufen. Bitte abmelden und neu einloggen.");
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(days);
  }, [days]);

  const maxByDay = useMemo(() => Math.max(1, ...(stats?.byDay ?? []).map((d) => d.count)), [stats]);
  const maxSessionsByDay = useMemo(
    () => Math.max(1, ...(stats?.sessionsByDay ?? []).map((d) => d.count)),
    [stats],
  );
  const maxEventsByDay = useMemo(
    () => Math.max(1, ...(stats?.eventsByDay ?? []).map((d) => d.count)),
    [stats],
  );
  const maxByHour = useMemo(() => Math.max(1, ...(stats?.byHour ?? []).map((d) => d.count)), [stats]);
  const maxByWeekday = useMemo(
    () => Math.max(1, ...(stats?.byWeekday ?? []).map((d) => d.count)),
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
            <Card
              icon={<BarChart3 className="h-4 w-4" />}
              label="Aufrufe"
              value={stats.totals.views}
              delta={stats.delta.views}
              prev={stats.prev.views}
            />
            <Card
              icon={<Activity className="h-4 w-4" />}
              label="Sessions"
              value={stats.totals.sessions}
              delta={stats.delta.sessions}
              prev={stats.prev.sessions}
            />
            <Card
              icon={<BarChart3 className="h-4 w-4" />}
              label="Events"
              value={stats.totals.events}
              delta={stats.delta.events}
              prev={stats.prev.events}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Card
              icon={<Users className="h-4 w-4" />}
              label="Neue Besucher"
              value={stats.totals.newSessions}
            />
            <Card
              icon={<Repeat className="h-4 w-4" />}
              label="Wiederkehrend"
              value={stats.totals.returningSessions}
              hint={fmtPct(stats.totals.returningRate)}
            />
            <Card
              icon={<MousePointerClick className="h-4 w-4" />}
              label="Ø Aufrufe/Session"
              value={stats.totals.avgViewsPerSession}
              format={fmtNum}
            />
            <Card
              icon={<Activity className="h-4 w-4" />}
              label="Bounce-Rate"
              value={stats.totals.bounceRate}
              format={fmtPct}
            />
            <Card
              icon={<Timer className="h-4 w-4" />}
              label="Ø Sitzungsdauer"
              value={stats.totals.avgSessionSeconds}
              format={fmtDuration}
            />
            <Card
              icon={<RouteIcon className="h-4 w-4" />}
              label="Eindeutige Routen"
              value={stats.totals.uniquePaths}
            />
            <Card
              icon={<Smartphone className="h-4 w-4" />}
              label="PWA-Installs"
              value={stats.totals.pwaInstalls}
            />
            <Card
              icon={<LogIn className="h-4 w-4" />}
              label="Einstiegsseiten"
              value={stats.topEntryPaths.length}
            />
          </div>

          {stats.byDay.length > 0 && (
            <section className="rounded-2xl glass p-4">
              <h3 className="text-sm font-semibold mb-3">Verlauf (Aufrufe vs. Sessions)</h3>
              <div className="flex items-end gap-1 h-28">
                {stats.byDay.map((d, i) => {
                  const sess = stats.sessionsByDay[i]?.count ?? 0;
                  return (
                    <div key={d.day} className="flex-1 flex flex-col-reverse gap-0.5 h-full">
                      <div
                        className="bg-primary/40 hover:bg-primary/70 rounded-t-sm"
                        style={{ height: `${(d.count / maxByDay) * 100}%` }}
                        title={`${d.day}: ${d.count} Aufrufe`}
                      />
                      <div
                        className="bg-secondary/50 hover:bg-secondary/80 rounded-t-sm"
                        style={{ height: `${(sess / maxSessionsByDay) * 60}%` }}
                        title={`${d.day}: ${sess} Sessions`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
                <span>{stats.byDay[0]?.day}</span>
                <span>{stats.byDay[stats.byDay.length - 1]?.day}</span>
              </div>
              <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-primary/60" /> Aufrufe
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-secondary/70" /> Sessions
                </span>
              </div>
            </section>
          )}

          {stats.eventsByDay.length > 0 && (
            <section className="rounded-2xl glass p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" /> Events pro Tag
              </h3>
              <div className="flex items-end gap-1 h-20">
                {stats.eventsByDay.map((d) => (
                  <div
                    key={d.day}
                    className="flex-1 bg-secondary/50 hover:bg-secondary/80 rounded-t-sm"
                    style={{ height: `${(d.count / maxEventsByDay) * 100}%` }}
                    title={`${d.day}: ${d.count} Events`}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
                <span>{stats.eventsByDay[0]?.day}</span>
                <span>{stats.eventsByDay[stats.eventsByDay.length - 1]?.day}</span>
              </div>
            </section>
          )}

          <section className="rounded-2xl glass p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> Wochentage
            </h3>
            <div className="flex items-end gap-1.5 h-24">
              {stats.byWeekday.map((w) => (
                <div key={w.weekday} className="flex-1 flex flex-col justify-end h-full">
                  <div
                    className="bg-gradient-to-t from-primary/40 to-secondary/60 rounded-t-sm"
                    style={{ height: `${(w.count / maxByWeekday) * 100}%` }}
                    title={`${w.label}: ${w.count} Aufrufe`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1 flex gap-1.5 text-[10px] text-muted-foreground">
              {stats.byWeekday.map((w) => (
                <span key={w.weekday} className="flex-1 text-center">
                  {w.label}
                </span>
              ))}
            </div>
          </section>

          {stats.byHour.some((h) => h.count > 0) && (
            <section className="rounded-2xl glass p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Tageszeit (UTC)
              </h3>
              <div className="flex items-end gap-1 h-20">
                {stats.byHour.map((h) => (
                  <div
                    key={h.hour}
                    className="flex-1 bg-primary/40 hover:bg-primary/70 rounded-t-sm"
                    style={{ height: `${(h.count / maxByHour) * 100}%` }}
                    title={`${h.hour}:00 — ${h.count} Aufrufe`}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
                <span>00</span>
                <span>06</span>
                <span>12</span>
                <span>18</span>
                <span>23</span>
              </div>
            </section>
          )}

          <section className="rounded-2xl glass p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" /> Top Referrer
            </h3>
            {stats.topReferrers.length === 0 ? (
              <p className="text-xs text-muted-foreground">Noch keine Referrer.</p>
            ) : (
              <ul className="space-y-1.5">
                {stats.topReferrers.map((r) => (
                  <Bar key={r.key} label={r.key} value={r.count} max={stats.topReferrers[0].count} />
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl glass p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Top Routen
            </h3>
            {stats.topPaths.length === 0 ? (
              <p className="text-xs text-muted-foreground">Noch keine Daten.</p>
            ) : (
              <Table
                cols={["Route", "Aufrufe", "Sessions", "Ø/Session", "Anteil"]}
                rows={stats.topPaths.map((p) => [
                  p.key,
                  p.count.toLocaleString("de-DE"),
                  p.sessions.toLocaleString("de-DE"),
                  p.sessions > 0 ? fmtNum(p.count / p.sessions) : "–",
                  stats.totals.views > 0 ? fmtPct(p.count / stats.totals.views) : "–",
                ])}
              />
            )}
          </section>

          <section className="rounded-2xl glass p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <LogIn className="h-4 w-4" /> Top Einstiegsseiten
            </h3>
            {stats.topEntryPaths.length === 0 ? (
              <p className="text-xs text-muted-foreground">Noch keine Daten.</p>
            ) : (
              <Table
                cols={["Einstieg", "Sessions", "Anteil"]}
                rows={stats.topEntryPaths.map((p) => [
                  p.key,
                  p.count.toLocaleString("de-DE"),
                  stats.totals.sessions > 0 ? fmtPct(p.count / stats.totals.sessions) : "–",
                ])}
              />
            )}
          </section>

          <section className="rounded-2xl glass p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Globe2 className="h-4 w-4" /> Länder
            </h3>
            {stats.topCountries.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Keine Länder erkannt (lokal/Preview?).
              </p>
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
              <Table
                cols={["Event", "Anzahl", "Anteil"]}
                rows={stats.topEvents.map((e) => [
                  e.key,
                  e.count.toLocaleString("de-DE"),
                  stats.totals.events > 0 ? fmtPct(e.count / stats.totals.events) : "–",
                ])}
              />
            )}
          </section>

          <section className="rounded-2xl glass p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" /> Event-Details
            </h3>
            {stats.topEventDetails.length === 0 ? (
              <p className="text-xs text-muted-foreground">Noch keine Details erfasst.</p>
            ) : (
              <Table
                cols={["Event → Detail", "Anzahl"]}
                rows={stats.topEventDetails.map((e) => [e.key, e.count.toLocaleString("de-DE")])}
              />
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
  hint,
  format,
  delta,
  prev,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
  format?: (n: number) => string;
  delta?: number;
  prev?: number;
}) {
  const display = format ? format(value) : value.toLocaleString("de-DE");
  const up = (delta ?? 0) >= 0;
  return (
    <div className="rounded-2xl glass p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xl font-bold tabular-nums">{display}</div>
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
      {delta !== undefined && (
        <div
          className={`mt-0.5 inline-flex items-center gap-1 text-[10px] tabular-nums ${
            up ? "text-primary" : "text-destructive"
          }`}
          title={prev !== undefined ? `Vorzeitraum: ${prev.toLocaleString("de-DE")}` : undefined}
        >
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {`${up ? "+" : ""}${(delta * 100).toFixed(0)}%`}
        </div>
      )}
    </div>
  );
}

function Table({ cols, rows }: { cols: string[]; rows: string[][] }) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground">
            {cols.map((c, i) => (
              <th
                key={c}
                className={`pb-1.5 font-medium ${i === 0 ? "text-left" : "text-right"} px-1`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-t border-border/40">
              {r.map((cell, ci) => (
                <td
                  key={ci}
                  className={`py-1.5 px-1 ${
                    ci === 0
                      ? "text-left max-w-[180px] truncate"
                      : "text-right tabular-nums text-muted-foreground"
                  }`}
                  title={ci === 0 ? cell : undefined}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
