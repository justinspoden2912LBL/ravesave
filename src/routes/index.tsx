import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  Clock,
  GitMerge,
  Heart,
  HeartPulse,
  ListChecks,
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
import { DetailLevelSwitch } from "@/components/DetailLevelSwitch";
import { useText } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Rave Safe, have Fun — Der Copilot für Psychonauten" },
      { name: "description", content: "Modernes Safer Use / Harmreduction Tool \nFaktenbasiert / Substanz-Wiki \nKi unterstützt von psychonauten-für psychonauten" },
      { property: "og:title", content: "Rave Safe, have Fun — Der Copilot für Psychonauten" },
      { property: "og:description", content: "Modernes Safer Use / Harmreduction Tool \nFaktenbasiert / Substanz-Wiki \nKi unterstützt von psychonauten-für psychonauten" },
      { property: "og:url", content: "https://ravesave.de/" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.de/" }],
  }),
});

function Home() {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!loadProfile() && !isDismissed()) {
      setShowPrompt(true);
    }
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-4">
      {showPrompt && (
        <div className="mt-5 rounded-3xl glass-strong glass-shine p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-secondary">
              <UserCircle2 className="h-3.5 w-3.5" /> Erstes Mal hier?
            </div>
            <h2 className="text-base font-semibold leading-snug">
              Richte dein Profil ein — ca. 2 Minuten.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Damit Dosis-Hinweise, Mischkonsum-Checks und KI-Antworten zu dir passen. Komplett lokal.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate({ to: "/onboarding" })}
              className="inline-flex items-center gap-2 rounded-full bg-aurora animate-aurora px-5 py-3 text-sm font-semibold text-primary-foreground glow hover:scale-[1.02] transition"
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

      {/* Kopfzeile + Notfall-Anker */}
      <header className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.05]">
            <span className="text-aurora animate-aurora bg-aurora bg-clip-text">Rave Safe</span>
            <span className="text-foreground">, have </span>
            <span className="text-aurora animate-aurora bg-aurora bg-clip-text">Fun</span>
            <span className="sr-only"> — Harm Reduction Companion für Raver:innen in DE/AT/CH</span>
          </h1>
          <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Harm Reduction · DE / AT / CH
          </p>
        </div>
        <Link
          to="/notfall"
          className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-destructive/20 border border-destructive/50 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-destructive-foreground backdrop-blur-md hover:bg-destructive/30 active:scale-95 transition"
        >
          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          Notfall
        </Link>
      </header>

      {/* Kompakter Hero */}
      <section className="relative overflow-hidden rounded-3xl glass-strong glass-shine mt-4 p-5">
        <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-aurora animate-aurora opacity-25 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
              Safer-Use-Wissen, Notfallhilfe &amp; KI-Begleitung — evidenzbasiert und ohne Belehrung.
            </p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-secondary/15 ring-1 ring-secondary/30 px-3 py-1 text-[11px] text-secondary">
              <Shield className="h-3.5 w-3.5" />
              100% lokal — keine Daten verlassen dein Gerät
            </div>
          </div>
          <div className="shrink-0">
            <DetailLevelSwitch size="sm" />
          </div>
        </div>
      </section>

      {/* Marleen stellt sich vor */}
      <section className="mt-4 rounded-3xl glass-strong glass-shine p-5">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-aurora animate-aurora grid place-items-center text-primary-foreground glow">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div className="min-w-0 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
            <p className="text-foreground">
              {useText(
                "home.marleen.intro",
                "Hi, ich bin Marleen — dein Guide zum Thema Schadensminderung (Harm Reduction).",
              )}
            </p>
            <p>
              {useText(
                "home.marleen.body",
                "Ich gebe dir einen realistischen Check über Substanzen, Dosierungen und Risiken — ausschließlich neutral, ohne Bevormundung und ohne Ermutigung. Faktenbasiert, auf Grundlage anerkannter Quellen und Studien.",
              )}
            </p>
            <p>
              {useText(
                "home.marleen.mission",
                "Konsum ist immer ein Risiko. Meine Mission ist nicht, dir etwas auszureden — sondern deine Reise etwas sicherer zu machen.",
              )}
            </p>
            <p className="text-foreground font-medium">
              {useText("home.marleen.claim", "Ich bin quasi dein Anschnallgurt für Psychonauten.")}
            </p>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-full bg-primary/15 ring-1 ring-primary/30 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/25 transition"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Mit Marleen sprechen
            </Link>
          </div>
        </div>
      </section>




      {/* Featured: Akute Hilfe + Marleen */}
      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link
          to="/akut"
          className="group rounded-3xl glass-strong p-5 border border-secondary/30 hover:border-secondary/60 hover-lift transition"
        >
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-2xl bg-secondary/20 grid place-items-center text-secondary">
              <HeartPulse className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold uppercase rounded-full bg-secondary/20 text-secondary px-2 py-1">
              Sofort
            </span>
          </div>
          <h2 className="mt-3 font-semibold leading-snug">Wenn's gerade nicht gut ist</h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Atmen, erden, Comedown — ruhige Schritte zwischen Alltag und 112.
          </p>
        </Link>

        <Link
          to="/chat"
          className="group rounded-3xl p-5 border border-primary/30 hover:border-primary/60 hover-lift transition bg-primary/10 backdrop-blur-xl"
        >
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-2xl bg-aurora animate-aurora grid place-items-center text-primary-foreground glow">
              <MessageCircle className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold uppercase rounded-full bg-primary/20 text-primary px-2 py-1">
              KI
            </span>
          </div>
          <h2 className="mt-3 font-semibold leading-snug">Frag Marleen</h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Fragen zu Substanzen, Wechselwirkungen und Studienlage — jederzeit.
          </p>
        </Link>
      </section>

      {/* Alle Bereiche — kompakt, ohne Dopplungen */}
      <section className="mt-6 space-y-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
          <h2 className="section-label">Schnellzugriff</h2>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-[11px] font-semibold text-primary hover:underline shrink-0"
          >
            {showAll ? "Weniger anzeigen" : "Alle Bereiche"}
          </button>
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <QuickTile to="/mix" icon={GitMerge} title="Mix-Check" desc="Ampel für 2+ Substanzen." tone="primary" />
          <QuickTile to="/substances" icon={BookOpen} title="Substanz-Wiki" desc={`${SUBSTANCES.length}+ Stoffe`} tone="secondary" />
          <QuickTile to="/session/active" icon={Activity} title="Aktive Session" desc="Anflug → Peak → Comedown." tone="primary" />
          <QuickTile to="/checkliste" icon={ListChecks} title="Pre-Rave-Check" desc="Zwei Minuten vorher." tone="accent" />
        </div>

        {showAll && (
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 animate-fade-in">
            <QuickTile to="/log" icon={Activity} title="Protokoll" desc="Konsum & Stimmung." tone="secondary" />
            <QuickTile to="/risks" icon={ShieldAlert} title="Risiken" desc="Paarungen pro Substanz." tone="emergency" />
            <QuickTile to="/drugchecking" icon={MapPin} title="Drug-Checking" desc="Stellen DE / AT / CH." tone="accent" />
            <QuickTile to="/reagenztest" icon={TestTube} title="Reagent-Test" desc="Marquis, Mecke & Co." tone="secondary" />
            <QuickTile to="/tolerance" icon={Clock} title="Toleranz" desc="Wann ist ok?" tone="accent" />
            <QuickTile to="/aftercare" icon={Heart} title="Aftercare" desc="Schlaf, Essen, Mood." tone="secondary" />
            <QuickTile to="/safety-plan" icon={Shield} title="Safety-Plan" desc="Vorsätze fürs nächste Mal." tone="primary" />
            <QuickTile to="/notfall" icon={ShieldAlert} title="Notfall" desc="112, Erste Hilfe, Naloxon." tone="emergency" />
          </div>
        )}
      </section>

      {/* Grundprinzipien — kompakt */}
      <section className="mt-6 rounded-3xl glass p-5">
        <h2 className="section-label flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> Grundprinzipien
        </h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Start low, go slow.</strong> Niedrig dosieren, besonders bei neuen Chargen.</li>
          <li><strong className="text-foreground">Test, was du nimmst.</strong> Drug-Checking oder mind. Reagenztest.</li>
          <li><strong className="text-foreground">Mischkonsum ist Risiko Nr. 1.</strong> Vor allem Atemdepressiva.</li>
          <li><strong className="text-foreground">Sei nicht allein.</strong> Nüchterne Vertrauensperson. Im Notfall: 112.</li>
        </ul>
      </section>

    </div>
  );
}

