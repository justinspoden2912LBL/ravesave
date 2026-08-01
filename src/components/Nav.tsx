import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  FlaskConical,
  GitMerge,
  HandHeart,
  Heart,
  Home,
  Info,
  ListChecks,
  MessageCircle,
  Search,
  Settings as SettingsIcon,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { DetailLevelSwitch } from "@/components/DetailLevelSwitch";

/**
 * Top-Nav mit horizontal scrollbarer Kategorien-Leiste.
 * Verbesserungen:
 *  - Kategorien sind nach Bereich (Hilfe / Wissen / Mein) farblich getönt,
 *    bleiben aber konsistent in Form & Größe.
 *  - Aktiver Tab: gefüllter Aurora-Pill mit Glow + dünner Top-Indikator.
 *  - Inaktive Tabs: Glas-Pill mit dezenter Tönung, klar lesbar.
 *  - Scroll-Affordance: Edge-Fades links/rechts werden nur eingeblendet,
 *    wenn in diese Richtung noch gescrollt werden kann; auf md+ zusätzlich
 *    Pfeil-Buttons. So sieht man sofort, dass die Leiste wischbar ist.
 *  - Aktiver Tab scrollt sich automatisch in den Sichtbereich.
 *  - Tiefe-Schalter (Kurz · Erweitert · Experte) ist visuell abgesetzt
 *    sichtbar — auf md+ rechts neben der Leiste, auf Mobile am Ende der
 *    Scroll-Reihe nach einem Trenner.
 */

type Tone = "primary" | "secondary" | "accent" | "danger" | "neutral";

type NavLink = {
  to: string;
  label: string;
  icon: LucideIcon;
  tone: Tone;
};

const links: readonly NavLink[] = [
  { to: "/", label: "Home", icon: Home, tone: "neutral" },
  // Hilfe / Schutz — warme, dringliche Töne
  { to: "/akut", label: "Akute Hilfe", icon: Heart, tone: "danger" },
  { to: "/risks", label: "Risiken", icon: ShieldAlert, tone: "danger" },
  { to: "/checkliste", label: "Checkliste", icon: ListChecks, tone: "accent" },
  // Wissen — kühlere, sachliche Töne
  { to: "/substances", label: "Substanzen", icon: BookOpen, tone: "secondary" },
  { to: "/mix", label: "Mix-Check", icon: GitMerge, tone: "secondary" },
  { to: "/knigge", label: "Knigge", icon: HandHeart, tone: "secondary" },
  // Persönlich / KI — primärfarben
  { to: "/chat", label: "KI-Chat", icon: MessageCircle, tone: "primary" },
  { to: "/log", label: "Protokoll", icon: Activity, tone: "primary" },
  { to: "/stats", label: "Statistik", icon: FlaskConical, tone: "primary" },
  // Meta
  { to: "/install", label: "App installieren", icon: Download, tone: "neutral" },
  { to: "/about", label: "Über", icon: Info, tone: "neutral" },
  { to: "/settings", label: "Profil", icon: SettingsIcon, tone: "neutral" },
] as const;

const toneClasses: Record<Tone, { idle: string; iconIdle: string; ring: string }> = {
  primary: {
    idle: "bg-primary/8 hover:bg-primary/15 border-primary/20",
    iconIdle: "text-primary",
    ring: "ring-primary/30",
  },
  secondary: {
    idle: "bg-secondary/8 hover:bg-secondary/15 border-secondary/20",
    iconIdle: "text-secondary",
    ring: "ring-secondary/30",
  },
  accent: {
    idle: "bg-accent/8 hover:bg-accent/15 border-accent/25",
    iconIdle: "text-accent",
    ring: "ring-accent/30",
  },
  danger: {
    idle: "bg-destructive/8 hover:bg-destructive/15 border-destructive/25",
    iconIdle: "text-destructive",
    ring: "ring-destructive/30",
  },
  neutral: {
    idle: "bg-muted/30 hover:bg-muted/50 border-border/40",
    iconIdle: "text-muted-foreground",
    ring: "ring-border",
  },
};

function useScrollAffordance() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollBy = (delta: number) => {
    ref.current?.scrollBy({ left: delta, behavior: "smooth" });
  };
  return { ref, canLeft, canRight, scrollBy };
}

