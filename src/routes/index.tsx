import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  Clock,
  GitMerge,
  Heart,
  MapPin,
  MessageCircle,
  Shield,
  ShieldAlert,
  Sparkles,
  TestTube,
  UserCircle2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SUBSTANCES } from "@/lib/substances";
import { loadProfile, isDismissed, dismissOnboarding } from "@/lib/profile";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Rave Safe, have Fun — Harm Reduction Companion" },
      { name: "description", content: "Konsum protokollieren, Mischkonsum prüfen, Substanzen verstehen — alles lokal im Browser." },
      { property: "og:title", content: "Rave Safe, have Fun — Harm Reduction Companion" },
      { property: "og:description", content: "Konsum protokollieren, Mischkonsum prüfen, Substanzen verstehen — alles lokal im Browser." },
      { property: "og:url", content: "https://ravesave.fun/" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.fun/" }],
  }),
});

function Home() {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!loadProfile() && !isDismissed()) {
      setShowPrompt(true);
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4">
      {showPrompt && (
        <div className="mt-6 rounded-2xl glass p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-5 border border-primary/30">
          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs text-secondary">
              <UserCircle2 className="h-3.5 w-3.5" /> Erstes Mal hier?
            </div>
            <h2 className="text-lg md:text-xl font-semibold leading-snug">
              Richte dein Profil ein — ca. 2 Minuten.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
              Damit Dosis-Hinweise, Mischkonsum-Checks und KI-Antworten zu dir passen.
              Komplett lokal, jederzeit löschbar.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate({ to: "/onboarding" })}
              className="inline-flex items-center gap-2 rounded-full bg-aurora animate-aurora px-6 py-3 text-sm font-semibold text-primary-foreground glow ring-2 ring-primary/40 hover:scale-[1.02] transition"
            >
              <Sparkles className="h-4 w-4" /> Jetzt starten
            </button>
            <button
              onClick={() => { dismissOnboarding(); setShowPrompt(false); }}
              className="inline-flex items-center justify-center rounded-full p-3 min-h-11 min-w-11 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
              title="Später"
              aria-label="Onboarding-Hinweis schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl glass mt-8 p-8 md:p-14">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-aurora animate-aurora opacity-40 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-aurora animate-aurora opacity-30 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
            <Shield className="h-3.5 w-3.5 text-secondary" />
            <span>100% lokal — keine Daten verlassen dein Gerät</span>
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            <span className="text-aurora animate-aurora bg-aurora bg-clip-text">Rave Safe</span>
            <span className="text-foreground">, have </span>
            <span className="text-aurora animate-aurora bg-aurora bg-clip-text">Fun</span>
            <span className="sr-only"> — Harm Reduction Companion für Raver:innen in DE/AT/CH</span>
          </h1>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-sm font-medium text-secondary ring-1 ring-secondary/30">
            <Sparkles className="h-3.5 w-3.5" /> Wissen statt Bauchgefühl.
          </p>
          <p className="mt-5 max-w-2xl text-muted-foreground text-lg">
            Safer-Use-Wissen, Notfallhilfe &amp; AI-Begleitung für Raver:innen in DE/AT/CH —
            evidenzbasiert, lokal, ohne Belehrung.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/notfall"
              className="inline-flex items-center gap-2 rounded-full bg-destructive px-6 py-3 text-sm font-semibold text-destructive-foreground shadow-lg ring-2 ring-destructive/40 hover:brightness-110 active:scale-95 transition"
            >
              <ShieldAlert className="h-4 w-4" /> Notfall jetzt
            </Link>
            <Link
              to="/substances"
              className="inline-flex items-center gap-2 rounded-full bg-aurora animate-aurora px-6 py-3 text-sm font-semibold text-primary-foreground glow transition-transform hover:scale-105 active:scale-95"
            >
              <BookOpen className="h-4 w-4" /> Safer Use lernen
            </Link>
            <Link
              to="/mix"
              className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted/40 active:scale-95"
            >
              <GitMerge className="h-4 w-4" /> Mischkonsum prüfen
            </Link>
          </div>
        </div>
      </section>

      {/* Direkter Quick-Hub — keine versteckten Accordions */}
      <section className="mt-8 space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
          Schnellzugriff
        </h2>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <QuickTile to="/notfall" icon={ShieldAlert} title="Notfall" desc="112, Erste Hilfe, Naloxon." tone="emergency" />
          <QuickTile to="/mix" icon={GitMerge} title="Mix-Check" desc="Ampel für 2+ Substanzen." tone="aurora" />
          <QuickTile to="/substances" icon={BookOpen} title="Substanz-Wiki" desc={`${SUBSTANCES.length}+ Stoffe, gruppiert.`} />
          <QuickTile to="/log" icon={Activity} title="Protokoll" desc="Konsum & Stimmung tracken." />
        </div>
      </section>

      {/* Praxis-Werkzeuge */}
      <section className="mt-8 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
            Praxis-Werkzeuge
          </h2>
          <span className="text-xs text-muted-foreground">Vor, während &amp; nach der Session</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickTile to="/session/active" icon={Activity} title="Aktive Session" desc="Live-Phasen, Anflug → Peak → Comedown." tone="aurora" />
          <QuickTile to="/risks" icon={ShieldAlert} title="Risiko-Übersicht" desc="Alle Paarungen pro Substanz." />
          <QuickTile to="/reagenztest" icon={TestTube} title="Reagent-Test" desc="Marquis, Mecke, Mandelin & Co." />
          <QuickTile to="/drugchecking" icon={MapPin} title="Drug-Checking" desc="Anlaufstellen DE / AT / CH." />
          <QuickTile to="/tolerance" icon={Clock} title="Toleranz & Cooldown" desc="Wann ist die nächste Session ok?" />
          <QuickTile to="/aftercare" icon={Heart} title="Aftercare" desc="Tag danach: Schlaf, Essen, Mood." />
          <QuickTile to="/safety-plan" icon={Shield} title="Safety-Plan" desc="Vorsätze für die nächste Session." />
          <QuickTile to="/chat" icon={MessageCircle} title="Marleen (KI)" desc="Fragen zur Studienlage." />
          <QuickTile to="/stats" icon={Sparkles} title="Statistik" desc="Muster, Häufigkeiten, Trends." />
        </div>
      </section>



      {/* Principles */}
      <section className="mt-12 rounded-3xl glass p-8">
        <h2 className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" /> Grundprinzipien
        </h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <Principle title="Start low, go slow.">
            Beginne immer mit der niedrigsten Dosis — besonders bei neuen Substanzen oder Chargen.
          </Principle>
          <Principle title="Test, was du nimmst.">
            Drug-Checking-Angebote (z.B. checkit!, Saferparty, DIMS) nutzen. Reagenztests sind ein Minimum.
          </Principle>
          <Principle title="Mischkonsum ist der größte Risikofaktor.">
            Die meisten Notfälle entstehen durch Kombinationen — vor allem Atemdepressiva untereinander.
          </Principle>
          <Principle title="Sei nicht allein.">
            Eine nüchterne Vertrauensperson ist die wirksamste Sicherheitsmaßnahme. Im Notfall: 112.
          </Principle>
        </div>
      </section>
    </div>
  );
}

function Principle({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function QuickTile({
  to,
  icon: Icon,
  title,
  desc,
  tone,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  tone?: "aurora" | "emergency";
}) {
  const iconBg =
    tone === "emergency"
      ? "bg-destructive ring-2 ring-destructive/40 animate-pulse"
      : tone === "aurora"
      ? "bg-aurora animate-aurora glow"
      : "bg-aurora animate-aurora opacity-80";
  const ring =
    tone === "emergency"
      ? "ring-1 ring-destructive/40 hover:ring-destructive/60"
      : "hover:ring-1 hover:ring-primary/30";
  return (
    <Link
      to={to}
      className={`group rounded-2xl glass p-4 hover-lift transition flex items-start gap-3 min-h-[88px] ${ring}`}
    >
      <div className={`h-11 w-11 shrink-0 rounded-xl grid place-items-center text-primary-foreground ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="font-semibold group-hover:text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </Link>
  );
}

