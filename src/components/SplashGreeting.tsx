import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useText } from "@/lib/i18n";

/**
 * Kurze Begrüßungs-Animation beim App-Start (einmal pro Browser-Session).
 * Texte sind über die Admin-Textbausteine editierbar:
 *   splash.title / splash.subtitle
 */
const SESSION_KEY = "rs_splash_shown_v1";

export function SplashGreeting() {
  const title = useText("splash.title", "Willkommen bei RaveSave");
  const subtitle = useText("splash.subtitle", "Rave safe, have fun.");
  const [phase, setPhase] = useState<"hidden" | "in" | "out">("hidden");

  useEffect(() => {
    if (typeof window === "undefined") return;
    let skip = false;
    try {
      skip = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (skip) return;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setPhase("in");
    // bewusst langsam: genug Zeit zum Lesen, ruhiges Ausblenden
    const t1 = setTimeout(() => setPhase("out"), 3200);
    const t2 = setTimeout(() => setPhase("hidden"), 4400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[120] grid place-items-center bg-background transition-opacity duration-[1200ms] ease-in-out print:hidden ${
        phase === "out" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative w-full max-w-md px-8 animate-fade-in">
        <span className="tag-label">Rave Safe / Harm Reduction</span>
        <h1 className="mt-4 text-4xl font-extrabold leading-[0.95] tracking-tight">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6 h-px w-full bg-border">
          <div className="h-px bg-primary animate-[splash-line_3.2s_linear_forwards]" />
        </div>
      </div>
    </div>
  );
}

