import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, ArrowLeft, Droplets, AlertTriangle } from "lucide-react";
import { getActiveSessions, formatMin, unmarkActive } from "@/lib/session";
import { SUBSTANCES } from "@/lib/substances";

export const Route = createFileRoute("/session/active")({
  component: ActiveSessionPage,
  head: () => ({
    meta: [
      { title: "Aktive Session — Rave Safe, have Fun" },
      { name: "description", content: "Phasen-Anzeige, Quick-Reminder und Notfall-Zugang während einer aktiven Session." },
    ],
  }),
});

function ActiveSessionPage() {
  const [sessions, setSessions] = useState(() => getActiveSessions());
  useEffect(() => {
    const tick = () => setSessions(getActiveSessions());
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <Link to="/log" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> zum Log
      </Link>
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-secondary" />
        <h1 className="text-2xl font-bold">Aktive Session</h1>
      </div>

      {sessions.length === 0 && (
        <div className="rounded-2xl glass p-6 text-sm text-muted-foreground">
          Keine aktive Session. Markiere im{" "}
          <Link to="/log" className="text-secondary underline">Protokoll</Link> einen Eintrag als „aktiv".
        </div>
      )}

      {sessions.map(({ entry, info }) => {
        const sub = SUBSTANCES.find((s) => s.id === entry.substanceId);
        return (
          <div key={entry.id} className="rounded-2xl glass p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold">{sub?.name ?? entry.substanceId}</div>
                <div className="text-xs text-muted-foreground">
                  {entry.dose} {entry.unit} · {entry.route} · seit {formatMin(info.elapsedMin)}
                </div>
              </div>
              <button
                onClick={() => unmarkActive(entry.id)}
                className="text-xs rounded-full px-3 py-1.5 bg-muted/40 hover:bg-muted/60"
              >
                Beenden
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium">{info.label}</span>
                {info.nextEvent && info.nextEvent.inMin > 0 && (
                  <span className="text-muted-foreground">
                    {info.nextEvent.label} in {formatMin(info.nextEvent.inMin)}
                  </span>
                )}
              </div>
              <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className="h-full bg-aurora animate-aurora transition-all"
                  style={{ width: `${Math.min(100, info.progress * 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-3 text-[10px] text-muted-foreground pt-1">
                <span>Anflug bis {formatMin(info.onsetEndMin)}</span>
                <span className="text-center">Peak/Plateau</span>
                <span className="text-right">Ende ~{formatMin(info.peakEndMin)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => alert("💧 Glas Wasser, in Ruhe. Über die Stunden verteilt — keine Liter auf einmal.")}
                className="rounded-lg bg-muted/30 hover:bg-muted/50 px-3 py-2 text-xs inline-flex items-center justify-center gap-1.5"
              >
                <Droplets className="h-3.5 w-3.5" /> Wasser-Erinnerung
              </button>
              <Link
                to="/aftercare"
                className="rounded-lg bg-muted/30 hover:bg-muted/50 px-3 py-2 text-xs text-center"
              >
                Aftercare lesen
              </Link>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("ravesave:open-emergency"))}
                className="rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 px-3 py-2 text-xs inline-flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="h-3.5 w-3.5" /> Notfall
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
