import { Link, useLocation } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  FlaskConical,
  GitMerge,
  HandHeart,
  Heart,
  Home,
  Info,
  MessageCircle,
  Search,
  Settings as SettingsIcon,
  ShieldAlert,
} from "lucide-react";
import { DetailLevelSwitch } from "@/components/DetailLevelSwitch";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/akut", label: "Akute Hilfe", icon: Heart },
  { to: "/log", label: "Protokoll", icon: Activity },
  { to: "/mix", label: "Mix-Check", icon: GitMerge },
  { to: "/risks", label: "Risiken", icon: ShieldAlert },
  { to: "/substances", label: "Substanzen", icon: BookOpen },
  { to: "/knigge", label: "Knigge", icon: HandHeart },
  { to: "/chat", label: "KI-Chat", icon: MessageCircle },
  { to: "/stats", label: "Statistik", icon: FlaskConical },
  { to: "/about", label: "Über", icon: Info },
  { to: "/settings", label: "Profil", icon: SettingsIcon },
] as const;

export function Nav() {
  const loc = useLocation();
  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Rave Safe, have Fun — zur Startseite"
          title="Zur Startseite"
        >
          <div className="h-8 w-8 rounded-full bg-aurora animate-aurora glow" aria-hidden="true" />
          <span className="text-base sm:text-lg font-bold tracking-tight whitespace-nowrap">
            Rave Safe<span className="text-aurora">,</span> have Fun
          </span>
          <span className="hidden sm:inline-flex items-center rounded-full border border-secondary/40 bg-secondary/10 text-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            Open Beta
          </span>
        </Link>

        {/* Horizontal scrollable category row */}
        <nav
          className="relative flex-1 min-w-0 overflow-x-auto scrollbar-hide"
          aria-label="Hauptnavigation"
        >
          <ul className="flex items-center gap-1.5 pr-4 snap-x snap-mandatory">
            {links.map(({ to, label, icon: Icon }) => {
              const active = loc.pathname === to;
              return (
                <li key={to} className="snap-start">
                  <Link
                    to={to}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-all ${
                      active
                        ? "bg-aurora animate-aurora text-primary-foreground glow"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {/* Edge fade hint that it's scrollable */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background/80 to-transparent" />
        </nav>
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
      <p className="leading-relaxed">
        Feedback, Bugs oder Verbesserungsvorschläge? →{" "}
        <a className="text-secondary hover:underline" href="mailto:ravesafe.live@gmail.com?subject=Rave%20Safe%20Beta%20Feedback">
          ravesafe.live@gmail.com
        </a>
      </p>
    </footer>
  );
}