function Principle({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

const TILE_TONES: Record<string, { chip: string; ring: string }> = {
  emergency: {
    chip: "bg-destructive/20 text-destructive ring-1 ring-destructive/40",
    ring: "border-destructive/25 hover:border-destructive/50",
  },
  primary: {
    chip: "bg-primary/20 text-primary ring-1 ring-primary/40",
    ring: "border-white/10 hover:border-primary/50",
  },
  secondary: {
    chip: "bg-secondary/20 text-secondary ring-1 ring-secondary/40",
    ring: "border-white/10 hover:border-secondary/50",
  },
  accent: {
    chip: "bg-accent/20 text-accent ring-1 ring-accent/40",
    ring: "border-white/10 hover:border-accent/50",
  },
};

function QuickTile({
  to,
  icon: Icon,
  title,
  desc,
  tone = "primary",
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  tone?: "primary" | "secondary" | "accent" | "emergency";
}) {
  const t = TILE_TONES[tone];
  return (
    <Link
      to={to}
      className={`group rounded-3xl glass p-4 hover-lift transition flex flex-col gap-3 min-h-[112px] ${t.ring}`}
    >
      <div className={`h-9 w-9 shrink-0 rounded-xl grid place-items-center ${t.chip}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-sm leading-tight">{title}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{desc}</div>
      </div>
    </Link>
  );
}


