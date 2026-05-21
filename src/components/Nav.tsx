import { Link, useLocation } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  FlaskConical,
  GitMerge,
  HandHeart,
  Home,
  Info,
  MessageCircle,
  Settings as SettingsIcon,
  ShieldAlert,
} from "lucide-react";

const links = [
  { to: "/", label: "Home", icon: Home },
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
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-full bg-aurora animate-aurora glow" />
          <span className="text-base sm:text-lg font-bold tracking-tight whitespace-nowrap">
            Rave Safe<span className="text-aurora">,</span> have Fun
          </span>
          <span className="hidden sm:inline-flex items-center rounded-full border border-secondary/40 bg-secondary/10 text-secondary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
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
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-muted-foreground">
      <p className="leading-relaxed">
        <strong className="text-foreground">Rave Safe, have Fun</strong> ist ein Harm-Reduction-Werkzeug.
        Alle Daten bleiben lokal in deinem Browser. Dosis-Angaben sind grobe Orientierungswerte
        aus PsychonautWiki, TripSit, EMCDDA und Fachliteratur — keine medizinische Empfehlung.
        Reinheit und individuelle Verträglichkeit sind nicht abschätzbar; nutze Drug-Checking,
        beginne mit niedrigen Dosen, sei nicht allein. Im Notfall: <strong>112</strong>.
      </p>
    </footer>
  );
}
