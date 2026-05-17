import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink, AlertTriangle, ChevronDown, Clock } from "lucide-react";
import { SUBSTANCES, CATEGORY_LABEL, RISK_META, assessPair } from "@/lib/substances";
import { profileFor, RISK_FLAG_META } from "@/lib/pharmacology";
import { RiskFlagChips } from "@/components/viz/RiskFlagChips";
import { CypBadges } from "@/components/viz/CypBadges";
import { NeuroProfile } from "@/components/neuro/NeuroProfile";

export const Route = createFileRoute("/substances/$slug")({
  component: SubstanceDetail,
  loader: ({ params }) => {
    const s = SUBSTANCES.find((x) => x.id === params.slug);
    if (!s) throw notFound();
    return { substance: s };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Substanz nicht gefunden</h1>
      <Link to="/substances" className="mt-4 inline-block text-accent">
        ← Zurück zum Wiki
      </Link>
    </div>
  ),
  head: ({ loaderData }) => {
    const name = loaderData?.substance.name ?? "Substanz";
    return {
      meta: [
        { title: `${name} — Pharmakologie & Risiko | Rave Safe, have Fun` },
        { name: "description", content: `${name}: Pharmakologie, Dosis, Wirkdauer, Rezeptorprofil und Risiko-Flags. Evidenzbasiert.` },
        { property: "og:title", content: `${name} — Pharmakologie & Risiko` },
        { property: "og:description", content: loaderData?.substance.shortDescription ?? "" },
      ],
    };
  },
});

const SECTIONS = [
  { id: "overview", label: "Übersicht" },
  { id: "pharma", label: "Pharma" },
  { id: "duration", label: "Dauer" },
  { id: "doses", label: "Dosis" },
  { id: "risks", label: "Risiken" },
  { id: "cardio", label: "Herz" },
  { id: "reports", label: "Reports" },
  { id: "sources", label: "Quellen" },
];

