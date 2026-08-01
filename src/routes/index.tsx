import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  ChevronDown,
  Clock,
  FlaskConical,
  GitMerge,
  HandHeart,
  Heart,
  HeartPulse,
  ListChecks,
  MapPin,
  MessageCircle,
  Newspaper,
  Shield,
  ShieldAlert,
  Sparkles,
  TestTube,
  UserCircle2,
  Users,
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
      { title: "Rave Safe, have Fun — Harm-Reduction-Companion" },
      {
        name: "description",
        content:
          "Dein Harm-Reduction-Companion: Substanz-Wissen, Mix-Check, akute Hilfe und KI-Coach. Start low, go slow. Teste, was du nimmst. Sei nicht allein.",
      },
      { property: "og:title", content: "Rave Safe, have Fun — Harm-Reduction-Companion" },
      {
        property: "og:description",
        content:
          "Substanz-Wissen, Mix-Check, akute Hilfe und KI-Coach — evidenzbasiert, lokal, ohne Belehrung.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://ravesave.de/" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.de/" }],
  }),
});

type Tone = "primary" | "secondary" | "accent" | "emergency";

const PHASES: {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  tone: Tone;
  items: { to: string; icon: LucideIcon; title: string; desc: string }[];
}[] = [
  {
    id: "vorher",
    label: "Vor dem Rave",
    hint: "Vorbereiten, testen, absprechen",
    icon: ListChecks,
    tone: "accent",
    items: [
      { to: "/checkliste", icon: ListChecks, title: "Checkliste", desc: "Set & Setting, Wasser, Kontakte" },
      { to: "/substances", icon: BookOpen, title: "Substanzen", desc: `${SUBSTANCES.length}+ Profile` },
      { to: "/mix", icon: GitMerge, title: "Mix-Check", desc: "Ampel für Mischkonsum" },
      { to: "/drugchecking", icon: MapPin, title: "Drug-Checking", desc: "Stellen DE / AT / CH" },
      { to: "/reagenztest", icon: TestTube, title: "Reagenztest", desc: "Marquis, Mecke & Co." },
      { to: "/tolerance", icon: Clock, title: "Toleranz", desc: "Wann ist wieder ok?" },
      { to: "/safety-plan", icon: Shield, title: "Safety-Plan", desc: "Vorsätze festhalten" },
    ],
  },
  {
    id: "waehrend",
    label: "Während des Raves",
    hint: "Überblick behalten, nachfragen",
    icon: Activity,
    tone: "primary",
    items: [
      { to: "/session/active", icon: Activity, title: "Aktive Session", desc: "Anflug → Peak → Comedown" },
      { to: "/mix", icon: GitMerge, title: "Mix-Check", desc: "Bevor du kombinierst" },
      { to: "/knigge", icon: HandHeart, title: "Knigge", desc: "Konsens & Rücksicht" },
      { to: "/chat", icon: MessageCircle, title: "KI-Chat", desc: "Marleen fragen" },
    ],
  },
  {
    id: "danach",
    label: "Nach dem Rave",
    hint: "Runterkommen, auffüllen, reflektieren",
    icon: Heart,
    tone: "secondary",
    items: [
      { to: "/aftercare", icon: Heart, title: "Aftercare", desc: "Schlaf, Essen, Mood" },
      { to: "/log", icon: Activity, title: "Protokoll", desc: "Konsum & Stimmung" },
      { to: "/stats", icon: FlaskConical, title: "Statistik", desc: "Deine Muster" },
      { to: "/erfahrungen", icon: Newspaper, title: "Blog", desc: "Berichte & Artikel" },
    ],
  },
  {
    id: "andere",
    label: "Ich sorge mich um jemanden",
    hint: "Da sein, einschätzen, handeln",
    icon: Users,
    tone: "emergency",
    items: [
      { to: "/notfall", icon: ShieldAlert, title: "Erste Hilfe", desc: "112, stabile Seitenlage" },
      { to: "/akut", icon: HeartPulse, title: "Beruhigen", desc: "Atmen, erden, begleiten" },
      { to: "/risks", icon: Shield, title: "Risiken", desc: "Was wirklich gefährlich wird" },
      { to: "/chat", icon: MessageCircle, title: "Marleen fragen", desc: "Einschätzung holen" },
    ],
  },
];

