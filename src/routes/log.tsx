import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Trash2, Plus, Clock, AlertTriangle, RotateCcw, Info } from "lucide-react";
import { SUBSTANCES, assessPair, RISK_META } from "@/lib/substances";
import { addEntry, deleteEntry, loadEntries, type LogEntry } from "@/lib/log";
import { useRegisterAiContext } from "@/lib/aiContext";


export const Route = createFileRoute("/log")({
  component: LogPage,
  head: () => ({
    meta: [
      { title: "Protokoll — Rave Safe, have Fun" },
      { name: "description", content: "Dokumentiere Substanz, Dosis, Set & Setting lokal im Browser und erkenne riskante Kombinationen der letzten Stunden." },
      { property: "og:title", content: "Konsum-Protokoll — Rave Safe, have Fun" },
      { property: "og:description", content: "Dokumentiere Substanz, Dosis und Stimmung lokal — mit Live-Warnung bei kritischen Kombinationen." },
      { property: "og:url", content: "https://ravesave.lovable.app/log" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.lovable.app/log" }],
  }),
});

function doseHint(substanceId: string): string | null {
  const s = SUBSTANCES.find((x) => x.id === substanceId);
  if (!s || !s.doses?.length) return null;
  const d = s.doses[0];
  const range = d.common ?? d.light ?? d.strong;
  if (!range) return null;
  return `${s.name}: üblich ${range}${d.route ? ` (${d.route})` : ""}`;
}

function LogPage() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [substanceId, setSubstanceId] = useState(SUBSTANCES[0].id);
  const [dose, setDose] = useState("");
  const [unit, setUnit] = useState("mg");
  const [route, setRoute] = useState("oral");
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState(3);
  const [when, setWhen] = useState(() => new Date().toISOString().slice(0, 16));
  const [formOpenMobile, setFormOpenMobile] = useState(false);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!dose.trim()) return;
    addEntry({
      substanceId,
      dose: dose.trim(),
      unit,
      route,
      timestamp: new Date(when).getTime(),
      notes: notes.trim() || undefined,
      mood,
    });
    setEntries(loadEntries());
    setDose("");
    setNotes("");
    setFormOpenMobile(false);
  }

  function remove(id: string) {
    deleteEntry(id);
    setEntries(loadEntries());
  }

  function repeat(e: LogEntry) {
    setSubstanceId(e.substanceId);
    setDose(e.dose);
    setUnit(e.unit);
    setRoute(e.route);
    setWhen(new Date().toISOString().slice(0, 16));
    setFormOpenMobile(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Last 12h — flag risky combos
  const recent = useMemo(() => {
    const cutoff = Date.now() - 12 * 3600 * 1000;
    return entries.filter((e) => e.timestamp >= cutoff);
  }, [entries]);

  const recentRisks = useMemo(() => {
    const out: { a: LogEntry; b: LogEntry; risk: ReturnType<typeof assessPair> }[] = [];
    for (let i = 0; i < recent.length; i++) {
      for (let j = i + 1; j < recent.length; j++) {
        if (recent[i].substanceId === recent[j].substanceId) continue;
        const r = assessPair(recent[i].substanceId, recent[j].substanceId);
        if (r.level === "danger" || r.level === "unsafe") {
          out.push({ a: recent[i], b: recent[j], risk: r });
        }
      }
    }
    return out;
  }, [recent]);

  const hint = doseHint(substanceId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-[minmax(320px,400px)_1fr]">
      <h1 className="sr-only">Konsum-Protokoll</h1>

      {/* Mobile: prominent "Neuer Eintrag" trigger before the form expands */}
      {!formOpenMobile && (
        <button
          onClick={() => setFormOpenMobile(true)}
          className="md:hidden inline-flex w-full items-center justify-center gap-2 rounded-full bg-aurora animate-aurora px-5 py-3 text-sm font-semibold text-primary-foreground glow"
        >
          <Plus className="h-4 w-4" /> Neuer Eintrag
        </button>
      )}

      {/* Form */}
      <aside
        className={`md:sticky md:top-24 md:self-start ${formOpenMobile ? "" : "hidden md:block"}`}
      >
        <form onSubmit={submit} className="rounded-2xl glass p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Plus className="h-5 w-5" style={{ color: "oklch(0.78 0.22 320)" }} />
              Neuer Eintrag
            </h2>
            <button
              type="button"
              onClick={() => setFormOpenMobile(false)}
              className="md:hidden inline-flex items-center justify-center rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/40 min-h-11 min-w-11"
              aria-label="Formular schließen"
            >
              ✕
            </button>
          </div>

          <Field
            label="Substanz"
            rightSlot={
              <Link
                to="/substances"
                title={`${SUBSTANCES.find((s) => s.id === substanceId)?.name} im Wiki öffnen`}
                aria-label="Substanz im Wiki öffnen"
                className="inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted/40"
              >
                <Info className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <select
              value={substanceId}
              onChange={(e) => setSubstanceId(e.target.value)}
              className="w-full rounded-lg bg-input px-3 py-2 text-sm"
            >
              {SUBSTANCES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Dosis">
              <input
                inputMode="decimal"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="z.B. 100"
                className="w-full rounded-lg bg-input px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Einheit">
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full rounded-lg bg-input px-3 py-2 text-sm">
                <option>mg</option><option>µg</option><option>g</option><option>ml</option><option>Stück</option>
              </select>
            </Field>
          </div>
          {hint && (
            <p className="-mt-2 text-xs text-muted-foreground">
              <span className="text-secondary">Richtwert:</span> {hint}
            </p>
          )}

          <Field label="Applikation">
            <select value={route} onChange={(e) => setRoute(e.target.value)} className="w-full rounded-lg bg-input px-3 py-2 text-sm">
              <option>oral</option><option>insufflated</option><option>inhaliert</option><option>vaporisiert</option>
              <option>sublingual</option><option>i.v.</option><option>i.m.</option><option>rektal</option><option>transdermal</option>
            </select>
          </Field>

          <Field label="Zeitpunkt">
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="w-full rounded-lg bg-input px-3 py-2 text-sm"
            />
          </Field>

          <Field label={`Stimmung ${["⛈","🌧","🌤","☀️","✨"][mood - 1]}`}>
            <input
              type="range" min={1} max={5} value={mood}
              onChange={(e) => setMood(+e.target.value)}
              className="w-full accent-primary"
              aria-label="Stimmung von schlecht (1) bis sehr gut (5)"
              aria-valuetext={`${mood} von 5`}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Schlecht</span>
              <span>Neutral</span>
              <span>Gut</span>
            </div>
          </Field>

          <Field label="Notizen">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Set, Setting, Wirkungseintritt..."
              className="w-full rounded-lg bg-input px-3 py-2 text-sm resize-none"
            />
          </Field>

          <button
            type="submit"
            className="w-full rounded-full bg-aurora animate-aurora py-2.5 text-sm font-semibold text-primary-foreground glow"
          >
            Speichern
          </button>
        </form>
      </aside>

      {/* Timeline */}
      <section className="space-y-4">
        {recentRisks.length > 0 && (
          <div className="rounded-2xl border border-risk-danger/40 bg-risk-danger/10 p-5">
            <div className="flex items-center gap-2 text-risk-danger font-semibold">
              <AlertTriangle className="h-5 w-5" /> Aktive Risiko-Kombinationen (12h)
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {recentRisks.map((r, i) => {
                const sa = SUBSTANCES.find((s) => s.id === r.a.substanceId)!;
                const sb = SUBSTANCES.find((s) => s.id === r.b.substanceId)!;
                return (
                  <li key={i} className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full glass px-2 py-0.5 text-xs">{sa.name}</span>
                    <span>+</span>
                    <span className="rounded-full glass px-2 py-0.5 text-xs">{sb.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs border ${RISK_META[r.risk.level].bg}`}>
                      {RISK_META[r.risk.level].label}
                    </span>
                    <span className="text-muted-foreground">— {r.risk.reason}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <h2 className="text-xl font-bold">Verlauf ({entries.length})</h2>
        {entries.length === 0 ? (
          <div className="rounded-2xl glass p-8 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-aurora animate-aurora glow" />
            <h3 className="text-base font-semibold">Noch keine Einträge</h3>
            <p className="text-sm text-muted-foreground">
              Halte fest, was du wann genommen hast. Alles bleibt lokal auf deinem Gerät und hilft dir,
              riskante Kombinationen früh zu erkennen.
            </p>
            <button
              onClick={() => {
                setFormOpenMobile(true);
                if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 rounded-full bg-aurora animate-aurora px-5 py-2.5 text-sm font-semibold text-primary-foreground glow"
            >
              <Plus className="h-4 w-4" /> Ersten Eintrag anlegen
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => {
              const s = SUBSTANCES.find((x) => x.id === e.substanceId);
              const d = new Date(e.timestamp);
              return (
                <li key={e.id} className="group rounded-2xl glass p-4 flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-aurora animate-aurora glow" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-semibold">{s?.name ?? e.substanceId}</span>
                      <span className="text-sm text-muted-foreground">
                        {e.dose} {e.unit} · {e.route}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {d.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })}
                      <span className="ml-2">{["⛈","🌧","🌤","☀️","✨"][(e.mood ?? 3) - 1]}</span>
                    </div>
                    {e.notes && <p className="mt-2 text-sm whitespace-pre-wrap">{e.notes}</p>}
                  </div>
                  <div className="flex flex-col items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition">
                    <button
                      onClick={() => repeat(e)}
                      className="rounded-full p-2 hover:bg-secondary/20 text-muted-foreground hover:text-secondary"
                      aria-label="Erneut dosieren (Formular ausfüllen)"
                      title="Wiederholen / Re-Dose"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(e.id)}
                      className="rounded-full p-2 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                      aria-label="Löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  children,
  rightSlot,
}: {
  label: string;
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1">
        <span>{label}</span>
        {rightSlot}
      </span>
      {children}
    </label>
  );
}