function SubstanceDetail() {
  const { substance: s } = Route.useLoaderData();
  const prof = profileFor(s.id);
  const [activeSec, setActiveSec] = useState("overview");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSec(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [s.id]);

  const isHighRisk = !!prof?.flags.some((f) =>
    ["respiratoryDepression", "qtProlongation", "cardiotoxic"].includes(f),
  );

  // dangerous combos: scan all substances, surface 5 worst pairs
  const dangerousCombos = SUBSTANCES
    .filter((o) => o.id !== s.id)
    .map((o) => ({ other: o, risk: assessPair(s.id, o.id) }))
    .filter((x) => x.risk.level === "danger" || x.risk.level === "unsafe")
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-12">
      {/* Hero */}
      <header className="pt-4 pb-2" id="overview">
        <div className="text-[11px] uppercase tracking-[0.18em] text-accent/80 font-medium">
          {CATEGORY_LABEL[s.category]}
        </div>
        <h1 className="mt-1 text-4xl font-bold font-display tracking-tight">{s.name}</h1>
        {s.aliases.length > 0 && (
          <div className="mt-1 text-sm text-muted-foreground">
            {s.aliases.join(" · ")}
          </div>
        )}
        <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">
          {s.shortDescription}
        </p>
        {prof && prof.flags.length > 0 && (
          <div className="mt-4">
            <RiskFlagChips flags={prof.flags} />
          </div>
        )}
      </header>

      {isHighRisk && (
        <div className="mt-4 glass-card p-4 border border-danger/40 bg-danger/[0.08] animate-pulse-soft">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm">Hochrisiko-Substanz</div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Diese Substanz hat dokumentierte Risiken für Atmung, Herzrhythmus oder Herzmuskel.
                Nie alleine, nie mit anderen Atemdepressiva, immer Notfallplan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sticky section nav */}
      <nav
        className="sticky top-12 z-30 -mx-4 px-4 py-2 backdrop-blur-2xl bg-background/65 border-b border-white/[0.05] mt-5"
        aria-label="Substanz-Sektionen"
      >
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {SECTIONS.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className={`pressable shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                activeSec === sec.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground bg-white/[0.04]"
              }`}
            >
              {sec.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Sections */}
      <section id="pharma" className="scroll-mt-28 mt-8">
        <SectionTitle>Pharmakologie</SectionTitle>
        {prof ? (
          <>
            <NeuroProfile profile={prof} />
            {prof.cyp.length > 0 && (
              <div className="glass-card p-4 mt-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  CYP-Interaktionen
                </div>
                <CypBadges cyp={prof.cyp} />
              </div>
            )}
            <div className="glass-card p-4 mt-4 text-sm">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
                Mechanismus
              </span>
              {s.mechanism}
            </div>
          </>
        ) : (
          <div className="glass-card p-4 text-sm text-muted-foreground">
            Detailliertes Pharmakologie-Profil noch nicht hinterlegt.
            <p className="mt-2 text-foreground">{s.mechanism}</p>
          </div>
        )}
      </section>

      <section id="duration" className="scroll-mt-28 mt-8">
        <SectionTitle icon={<Clock className="h-4 w-4" />}>Wirkdauer</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Eintritt</div>
            <div className="mt-1 font-mono text-base">{s.onset}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Dauer</div>
            <div className="mt-1 font-mono text-base">{s.duration}</div>
          </div>
        </div>
        <DurationStrip onset={s.onset} duration={s.duration} />
      </section>

      <section id="doses" className="scroll-mt-28 mt-8">
        <SectionTitle>Dosis-Bereiche</SectionTitle>
        <div className="space-y-3">
          {s.doses.map((d, i) => (
            <div key={i} className="glass-card p-4">
              <div className="font-semibold text-xs mb-2 uppercase tracking-wider text-accent">
                {d.route}
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-[11px]">
                <Dose label="Schwelle" v={d.threshold} tone="muted" />
                <Dose label="Leicht" v={d.light} tone="ok" />
                <Dose label="Üblich" v={d.common} tone="warn" />
                <Dose label="Stark" v={d.strong} tone="warn" />
                <Dose label="Heavy" v={d.heavy} tone="danger" />
              </div>
              {d.notes && (
                <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">{d.notes}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="risks" className="scroll-mt-28 mt-8">
        <SectionTitle>Risiken & Warnungen</SectionTitle>
        {s.warnings.length > 0 && (
          <div className="glass-card p-4">
            <ul className="space-y-2 text-sm">
              {s.warnings.map((w, i) => (
                <li key={i} className="flex gap-2 leading-relaxed">
                  <span className="text-accent mt-1.5 shrink-0">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {dangerousCombos.length > 0 && (
          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 px-1">
              Gefährliche Kombinationen
            </div>
            <div className="glass-card overflow-hidden divide-y divide-white/[0.05]">
              {dangerousCombos.map(({ other, risk }) => (
                <div key={other.id} className="p-3 flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full shrink-0`} style={{
                    background: risk.level === "danger" ? "var(--risk-danger)" : "var(--risk-unsafe)"
                  }} />
                  <span className="font-medium text-sm flex-1 min-w-0">
                    + {other.name}
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold ${RISK_META[risk.level].color}`}>
                    {RISK_META[risk.level].label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section id="cardio" className="scroll-mt-28 mt-8">
        <SectionTitle>Herz-Kreislauf-Profil</SectionTitle>
        <CardioMini flags={prof?.flags ?? []} />
      </section>

      <section id="reports" className="scroll-mt-28 mt-8">
        <SectionTitle>Erfahrungsberichte</SectionTitle>
        <div className="glass-card p-4">
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-warn font-semibold mb-2">
            <AlertTriangle className="h-3 w-3" /> Subjektiv — keine Faktenbasis
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Erfahrungsberichte sind individuell und nicht verallgemeinerbar. Für Berichte siehe
            externe Quellen wie{" "}
            <a className="text-accent hover:underline" href="https://erowid.org/" target="_blank" rel="noopener noreferrer">
              Erowid Experience Vaults
            </a>{" "}oder PsychonautWiki Reports. Diese App führt bewusst keine eigene Reports-Sammlung.
          </p>
        </div>
      </section>

      <section id="sources" className="scroll-mt-28 mt-8">
        <SectionTitle>Quellen & Evidenz</SectionTitle>
        <div className="glass-card p-4">
          <ul className="space-y-2 text-sm">
            {s.evidence.length > 0 ? s.evidence.map((e, i) => (
              <li key={i}>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  {e.label} <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            )) : (
              <li className="text-muted-foreground">Keine spezifischen Quellen hinterlegt.</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 px-1">
      {icon && <span className="text-accent">{icon}</span>}
      {children}
    </h2>
  );
}

function DurationStrip({ onset, duration }: { onset: string; duration: string }) {
  return (
    <div className="glass-card p-4 mt-3">
      <div className="relative h-10 rounded-xl bg-white/[0.04] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-accent/40 to-accent/20"
          title={`Onset ${onset}`}
        />
        <div
          className="absolute inset-y-0 left-[15%] w-[50%] bg-gradient-to-r from-accent/70 via-accent-glow/70 to-accent/60"
          title="Peak"
        />
        <div
          className="absolute inset-y-0 left-[65%] right-0 bg-gradient-to-r from-accent/30 to-accent/5"
          title="Comedown"
        />
        <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-mono text-foreground/90">
          <span>Onset · {onset}</span>
          <span>Peak</span>
          <span>Comedown</span>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground mt-1.5 text-center">
        Gesamte Wirkdauer: {duration}
      </div>
    </div>
  );
}

function Dose({
  label, v, tone = "muted",
}: {
  label: string; v?: string; tone?: "muted" | "ok" | "warn" | "danger";
}) {
  const toneClass: Record<string, string> = {
    muted: "bg-white/[0.04] text-muted-foreground",
    ok: "bg-[color:var(--ok)]/15 text-[color:var(--ok)]",
    warn: "bg-[color:var(--warn)]/15 text-[color:var(--warn)]",
    danger: "bg-[color:var(--danger)]/15 text-[color:var(--danger)]",
  };
  return (
    <div className={`rounded-lg px-1.5 py-1.5 text-center ${v ? toneClass[tone] : "bg-white/[0.02] text-muted-foreground/30"}`}>
      <div className="text-[9px] uppercase tracking-wider opacity-70">{label}</div>
      <div className="font-mono mt-0.5">{v ?? "—"}</div>
    </div>
  );
}

function CardioMini({ flags }: { flags: string[] }) {
  const stats = [
    { key: "qtProlongation", label: "QT-Intervall", suffix: "↑" },
    { key: "vasoconstriction", label: "Vasokonstriktion", suffix: "" },
    { key: "cardiotoxic", label: "Direkte Kardio-Last", suffix: "" },
    { key: "hyperthermia", label: "Hyperthermie", suffix: "" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s) => {
        const present = flags.includes(s.key);
        const meta = RISK_FLAG_META[s.key as keyof typeof RISK_FLAG_META];
        return (
          <div key={s.key} className="glass-card p-3.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${present ? "" : "opacity-30"}`}
                style={{ background: meta?.token, boxShadow: present ? `0 0 8px ${meta?.token}` : undefined }}
              />
              <span className="text-sm font-medium">
                {present ? "Belastet" : "Unauffällig"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Suppress unused
void ChevronDown;
