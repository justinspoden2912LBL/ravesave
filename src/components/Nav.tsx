import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BookOpen,
  Clock,
  Download,
  FlaskConical,
  GitMerge,
  HandHeart,
  Heart,
  HeartPulse,
  Home,
  Info,
  ListChecks,
  MapPin,
  MessageCircle,
  Newspaper,
  Search,
  Settings as SettingsIcon,
  Shield,
  ShieldAlert,
  Sparkles,
  TestTube,
  Users,
  type LucideIcon,
} from "lucide-react";
import { DetailLevelSwitch } from "@/components/DetailLevelSwitch";

/**
 * Navigation in zwei Ebenen — entlang der Nutzungs-Situation statt entlang
 * der Feature-Liste:
 *
 *  Primär-Nav (immer sichtbar):
 *    Home · Akute Hilfe · Vor dem Rave · Während · Danach · Für andere · Wissen
 *
 *  Sekundär-Nav (kontextabhängig):
 *    zeigt die Seiten der aktiven Gruppe. Keine Seite geht verloren —
 *    sie ist nur nicht mehr alles gleichzeitig sichtbar.
 *
 * Ruhige Bewegung, große Touch-Targets (min-h-11), hoher Kontrast.
 */

type Tone = "primary" | "secondary" | "accent" | "danger" | "neutral";

type NavItem = { to: string; label: string; icon: LucideIcon; desc?: string };

type NavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  tone: Tone;
  /** Direkt-Ziel beim Klick auf die Gruppe */
  to: string;
  items: NavItem[];
};

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    id: "akut",
    label: "Akute Hilfe",
    icon: HeartPulse,
    tone: "danger",
    to: "/akut",
    items: [
      { to: "/akut", label: "Ruhig werden", icon: HeartPulse, desc: "Atmen, erden, Comedown" },
      { to: "/notfall", label: "Notfall & 112", icon: ShieldAlert, desc: "Erste Hilfe, stabile Seitenlage" },
      { to: "/risks", label: "Risiken", icon: Shield, desc: "Was wirklich gefährlich wird" },
    ],
  },
  {
    id: "vorher",
    label: "Vor dem Rave",
    icon: ListChecks,
    tone: "accent",
    to: "/checkliste",
    items: [
      { to: "/checkliste", label: "Checkliste", icon: ListChecks, desc: "Set & Setting, Wasser, Kontakte" },
      { to: "/safety-plan", label: "Safety-Plan", icon: Shield, desc: "Vorsätze festhalten" },
      { to: "/drugchecking", label: "Drug-Checking", icon: MapPin, desc: "Stellen in DE / AT / CH" },
      { to: "/reagenztest", label: "Reagenztest", icon: TestTube, desc: "Marquis, Mecke & Co." },
      { to: "/tolerance", label: "Toleranz", icon: Clock, desc: "Wann ist wieder ok?" },
    ],
  },
  {
    id: "waehrend",
    label: "Während",
    icon: Activity,
    tone: "primary",
    to: "/session/active",
    items: [
      { to: "/session/active", label: "Aktive Session", icon: Activity, desc: "Anflug → Peak → Comedown" },
      { to: "/mix", label: "Mix-Check", icon: GitMerge, desc: "Ampel für Mischkonsum" },
      { to: "/knigge", label: "Knigge", icon: HandHeart, desc: "Respektvolles Nightlife" },
      { to: "/chat", label: "KI-Chat", icon: MessageCircle, desc: "Marleen fragen" },
    ],
  },
  {
    id: "danach",
    label: "Danach",
    icon: Heart,
    tone: "secondary",
    to: "/aftercare",
    items: [
      { to: "/aftercare", label: "Aftercare", icon: Heart, desc: "Schlaf, Essen, Mood" },
      { to: "/log", label: "Protokoll", icon: Activity, desc: "Konsum & Stimmung" },
      { to: "/stats", label: "Statistik", icon: FlaskConical, desc: "Deine Muster" },
    ],
  },
  {
    id: "wissen",
    label: "Wissen",
    icon: BookOpen,
    tone: "secondary",
    to: "/substances",
    items: [
      { to: "/substances", label: "Substanzen", icon: BookOpen, desc: "Evidenzbasierte Profile" },
      { to: "/mix", label: "Mix-Check", icon: GitMerge, desc: "Wechselwirkungen" },
      { to: "/risks", label: "Risiken", icon: Shield, desc: "Grundlagen & Mischkonsum" },
      { to: "/erfahrungen", label: "Blog", icon: Newspaper, desc: "Berichte & Artikel" },
    ],
  },
  {
    id: "andere",
    label: "Für andere",
    icon: Users,
    tone: "danger",
    to: "/notfall",
    items: [
      { to: "/notfall", label: "Erste Hilfe", icon: ShieldAlert, desc: "Wenn es jemandem schlecht geht" },
      { to: "/akut", label: "Beruhigen & begleiten", icon: HeartPulse, desc: "Da sein ohne Panik" },
      { to: "/knigge", label: "Knigge", icon: HandHeart, desc: "Konsens & Rücksicht" },
      { to: "/chat", label: "Marleen fragen", icon: MessageCircle, desc: "Einschätzung holen" },
    ],
  },
] as const;

const META_ITEMS: NavItem[] = [
  { to: "/about", label: "Über uns", icon: Info },
  { to: "/install", label: "App installieren", icon: Download },
  { to: "/settings", label: "Profil", icon: SettingsIcon },
];

