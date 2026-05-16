import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { SUBSTANCES, assessPair, overallRisk, RISK_META, CATEGORY_LABEL, explainRisk } from "@/lib/substances";
import { loadProfile, getDetailLevel, type DetailLevel } from "@/lib/profile";

export const Route = createFileRoute("/mix")({
  component: MixPage,
  head: () => ({ meta: [{ title: "Mischkonsum-Check — trace" }] }),
});

function MixPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [profileDetail, setProfileDetail] = useState<DetailLevel>("lay");
  const [detail, setDetail] = useState<DetailLevel>("lay");
  useEffect(() => {
    const d = getDetailLevel(loadProfile());
    setProfileDetail(d);
    setDetail(d);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return SUBSTANCES.filter(
      (s) =>
        !selected.includes(s.id) &&
        (!q || s.name.toLowerCase().includes(q) || s.aliases.some((a) => a.toLowerCase().includes(q)))
    );
  }, [query, selected]);

  const pairs = useMemo(() => {
    const out: { a: string; b: string; risk: ReturnType<typeof assessPair> }[] = [];
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        out.push({ a: selected[i], b: selected[j], risk: assessPair(selected[i], selected[j]) });
      }
    }
    return out;
  }, [selected]);

  const overall = overallRisk(selected);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Mischkonsum-Check</h1>
        <p className="text-muted-foreground mt-1">
          Wähle 2 oder mehr Substanzen — wir zeigen das paarweise Risiko, basierend auf TripSit, EMCDDA und Fachliteratur.
        </p>
      </header>

      {/* Selected */}
      <div className="rounded-2xl glass p-5">
        <div className="flex flex-wrap items-center gap-2 min-h-[2.5rem]">
          {selected.length === 0 && <span className="text-sm text-muted-foreground">Noch nichts ausgewählt.</span>}
          {selected.map((id) => {
            const s = SUBSTANCES.find((x) => x.id === id)!;
            return (
              <button
                key={id}
                onClick={() => setSelected(selected.filter((x) => x !== id))}
                className="flex items-center gap-1.5 rounded-full bg-aurora animate-aurora px-3 py-1 text-xs text-primary-foreground"
              >
                {s.name}
                <X className="h-3 w-3" />
              </button>
            );
          })}
        </div>

        {selected.length >= 2 && (
          <div className={`mt-5 rounded-xl border p-4 ${RISK_META[overall.level].bg}`}>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Höchstes Risiko</div>
            <div className={`mt-1 text-2xl font-bold ${RISK_META[overall.level].color}`}>
              {RISK_META[overall.level].label}
            </div>
            <p className="mt-1 text-sm">{overall.reason}</p>
          </div>
        )}
      </div>

      {/* Pair breakdown */}
      {pairs.length > 0 && (
        <div className="rounded-2xl glass p-5">
          <h2 className="font-semibold mb-3">Alle Paare</h2>
          <ul className="space-y-2">
            {pairs.map(({ a, b, risk }) => {
              const sa = SUBSTANCES.find((s) => s.id === a)!;
              const sb = SUBSTANCES.find((s) => s.id === b)!;
              return (
                <li key={a + b} className={`rounded-xl border p-3 ${RISK_META[risk.level].bg}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-medium">{sa.name} + {sb.name}</span>
                    <span className={`text-xs font-semibold ${RISK_META[risk.level].color}`}>
                      {RISK_META[risk.level].label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{risk.reason}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Picker */}
      <div className="rounded-2xl glass p-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Substanz suchen..."
          className="w-full rounded-lg bg-input px-3 py-2 text-sm mb-4"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[420px] overflow-auto pr-1">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected([...selected, s.id])}
              className="text-left rounded-xl glass px-3 py-2 hover:bg-muted/40 transition"
            >
              <div className="font-medium text-sm">{s.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                {CATEGORY_LABEL[s.category]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-2xl glass p-5">
        <h3 className="font-semibold mb-3">Legende</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {(Object.keys(RISK_META) as Array<keyof typeof RISK_META>).map((k) => (
            <div key={k} className={`rounded-lg border px-3 py-2 ${RISK_META[k].bg}`}>
              <span className={`font-semibold ${RISK_META[k].color}`}>{RISK_META[k].label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
