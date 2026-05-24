import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, X, Sparkles, AlertTriangle, Phone, Syringe, ShieldCheck, Siren } from "lucide-react";
import {
  SUBSTANCES,
  assessPair,
  overallRisk,
  RISK_META,
  CATEGORY_LABEL,
  CATEGORY_TO_SUPER,
  SUPER_CATEGORY_LABEL,
  SUPER_CATEGORY_ORDER,
  explainRisk,
  type Substance,
  type SubstanceCategory,
  type SuperCategory,
} from "@/lib/substances";
import { loadProfile, getDetailLevel, type DetailLevel } from "@/lib/profile";
import { useRegisterAiContext } from "@/lib/aiContext";


export const Route = createFileRoute("/mix")({
  component: MixPage,
  head: () => ({
    meta: [
      { title: "Mischkonsum-Check — Rave Safe, have Fun" },
      { name: "description", content: "Prüfe Kombinationen aus 2+ Substanzen mit einer Ampel-Bewertung und detaillierten Hinweisen zu Wechselwirkungen." },
      { property: "og:title", content: "Mischkonsum-Check — Rave Safe, have Fun" },
      { property: "og:description", content: "Ampel-Risikobewertung für Substanzkombinationen mit Quellen und Erklärungen." },
      { property: "og:url", content: "https://ravesave.lovable.app/mix" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.lovable.app/mix" }],
  }),
});

function MixPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [profileDetail, setProfileDetail] = useState<DetailLevel>("lay");
  const [detail, setDetail] = useState<DetailLevel>("lay");
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const d = getDetailLevel(loadProfile());
    setProfileDetail(d);
    setDetail(d);
    // Autofocus the picker so users can start typing immediately
    searchRef.current?.focus({ preventScroll: true });
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

  // KI-Kontext: gewählte Substanzen + höchstes Risiko-Level
  useRegisterAiContext({
    route: "/mix",
    mixSelected:
      selected.length > 0
        ? selected
            .map((id) => SUBSTANCES.find((x) => x.id === id))
            .filter((s): s is Substance => !!s)
            .map((s) => ({ id: s.id, name: s.name }))
        : undefined,
    mixRisk: selected.length >= 2 ? { level: overall.level } : undefined,
  });


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

        {selected.length >= 2 && (() => {
          const selectedSubs = selected
            .map((id) => SUBSTANCES.find((x) => x.id === id))
            .filter((s): s is Substance => !!s);
          const hasOpioid = selectedSubs.some((s) => s.category === "opioid");
          const isCritical = overall.level === "danger" || overall.level === "unsafe";
          const isDeadly = overall.level === "danger";
          const ringColor =
            overall.level === "danger"
              ? "ring-risk-danger"
              : overall.level === "unsafe"
              ? "ring-risk-unsafe"
              : overall.level === "caution"
              ? "ring-risk-caution"
              : overall.level === "synergy"
              ? "ring-secondary"
              : overall.level === "safe"
              ? "ring-risk-safe"
              : "ring-muted-foreground";
          const dotColor =
            overall.level === "danger"
              ? "bg-risk-danger"
              : overall.level === "unsafe"
              ? "bg-risk-unsafe"
              : overall.level === "caution"
              ? "bg-risk-caution"
              : overall.level === "synergy"
              ? "bg-secondary"
              : overall.level === "safe"
              ? "bg-risk-safe"
              : "bg-muted-foreground";
          const RiskIcon = isDeadly ? Siren : isCritical ? AlertTriangle : ShieldCheck;
          return (
            <div className={`mt-5 rounded-2xl border p-5 ${RISK_META[overall.level].bg}`}>
              {/* Großer visueller Ampel-Kreis */}
              <div className="flex items-center gap-4">
                <div
                  className={`relative grid h-20 w-20 shrink-0 place-items-center rounded-full ring-4 ${ringColor}/40 ${
                    isDeadly ? "animate-pulse" : ""
                  }`}
                  aria-hidden="true"
                >
                  <span className={`absolute inset-2 rounded-full ${dotColor}/30 blur-sm`} />
                  <span className={`relative grid h-12 w-12 place-items-center rounded-full ${dotColor}/90 shadow-lg`}>
                    <RiskIcon className="h-6 w-6 text-background" />
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Höchstes Risiko</div>
                  <div className={`text-2xl md:text-3xl font-bold leading-tight ${RISK_META[overall.level].color}`}>
                    {RISK_META[overall.level].label}
                  </div>
                  <p className="mt-1 text-sm text-foreground/90">{overall.reason}</p>
                </div>
              </div>

              {/* Naloxon/112-Banner bei lebensgefährlicher Opioid-Kombination */}
              {isDeadly && hasOpioid && (
                <div className="mt-4 rounded-xl bg-destructive/15 ring-1 ring-destructive/40 p-3 flex items-start gap-2">
                  <Syringe className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                  <div className="text-xs leading-relaxed">
                    <div className="font-semibold text-destructive">Opioid-beteiligte Hochrisiko-Kombi.</div>
                    <p className="mt-0.5 text-foreground/90">
                      Atemstillstand möglich. <strong>Naloxon-Nasenspray</strong> bereithalten, niemals allein konsumieren.
                      Bei flacher/aussetzender Atmung sofort{" "}
                      <a href="tel:112" className="underline font-semibold text-destructive">112</a> rufen — Sanitäter:innen
                      die Kombi offen mitteilen.{" "}
                      <Link to="/notfall" className="underline font-medium">Erste Hilfe ansehen</Link>.
                    </p>
                  </div>
                </div>
              )}
              {isDeadly && !hasOpioid && (
                <div className="mt-4 rounded-xl bg-destructive/15 ring-1 ring-destructive/40 p-3 flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                  <div className="text-xs leading-relaxed">
                    <div className="font-semibold text-destructive">Lebensgefährliche Kombination.</div>
                    <p className="mt-0.5 text-foreground/90">
                      Bei Bewusstlosigkeit, Krampf, blauen Lippen, Brustschmerz oder schwerer Verwirrung sofort{" "}
                      <a href="tel:112" className="underline font-semibold text-destructive">112</a>. Erkläre dem
                      Rettungsdienst die Kombi — Schweigepflicht gilt, keine automatische Polizei.{" "}
                      <Link to="/notfall" className="underline font-medium">Erste Hilfe</Link>.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  const names = selectedSubs.map((s) => s.name).join(" + ");
                  const prompt = `Im Mischkonsum-Check habe ich gerade ${names} ausgewählt (Ampel: ${RISK_META[overall.level].label}). Erklär mir kurz, worauf ich hier konkret achten muss — keine Dosis-Empfehlung, sondern Mechanismus, Warnzeichen und Safer-Use-Punkte.`;
                  window.dispatchEvent(
                    new CustomEvent("ravesave:open-marlene", { detail: { prompt } }),
                  );
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary/95 px-3.5 py-1.5 text-xs font-semibold text-secondary-foreground hover:brightness-110 shine"
              >
                <Sparkles className="h-3.5 w-3.5" /> Marleen dazu fragen
              </button>
            </div>
          );
        })()}
      </div>

      {/* Pair breakdown */}
      {pairs.length > 0 && (
        <div className="rounded-2xl glass p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-semibold">Alle Paare</h2>
            <DetailToggle value={detail} onChange={setDetail} profileDetail={profileDetail} />
          </div>
          <ul className="space-y-2">
            {pairs.map(({ a, b, risk }) => {
              const sa = SUBSTANCES.find((s) => s.id === a)!;
              const sb = SUBSTANCES.find((s) => s.id === b)!;
              const ex = explainRisk(risk, detail);
              return (
                <li key={a + b} className={`rounded-xl border p-3 ${RISK_META[risk.level].bg}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="font-medium">
                      <Link to="/substances" className="hover:underline">{sa.name}</Link>
                      <span className="text-muted-foreground"> + </span>
                      <Link to="/substances" className="hover:underline">{sb.name}</Link>
                    </div>
                    <span className={`text-xs font-semibold ${RISK_META[risk.level].color}`}>
                      {RISK_META[risk.level].label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{ex.headline}</p>
                  {ex.detail && (
                    <p className="mt-1.5 text-xs text-muted-foreground/80 leading-relaxed border-l-2 border-border pl-2">
                      <span className="font-semibold text-foreground/70">Mechanismus:</span> {ex.detail}
                    </p>
                  )}
                  {ex.expert && ex.expert !== ex.detail && (
                    <p className="mt-1.5 text-xs text-muted-foreground/80 leading-relaxed border-l-2 border-secondary/60 pl-2">
                      <span className="font-semibold text-secondary">Fachebene:</span> {ex.expert}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Picker — grouped by super category */}
      <div className="rounded-2xl glass p-5">
        <input
          ref={searchRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Substanz suchen..."
          aria-label="Substanz suchen"
          autoFocus
          className="w-full rounded-lg bg-input px-3 py-2 text-sm mb-4"
        />
        <GroupedPicker
          items={filtered}
          onPick={(id) => setSelected([...selected, id])}
          searching={query.trim().length > 0}
        />
      </div>

      {/* Legend */}
      <div className="rounded-2xl glass p-5">
        <h3 className="font-semibold mb-3">Legende</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {(Object.keys(RISK_META) as Array<keyof typeof RISK_META>).map((k) => (
            <li key={k} className={`rounded-lg border px-3 py-2 ${RISK_META[k].bg}`}>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${RISK_META[k].color}`}>{RISK_META[k].label}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-snug">
                {LEGEND_DESC[k]}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const LEGEND_DESC: Record<keyof typeof RISK_META, string> = {
  safe: 'Keine bekannten kritischen Wechselwirkungen in unseren Quellen — heißt nicht "sicher". Restrisiko bleibt immer.',
  synergy: "Wirkungen verstärken sich gewollt — Dosis runter, Wirkung abwarten, nicht nachlegen.",
  caution: "Vorsicht — mögliche unangenehme oder riskante Wechselwirkungen. Niedrig dosieren, nicht allein konsumieren.",
  unsafe: "Riskant — erhöhte körperliche oder psychische Belastung möglich. Besser nicht kombinieren.",
  danger: "Gefährlich — Atemstillstand, Krampf oder Tod möglich. Kombination vermeiden, bei Symptomen 112.",
  unknown: "Keine belastbaren Daten — im Zweifel trennen, nicht raten.",
};

function GroupedPicker({
  items,
  onPick,
  searching,
}: {
  items: Substance[];
  onPick: (id: string) => void;
  searching: boolean;
}) {
  const [openSuper, setOpenSuper] = useState<Record<string, boolean>>({});
  const [openCat, setOpenCat] = useState<Record<string, boolean>>({});

  const tree = useMemo(() => {
    const t: Partial<Record<SuperCategory, Partial<Record<SubstanceCategory, Substance[]>>>> = {};
    for (const s of items) {
      const sup = CATEGORY_TO_SUPER[s.category];
      const supBucket = (t[sup] ??= {});
      (supBucket[s.category] ??= []).push(s);
    }
    return t;
  }, [items]);

  return (
    <div className="space-y-1.5 max-h-[480px] overflow-auto pr-1">
      {SUPER_CATEGORY_ORDER.map((sup) => {
        const cats = tree[sup];
        if (!cats) return null;
        const count = Object.values(cats).reduce((n, arr) => n + (arr?.length ?? 0), 0);
        const isOpen = searching || !!openSuper[sup];
        return (
          <div key={sup} className="rounded-xl border border-border/40 overflow-hidden">
            <button
              onClick={() => setOpenSuper((p) => ({ ...p, [sup]: !p[sup] }))}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-muted/30 transition"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                <span className="text-sm font-semibold">{SUPER_CATEGORY_LABEL[sup]}</span>
              </div>
              <span className="text-[10px] tabular-nums text-muted-foreground rounded-full bg-muted/50 px-2 py-0.5">
                {count}
              </span>
            </button>
            {isOpen && (
              <div className="px-2 pb-2 space-y-1.5">
                {(Object.entries(cats) as [SubstanceCategory, Substance[]][]).map(([cat, list]) => {
                  const catOpen = searching || !!openCat[cat];
                  return (
                    <div key={cat} className="rounded-lg bg-background/30">
                      <button
                        onClick={() => setOpenCat((p) => ({ ...p, [cat]: !p[cat] }))}
                        aria-expanded={catOpen}
                        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 hover:bg-muted/30 transition"
                      >
                        <div className="flex items-center gap-1.5">
                          <ChevronRight className={`h-3.5 w-3.5 transition-transform ${catOpen ? "rotate-90" : ""}`} />
                          <span className="text-xs font-medium">{CATEGORY_LABEL[cat]}</span>
                        </div>
                        <span className="text-[10px] tabular-nums text-muted-foreground">{list.length}</span>
                      </button>
                      {catOpen && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 p-2 pt-1">
                          {list.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => onPick(s.id)}
                              className="text-left rounded-lg bg-background/60 border border-border/40 px-2.5 py-1.5 hover:bg-muted/40 transition"
                            >
                              <div className="text-xs font-medium truncate">{s.name}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {items.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-6">Keine Substanzen.</div>
      )}
    </div>
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
    <div className="flex items-center gap-1 rounded-full glass p-0.5 text-xs">
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
          {l === profileDetail && <span className="ml-1 opacity-60">·</span>}
        </button>
      ))}
    </div>
  );
}
