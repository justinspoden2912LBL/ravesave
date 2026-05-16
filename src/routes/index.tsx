import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Activity, BookOpen, GitMerge, Shield, Sparkles, UserCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SUBSTANCES } from "@/lib/substances";
import { loadProfile, isDismissed, dismissOnboarding } from "@/lib/profile";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "trace — Harm Reduction Tracker" },
      { name: "description", content: "Konsum protokollieren, Mischkonsum prüfen, Substanzen verstehen." },
    ],
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
        <div className="mt-6 rounded-2xl glass p-5 flex flex-col md:flex-row md:items-center gap-4 border border-primary/30">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-xs text-secondary">
              <UserCircle2 className="h-3.5 w-3.5" /> Erstes Mal hier?
            </div>
            <h3 className="mt-1 text-lg font-semibold">Richte dein Profil ein — 2 Minuten.</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Damit Dosis-Hinweise, Mischkonsum-Checks und KI-Antworten zu dir passen. Komplett lokal, jederzeit löschbar.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate({ to: "/onboarding" })}
              className="rounded-full bg-aurora animate-aurora px-5 py-2.5 text-sm font-semibold text-primary-foreground glow"
            >
              Starten
            </button>
            <button
              onClick={() => { dismissOnboarding(); setShowPrompt(false); }}
              className="rounded-full p-2 text-muted-foreground hover:text-foreground"
              title="Später"
            >
              <X className="h-4 w-4" />
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
          <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
            Dein <span className="text-aurora animate-aurora bg-aurora bg-clip-text">Bewusstsein</span><br />
            verdient ein Logbuch.
          </h1>
          <p className="mt-5 max-w-2xl text-muted-foreground text-lg">
            Protokolliere deinen Konsum, prüfe Mischkonsum-Risiken in Echtzeit
            und greife auf evidenzbasierte Informationen zu {SUBSTANCES.length}+ Substanzen zu.
            Ohne Belehrung, ohne Drama — nur Fakten.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/log"
              className="inline-flex items-center gap-2 rounded-full bg-aurora animate-aurora px-6 py-3 text-sm font-semibold text-primary-foreground glow transition-transform hover:scale-105"
            >
              <Activity className="h-4 w-4" /> Eintrag anlegen
            </Link>
            <Link
              to="/mix"
              className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted/40"
            >
              <GitMerge className="h-4 w-4" /> Mischkonsum prüfen
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid gap-4 md:grid-cols-3 mt-8">
        <FeatureCard
          to="/log"
          icon={Activity}
          title="Protokoll"
          desc="Zeitpunkt, Substanz, Dosis, Set & Setting. Mit Stimmungs-Tracking."
        />
        <FeatureCard
          to="/mix"
          icon={GitMerge}
          title="Mischkonsum-Check"
          desc="Ampelsystem für 2+ Substanzen — basierend auf TripSit & EMCDDA."
        />
        <FeatureCard
          to="/substances"
          icon={BookOpen}
          title="Substanz-Wiki"
          desc="Pharmakologie, Dosierung, Studienlinks. Klassische Drogen, Cathinone, Medikamente."
        />
      </section>

      {/* Principles */}
      <section className="mt-12 rounded-3xl glass p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" /> Grundprinzipien
        </div>
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

function FeatureCard({ to, icon: Icon, title, desc }: any) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl glass p-6 transition-all hover:scale-[1.02] hover:glow"
    >
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-aurora opacity-0 blur-2xl transition-opacity group-hover:opacity-40" />
      <Icon className="h-6 w-6 text-aurora" style={{ color: "oklch(0.78 0.22 320)" }} />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}

function Principle({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
