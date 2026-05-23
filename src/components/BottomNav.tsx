import { Link, useLocation } from "@tanstack/react-router";
import { Home, BookOpen, Sparkles, ShieldAlert } from "lucide-react";

/**
 * Mobile-only Bottom-Nav.
 * 4 Kern-Ziele: Home / Wissen / Marlene / Notfall.
 * Versteckt auf md+ und auf /admin, /reset-password.
 *
 * Marlene öffnet das globale FAB-Panel via window-Event "ravesave:open-marlene"
 * (in AiAskButton gehört). Notfall öffnet das EmergencyButton-Panel via
 * window-Event "ravesave:open-emergency".
 */
const tabs = [
  { id: "home", to: "/", label: "Home", icon: Home, kind: "link" as const },
  { id: "wissen", to: "/substances", label: "Wissen", icon: BookOpen, kind: "link" as const },
  { id: "marlene", label: "Marleen", icon: Sparkles, kind: "event" as const, event: "ravesave:open-marlene" },
  { id: "notfall", label: "Notfall", icon: ShieldAlert, kind: "event" as const, event: "ravesave:open-emergency" },
];

export function BottomNav() {
  const loc = useLocation();
  const path = loc.pathname;

  if (path.startsWith("/admin") || path.startsWith("/reset-password") || path.startsWith("/onboarding")) {
    return null;
  }

  return (
    <nav
      aria-label="Hauptnavigation Mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-2 mb-2 rounded-2xl glass border border-border/60 shadow-2xl">
        <ul className="grid grid-cols-4">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active =
              t.kind === "link" && (t.to === "/" ? path === "/" : path.startsWith(t.to!));
            const cls = `flex flex-col items-center justify-center gap-0.5 py-2 min-h-14 text-[10px] font-medium transition ${
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground active:scale-95"
            }`;
            const indicator = active ? (
              <span
                aria-hidden="true"
                className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-aurora animate-aurora"
              />
            ) : null;
            if (t.kind === "link") {
              return (
                <li key={t.id} className="relative">
                  {indicator}
                  <Link to={t.to!} className={cls} aria-current={active ? "page" : undefined}>
                    <Icon
                      className={`h-5 w-5 ${active ? "text-secondary drop-shadow-[0_0_8px_var(--aurora-1)]" : ""}`}
                    />
                    <span>{t.label}</span>
                  </Link>
                </li>
              );
            }
            return (
              <li key={t.id} className="relative">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent(t.event!))}
                  className={`${cls} w-full`}
                  aria-label={`${t.label} öffnen`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      t.id === "notfall"
                        ? "text-destructive"
                        : t.id === "marlene"
                          ? "text-secondary"
                          : ""
                    }`}
                  />
                  <span>{t.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