export function Nav() {
  const loc = useLocation();
  const { ref, canLeft, canRight, scrollBy } = useScrollAffordance();
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  // aktiven Tab horizontal in den Sichtbereich scrollen (ohne Seiten-Scroll)
  useEffect(() => {
    const el = activeRef.current;
    const box = ref.current;
    if (!el || !box) return;
    const target = el.offsetLeft - box.clientWidth / 2 + el.offsetWidth / 2;
    box.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [loc.pathname, ref]);


  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Rave Safe, have Fun — zur Startseite"
          title="Zur Startseite"
        >
          <div className="h-8 w-8 rounded-full bg-aurora animate-aurora glow" aria-hidden="true" />
          <span className="hidden sm:inline text-base sm:text-lg font-bold tracking-tight whitespace-nowrap">
            Rave Safe<span className="text-aurora">,</span> have Fun
          </span>
          <span className="hidden lg:inline-flex items-center rounded-full border border-secondary/40 bg-secondary/10 text-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            Open Beta
          </span>
        </Link>

        {/* Scrollable category row */}
        <div className="relative flex-1 min-w-0">
          {/* Pfeil links — md+ */}
          <button
            type="button"
            aria-label="Kategorien nach links scrollen"
            onClick={() => scrollBy(-220)}
            className={`hidden md:grid absolute left-0 top-1/2 -translate-y-1/2 z-20 h-7 w-7 place-items-center rounded-full glass border border-border/60 text-muted-foreground hover:text-foreground transition ${
              canLeft ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <nav
            ref={ref}
            className="overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide scroll-smooth touch-pan-x py-1.5 -my-1.5"
            aria-label="Hauptnavigation"
            style={{
              WebkitMaskImage: `linear-gradient(to right, ${
                canLeft ? "transparent 0px, black 28px" : "black 0px"
              }, ${canRight ? "black calc(100% - 28px), transparent 100%" : "black 100%"})`,
              maskImage: `linear-gradient(to right, ${
                canLeft ? "transparent 0px, black 28px" : "black 0px"
              }, ${canRight ? "black calc(100% - 28px), transparent 100%" : "black 100%"})`,
            }}
          >
            <ul className="flex items-center gap-1.5 px-1 md:px-8">
              {links.map(({ to, label, icon: Icon, tone }) => {
                const active = loc.pathname === to;
                const t = toneClasses[tone];
                return (
                  <li key={to} className="shrink-0">
                    <Link
                      ref={active ? activeRef : undefined}
                      to={to}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        active
                          ? "bg-aurora animate-aurora text-primary-foreground border-transparent"
                          : `${t.idle} text-foreground/85 hover:text-foreground`
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          active ? "text-primary-foreground" : t.iconIdle
                        }`}
                      />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}

              {/* Mobile: Trenner + Tiefe-Schalter inline am Ende */}
              <li
                aria-hidden="true"
                className="md:hidden mx-1 h-6 w-px shrink-0 bg-border/60"
              />
              <li className="md:hidden shrink-0 pr-1">
                <DetailLevelSwitch size="sm" />
              </li>
            </ul>
          </nav>


          {/* Pfeil rechts — md+ */}
          <button
            type="button"
            aria-label="Kategorien nach rechts scrollen"
            onClick={() => scrollBy(220)}
            className={`hidden md:grid absolute right-0 top-1/2 -translate-y-1/2 z-20 h-7 w-7 place-items-center rounded-full glass border border-border/60 text-muted-foreground hover:text-foreground transition ${
              canRight ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden md:block shrink-0">
          <DetailLevelSwitch size="sm" />
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("ravesave:open-spotlight"))}
          className="shrink-0 inline-flex items-center justify-center rounded-full p-2 min-h-9 min-w-9 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
          aria-label="Suche öffnen (⌘K)"
          title="Suche (⌘K / Strg+K)"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-muted-foreground space-y-3">
      <p className="leading-relaxed">
        <strong className="text-foreground">Rave Safe, have Fun</strong> ist ein Harm-Reduction-Werkzeug — aktuell in der <strong className="text-secondary">Open Beta</strong>.
        Alle Daten bleiben lokal in deinem Browser. Dosis-Angaben sind grobe Orientierungswerte
        aus PsychonautWiki, TripSit, EMCDDA und Fachliteratur — keine medizinische Empfehlung.
        Reinheit und individuelle Verträglichkeit sind nicht abschätzbar; nutze Drug-Checking,
        beginne mit niedrigen Dosen, sei nicht allein. Im Notfall: <strong>112</strong>.
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link to="/install" className="text-secondary hover:underline">App installieren</Link>
        <span className="text-border">·</span>
        <Link to="/about" className="text-secondary hover:underline">Über uns</Link>
        <span className="text-border">·</span>
        <Link to="/settings" className="text-secondary hover:underline">Einstellungen</Link>
      </div>
    </footer>
  );
}
