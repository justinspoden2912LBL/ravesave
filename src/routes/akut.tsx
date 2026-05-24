import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Wind,
  Brain,
  Snowflake,
  ShieldAlert,
  ArrowRight,
  Phone,
  Sparkles,
  Loader2,
  Thermometer,
  HeartPulse,
  Users,
  Moon,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { DetailGate } from "@/components/DetailGate";
import { useDetailLevel } from "@/lib/detailLevel";

export const Route = createFileRoute("/akut")({
  component: AkutPage,
  head: () => ({
    meta: [
      { title: "Akute Hilfe — wenn's gerade nicht gut ist · RaveSave" },
      {
        name: "description",
        content:
          "Ruhige Soforthilfe bei Überforderung, schlechtem Trip oder Comedown — bevor es ein Notfall ist. Mit Marleen-Coach für deine Situation.",
      },
      { property: "og:title", content: "Akute Hilfe · RaveSave" },
      {
        property: "og:description",
        content: "Ruhige Soforthilfe zwischen Alltag und 112 — personalisiert von Marleen.",
      },
      { property: "og:url", content: "https://ravesave.fun/akut" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.fun/akut" }],
  }),
});

type Advice = {
  title: string;
  subtitle: string;
  steps: string[];
  deeper?: string;
  redFlags?: string[];
};

const SCENARIOS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "overwhelm", label: "Mir wird's zu viel", icon: Wind },
  { key: "bad_trip", label: "Schlechter Trip / Angst", icon: Brain },
  { key: "comedown", label: "Comedown / Crash", icon: Snowflake },
  { key: "hot", label: "Heiß & Schwindel", icon: Thermometer },
  { key: "cold", label: "Kalt & schwach", icon: HeartPulse },
  { key: "someone_unwell", label: "Jemand anderem geht's schlecht", icon: Users },
  { key: "cant_sleep", label: "Komme nicht zur Ruhe", icon: Moon },
];