const toneClasses: Record<Tone, { idle: string; iconIdle: string }> = {
  primary: { idle: "border-border/70 hover:border-primary/60", iconIdle: "text-primary/80" },
  secondary: { idle: "border-border/70 hover:border-secondary/60", iconIdle: "text-secondary/80" },
  accent: { idle: "border-border/70 hover:border-accent/60", iconIdle: "text-accent/80" },
  danger: { idle: "border-destructive/35 hover:border-destructive/70", iconIdle: "text-destructive" },
  neutral: { idle: "border-border/70 hover:border-foreground/40", iconIdle: "text-muted-foreground" },
};

function groupForPath(path: string): string | null {
  for (const g of NAV_GROUPS) {
    if (g.items.some((i) => i.to === path)) return g.id;
  }
  return null;
}

export function Nav() {
  const loc = useLocation();
  const path = loc.pathname;
  const detected = useMemo(() => groupForPath(path), [path]);
  const [openGroup, setOpenGroup] = useState<string | null>(detected);
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpenGroup(detected);
  }, [detected]);

  const active = NAV_GROUPS.find((g) => g.id === openGroup) ?? null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 h-14 flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60"
          aria-label="Rave Safe, have Fun — zur Startseite"
        >
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
          <span className="font-display text-sm font-800 uppercase tracking-[0.2em] whitespace-nowrap"
            style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>
            Rave&nbsp;Safe
          </span>
        </Link>

        <div className="flex-1" />

        <div className="hidden md:block shrink-0">
          <DetailLevelSwitch size="sm" />
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("ravesave:open-spotlight"))}
          className="shrink-0 inline-flex items-center justify-center h-11 w-11 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Suche öffnen (⌘K)"
          title="Suche (⌘K / Strg+K)"
        >
          <Search className="h-5 w-5" />
        </button>
        <Link
          to="/notfall"
          className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 border border-destructive/50 text-destructive text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-destructive/10 transition-colors"
        >
          <ShieldAlert className="h-4 w-4" /> <span className="hidden xs:inline sm:inline">112</span>
        </Link>
      </div>

      {/* Primär-Nav */}
      <div
        ref={rowRef}
        className="mx-auto max-w-6xl overflow-x-auto overscroll-x-contain scrollbar-hide touch-pan-x px-3 sm:px-4 border-t border-border/50"
        aria-label="Hauptnavigation"
      >
        <ul className="flex items-center gap-1 w-max">
          <li>
            <Link
              to="/"
              aria-current={path === "/" ? "page" : undefined}
              className={`inline-flex min-h-11 items-center gap-1.5 px-3 text-[13px] font-semibold uppercase tracking-[0.08em] border-b-2 transition-colors ${
                path === "/"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="h-4 w-4" /> Home
            </Link>
          </li>
          {NAV_GROUPS.map((g) => {
            const t = toneClasses[g.tone];
            const isOpen = openGroup === g.id;
            return (
              <li key={g.id}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenGroup(isOpen ? null : g.id)}
                  className={`inline-flex min-h-11 items-center gap-1.5 px-3 text-[13px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap border-b-2 transition-colors focus-visible:outline-none ${
                    isOpen
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <g.icon className={`h-4 w-4 ${isOpen ? "text-primary" : t.iconIdle}`} />
                  {g.label}
                </button>
              </li>
            );
          })}
          <li aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
          <li className="md:hidden pr-1 py-1.5">
            <DetailLevelSwitch size="sm" />
          </li>
        </ul>
      </div>

      {/* Sekundär-Nav */}
      {active && (
        <div className="border-t border-border/50 bg-muted/20">
          <div className="mx-auto max-w-6xl overflow-x-auto scrollbar-hide touch-pan-x px-3 sm:px-4 py-1.5">
            <ul className="flex items-center gap-1 w-max" aria-label={`Unternavigation ${active.label}`}>
              {active.items.map((i) => {
                const isActive = path === i.to;
                return (
                  <li key={`${active.id}-${i.to}`}>
                    <Link
                      to={i.to}
                      aria-current={isActive ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center gap-1.5 px-3 text-sm transition-colors ${
                        isActive
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <i.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                      {i.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}


export function Footer() {
  const cols: { title: string; items: NavItem[] }[] = [
    ...NAV_GROUPS.filter((g) => g.id !== "andere").map((g) => ({ title: g.label, items: g.items.slice(0, 4) })),
    { title: "Mehr", items: META_ITEMS },
  ];

  return (
    <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground space-y-8">
      <nav aria-label="Footernavigation" className="grid gap-6 grid-cols-2 md:grid-cols-5">
        {cols.map((c) => (
          <div key={c.title}>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/80">{c.title}</h2>
            <ul className="mt-2 space-y-0.5">
              {c.items.map((i) => (
                <li key={`${c.title}-${i.to}`}>
                  <Link
                    to={i.to}
                    className="inline-flex min-h-11 items-center text-sm hover:text-foreground transition-colors"
                  >
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-border/50 pt-6 text-xs">
        <p className="inline-flex items-center gap-2 rounded-full bg-secondary/15 ring-1 ring-secondary/30 px-3 py-1.5 text-secondary">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Alles bleibt lokal auf deinem Gerät — kein Tracking deiner Eingaben.
        </p>
        <p className="leading-relaxed">
          <strong className="text-foreground">Rave Safe, have Fun</strong> ist ein
          Harm-Reduction-Companion — aktuell in der <strong className="text-secondary">Open Beta</strong>.
          Dosis-Angaben sind grobe Orientierungswerte aus PsychonautWiki, TripSit, EMCDDA und
          Fachliteratur — keine medizinische Empfehlung. Start low, go slow. Teste, was du nimmst.
          Sei nicht allein. Im Notfall: <strong className="text-foreground">112</strong>.
        </p>
      </div>
    </footer>
  );
}
