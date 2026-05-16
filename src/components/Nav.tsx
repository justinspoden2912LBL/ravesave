import { Link, useLocation } from "@tanstack/react-router";
import { Activity, BookOpen, FlaskConical, GitMerge, Home, MessageCircle, Settings as SettingsIcon } from "lucide-react";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/log", label: "Protokoll", icon: Activity },
  { to: "/mix", label: "Mix-Check", icon: GitMerge },
  { to: "/substances", label: "Substanzen", icon: BookOpen },
  { to: "/chat", label: "KI-Chat", icon: MessageCircle },
  { to: "/stats", label: "Statistik", icon: FlaskConical },
  { to: "/settings", label: "Profil", icon: SettingsIcon },
] as const;

export function Nav() {
  const loc = useLocation();
  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-aurora animate-aurora glow" />
          <span className="text-lg font-bold tracking-tight">trace<span className="text-aurora">.</span></span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const active = loc.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all ${
                  active
                    ? "bg-aurora animate-aurora text-primary-foreground glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-muted-foreground">
      <p className="leading-relaxed">
        <strong className="text-foreground">trace</strong> ist ein Harm-Reduction-Werkzeug.
        Alle Daten bleiben lokal in deinem Browser. Dosis-Angaben sind grobe Orientierungswerte
        aus PsychonautWiki, TripSit, EMCDDA und Fachliteratur — keine medizinische Empfehlung.
        Reinheit und individuelle Verträglichkeit sind nicht abschätzbar; nutze Drug-Checking,
        beginne mit niedrigen Dosen, sei nicht allein. Im Notfall: <strong>112</strong>.
      </p>
    </footer>
  );
}
