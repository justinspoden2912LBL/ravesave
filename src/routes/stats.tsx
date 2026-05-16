import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SUBSTANCES, CATEGORY_LABEL } from "@/lib/substances";
import { loadEntries, type LogEntry } from "@/lib/log";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
  head: () => ({ meta: [{ title: "Statistik — trace" }] }),
});

function StatsPage() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  useEffect(() => setEntries(loadEntries()), []);

  const stats = useMemo(() => {
    const bySubstance: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byDay: Record<string, number> = {};
    let moodSum = 0, moodCount = 0;

    entries.forEach((e) => {
      bySubstance[e.substanceId] = (bySubstance[e.substanceId] ?? 0) + 1;
      const s = SUBSTANCES.find((x) => x.id === e.substanceId);
      if (s) byCategory[s.category] = (byCategory[s.category] ?? 0) + 1;
      const day = new Date(e.timestamp).toISOString().slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + 1;
      if (e.mood) { moodSum += e.mood; moodCount++; }
    });

    const last30: { day: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      last30.push({ day: d, count: byDay[d] ?? 0 });
    }

    return {
      total: entries.length,
      uniqueSubstances: Object.keys(bySubstance).length,
      avgMood: moodCount ? (moodSum / moodCount).toFixed(1) : "—",
      bySubstance: Object.entries(bySubstance).sort((a, b) => b[1] - a[1]),
      byCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1]),
      last30,
    };
  }, [entries]);

  const maxDay = Math.max(1, ...stats.last30.map((d) => d.count));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Statistik</h1>
        <p className="text-muted-foreground mt-1">Muster aus deinem Logbuch. Bleibt zu 100% lokal.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Einträge gesamt" value={stats.total} />
        <Stat label="Verschiedene Substanzen" value={stats.uniqueSubstances} />
        <Stat label="Ø Stimmung (1–5)" value={stats.avgMood} />
      </div>

      {/* Last 30 days */}
      <div className="rounded-2xl glass p-5">
        <h2 className="font-semibold mb-4">Letzte 30 Tage</h2>
        <div className="flex items-end gap-1 h-32">
          {stats.last30.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1" title={`${d.day}: ${d.count}`}>
              <div
                className="w-full rounded-t bg-aurora animate-aurora opacity-90"
                style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count ? 4 : 0 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* By substance */}
      {stats.bySubstance.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl glass p-5">
            <h2 className="font-semibold mb-4">Häufigste Substanzen</h2>
            <ul className="space-y-2">
              {stats.bySubstance.slice(0, 10).map(([id, n]) => {
                const s = SUBSTANCES.find((x) => x.id === id);
                const pct = (n / stats.total) * 100;
                return (
                  <li key={id}>
                    <div className="flex justify-between text-sm">
                      <span>{s?.name ?? id}</span>
                      <span className="text-muted-foreground">{n}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-aurora animate-aurora" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl glass p-5">
            <h2 className="font-semibold mb-4">Nach Kategorie</h2>
            <ul className="space-y-2">
              {stats.byCategory.map(([cat, n]) => {
                const pct = (n / stats.total) * 100;
                return (
                  <li key={cat}>
                    <div className="flex justify-between text-sm">
                      <span>{CATEGORY_LABEL[cat as keyof typeof CATEGORY_LABEL]}</span>
                      <span className="text-muted-foreground">{n}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-aurora animate-aurora" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="rounded-2xl glass p-10 text-center text-muted-foreground">
          Noch keine Daten. Lege im Protokoll deinen ersten Eintrag an.
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl glass p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-bold text-aurora bg-aurora bg-clip-text" style={{ WebkitTextFillColor: "transparent" }}>
        {value}
      </div>
    </div>
  );
}
