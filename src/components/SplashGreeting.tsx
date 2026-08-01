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
    const t1 = setTimeout(() => setPhase("out"), 1500);
    const t2 = setTimeout(() => setPhase("hidden"), 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[120] grid place-items-center bg-background/95 backdrop-blur-xl transition-opacity duration-500 print:hidden ${
        phase === "out" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute -top-24 h-72 w-72 rounded-full bg-aurora animate-aurora opacity-30 blur-3xl" />
      <div className="relative text-center px-6 animate-scale-in">
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-aurora animate-aurora grid place-items-center text-primary-foreground glow">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-aurora animate-aurora bg-aurora bg-clip-text">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground animate-fade-in">{subtitle}</p>
      </div>
    </div>
  );
}
