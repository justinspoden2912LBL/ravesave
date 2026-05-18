import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, ExternalLink, Search } from "lucide-react";
import {
  SUBSTANCES,
  CATEGORY_LABEL,
  CATEGORY_TO_SUPER,
  SUPER_CATEGORY_LABEL,
  SUPER_CATEGORY_ORDER,
  type SubstanceCategory,
  type SuperCategory,
  type Substance,
} from "@/lib/substances";

export const Route = createFileRoute("/substances")({
  component: SubstancesPage,
  head: () => ({ meta: [{ title: "Substanzen — Rave Safe, have Fun" }] }),
});

function SubstancesPage() {
  const [query, setQuery] = useState("");
  const [filterSuper, setFilterSuper] = useState<SuperCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [openSuper, setOpenSuper] = useState<Record<string, boolean>>({});
  const [openCat, setOpenCat] = useState<Record<string, boolean>>({});

  const q = query.toLowerCase().trim();
  const searching = q.length > 0 || filterSuper !== "all";

  // Count per super-category across the full dataset for the filter chips.
  const superCounts = useMemo(() => {
    const counts: Partial<Record<SuperCategory, number>> = {};
    for (const s of SUBSTANCES) {
      const sup = CATEGORY_TO_SUPER[s.category];
      counts[sup] = (counts[sup] ?? 0) + 1;
    }
    return counts;
  }, []);

  const matches = useMemo(() => {
    return SUBSTANCES.filter((s) => {
      const sup = CATEGORY_TO_SUPER[s.category];
      if (filterSuper !== "all" && sup !== filterSuper) return false;
      if (!q) return true;
      const hay = [
        s.name,
        s.id,
        ...s.aliases,
        s.shortDescription,
        s.mechanism,
        CATEGORY_LABEL[s.category],
        SUPER_CATEGORY_LABEL[sup],
      ]
        .join(" \u0001 ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [q, filterSuper]);

  const tree = useMemo(() => {
    const t: Partial<Record<SuperCategory, Partial<Record<SubstanceCategory, Substance[]>>>> = {};
    for (const s of matches) {
      const sup = CATEGORY_TO_SUPER[s.category];
      const supBucket = (t[sup] ??= {});
      (supBucket[s.category] ??= []).push(s);
    }
    return t;
  }, [matches]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Substanz-Wiki</h1>
        <p className="text-muted-foreground mt-1">
          Erst Oberkategorie wählen — dann Klasse — dann Substanz. Kompakt bis ausführlich.
        </p>
      </header>

      <div className="rounded-2xl glass p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche (Name, Alias, Klasse, Wirkung)…"
            className="w-full rounded-lg bg-input pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={filterSuper === "all"}
            onClick={() => setFilterSuper("all")}
            label="Alle"
            count={SUBSTANCES.length}
          />
          {SUPER_CATEGORY_ORDER.map((sup) => (
            <FilterChip
              key={sup}
              active={filterSuper === sup}
              onClick={() => setFilterSuper(sup)}
              label={SUPER_CATEGORY_LABEL[sup]}
              count={superCounts[sup] ?? 0}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {SUPER_CATEGORY_ORDER.map((sup) => {
          const cats = tree[sup];
          if (!cats) return null;
          const count = Object.values(cats).reduce((n, arr) => n + (arr?.length ?? 0), 0);
          const isOpen = searching || !!openSuper[sup];
          return (
            <div key={sup} className="rounded-2xl glass overflow-hidden">
              <button
                onClick={() => setOpenSuper((p) => ({ ...p, [sup]: !p[sup] }))}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/30 transition"
              >
                <div className="flex items-center gap-2">
                  <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  <span className="font-semibold">{SUPER_CATEGORY_LABEL[sup]}</span>
                </div>
                <span className="text-[11px] tabular-nums text-muted-foreground rounded-full bg-muted/50 px-2 py-0.5">
                  {count}
                </span>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 space-y-2">
                  {(Object.entries(cats) as [SubstanceCategory, Substance[]][]).map(([cat, list]) => {
                    const catOpen = searching || !!openCat[cat];
                    return (
                      <div key={cat} className="rounded-xl border border-border/50 bg-background/30">
                        <button
                          onClick={() => setOpenCat((p) => ({ ...p, [cat]: !p[cat] }))}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-muted/30 transition"
                        >
                          <div className="flex items-center gap-2">
                            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${catOpen ? "rotate-90" : ""}`} />
                            <span className="text-sm font-medium">{CATEGORY_LABEL[cat]}</span>
                          </div>
                          <span className="text-[10px] tabular-nums text-muted-foreground">{list.length}</span>
                        </button>
                        {catOpen && (
                          <ul className="px-2 pb-2 space-y-1.5">
                            {list.map((s) => {
                              const open = openId === s.id;
                              return (
                                <li
                                  key={s.id}
                                  className={`rounded-lg bg-background/60 border ${open ? "border-primary/50" : "border-border/40"}`}
                                >
                                  <button
                                    onClick={() => setOpenId(open ? null : s.id)}
                                    className="w-full text-left px-3 py-2"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <div className="font-medium text-sm truncate">{s.name}</div>
                                        {s.aliases.length > 0 && (
                                          <div className="text-[10px] text-muted-foreground truncate">
                                            {s.aliases.join(", ")}
                                          </div>
                                        )}
                                      </div>
                                      <ChevronRight className={`h-4 w-4 mt-0.5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
                                    </div>
                                    {!open && (
                                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                                        {s.shortDescription}
                                      </p>
                                    )}
                                  </button>

                                  {open && (
                                    <div className="px-3 pb-3 space-y-3 border-t border-border/40 pt-3 text-sm">
                                      <p className="text-muted-foreground">{s.shortDescription}</p>
                                      <Row label="Mechanismus">{s.mechanism}</Row>
                                      <Row label="Eintritt">{s.onset}</Row>
                                      <Row label="Dauer">{s.duration}</Row>

                                      <div>
                                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                                          Dosis-Bereiche
                                        </div>
                                        {s.doses.map((d, i) => (
                                          <div key={i} className="rounded-xl glass p-3 mb-2">
                                            <div className="font-medium text-xs mb-2">{d.route}</div>
                                            <div className="grid grid-cols-5 gap-1 text-[11px]">
                                              <Dose label="Schwelle" v={d.threshold} />
                                              <Dose label="Leicht" v={d.light} />
                                              <Dose label="Üblich" v={d.common} />
                                              <Dose label="Stark" v={d.strong} />
                                              <Dose label="Heavy" v={d.heavy} />
                                            </div>
                                            {d.notes && (
                                              <p className="text-xs text-muted-foreground mt-2">{d.notes}</p>
                                            )}
                                          </div>
                                        ))}
                                      </div>

                                      {s.warnings.length > 0 && (
                                        <div>
                                          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                                            Warnungen
                                          </div>
                                          <ul className="list-disc pl-4 space-y-1">
                                            {s.warnings.map((w, i) => (
                                              <li key={i}>{w}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {s.evidence.length > 0 && (
                                        <div>
                                          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                                            Quellen / Evidenz
                                          </div>
                                          <ul className="space-y-1">
                                            {s.evidence.map((e, i) => (
                                              <li key={i}>
                                                <a
                                                  href={e.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1 text-secondary hover:underline"
                                                >
                                                  {e.label} <ExternalLink className="h-3 w-3" />
                                                </a>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {matches.length === 0 && (
          <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
            Keine Treffer für „{query}".
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="w-24 shrink-0 text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="flex-1">{children}</span>
    </div>
  );
}

function Dose({ label, v }: { label: string; v?: string }) {
  return (
    <div className={`rounded-md px-1.5 py-1 text-center ${v ? "bg-muted/60" : "bg-muted/20 text-muted-foreground/40"}`}>
      <div className="text-[9px] uppercase tracking-wider opacity-60">{label}</div>
      <div className="font-mono">{v ?? "—"}</div>
    </div>
  );
}
