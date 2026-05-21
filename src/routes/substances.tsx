import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, ExternalLink, Mail, Search, FlaskConical, Sparkles, Zap, Brain, Wind, Pill, Cloud, Beaker, CircleDot } from "lucide-react";
import {
  SUBSTANCES,
  CATEGORY_LABEL,
  CATEGORY_TO_SUPER,
  CATEGORY_HR_TIPS,
  SUPER_CATEGORY_LABEL,
  SUPER_CATEGORY_ORDER,
  type DoseRange,
  type SubstanceCategory,
  type SuperCategory,
  type Substance,
} from "@/lib/substances";

export const Route = createFileRoute("/substances")({
  component: SubstancesPage,
  head: () => ({
    meta: [
      { title: "Substanz-Wiki — Rave Safe, have Fun" },
      { name: "description", content: "Kompakte, scanbare Substanzinfos: Dosis, Wirkdauer und Risiken pro Applikationsweg. Expertenmodus für Pharmakologie." },
      { property: "og:title", content: "Substanz-Wiki — Rave Safe, have Fun" },
      { property: "og:description", content: "Kompakte, scanbare Substanzinfos: Dosis, Wirkdauer und Risiken pro Applikationsweg." },
      { property: "og:url", content: "https://ravesave.lovable.app/substances" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.lovable.app/substances" }],
  }),
});

const DEPTH_KEY = "rs.depth";
type Depth = "einfach" | "fortgeschritten" | "experte";

const DEPTH_META: Record<Depth, { label: string; hint: string }> = {
  einfach: { label: "Einfach", hint: "Locker erklärt, das Wichtigste auf einen Blick." },
  fortgeschritten: { label: "Fortgeschritten", hint: "Mehr Kontext, klare Empfehlungen, mehr Tiefe." },
  experte: { label: "Experte", hint: "Pharmakologie, Rezeptorprofile, PK/CYP — volle Tiefe." },
};

const TAB_LABELS: Record<Depth, Record<"overview" | "dose" | "duration" | "risks" | "pharma", string>> = {
  einfach: { overview: "Was ist das?", dose: "Wie viel?", duration: "Wie lange?", risks: "Worauf achten", pharma: "Pharma" },
  fortgeschritten: { overview: "Übersicht", dose: "Dosis", duration: "Wirkdauer", risks: "Risiken", pharma: "Pharma" },
  experte: { overview: "Übersicht", dose: "Dosis", duration: "Pharmakokinetik", risks: "Risikoprofil", pharma: "Pharmakologie" },
};

function SubstancesPage() {
  const [query, setQuery] = useState("");
  const [filterSuper, setFilterSuper] = useState<SuperCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [openSuper, setOpenSuper] = useState<Record<string, boolean>>({});
  const [openCat, setOpenCat] = useState<Record<string, boolean>>({});
  const [depth, setDepth] = useState<Depth>("fortgeschritten");

  useEffect(() => {
    try {
      const v = localStorage.getItem(DEPTH_KEY) as Depth | null;
      if (v === "einfach" || v === "fortgeschritten" || v === "experte") setDepth(v);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(DEPTH_KEY, depth);
    } catch {}
  }, [depth]);

  const expert = depth === "experte";

  const q = query.toLowerCase().trim();
  const searching = q.length > 0 || filterSuper !== "all";

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

  const intro =
    depth === "einfach"
      ? "Hier findest du das Wichtigste zu jeder Substanz — locker erklärt, ohne Fachchinesisch, aber ehrlich zu den Risiken."
      : depth === "fortgeschritten"
      ? "Übersichten zu Dosis, Wirkdauer und Risiken pro Applikationsweg — mit klaren Safer-Use-Hinweisen."
      : "Volle pharmakologische Tiefe: Rezeptorprofile, Pharmakokinetik, CYP-Interaktionen, Quellen.";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Substanz-Wiki</h1>
            <p className="text-muted-foreground mt-1 text-sm max-w-xl">{intro}</p>
          </div>
        </div>

        <div className="rounded-2xl glass p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FlaskConical className="h-3 w-3" /> Detailtiefe
            </span>
            <span className="text-[10px] text-muted-foreground hidden sm:block">{DEPTH_META[depth].hint}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.keys(DEPTH_META) as Depth[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDepth(d)}
                className={`rounded-lg px-3 py-2 text-xs font-medium border transition ${
                  depth === d
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted/20 border-border/50 text-foreground/80 hover:bg-muted/50"
                }`}
              >
                {DEPTH_META[d].label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground sm:hidden">{DEPTH_META[depth].hint}</p>
        </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <SuperChip
            active={filterSuper === "all"}
            onClick={() => setFilterSuper("all")}
            label="Alle"
            count={SUBSTANCES.length}
            Icon={CircleDot}
          />
          {SUPER_CATEGORY_ORDER.map((sup) => (
            <SuperChip
              key={sup}
              active={filterSuper === sup}
              onClick={() => setFilterSuper(sup)}
              label={SUPER_CATEGORY_LABEL[sup]}
              count={superCounts[sup] ?? 0}
              Icon={SUPER_ICON[sup]}
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
                            {list.map((s) => (
                              <SubstanceCard
                                key={s.id}
                                s={s}
                                open={openId === s.id}
                                onToggle={() => setOpenId(openId === s.id ? null : s.id)}
                                depth={depth}
                              />
                            ))}
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
            {query ? `Keine Treffer für „${query}".` : "Keine Substanzen in dieser Kategorie."}
          </div>
        )}
      </div>

      <footer className="rounded-2xl glass p-4 flex items-center justify-between gap-3 flex-wrap text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4 text-secondary" />
          <span>Feedback, Korrekturen oder Anregungen?</span>
        </div>
        <a
          href="mailto:ravesafe.live@gmail.com?subject=Rave%20Safe%20Feedback%20(Substanz-Wiki)"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-3 py-1.5 text-xs font-medium hover:bg-primary/25 transition"
        >
          <Mail className="h-3.5 w-3.5" /> ravesafe.live@gmail.com
        </a>
      </footer>
    </div>
  );
}


/* ─────────── Substance card with tabs ─────────── */

type TabKey = "overview" | "dose" | "duration" | "risks" | "pharma";

function SubstanceCard({
  s,
  open,
  onToggle,
  depth,
}: {
  s: Substance;
  open: boolean;
  onToggle: () => void;
  depth: Depth;
}) {
  const expert = depth === "experte";
  const [tab, setTab] = useState<TabKey>("overview");
  const [routeIdx, setRouteIdx] = useState(0);
  const route = s.doses[routeIdx] ?? s.doses[0];
  const labels = TAB_LABELS[depth];

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: labels.overview },
    { key: "dose", label: labels.dose },
    { key: "duration", label: labels.duration },
    { key: "risks", label: labels.risks },
    ...(expert ? ([{ key: "pharma" as const, label: labels.pharma }]) : []),
  ];

  return (
    <li className={`rounded-lg bg-background/60 border ${open ? "border-primary/50" : "border-border/40"}`}>
      <button onClick={onToggle} className="w-full text-left px-3 py-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm truncate">{s.name}</span>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground rounded bg-muted/50 px-1.5 py-0.5">
                {CATEGORY_LABEL[s.category]}
              </span>
            </div>
            {s.aliases.length > 0 && (
              <div className="text-[10px] text-muted-foreground truncate">{s.aliases.join(", ")}</div>
            )}
            {!open && (
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="font-mono">{s.onset}</span>
                <span className="opacity-40">·</span>
                <span className="font-mono">{s.duration}</span>
                <span className="opacity-40">·</span>
                <span className="truncate">{quickDose(s.doses[0])}</span>
              </div>
            )}
          </div>
          <ChevronRight
            className={`h-4 w-4 mt-0.5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-border/40">
          {/* tabs */}
          <div className="flex gap-1 px-2 pt-2 overflow-x-auto scrollbar-none">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`shrink-0 rounded-md px-2.5 py-1 text-xs transition ${
                  tab === t.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* route selector (only on dose / duration / risks) */}
          {(tab === "dose" || tab === "duration" || tab === "risks") && s.doses.length > 1 && (
            <div className="flex flex-wrap gap-1 px-3 pt-2">
              {s.doses.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setRouteIdx(i)}
                  className={`text-[10px] rounded-full px-2 py-0.5 border transition ${
                    routeIdx === i
                      ? "border-primary/60 bg-primary/10 text-foreground"
                      : "border-border/40 text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  {d.route}
                </button>
              ))}
            </div>
          )}

          <div className="px-3 pb-3 pt-2 text-sm">
            {tab === "overview" && <OverviewTab s={s} depth={depth} />}
            {tab === "dose" && <DoseTab s={s} d={route} depth={depth} />}
            {tab === "duration" && <DurationTab s={s} d={route} depth={depth} />}
            {tab === "risks" && <RisksTab s={s} d={route} depth={depth} />}
            {tab === "pharma" && expert && <PharmaTab s={s} />}
          </div>
        </div>
      )}
    </li>
  );
}


function quickDose(d?: DoseRange) {
  if (!d) return "";
  const c = d.common ?? d.light ?? d.threshold;
  return c ? `${d.route}: ${c}` : d.route;
}

/* ─────────── Tab bodies ─────────── */

function OverviewTab({ s, expert }: { s: Substance; expert: boolean }) {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground">{s.shortDescription}</p>
      <Row label="Klasse">{CATEGORY_LABEL[s.category]}</Row>
      <Row label="Wirkung">{s.mechanism}</Row>
      <Row label="Eintritt">{s.onset}</Row>
      <Row label="Dauer">{s.duration}</Row>
      {expert && s.expert?.notes && (
        <ExpertBlock>
          <p className="text-muted-foreground">{s.expert.notes}</p>
        </ExpertBlock>
      )}
      {s.evidence.length > 0 && (
        <div className="pt-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Quellen</div>
          <ul className="space-y-0.5">
            {s.evidence.map((e, i) => (
              <li key={i}>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-secondary hover:underline"
                >
                  {e.label} <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DoseTab({ s, d, expert }: { s: Substance; d?: DoseRange; expert: boolean }) {
  if (!d) return <p className="text-muted-foreground text-xs">Keine Dosisdaten.</p>;
  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.route}</div>
      <div className="grid grid-cols-5 gap-1 text-[11px]">
        <Dose label="Schwelle" v={d.threshold} />
        <Dose label="Leicht" v={d.light} />
        <Dose label="Üblich" v={d.common} />
        <Dose label="Stark" v={d.strong} />
        <Dose label="Heavy" v={d.heavy} />
      </div>
      {d.notes && <p className="text-xs text-muted-foreground">{d.notes}</p>}
      {expert && s.expert?.bioavailability && (
        <ExpertBlock>
          <Row label="Bioverfügbarkeit">{s.expert.bioavailability}</Row>
        </ExpertBlock>
      )}
    </div>
  );
}

function DurationTab({ s, d, expert }: { s: Substance; d?: DoseRange; expert: boolean }) {
  const onset = d?.onset ?? s.onset;
  const total = d?.total ?? s.duration;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Eintritt" v={onset} />
        <Stat label="Peak" v={d?.peak ?? "—"} />
        <Stat label="Gesamtdauer" v={total} />
        <Stat label="Nachwirkung" v={d?.afterglow ?? s.afterEffects ?? "—"} />
      </div>
      {expert && (s.expert?.halfLife || s.expert?.pharmacokinetics) && (
        <ExpertBlock>
          {s.expert?.halfLife && <Row label="Halbwertszeit">{s.expert.halfLife}</Row>}
          {s.expert?.pharmacokinetics && <Row label="Pharmakokinetik">{s.expert.pharmacokinetics}</Row>}
        </ExpertBlock>
      )}
    </div>
  );
}

function RisksTab({ s, d, expert }: { s: Substance; d?: DoseRange; expert: boolean }) {
  const classTips = CATEGORY_HR_TIPS[s.category] ?? [];
  return (
    <div className="space-y-3">
      {d?.riskNotes && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs">
          <span className="font-medium text-amber-300/90">{d.route}: </span>
          {d.riskNotes}
        </div>
      )}
      {s.warnings.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Substanzspezifisch</div>
          <ul className="list-disc pl-4 space-y-0.5 text-xs">
            {s.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      {classTips.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Klasse: {CATEGORY_LABEL[s.category]}
          </div>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-muted-foreground">
            {classTips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      {expert && s.expert?.cyp && (
        <ExpertBlock>
          <Row label="CYP-Interaktion">{s.expert.cyp}</Row>
        </ExpertBlock>
      )}
    </div>
  );
}

function ExpertBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 space-y-1">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-primary/80 font-medium">
        <FlaskConical className="h-3 w-3" />
        Expertendaten
      </div>
      {children}
    </div>
  );
}

function PharmaTab({ s }: { s: Substance }) {
  const e = s.expert;
  return (
    <div className="space-y-2 text-xs">
      <Row label="Mechanismus">{s.mechanism}</Row>
      {e?.halfLife && <Row label="Halbwertszeit">{e.halfLife}</Row>}
      {e?.bioavailability && <Row label="Bioverfügbarkeit">{e.bioavailability}</Row>}
      {e?.cyp && <Row label="CYP-Metabolismus">{e.cyp}</Row>}
      {e?.pharmacokinetics && <Row label="Pharmakokinetik">{e.pharmacokinetics}</Row>}
      {e?.receptorAffinities && e.receptorAffinities.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Rezeptor-Affinitäten</div>
          <div className="rounded-md border border-border/40 overflow-hidden">
            <table className="w-full text-[11px]">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="text-left px-2 py-1 font-medium">Target</th>
                  <th className="text-left px-2 py-1 font-medium">Ki</th>
                  <th className="text-left px-2 py-1 font-medium">IC50</th>
                  <th className="text-left px-2 py-1 font-medium">Wirkung</th>
                </tr>
              </thead>
              <tbody>
                {e.receptorAffinities.map((r, i) => (
                  <tr key={i} className="border-t border-border/30">
                    <td className="px-2 py-1 font-mono">{r.target}</td>
                    <td className="px-2 py-1 font-mono">{r.ki ?? "—"}</td>
                    <td className="px-2 py-1 font-mono">{r.ic50 ?? "—"}</td>
                    <td className="px-2 py-1 text-muted-foreground">{r.action ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {e?.notes && <p className="text-muted-foreground">{e.notes}</p>}
      {!e && (
        <p className="text-muted-foreground italic">
          Detaillierte Pharmakologie für diese Substanz noch nicht eingepflegt. Siehe Quellen im Übersichts-Tab.
        </p>
      )}
    </div>
  );
}

/* ─────────── Atoms ─────────── */

const SUPER_ICON: Record<SuperCategory, typeof CircleDot> = {
  hallucinogen: Sparkles,
  stimulant_group: Zap,
  depressant_group: Cloud,
  opioid_group: Pill,
  empathogen_group: Brain,
  cannabinoid_group: Wind,
  other_group: Beaker,
};

function SuperChip({
  active,
  onClick,
  label,
  count,
  Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  Icon: typeof CircleDot;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition border ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-muted/30 border-border/50 text-foreground/85 hover:bg-muted/60"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left truncate font-medium">{label}</span>
      <span className={`tabular-nums text-xs rounded-full px-1.5 py-0.5 ${
        active ? "bg-primary-foreground/20" : "bg-muted/60"
      }`}>{count}</span>
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-xs">
      <span className="w-28 shrink-0 uppercase tracking-wider text-[10px] text-muted-foreground pt-0.5">
        {label}
      </span>
      <span className="flex-1">{children}</span>
    </div>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-md bg-muted/30 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-xs mt-0.5">{v}</div>
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
