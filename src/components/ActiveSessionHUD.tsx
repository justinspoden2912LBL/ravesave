import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Activity, X, Droplets, AlertTriangle } from "lucide-react";
import { getActiveSessions, formatMin, unmarkActive } from "@/lib/session";
import { SUBSTANCES } from "@/lib/substances";

export function ActiveSessionHUD() {
  const [sessions, setSessions] = useState(() => getActiveSessions());
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const tick = () => setSessions(getActiveSessions());
    const id = window.setInterval(tick, 30_000);
    const onChange = () => tick();
    window.addEventListener("ravesave:active-changed", onChange);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("ravesave:active-changed", onChange);
    };
  }, []);

  if (sessions.length === 0) return null;

  return (
    <div
      className="fixed left-2 right-2 md:left-auto md:right-4 md:max-w-sm z-30 print:hidden"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 64px)" }}
    >
      <div className="rounded-2xl glass border border-primary/40 shadow-2xl overflow-hidden">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-aurora/10 text-left"
          aria-expanded={!collapsed}
        >
          <Activity className="h-4 w-4 text-secondary animate-pulse shrink-0" />
          <span className="text-xs font-semibold flex-1">
            {sessions.length} aktive Session{sessions.length > 1 ? "s" : ""}
          </span>
          <span className="text-[10px] text-muted-foreground">{collapsed ? "▼" : "▲"}</span>
        </button>
        {!collapsed && (
          <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto">
            {sessions.map(({ entry, info }) => {
              const sub = SUBSTANCES.find((s) => s.id === entry.substanceId);
              return (
                <div key={entry.id} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{sub?.name ?? entry.substanceId}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {info.label} · seit {formatMin(info.elapsedMin)}
                        {info.nextEvent && info.nextEvent.inMin > 0 && (
                          <> · {info.nextEvent.label} in {formatMin(info.nextEvent.inMin)}</>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => unmarkActive(entry.id)}
                      className="text-muted-foreground hover:text-foreground p-1"
                      aria-label="Session beenden"
                      title="Session beenden"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className="h-full bg-aurora animate-aurora transition-all"
                      style={{ width: `${Math.min(100, info.progress * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border/40">
              <Link to="/session/active" className="text-[10px] rounded-lg bg-muted/30 hover:bg-muted/50 px-2 py-1.5 text-center transition">
                Vollansicht
              </Link>
              <button
                onClick={() => alert("💧 Trink ein Glas Wasser. Über die Stunden verteilt — keine Liter auf einmal.")}
                className="text-[10px] rounded-lg bg-muted/30 hover:bg-muted/50 px-2 py-1.5 inline-flex items-center justify-center gap-1 transition"
              >
                <Droplets className="h-3 w-3" /> Wasser
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("ravesave:open-emergency"))}
                className="text-[10px] rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 px-2 py-1.5 inline-flex items-center justify-center gap-1 transition"
              >
                <AlertTriangle className="h-3 w-3" /> Notfall
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
