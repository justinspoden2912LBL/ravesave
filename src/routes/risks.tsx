import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Search, ShieldAlert } from "lucide-react";
import {
  SUBSTANCES,
  CATEGORY_LABEL,
  RISK_META,
  assessPair,
  explainRisk,
  type RiskLevel,
  type SubstanceCategory,
} from "@/lib/substances";
import { loadProfile, getDetailLevel, type DetailLevel } from "@/lib/profile";

export const Route = createFileRoute("/risks")({
  component: RisksPage,
  head: () => ({
    meta: [
      { title: "Risiko-Übersicht — trace" },
      { name: "description", content: "Alle Mischkonsum-Risiken pro Substanz auf einen Blick." },
    ],
  }),
});

// Sortierung von höchstem zu niedrigstem Risiko
const RISK_ORDER: RiskLevel[] = ["danger", "unsafe", "caution", "unknown", "synergy", "safe"];

function RisksPage() {
  const [selectedId, setSelectedId] = useState<string>(SUBSTANCES[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<SubstanceCategory | "all">("all");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  const [profileDetail, setProfileDetail] = useState<DetailLevel>("lay");
  const [detail, setDetail] = useState<DetailLevel>("lay");
  useEffect(() => {
    const d = getDetailLevel(loadProfile());
    setProfileDetail(d);
    setDetail(d);
  }, []);

  const selected = SUBSTANCES.find((s) => s.id === selectedId);

  const substanceList = useMemo(() => {
    const q = query.toLowerCase().trim();
    return SUBSTANCES.filter(
      (s) =>
        (!q || s.name.toLowerCase().includes(q) || s.aliases.some((a) => a.toLowerCase().includes(q))),
    );
  }, [query]);

  // Alle Paarungen für die gewählte Substanz
  const pairings = useMemo(() => {
    if (!selected) return [];
    return SUBSTANCES.filter((s) => s.id !== selected.id)
      .map((other) => ({
        other,
        risk: assessPair(selected.id, other.id),
      }))
      .sort((a, b) => {
        const ra = RISK_ORDER.indexOf(a.risk.level);
        const rb = RISK_ORDER.indexOf(b.risk.level);
        if (ra !== rb) return ra - rb;
        return a.other.name.localeCompare(b.other.name);
      });
  }, [selected]);

  // Gruppiert nach Risiko-Level (für die "Hotspots"-Ansicht)
  const grouped = useMemo(() => {
    const g: Record<RiskLevel, typeof pairings> = {
      danger: [], unsafe: [], caution: [], unknown: [], synergy: [], safe: [],
    };
    for (const p of pairings) {
      if (catFilter !== "all" && p.other.category !== catFilter) continue;
      if (riskFilter !== "all" && p.risk.level !== riskFilter) continue;
      g[p.risk.level].push(p);
    }
    return g;
  }, [pairings, catFilter, riskFilter]);

  const cats = Array.from(new Set(SUBSTANCES.map((s) => s.category)));

  // Counts pro Risiko-Level für die Zusammenfassung
  const counts = useMemo(() => {
    const c: Record<RiskLevel, number> = { danger: 0, unsafe: 0, caution: 0, unknown: 0, synergy: 0, safe: 0 };
    for (const p of pairings) c[p.risk.level]++;
    return c;
  }, [pairings]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldAlert className="h-7 w-7 text-aurora" />
          Risiko-Übersicht
        </h1>
        <p className="text-muted-foreground mt-1">
          Wähle eine Substanz — du siehst alle relevanten Mischkonsum-Risiken auf einen Blick, sortiert nach Schweregrad.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Substanz-Picker */}
        <aside className="rounded-2xl glass p-4 space-y-3 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Substanz suchen..."
              className="w-full rounded-lg bg-input pl-9 pr-3 py-2 text-sm"
            />
          </div>
          <ul className="space-y-1">
            {substanceList.map((s) => {
              const active = s.id === selectedId;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setSelectedId(s.id)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${
                      active
                        ? "bg-aurora animate-aurora text-primary-foreground glow"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="font-medium">{s.name}</div>
                    <div className={`text-[10px] uppercase tracking-wider mt-0.5 ${active ? "opacity-80" : "text-muted-foreground"}`}>
                      {CATEGORY_LABEL[s.category]}
                    </div>
                  </button>
                </li>
              );
            })}
            {substanceList.length === 0 && (
              <li className="text-sm text-muted-foreground px-3 py-2">Keine Treffer.</li>
            )}
          </ul>
        </aside>

        {/* Detail-Bereich */}
        <section className="space-y-5 min-w-0">
          {selected && (
            <>
              <div className="rounded-2xl glass p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {CATEGORY_LABEL[selected.category]}
                    </div>
                    <h2 className="text-2xl font-bold mt-0.5">{selected.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{selected.shortDescription}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DetailToggle value={detail} onChange={setDetail} profileDetail={profileDetail} />
                    <Link
                      to="/mix"
                      className="text-xs rounded-full glass px-3 py-1.5 hover:bg-muted/40 transition"
                    >
                      → Mehrfach-Mix
                    </Link>
                  </div>
                </div>

                {/* Risiko-Counts */}
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {RISK_ORDER.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setRiskFilter(riskFilter === lvl ? "all" : lvl)}
                      className={`rounded-lg border px-2 py-2 text-left transition ${RISK_META[lvl].bg} ${
                        riskFilter === lvl ? "ring-2 ring-foreground/30" : ""
                      }`}
                    >
                      <div className={`text-lg font-bold ${RISK_META[lvl].color}`}>{counts[lvl]}</div>
                      <div className={`text-[10px] uppercase tracking-wider ${RISK_META[lvl].color}`}>
                        {RISK_META[lvl].label}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Kategorie-Filter */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <FilterChip active={catFilter === "all"} onClick={() => setCatFilter("all")}>
                    Alle Kategorien
                  </FilterChip>
                  {cats.map((c) => (
                    <FilterChip key={c} active={catFilter === c} onClick={() => setCatFilter(c)}>
                      {CATEGORY_LABEL[c]}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Warnungen der Substanz selbst */}
              {selected.warnings.length > 0 && (
                <div className="rounded-2xl glass p-5">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-aurora" />
                    Allgemeine Warnhinweise zu {selected.name}
                  </h3>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    {selected.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              {/* Risiko-Gruppen */}
              {RISK_ORDER.map((lvl) => {
                const items = grouped[lvl];
                if (items.length === 0) return null;
                return (
                  <div key={lvl} className={`rounded-2xl border p-5 ${RISK_META[lvl].bg}`}>
                    <h3 className={`font-bold text-lg mb-3 ${RISK_META[lvl].color}`}>
                      {RISK_META[lvl].label}
                      <span className="ml-2 text-xs font-normal opacity-70">{items.length}</span>
                    </h3>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {items.map(({ other, risk }) => (
                        <li
                          key={other.id}
                          className="rounded-xl bg-background/40 backdrop-blur-sm p-3 border border-border/50"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              onClick={() => setSelectedId(other.id)}
                              className="font-medium text-sm hover:underline text-left"
                            >
                              + {other.name}
                            </button>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              {CATEGORY_LABEL[other.category]}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {risk.reason}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {Object.values(grouped).every((g) => g.length === 0) && (
                <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
                  Keine Paarungen mit diesen Filtern.
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Quellen: TripSit-Combo-Matrix, EMCDDA, PsychonautWiki, peer-reviewed Pharmakologie. Keine medizinische Beratung — im Zweifel Giftnotruf oder 112.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs transition ${
        active ? "bg-foreground text-background" : "glass hover:bg-muted/40 text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