function AkutPage() {
  const detail = useDetailLevel();
  const [scenario, setScenario] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customText, setCustomText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advice, setAdvice] = useState<Advice | null>(null);

  const ask = async (payload: { scenario?: string; customText?: string }) => {
    setLoading(true);
    setError(null);
    setAdvice(null);
    try {
      const resp = await fetch("/api/akut-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, mode: detail }),
      });
      if (!resp.ok) {
        if (resp.status === 429) throw new Error("Marleen ist gerade überlastet — versuch's in einer Minute nochmal.");
        if (resp.status === 402) throw new Error("KI-Kontingent ist aufgebraucht. Frag den Workspace-Admin.");
        throw new Error("Marleen konnte gerade nicht antworten. Die Schritte unten gelten trotzdem.");
      }
      const data = (await resp.json()) as Advice;
      if (!Array.isArray(data.steps) || data.steps.length === 0) {
        throw new Error("Antwort war leer. Versuch's nochmal oder nimm die Karten unten.");
      }
      setAdvice(data);
    } catch (e: any) {
      setError(e?.message ?? "Unbekannter Fehler.");
    } finally {
      setLoading(false);
    }
  };

  const pickScenario = (key: string) => {
    setScenario(key);
    setShowCustom(false);
    setCustomText("");
    ask({ scenario: key });
  };

  const submitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    setScenario(null);
    ask({ customText: customText.trim() });
  };

  const reset = () => {
    setAdvice(null);
    setError(null);
    setScenario(null);
    setShowCustom(false);
    setCustomText("");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-secondary">Akute Hilfe</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Atme. Du bist hier richtig.</h1>
        <p className="text-muted-foreground leading-relaxed">
          Wenn dir gerade viel ist, aber es (noch) kein Notfall ist. Wähle ein Szenario oder beschreib
          es selbst — Marleen baut dir personalisierte Schritte.
        </p>
      </header>

      {/* Marleen-Coach */}
      <section className="rounded-2xl glass p-5 space-y-4 border border-border/40">
        <header className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-aurora animate-aurora grid place-items-center text-primary-foreground shrink-0 glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold leading-tight">Marleen-Coach</h2>
            <p className="text-sm text-muted-foreground">
              Was ist gerade los? Tippe ein Szenario oder schreib's frei — Antwort bleibt lokal in
              deinem Browser.
            </p>
          </div>
        </header>

        {!advice && !loading && (
          <>
            <div className="flex flex-wrap gap-2">
              {SCENARIOS.map(({ key, label, icon: Icon }) => {
                const active = scenario === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => pickScenario(key)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition min-h-9 ${
                      active
                        ? "bg-aurora animate-aurora text-primary-foreground glow"
                        : "glass border border-border/40 text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setShowCustom((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition min-h-9 border ${
                  showCustom
                    ? "border-secondary text-secondary bg-secondary/10"
                    : "border-dashed border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                Eigenes Szenario …
              </button>
            </div>

            {showCustom && (
              <form onSubmit={submitCustom} className="space-y-2">
                <label htmlFor="akut-custom" className="text-xs text-muted-foreground">
                  Beschreib in 1–3 Sätzen, was gerade los ist. Keine Daten verlassen dein Gerät.
                </label>
                <textarea
                  id="akut-custom"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={3}
                  maxLength={600}
                  placeholder="z. B. „Mir ist heiß, Herz rast, ich hab vor 1 h 100 mg MDMA genommen und tanze seit 2 h." "
                  className="w-full rounded-xl bg-input/60 border border-border/40 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {customText.length} / 600
                  </span>
                  <button
                    type="submit"
                    disabled={!customText.trim()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-aurora animate-aurora px-4 py-2 text-xs font-semibold text-primary-foreground glow disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Marleen fragen
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {loading && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground py-3">
            <Loader2 className="h-4 w-4 animate-spin text-secondary" />
            Marleen denkt nach …
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm space-y-2">
            <p>{error}</p>
            <button
              type="button"
              onClick={reset}
              className="text-xs underline text-destructive font-semibold"
            >
              Nochmal versuchen
            </button>
          </div>
        )}

        {advice && !loading && (
          <div className="space-y-3">
            <article className="rounded-2xl bg-background/40 border border-secondary/30 p-5 space-y-3">
              <header>
                <p className="text-[10px] uppercase tracking-widest text-secondary font-semibold">
                  Personalisiert von Marleen
                </p>
                <h3 className="font-semibold text-lg leading-tight mt-1">{advice.title}</h3>
                <p className="text-sm text-muted-foreground">{advice.subtitle}</p>
              </header>
              <ol className="space-y-2 pl-1">
                {advice.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                    <span className="h-6 w-6 shrink-0 rounded-full bg-secondary/15 text-secondary grid place-items-center text-xs font-semibold">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>

              {advice.deeper && (
                <DetailGate min="extended">
                  <p className="text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {advice.deeper}
                  </p>
                </DetailGate>
              )}

              {advice.redFlags && advice.redFlags.length > 0 && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      112 wenn …
                    </span>
                  </div>
                  <ul className="text-xs text-foreground/90 list-disc pl-5 space-y-0.5">
                    {advice.redFlags.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-xs font-semibold border border-border/40"
              >
                Andere Situation
              </button>
              <Link
                to="/chat"
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 text-secondary px-4 py-2 text-xs font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5" /> Mit Marleen weiterreden
              </Link>
            </div>
          </div>
        )}
      </section>

      <p className="text-xs uppercase tracking-wider text-muted-foreground pt-2">
        Oder: Standard-Soforthilfe-Karten
      </p>

      <AkutCard
        icon={Wind}
        title="Mir wird's zu viel"
        subtitle="Reize runter, Atem rein."
        steps={[
          "Such einen ruhigeren Ort — Chillout, draußen, Auto, Bad.",
          "Box-Atmung: 4 Sek. ein, 4 halten, 4 aus, 4 halten. Fünfmal.",
          "Wasser trinken. Kühle Stirn, kühle Handgelenke.",
          "Sag jemandem, wie's dir geht. Du musst das nicht allein lösen.",
        ]}
        deeper={
          <p>
            Was du spürst, ist meist Sympathikus-Aktivität (Stress­achse). Box-Atmung
            aktiviert den Vagus und senkt Herzfrequenz und gefühlte Bedrohung
            messbar in 60–90 Sekunden.
          </p>
        }
      />

      <AkutCard
        icon={Brain}
        title="Schlechter Trip / Angst"
        subtitle="Erden — du bist sicher, das geht vorbei."
        steps={[
          "Hinsetzen, Augen offen, gedämpftes Licht, sanfte Musik.",
          "5-4-3-2-1: 5 Dinge sehen, 4 hören, 3 fühlen, 2 riechen, 1 schmecken.",
          "Sag laut: „Das ist die Substanz. Es geht vorbei.“",
          "Vertrauensperson dabeibleiben lassen — keine Diskussion, einfach da sein.",
        ]}
        deeper={
          <p>
            Psychedelika und Dissoziativa verstärken Erwartung. Setting ändern, vertraute
            Stimme hören, Körper wahrnehmen — das verschiebt die Erfahrung sehr
            zuverlässig in Richtung sicher.
          </p>
        }
      />

      <AkutCard
        icon={Snowflake}
        title="Comedown-Crash"
        subtitle="Wärme, Wasser, weniger Reize."
        steps={[
          "Warm anziehen oder Decke. Kein weiterer Konsum.",
          "Schluckweise Wasser oder Iso-Getränk — keine Liter auf einmal.",
          "Reize runter: Licht dimmen, Kopfhörer mit ruhiger Musik.",
          "Wenn möglich: irgendwo schlafen, wo dich jemand hört.",
        ]}
        deeper={
          <p>
            Nach Stimulanzien sind Dopamin- und Serotonin-Speicher kurzzeitig leer.
            Mehr nachlegen verstärkt nur den Crash. Schlaf, Magnesium und ein leichtes
            Frühstück sind die schnellste Hilfe — siehe{" "}
            <Link to="/aftercare" className="underline text-secondary">
              Aftercare
            </Link>
            .
          </p>
        }
      />

      <div className="rounded-2xl glass p-5 border border-destructive/40">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h2 className="font-semibold">Bin ich noch ok — oder ist das schon Notfall?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ruf <strong>112</strong>, wenn eines davon zutrifft:
            </p>
            <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
              <li>Bewusstsein trübt ein, jemand ist nicht weckbar.</li>
              <li>Atmung ist langsam, flach oder unregelmäßig.</li>
              <li>Hohes Fieber, Krampfanfall, anhaltende Brustschmerzen.</li>
              <li>Lippen oder Fingerspitzen blau.</li>
            </ul>
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href="tel:112"
                className="inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground"
              >
                <Phone className="h-4 w-4" /> 112 anrufen
              </a>
              <Link
                to="/notfall"
                className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-semibold"
              >
                Notfall-Seite öffnen <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Marleen ist kein Arzt und ersetzt keine medizinische Beratung. Im Zweifel immer 112.
      </p>
    </div>
  );
}

function AkutCard({
  icon: Icon,
  title,
  subtitle,
  steps,
  deeper,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  steps: string[];
  deeper?: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl glass p-5 space-y-3">
      <header className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-xl bg-aurora animate-aurora grid place-items-center text-primary-foreground shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold leading-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </header>
      <ol className="space-y-2 pl-1">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed">
            <span className="h-6 w-6 shrink-0 rounded-full bg-secondary/15 text-secondary grid place-items-center text-xs font-semibold">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      {deeper && (
        <DetailGate min="extended">
          <div className="text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
            {deeper}
          </div>
        </DetailGate>
      )}
    </article>
  );
}
