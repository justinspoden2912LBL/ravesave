import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ChevronRight } from "lucide-react";
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
import { profileFor } from "@/lib/pharmacology";
import { RiskFlagChips } from "@/components/viz/RiskFlagChips";

export const Route = createFileRoute("/substances")({
  component: SubstancesPage,
  head: () => ({
    meta: [
      { title: "Substanzen — Pharmakologie & Dosis | Rave Safe, have Fun" },
      { name: "description", content: "Evidenzbasiertes Substanz-Wiki: Rezeptorprofile, Dosis-Orientierung, Wirkdauer und Risikoflags für über 100 psychoaktive Substanzen." },
      { property: "og:title", content: "Substanzen — Pharmakologie & Dosis" },
      { property: "og:description", content: "Über 100 Substanzen mit Rezeptorprofil, Dosis und Risikoflags." },
      { property: "og:url", content: "https://ravesave.lovable.app/substances" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.lovable.app/substances" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Substanzen — Pharmakologie & Dosis",
        about: "Harm Reduction, Pharmakologie psychoaktiver Substanzen",
        url: "https://ravesave.lovable.app/substances",
        inLanguage: "de",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: SUBSTANCES.length,
          itemListElement: SUBSTANCES.slice(0, 50).map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.name,
            url: `https://ravesave.lovable.app/substances/${s.id}`,
          })),
        },
      }),
    }],
  }),
});

function SubstancesPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<SuperCategory | "all">("all");

  const q = query.toLowerCase().trim();

  const matches = useMemo(
    () =>
      SUBSTANCES.filter(
        (s) =>
          (activeFilter === "all" || CATEGORY_TO_SUPER[s.category] === activeFilter) &&
          (!q ||
            s.name.toLowerCase().includes(q) ||
            s.aliases.some((a) => a.toLowerCase().includes(q))),
      ),
    [q, activeFilter],
  );

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
    <div className="mx-auto max-w-3xl px-4 pb-12">
      <header className="pt-4 pb-6">
        <h1 className="text-4xl font-bold tracking-tight font-display">Substanzen</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {SUBSTANCES.length} Substanzen mit Pharmakologie, Dosis und Risikoprofil.
        </p>
      </header>

      {/* Search */}
      <div className="glass-card p-2 mb-3 sticky top-12 z-30 backdrop-blur-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche Name oder Alias…"
            aria-label="Substanz oder Alias suchen"
            type="search"
            className="w-full rounded-xl bg-transparent pl-10 pr-3 py-2.5 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4">
        <FilterChip active={activeFilter === "all"} onClick={() => setActiveFilter("all")}>
          Alle
        </FilterChip>
        {SUPER_CATEGORY_ORDER.map((s) => (
          <FilterChip
            key={s}
            active={activeFilter === s}
            onClick={() => setActiveFilter(s)}
          >
            {SUPER_CATEGORY_LABEL[s]}
          </FilterChip>
        ))}
      </div>

      <div className="space-y-6 mt-2">
        {SUPER_CATEGORY_ORDER.map((sup) => {
          const cats = tree[sup];
          if (!cats) return null;
          return (
            <section key={sup}>
              <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80 font-medium mb-2 px-1">
                {SUPER_CATEGORY_LABEL[sup]}
              </h2>
              <div className="glass-card overflow-hidden divide-y divide-white/[0.05]">
                {(Object.entries(cats) as [SubstanceCategory, Substance[]][]).flatMap(([cat, list]) =>
                  list.map((s) => <SubstanceRow key={s.id} s={s} catLabel={CATEGORY_LABEL[cat]} />)
                )}
              </div>
            </section>
          );
        })}

        {matches.length === 0 && (
          <div className="glass-card p-8 text-center text-sm text-muted-foreground">
            Keine Treffer für „{query}".
          </div>
        )}
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
      className={`pressable shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-accent text-accent-foreground glow"
          : "bg-white/[0.04] text-muted-foreground hover:text-foreground hover:bg-white/[0.08] ring-1 ring-white/[0.06]"
      }`}
    >
      {children}
    </button>
  );
}

function SubstanceRow({ s, catLabel }: { s: Substance; catLabel: string }) {
  const prof = profileFor(s.id);
  return (
    <Link
      to="/substances/$slug"
      params={{ slug: s.id }}
      className="pressable flex items-center gap-3 p-3.5 hover:bg-white/[0.03] transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{s.name}</span>
          <span className="text-[10px] text-muted-foreground/80">{catLabel}</span>
        </div>
        {s.aliases.length > 0 && (
          <div className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
            {s.aliases.slice(0, 3).join(" · ")}
          </div>
        )}
        {prof && prof.flags.length > 0 && (
          <RiskFlagChips flags={prof.flags.slice(0, 4)} size="xs" className="mt-1.5" />
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
    </Link>
  );
}
