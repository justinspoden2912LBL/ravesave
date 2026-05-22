import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles, X, ArrowRight, ShieldAlert } from "lucide-react";

/**
 * Erst-Onboarding-Modal — erscheint einmal beim ersten App-Start.
 * Bietet drei Wege: KI-geführtes Profil, App-Rundgang, oder später.
 * Versteckt auf /admin*, /reset-password und /onboarding selbst.
 */

const SEEN_KEY = "ravesave_welcome_seen";

export function WelcomeOnboarding() {
  const router = useRouterState();
  const path = router.location.pathname;
  const hidden =
    path.startsWith("/admin") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/onboarding");

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"intro" | "tour">("intro");
  const [tourIdx, setTourIdx] = useState(0);

  useEffect(() => {
    if (hidden) return;
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(SEEN_KEY) !== "1") {
        // small delay so it doesn't fight with route hydration
        const t = setTimeout(() => setOpen(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
  }, [hidden]);

  function dismiss() {
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (hidden || !open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Willkommen bei RaveSave"
      className="fixed inset-0 z-[95] print:hidden flex items-end sm:items-center justify-center"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full sm:max-w-md sm:m-4 max-h-[88dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl glass border border-border shadow-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold flex items-center gap-1.5">
            <Sparkles className="h-5 w-5 text-secondary" /> Willkommen bei RaveSave
          </h2>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Schließen"
            className="rounded-full p-1.5 hover:bg-muted/40 min-h-9 min-w-9 inline-flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "intro" && (
          <>
            <p className="text-sm text-muted-foreground">
              Ich kann dich kurz durch die App führen und dir helfen, ein einfaches
              Sicherheitsprofil einzurichten. Alles bleibt zunächst lokal auf deinem Gerät.
            </p>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-[11px] text-muted-foreground flex gap-2">
              <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0 text-secondary" />
              <p>
                Wenn du später die KI nutzt, werden deine Eingaben zur Antwort an einen externen
                KI-Anbieter gesendet. Profil- und Protokolldaten werden nur einbezogen, wenn du
                das ausdrücklich aktivierst.
              </p>
            </div>

            <div className="space-y-2">
              <Link
                to="/onboarding"
                onClick={dismiss}
                className="w-full inline-flex items-center justify-between gap-2 rounded-full bg-aurora animate-aurora px-4 py-2.5 text-sm font-semibold text-primary-foreground glow min-h-11"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Profil mit KI-Fragen anlegen
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setStep("tour");
                  setTourIdx(0);
                }}
                className="w-full rounded-full glass px-4 py-2.5 text-sm min-h-11"
              >
                Nur kurzer App-Rundgang
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="w-full text-xs text-muted-foreground hover:text-foreground min-h-9"
              >
                Später
              </button>
            </div>
          </>
        )}

        {step === "tour" && <Tour idx={tourIdx} onNext={() => setTourIdx((i) => i + 1)} onDone={dismiss} />}
      </div>
    </div>
  );
}

const TOUR_STEPS: Array<{ title: string; body: string }> = [
  {
    title: "Protokoll",
    body: "Halte fest, was du wann konsumiert hast und wie es dir geht. Bleibt lokal auf deinem Gerät.",
  },
  {
    title: "Mix-Check",
    body: "Prüfe bekannte Wechselwirkungsrisiken zwischen Substanzen — basierend auf öffentlich dokumentierten Quellen.",
  },
  {
    title: "Wiki",
    body: "Substanzinfos zum Nachlesen: Wirkung, Dauer, bekannte Risiken, mit Quellenangaben.",
  },
  {
    title: "Notfall",
    body: "Notfallpass, Übergabeinfos für den Rettungsdienst und direkter 112-Anruf.",
  },
  {
    title: "KI fragen",
    body: "Unten links findest du jederzeit den KI-Button für Erklärungen — keine Konsumfreigaben, keine Diagnosen.",
  },
];

function Tour({ idx, onNext, onDone }: { idx: number; onNext: () => void; onDone: () => void }) {
  const step = TOUR_STEPS[idx];
  const isLast = idx === TOUR_STEPS.length - 1;
  if (!step) {
    onDone();
    return null;
  }
  return (
    <div className="space-y-4">
      <div className="rounded-2xl rounded-bl-sm bg-muted/40 px-4 py-3 text-sm">
        <p className="font-semibold mb-1">{step.title}</p>
        <p className="text-muted-foreground">{step.body}</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">
          Schritt {idx + 1} / {TOUR_STEPS.length}
        </span>
        <button
          type="button"
          onClick={isLast ? onDone : onNext}
          className="rounded-full bg-aurora animate-aurora px-4 py-2 text-sm font-semibold text-primary-foreground glow min-h-11"
        >
          {isLast ? "Los geht's" : "Weiter"}
        </button>
      </div>
    </div>
  );
}