function Home() {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [open, setOpen] = useState<string | null>("vorher");

  useEffect(() => {
    if (!loadProfile() && !isDismissed()) setShowPrompt(true);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-6">
      {showPrompt && (
        <div className="mt-5 rounded-3xl glass-strong glass-shine p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-secondary">
              <UserCircle2 className="h-3.5 w-3.5" /> Erstes Mal hier?
            </div>
            <h2 className="text-base font-semibold leading-snug">Richte dein Profil ein — ca. 2 Minuten.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Damit Dosis-Hinweise, Mischkonsum-Checks und KI-Antworten zu dir passen. Komplett lokal.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate({ to: "/onboarding" })}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-aurora px-5 text-sm font-semibold text-primary-foreground glow transition"
            >
              <Sparkles className="h-4 w-4" /> Jetzt starten
            </button>
            <button
              onClick={() => {
                dismissOnboarding();
                setShowPrompt(false);
              }}
              className="inline-flex items-center justify-center rounded-full min-h-11 min-w-11 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
              aria-label="Onboarding-Hinweis schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Claim */}
      <header className="mt-6">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.05]">
          <span className="text-aurora bg-aurora bg-clip-text">Rave Safe</span>
          <span className="text-foreground">, have </span>
          <span className="text-aurora bg-aurora bg-clip-text">Fun</span>
        </h1>
        <p className="mt-2 text-lg md:text-xl font-semibold text-foreground">
          Dein Harm-Reduction-Companion.
        </p>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Safer-Use-Wissen, akute Hilfe und KI-Begleitung — evidenzbasiert, lokal und ohne Belehrung.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/15 ring-1 ring-secondary/30 px-3 py-1.5 text-xs text-secondary">
            <Shield className="h-3.5 w-3.5" /> 100 % lokal — keine Daten verlassen dein Gerät
          </span>
          <DetailLevelSwitch size="sm" />
        </div>
      </header>

      {/* Vier Grundregeln — direkt unter dem Claim, maximal scanbar */}
      <section className="mt-5 grid gap-3 sm:grid-cols-2" aria-label="Grundregeln">
        {[
          ["Start low, go slow.", "Niedrig dosieren, besonders bei neuen Chargen. Warte, bevor du nachlegst."],
          ["Test, was du nimmst.", "Drug-Checking oder mindestens ein Reagenztest."],
          ["Mischkonsum ist der größte Risikofaktor.", "Vor allem alles, was die Atmung dämpft."],
          ["Sei nicht allein.", "Eine nüchterne Vertrauensperson in der Nähe. Im Notfall: 112."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-2xl glass p-4">
            <p className="font-semibold leading-snug">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{body}</p>
          </div>
        ))}
      </section>

      {/* Akute Hilfe — immer als erstes Handlungsangebot */}
      <section className="mt-5 grid gap-3 sm:grid-cols-2" aria-label="Sofort-Hilfe">
        <Link
          to="/akut"
          className="rounded-3xl glass-strong p-5 border border-secondary/40 hover:border-secondary/70 transition"
        >
          <div className="h-11 w-11 rounded-2xl bg-secondary/20 grid place-items-center text-secondary">
            <HeartPulse className="h-6 w-6" />
          </div>
          <h2 className="mt-3 font-semibold leading-snug">Ich brauche akute Hilfe</h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Ruhige Schritte zwischen Alltag und 112: Atmung, Erden, Comedown. Bei echter Gefahr immer 112 rufen.
          </p>
        </Link>
        <Link
          to="/notfall"
          className="rounded-3xl p-5 border border-destructive/45 bg-destructive/10 backdrop-blur-xl hover:border-destructive/70 transition"
        >
          <div className="h-11 w-11 rounded-2xl bg-destructive/20 grid place-items-center text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-3 font-semibold leading-snug">Notfall — 112</h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Bewusstlosigkeit, Krampf, Atemnot, sehr hohe Temperatur: sofort Notruf. Hier stehen die Schritte.
          </p>
        </Link>
      </section>

      {/* Marleen */}
      <section className="mt-5 rounded-3xl glass-strong glass-shine p-5">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-aurora grid place-items-center text-primary-foreground glow">
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
            <p className="text-foreground font-medium">
              {useText("home.marleen.claim", "Ich bin quasi dein Anschnallgurt für Psychonauten.")}
            </p>
            <Link
              to="/chat"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary/15 ring-1 ring-primary/30 px-4 text-sm font-semibold text-primary hover:bg-primary/25 transition"
            >
              <MessageCircle className="h-4 w-4" /> Mit Marleen sprechen
            </Link>
          </div>
        </div>
      </section>

      {/* Phasen — Accordion, immer nur eine Ebene offen */}
      <section className="mt-6 space-y-3" aria-label="Bereiche nach Situation">
        <h2 className="section-label">Wo stehst du gerade?</h2>
        {PHASES.map((p) => {
          const isOpen = open === p.id;
          return (
            <div key={p.id} className="rounded-3xl glass overflow-hidden">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : p.id)}
                className="w-full min-h-14 px-4 py-3 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors"
              >
                <span className={`h-10 w-10 shrink-0 rounded-2xl grid place-items-center ${TILE_TONES[p.tone].chip}`}>
                  <p.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug">{p.label}</span>
                  <span className="block text-xs text-muted-foreground">{p.hint}</span>
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-3 pb-3 grid gap-3 grid-cols-2 lg:grid-cols-4">
                  {p.items.map((i) => (
                    <QuickTile key={`${p.id}-${i.to}`} {...i} tone={p.tone} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

const TILE_TONES: Record<Tone, { chip: string; ring: string }> = {
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
  tone?: Tone;
}) {
  const t = TILE_TONES[tone];
  return (
    <Link
      to={to}
      className={`rounded-2xl glass-strong p-4 border transition flex flex-col gap-3 min-h-[112px] ${t.ring}`}
    >
      <div className={`h-9 w-9 shrink-0 rounded-xl grid place-items-center ${t.chip}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-sm leading-tight">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground leading-snug">{desc}</div>
      </div>
    </Link>
  );
}
