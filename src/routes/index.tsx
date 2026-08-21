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
import heroImage from "@/assets/hero-rave.jpg";


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
    <div className="mx-auto max-w-5xl px-4 pb-8">
      {showPrompt && (
        <div className="mt-5 border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4 bg-muted/20">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="inline-flex items-center gap-2 tag-label">
              <UserCircle2 className="h-3.5 w-3.5" /> Erstes Mal hier
            </div>
            <h2 className="text-lg font-bold leading-snug">Richte dein Profil ein — ca. 2 Minuten.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Damit Dosis-Hinweise, Mischkonsum-Checks und KI-Antworten zu dir passen. Komplett lokal.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate({ to: "/onboarding" })}
              className="inline-flex min-h-11 items-center gap-2 bg-primary px-5 text-sm font-semibold uppercase tracking-[0.1em] text-primary-foreground hover:bg-primary/85 transition-colors"
            >
              <Sparkles className="h-4 w-4" /> Starten
            </button>
            <button
              onClick={() => {
                dismissOnboarding();
                setShowPrompt(false);
              }}
              className="inline-flex items-center justify-center min-h-11 min-w-11 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Onboarding-Hinweis schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Hero — Foto + Editorial-Typo */}
      <header className="mt-6">
        <div className="relative overflow-hidden border border-border">
          <img
            src={heroImage}
            alt="Dunkle Crowd auf einem Rave, Lichtstrahl im Nebel"
            width={1600}
            height={1104}
            className="h-[46vh] min-h-[300px] w-full object-cover opacity-70"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--background) 8%, oklch(0.15 0.006 285 / 0.75) 55%, oklch(0.15 0.006 285 / 0.35))",
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
            <span className="tag-label">Rave Safe / Harm Reduction</span>
            <h1 className="mt-3 text-[2.4rem] sm:text-6xl font-extrabold leading-[0.95] tracking-tight">
              Deine Nacht.
              <br />
              <span className="font-medium text-muted-foreground">Deine Entscheidung.</span>
              <br />
              <span className="text-primary">Deine Sicherheit.</span>
            </h1>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <p className="max-w-xl text-base text-muted-foreground leading-relaxed">
            Safer-Use-Wissen, akute Hilfe und Substanzprofile an einem Ort — evidenzbasiert, lokal
            gespeichert und ohne Belehrung.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 border border-secondary/40 px-3 py-1.5 text-xs text-secondary">
              <Shield className="h-3.5 w-3.5" /> 100 % lokal
            </span>
            <DetailLevelSwitch size="sm" />
          </div>
        </div>
      </header>

      {/* Vier Grundregeln — nummeriert, editorial */}
      <section className="mt-10 border-t border-border" aria-label="Grundregeln">
        <h2 className="section-label pt-5">Vier Grundregeln</h2>
        <div className="mt-4 grid gap-px bg-border sm:grid-cols-2">
          {[
            ["Start low, go slow.", "Niedrig dosieren, besonders bei neuen Chargen. Warte, bevor du nachlegst."],
            ["Test, was du nimmst.", "Drug-Checking oder mindestens ein Reagenztest."],
            ["Mischkonsum ist der größte Risikofaktor.", "Vor allem alles, was die Atmung dämpft."],
            ["Sei nicht allein.", "Eine nüchterne Vertrauensperson in der Nähe. Im Notfall: 112."],
          ].map(([title, body], idx) => (
            <div key={title} className="bg-background p-5">
              <span className="num-marker">{String(idx + 1).padStart(2, "0")}</span>
              <p className="mt-2 text-lg font-bold leading-snug">{title}</p>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Akute Hilfe — immer als erstes Handlungsangebot */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="Sofort-Hilfe">
        <Link
          to="/akut"
          className="group border border-border p-6 hover:border-secondary/70 transition-colors"
        >
          <HeartPulse className="h-6 w-6 text-secondary" strokeWidth={1.5} />
          <h2 className="mt-4 text-xl font-bold leading-snug">Ich brauche akute Hilfe</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Ruhige Schritte zwischen Alltag und 112: Atmung, Erden, Comedown. Bei echter Gefahr immer 112 rufen.
          </p>
        </Link>
        <Link
          to="/notfall"
          className="group border border-destructive/45 p-6 hover:border-destructive transition-colors"
        >
          <ShieldAlert className="h-6 w-6 text-destructive" strokeWidth={1.5} />
          <h2 className="mt-4 text-xl font-bold leading-snug">Notfall — 112</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Bewusstlosigkeit, Krampf, Atemnot, sehr hohe Temperatur: sofort Notruf. Hier stehen die Schritte.
          </p>
        </Link>
      </section>


      {/* Marleen */}
      <section className="mt-10 border-t border-border pt-5">
        <h2 className="section-label">Dein Guide</h2>
        <div className="mt-4 flex items-start gap-4 border border-border p-5">
          <div className="h-11 w-11 shrink-0 border border-primary/50 grid place-items-center text-primary">

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
              className="inline-flex min-h-11 items-center gap-2 border border-primary/50 px-4 text-xs font-bold uppercase tracking-[0.14em] text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> Mit Marleen sprechen
            </Link>
          </div>
        </div>
      </section>

      {/* Phasen — Accordion, immer nur eine Ebene offen */}
      <section className="mt-10 border-t border-border pt-5" aria-label="Bereiche nach Situation">
        <h2 className="section-label">Wo stehst du gerade?</h2>
        <div className="mt-4 border-t border-border">
        {PHASES.map((p) => {
          const isOpen = open === p.id;
          return (
            <div key={p.id} className="border-b border-border">

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
