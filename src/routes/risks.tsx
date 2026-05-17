import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Search, ShieldAlert, Clock, OctagonAlert, Activity, ListChecks, ExternalLink, Pill } from "lucide-react";
import {
  SUBSTANCES,
  CATEGORY_LABEL,
  RISK_META,
  HARM_REDUCTION,
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
      { title: "Risiko-Übersicht — Rave Safe, have Fun" },
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
                    <HarmReductionPanel level={lvl} substanceId={selected.id} />
                    <ul className="grid gap-2 md:grid-cols-2 mt-4">
                      {items.map(({ other, risk }) => (
                        <PairingCard
                          key={other.id}
                          self={selected}
                          other={other}
                          risk={risk}
                          detail={detail}
                          onSelectOther={() => setSelectedId(other.id)}
                        />
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

const DETAIL_LABEL: Record<DetailLevel, string> = {
  lay: "Einfach",
  intermediate: "Mechanismus",
  expert: "Fachebene",
};

function DetailToggle({
  value,
  onChange,
  profileDetail,
}: {
  value: DetailLevel;
  onChange: (v: DetailLevel) => void;
  profileDetail: DetailLevel;
}) {
  const levels: DetailLevel[] = ["lay", "intermediate", "expert"];
  return (
    <div className="flex items-center gap-0.5 rounded-full glass p-0.5 text-xs">
      {levels.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          title={l === profileDetail ? "Aus deinem Profil" : undefined}
          className={`px-2.5 py-1 rounded-full transition ${
            value === l ? "bg-aurora animate-aurora text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {DETAIL_LABEL[l]}
        </button>
      ))}
    </div>
  );
}

function RiskExplain({
  risk,
  detail,
}: {
  risk: import("@/lib/substances").RiskInfo;
  detail: DetailLevel;
}) {
  const ex = explainRisk(risk, detail);
  return (
    <>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{ex.headline}</p>
      {ex.detail && (
        <p className="mt-1.5 text-[11px] text-muted-foreground/80 leading-relaxed border-l-2 border-border pl-2">
          <span className="font-semibold text-foreground/70">Mechanismus:</span> {ex.detail}
        </p>
      )}
      {ex.expert && ex.expert !== ex.detail && (
        <p className="mt-1.5 text-[11px] text-muted-foreground/80 leading-relaxed border-l-2 border-secondary/60 pl-2">
          <span className="font-semibold text-secondary">Fachebene:</span> {ex.expert}
        </p>
      )}
    </>
  );
}

const SECTION_META = [
  { key: "waiting" as const, label: "Wartezeiten & Re-Dosing", Icon: Clock },
  { key: "abort" as const, label: "Abbruchkriterien", Icon: OctagonAlert },
  { key: "warningSigns" as const, label: "Warnzeichen", Icon: Activity },
  { key: "actions" as const, label: "Sofort umsetzbar", Icon: ListChecks },
];

function HarmReductionPanel({
  level,
  substanceId,
}: {
  level: RiskLevel;
  substanceId: string;
}) {
  const data = HARM_REDUCTION[level];
  const storageKey = `trace.hr.${substanceId}.${level}`;
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(level === "danger" || level === "unsafe");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setChecked(raw ? JSON.parse(raw) : {});
    } catch {
      setChecked({});
    }
  }, [storageKey]);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const totalItems = SECTION_META.reduce((n, s) => n + data[s.key].length, 0);
  const doneItems = Object.values(checked).filter(Boolean).length;

  return (
    <div className="rounded-xl border border-border/60 bg-background/50 backdrop-blur-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <ShieldAlert className="h-4 w-4 shrink-0 text-foreground/70" />
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">Harm-Reduction-Checkliste</div>
            <div className="text-[11px] text-muted-foreground truncate">{data.intent}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] tabular-nums rounded-full bg-muted/60 px-2 py-0.5 text-muted-foreground">
            {doneItems}/{totalItems}
          </span>
          <span className="text-xs text-muted-foreground">{open ? "−" : "+"}</span>
        </div>
      </button>
      {open && (
        <div className="grid gap-3 px-3 pb-3 md:grid-cols-2">
          {SECTION_META.map(({ key, label, Icon }) => (
            <div key={key} className="rounded-lg bg-background/60 p-3 border border-border/40">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/80">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
              <ul className="space-y-1.5">
                {data[key].map((item, i) => {
                  const id = `${key}-${i}`;
                  const isChecked = !!checked[id];
                  return (
                    <li key={id}>
                      <label className="flex items-start gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggle(id)}
                          className="mt-0.5 h-3.5 w-3.5 rounded accent-foreground shrink-0"
                        />
                        <span
                          className={`text-[12px] leading-snug ${
                            isChecked
                              ? "text-muted-foreground line-through"
                              : "text-foreground/85 group-hover:text-foreground"
                          }`}
                        >
                          {item}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PairingCard({
  self,
  other,
  risk,
  detail,
  onSelectOther,
}: {
  self: import("@/lib/substances").Substance;
  other: import("@/lib/substances").Substance;
  risk: import("@/lib/substances").RiskInfo;
  detail: DetailLevel;
  onSelectOther: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ex = explainRisk(risk, "expert"); // full info for detail view
  const meta = RISK_META[risk.level];

  return (
    <li className="rounded-xl bg-background/40 backdrop-blur-sm border border-border/50 overflow-hidden">
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onSelectOther}
            className="font-medium text-sm hover:underline text-left"
          >
            + {other.name}
          </button>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {CATEGORY_LABEL[other.category]}
          </span>
        </div>
        <RiskExplain risk={risk} detail={detail} />
        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-2 text-[11px] text-muted-foreground hover:text-foreground transition inline-flex items-center gap-1"
          aria-expanded={open}
        >
          {open ? "− Details ausblenden" : "+ Details zur Kombination"}
        </button>
      </div>

      {open && (
        <div className={`px-3 pb-3 pt-2 border-t border-border/40 space-y-2.5 ${meta.bg}`}>
          <div>
            <div className={`text-[10px] uppercase tracking-wider font-semibold ${meta.color}`}>
              Einstufung: {meta.label}
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-foreground/90">{ex.headline}</p>
          </div>

          {ex.detail && (
            <div className="rounded-lg bg-background/50 p-2.5 border border-border/40">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-foreground/70 mb-1">
                Mechanismus
              </div>
              <p className="text-[12px] leading-relaxed text-muted-foreground">{ex.detail}</p>
            </div>
          )}

          {ex.expert && ex.expert !== ex.detail && (
            <div className="rounded-lg bg-background/50 p-2.5 border-l-2 border-secondary/60">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-secondary mb-1">
                Fachebene
              </div>
              <p className="text-[12px] leading-relaxed text-muted-foreground">{ex.expert}</p>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            {[self, other].map((s) => (
              <SubstanceBrief key={s.id} s={s} />
            ))}
          </div>

          {(self.warnings.length > 0 || other.warnings.length > 0) && (
            <div className="grid gap-2 sm:grid-cols-2">
              {[self, other].map((s) =>
                s.warnings.length > 0 ? (
                  <div key={s.id} className="rounded-lg bg-background/50 p-2.5 border border-border/40">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-foreground/70 mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-aurora" />
                      Warnungen — {s.name}
                    </div>
                    <ul className="text-[11px] text-muted-foreground list-disc pl-4 space-y-0.5">
                      {s.warnings.slice(0, 4).map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
            <span className="rounded-full glass px-2 py-0.5">
              {CATEGORY_LABEL[self.category]} × {CATEGORY_LABEL[other.category]}
            </span>
            {self.onset && (
              <span className="rounded-full glass px-2 py-0.5">{self.name}: {self.onset}</span>
            )}
            {other.onset && (
              <span className="rounded-full glass px-2 py-0.5">{other.name}: {other.onset}</span>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function SubstanceBrief({ s }: { s: import("@/lib/substances").Substance }) {
  const primary = s.doses[0];
  const evidence = s.evidence.slice(0, 2);
  return (
    <div className="rounded-lg bg-background/50 p-2.5 border border-border/40 space-y-2">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-foreground/70 flex items-center gap-1">
        <Pill className="h-3 w-3 text-secondary" />
        Dosis & Evidenz — {s.name}
      </div>

      {primary ? (
        <div className="space-y-1">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {primary.route}
          </div>
          <div className="flex flex-wrap gap-1 text-[10px]">
            {([
              ["Schwelle", primary.threshold],
              ["Leicht", primary.light],
              ["Üblich", primary.common],
              ["Stark", primary.strong],
              ["Heavy", primary.heavy],
            ] as const)
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <span
                  key={k}
                  className={`rounded-md px-1.5 py-0.5 font-mono ${
                    k === "Üblich" ? "bg-secondary/20 text-secondary" : "bg-muted/60 text-foreground/80"
                  }`}
                >
                  <span className="opacity-60 mr-1">{k}</span>
                  {v}
                </span>
              ))}
          </div>
          {primary.notes && (
            <p className="text-[10px] text-muted-foreground/80 leading-snug">{primary.notes}</p>
          )}
          {s.doses.length > 1 && (
            <p className="text-[10px] text-muted-foreground/60">
              + {s.doses.length - 1} weitere Applikationsform(en) im Wiki.
            </p>
          )}
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground italic">Keine Dosis-Daten hinterlegt.</p>
      )}

      {evidence.length > 0 ? (
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
            Evidenz
          </div>
          <ul className="space-y-0.5">
            {evidence.map((e, i) => (
              <li key={i}>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-secondary hover:underline inline-flex items-center gap-1"
                >
                  {e.label} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
