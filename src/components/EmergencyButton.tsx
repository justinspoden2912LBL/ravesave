import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Siren,
  Phone,
  HeartPulse,
  ExternalLink,
  Wind,
  Brain,
  Zap,
  Thermometer,
  Frown,
  Activity,
  ArrowLeft,
  IdCard,
  Pencil,
  Save,
  Trash2,
  Maximize2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  emptyEmergencyInfo,
  emergencyInfoSchema,
  hasAnyEmergencyInfo,
  loadEmergencyInfo,
  saveEmergencyInfo,
  clearEmergencyInfo,
  type EmergencyInfo,
} from "@/lib/emergencyInfo";
import { loadEntries, type LogEntry } from "@/lib/log";
import { SUBSTANCES } from "@/lib/substances";
import { StepIllustration, ILLUSTRATION_LABEL, type IllusKey } from "@/components/EmergencyIllustrations";

const SCENARIOS: { label: string; to: string; hint: string }[] = [
  { label: "Opioid-Überdosis (Atemstillstand)", to: "/substances", hint: "Naloxon, Atemspende" },
  { label: "Serotonin-Syndrom", to: "/risks", hint: "MDMA + SSRI/MAOI" },
  { label: "GHB + Alkohol (Bewusstlosigkeit)", to: "/mix", hint: "Atemdepression" },
  { label: "Bad Trip (Psychedelika)", to: "/substances", hint: "Set & Setting, Talkdown" },
  { label: "Stimulanzien-Überhitzung", to: "/risks", hint: "Hyperthermie, Wasser, Pause" },
  { label: "Benzo/Alkohol-Mix", to: "/mix", hint: "Atemdepression" },
];

const POISON: { region: string; number: string }[] = [
  { region: "Berlin", number: "030 19240" },
  { region: "München", number: "089 19240" },
  { region: "Bonn", number: "0228 19240" },
  { region: "Wien (AT)", number: "+43 1 406 43 43" },
  { region: "Zürich (CH)", number: "145" },
];

type SymptomId =
  | "no_breathing"
  | "unconscious"
  | "seizure"
  | "overheating"
  | "chest_pain"
  | "panic";

interface Symptom {
  id: SymptomId;
  icon: LucideIcon;
  label: string;
  hint: string;
  severity: "critical" | "high" | "moderate";
}

const SYMPTOMS: Symptom[] = [
  { id: "no_breathing", icon: Wind, label: "Keine / flache Atmung", hint: "blaue Lippen, kein Heben des Brustkorbs", severity: "critical" },
  { id: "unconscious", icon: Brain, label: "Bewusstlos / nicht ansprechbar", hint: "reagiert nicht auf Anrufen oder Schmerzreiz", severity: "critical" },
  { id: "seizure", icon: Zap, label: "Krampfanfall", hint: "Zucken, Steifheit, Schaum vor dem Mund", severity: "critical" },
  { id: "chest_pain", icon: Activity, label: "Brustschmerz / Herzrasen extrem", hint: "Druck auf der Brust, sehr schneller Puls", severity: "high" },
  { id: "overheating", icon: Thermometer, label: "Überhitzung", hint: "heiße trockene Haut, Verwirrung, >39 °C", severity: "high" },
  { id: "panic", icon: Frown, label: "Panik / Bad Trip", hint: "ansprechbar, atmet, fühlt sich verloren", severity: "moderate" },
];

interface GuideStep {
  do: string;
  detail?: string;
  illus?: IllusKey;
}
interface Guide {
  title: string;
  call112: boolean;
  intro: string;
  steps: GuideStep[];
  followup?: { label: string; to: string };
}

const GUIDES: Record<SymptomId, Guide> = {
  no_breathing: {
    title: "Atemstillstand / Atemdepression",
    call112: true,
    intro: "Lebensbedrohlich. Jede Sekunde zählt — meistens Opioide, Benzos, GHB oder Mischkonsum.",
    steps: [
      { do: "112 anrufen", detail: "Lautsprecher an, Adresse zuerst.", illus: "phone112" },
      { do: "Auf den Rücken legen, Kopf überstrecken, Kinn anheben", detail: "Atemweg frei machen.", illus: "airway" },
      { do: "Falls Naloxon (Nyxoid/Narcan) verfügbar: 1 Sprühstoß pro Nasenloch", detail: "Bei Opioid-Verdacht. Alle 2–3 min wiederholen, bis Atmung kommt.", illus: "naloxone" },
      { do: "Keine eigenständige Atmung? Beatmen: 2 Atemstöße, dann 30 Herzdruckmassagen", detail: "Tempo 100–120/min, 5–6 cm tief, Mitte Brustkorb.", illus: "cpr" },
      { do: "Nicht aufhören, bis Rettung übernimmt", detail: "Auch wenn es ewig wirkt.", illus: "dontStop" },
    ],
    followup: { label: "Mehr zu Opioiden & Naloxon", to: "/substances" },
  },
  unconscious: {
    title: "Bewusstlos, aber atmet",
    call112: true,
    intro: "Stabile Seitenlage rettet Leben — verhindert Ersticken an Erbrochenem.",
    steps: [
      { do: "Ansprechen, Schulter rütteln, Schmerzreiz (Brustbein reiben)", detail: "Wirklich bewusstlos?", illus: "shake" },
      { do: "112 anrufen", detail: "Substanz(en) und Zeitpunkt ehrlich nennen.", illus: "phone112" },
      { do: "Atmung 10 Sek prüfen", detail: "Hören, sehen, fühlen. Keine Atmung → Herzdruckmassage.", illus: "checkBreath" },
      { do: "Stabile Seitenlage", detail: "Arm 90°, andere Hand an Wange, fernes Bein anwinkeln, zu dir drehen, Kopf überstrecken.", illus: "recovery" },
      { do: "Bleib daneben, beobachte Atmung", detail: "Erbricht die Person, Mund ausräumen.", illus: "clearMouth" },
    ],
  },
  seizure: {
    title: "Krampfanfall",
    call112: true,
    intro: "Häufig bei Stimulanzien-Überdosis, GHB-Entzug, Tramadol, Mischkonsum oder unbekannter RC.",
    steps: [
      { do: "Person nicht festhalten", detail: "Krampf nicht stoppen wollen — Verletzungsgefahr.", illus: "dontHold" },
      { do: "Umgebung sichern: harte Kanten weg, Kopf weich polstern", detail: "Jacke unter den Kopf.", illus: "seizurePad" },
      { do: "Nichts in den Mund stecken", detail: "Kein Löffel, kein Finger — Erstickungs- und Bissgefahr.", illus: "noMouth" },
      { do: "Zeit messen", detail: "Krampf >2 Min oder zweiter Anfall hintereinander = sofort 112.", illus: "stopwatch" },
      { do: "Nach dem Krampf: stabile Seitenlage, ansprechen, ruhig bleiben", detail: "Verwirrung danach ist normal.", illus: "recovery" },
    ],
    followup: { label: "Risiken nachschlagen", to: "/risks" },
  },
  overheating: {
    title: "Überhitzung / Hyperthermie",
    call112: true,
    intro: "Klassiker bei MDMA, Amphetamin, Kokain, 2C-B + Tanzen + warmer Raum. Ab 40 °C lebensbedrohlich.",
    steps: [
      { do: "Sofort raus aus der Hitze", detail: "Kühler Raum, Schatten, vor den Lüfter.", illus: "coolRoom" },
      { do: "Kleidung lockern, Haut nass machen", detail: "Lauwarmes Wasser auf Hals, Achseln, Leisten. Fächeln.", illus: "cooling" },
      { do: "Schluckweise Wasser oder isotonisches Getränk", detail: "Max ~500 ml/h — kein Wasser ex, sonst Hyponatriämie.", illus: "hydrate" },
      { do: "Bewusstsein & Atmung beobachten", detail: "Verwirrung, Krampf, Bewusstlosigkeit → 112.", illus: "checkBreath" },
      { do: "Nicht weiter tanzen, nicht nachlegen", detail: "Der Abend ist vorbei. Wirklich.", illus: "noSubstance" },
    ],
    followup: { label: "Stimulanzien-Risiken", to: "/risks" },
  },
  chest_pain: {
    title: "Brustschmerz / Herzrasen extrem",
    call112: true,
    intro: "Stimulanzien (Kokain, Speed, MDMA) + Vorerkrankung oder hohe Dosis können Herzinfarkt auslösen.",
    steps: [
      { do: "112 anrufen", detail: "Genau sagen: Brustschmerz, Substanz, Dosis.", illus: "phone112" },
      { do: "Hinsetzen, Oberkörper hoch, beruhigen", detail: "Nicht hinlegen — erleichtert die Atmung.", illus: "sitUp" },
      { do: "Keine weitere Substanz, kein Alkohol", detail: "Keine Aufputscher, kein Energy Drink.", illus: "noSubstance" },
      { do: "Wenn Atmung aussetzt: Herzdruckmassage", detail: "100–120/min, ohne Pause bis Rettung kommt.", illus: "cpr" },
    ],
  },
  panic: {
    title: "Bad Trip / akute Panik",
    call112: false,
    intro: "Meistens psychisch, nicht akut lebensgefährlich — solange Atmung und Bewusstsein stabil sind.",
    steps: [
      { do: "Ruhigen, vertrauten Ort aufsuchen", detail: "Weg von Crowd, Stroboskop, lauter Musik.", illus: "quietRoom" },
      { do: "Atem führen: 4 Sek ein, 6 Sek aus", detail: "Gemeinsam atmen, sanft Hand auf den Bauch.", illus: "breath" },
      { do: "Sätze wie 'Das geht vorbei. Du bist sicher. Ich bleibe da.'", detail: "Talkdown — nicht diskutieren, nicht widersprechen.", illus: "talkdown" },
      { do: "Wasser, evtl. Süßes, warme Decke", detail: "Erdung über den Körper.", illus: "blanket" },
      { do: "Bei Atemnot, Krampf, Bewusstlosigkeit → 112", detail: "Auch bei Suizidgedanken sofort Hilfe holen.", illus: "phone112" },
    ],
    followup: { label: "Drogenknigge & Awareness", to: "/knigge" },
  },
};

export function EmergencyButton() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<SymptomId | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  function reset() {
    setActive(null);
    setExpanded(null);
  }
  function closeAll() {
    setOpen(false);
    setTimeout(reset, 200);
  }

  const guide = active ? GUIDES[active] : null;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <button
          aria-label="Notfall-Hilfe öffnen"
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)",
            right: "calc(env(safe-area-inset-right, 0px) + 1rem)",
          }}
          className="fixed z-50 print:hidden inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground shadow-lg ring-2 ring-destructive/40 hover:brightness-110 transition motion-safe:animate-pulse motion-reduce:animate-none"
        >
          <Siren className="h-5 w-5" />
          <span>Notfall</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[85dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Siren className="h-5 w-5" /> Notfall-Hilfe
          </DialogTitle>
          <DialogDescription>
            {guide ? "Schritt-für-Schritt-Anleitung. Ruhig bleiben." : "Ruhig bleiben. Atmen. Person nicht allein lassen."}
          </DialogDescription>
        </DialogHeader>

        {/* Always-visible 112 */}
        <div className="space-y-1.5">
          <a
            href="tel:112"
            aria-label="Notruf 112 anrufen"
            className="flex items-center justify-center gap-2 rounded-2xl bg-destructive px-4 py-4 text-lg font-bold text-destructive-foreground shadow-md hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/60"
          >
            <Phone className="h-6 w-6" /> 112 anrufen
          </a>
          <p className="text-center text-xs text-muted-foreground">
            Oder ruf jetzt direkt <strong className="text-foreground">112</strong> an — kostenlos, EU-weit, ohne Guthaben.
          </p>
          <p className="text-center text-xs text-muted-foreground/80">
            ↓ Weiter unten: Symptom-Check, stabile Seitenlage, Hotlines.
          </p>
        </div>

        {/* Medical ID — immer sichtbar, damit Ersthelfer:innen Infos finden */}
        <MedicalCard />

        {/* Übergabe für Rettungsdienst — neutral, ohne Bewertung */}
        <HandoverCard />


        {!guide && (
          <>
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Symptom-Quickcheck</h3>
              <p className="text-xs text-muted-foreground">
                Was siehst du bei der betroffenen Person? Wähle das auffälligste Symptom.
              </p>
              <div className="grid gap-1.5">
                {SYMPTOMS.map((s) => {
                  const Icon = s.icon;
                  const tone =
                    s.severity === "critical"
                      ? "bg-destructive/10 ring-destructive/40 hover:bg-destructive/20"
                      : s.severity === "high"
                        ? "bg-orange-500/10 ring-orange-500/40 hover:bg-orange-500/20"
                        : "bg-muted/20 ring-border hover:bg-muted/40";
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActive(s.id)}
                      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left ring-1 transition ${tone}`}
                    >
                      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{s.label}</span>
                        <span className="block text-xs text-muted-foreground">{s.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl bg-muted/20 p-4 space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <HeartPulse className="h-4 w-4 text-destructive" /> Stabile Seitenlage — 4 Schritte
              </h3>
              <ol className="space-y-1.5 text-sm leading-relaxed list-decimal pl-5">
                <li>Naheliegenden Arm im 90°-Winkel <strong>nach oben</strong> anwinkeln.</li>
                <li>Anderen Arm über die Brust, <strong>Handrücken an die Wange</strong>.</li>
                <li>Fernes Bein anwinkeln, am Knie <strong>zur Seite ziehen</strong>.</li>
                <li>Kopf <strong>leicht überstrecken</strong>, Mund öffnen — Atemweg frei.</li>
              </ol>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Szenario nachschlagen</h3>
              <div className="grid gap-1.5">
                {SCENARIOS.map((s) => (
                  <Link
                    key={s.label}
                    to={s.to}
                    onClick={closeAll}
                    className="flex items-center justify-between gap-2 rounded-lg bg-muted/20 px-3 py-2 text-sm hover:bg-muted/40 transition"
                  >
                    <span>
                      <span className="font-medium">{s.label}</span>
                      <span className="block text-xs text-muted-foreground">{s.hint}</span>
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-muted/10 p-4 space-y-2 text-xs">
              <h3 className="text-sm font-semibold text-foreground">Hotlines & Giftnotruf</h3>
              <ul className="space-y-1">
                <li>Sucht- & Drogen-Hotline DE: <a className="font-medium underline" href="tel:01806313031">01806 313031</a></li>
                <li>Telefonseelsorge DE: <a className="font-medium underline" href="tel:08001110111">0800 111 0 111</a></li>
                <li>Drogennotruf AT: <a className="font-medium underline" href="tel:+4314069595">01 406 95 95</a></li>
              </ul>
              <details>
                <summary className="cursor-pointer text-muted-foreground">Giftnotruf (DACH)</summary>
                <ul className="mt-1 space-y-0.5">
                  {POISON.map((p) => (
                    <li key={p.region}>
                      {p.region}: <a className="underline" href={`tel:${p.number.replace(/\s/g, "")}`}>{p.number}</a>
                    </li>
                  ))}
                </ul>
              </details>
            </section>
          </>
        )}

        {guide && (
          <section className="space-y-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 min-h-11 px-3 -ml-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40"
            >
              <ArrowLeft className="h-4 w-4" /> Zurück zum Symptom-Check
            </button>

            <div className="rounded-2xl bg-destructive/10 ring-1 ring-destructive/30 p-4 space-y-2">
              <h3 className="text-base font-semibold text-destructive">{guide.title}</h3>
              <p className="text-sm leading-relaxed">{guide.intro}</p>
              {guide.call112 && (
                <p className="text-xs font-semibold text-destructive">
                  ▸ Jetzt 112 anrufen, dann Schritte abarbeiten.
                </p>
              )}
            </div>

            <ol className="space-y-2">
              {guide.steps.map((step, i) => {
                const isOpen = expanded === i;
                const clickable = !!step.illus;
                return (
                  <li
                    key={i}
                    className={`rounded-xl bg-muted/20 p-3 ${
                      clickable ? "cursor-pointer hover:bg-muted/30 transition" : ""
                    }`}
                    onClick={() => clickable && setExpanded(isOpen ? null : i)}
                  >
                    <div className="flex gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-destructive/20 text-sm font-bold text-destructive">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug">{step.do}</p>
                        {step.detail && (
                          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                        )}
                      </div>
                      {step.illus && (
                        <div
                          className="shrink-0 grid h-12 w-16 place-items-center rounded-lg bg-background/60 ring-1 ring-border text-foreground"
                          aria-hidden
                        >
                          <StepIllustration name={step.illus} className="h-10 w-14" />
                        </div>
                      )}
                    </div>
                    {isOpen && step.illus && (
                      <div className="mt-3 rounded-xl bg-background/70 ring-1 ring-border p-4 flex flex-col items-center gap-2">
                        <StepIllustration
                          name={step.illus}
                          className="h-28 w-full max-w-[260px] text-destructive"
                        />
                        <p className="text-xs font-medium text-muted-foreground">
                          {ILLUSTRATION_LABEL[step.illus]}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
            <p className="text-[11px] text-muted-foreground">
              Tipp: Schritt mit Illustration antippen, um sie groß zu sehen.
            </p>

            {guide.followup && (
              <Link
                to={guide.followup.to}
                onClick={closeAll}
                className="flex items-center justify-between gap-2 rounded-lg bg-muted/20 px-3 py-2 text-sm hover:bg-muted/40 transition"
              >
                <span className="font-medium">{guide.followup.label}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            )}
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}

function HandoverCard() {
  const [recent, setRecent] = useState<LogEntry[]>([]);
  const [info, setInfo] = useState<EmergencyInfo>(emptyEmergencyInfo());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const cutoff = Date.now() - 12 * 3600 * 1000;
    setRecent(loadEntries().filter((e) => e.timestamp >= cutoff).sort((a, b) => b.timestamp - a.timestamp));
    setInfo(loadEmergencyInfo());
  }, [open]);

  const hasData = recent.length > 0 || hasAnyEmergencyInfo(info);

  return (
    <section className="rounded-2xl bg-muted/15 ring-1 ring-border p-4 space-y-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <IdCard className="h-4 w-4 text-secondary" /> Übergabe für Rettungsdienst
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {open ? "schließen" : "zeigen"}
        </span>
      </button>
      {open && (
        <div className="space-y-2 text-sm">
          <p className="text-xs text-muted-foreground">
            Neutrale Übersicht — keine Bewertung, keine Diagnose. Zeig dem Rettungsdienst diese Infos oder lies sie laut vor.
          </p>
          {recent.length > 0 ? (
            <div className="rounded-lg bg-background/60 p-2.5 space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Substanzen letzte 12 h (lokales Protokoll)
              </div>
              <ul className="space-y-1">
                {recent.map((e) => {
                  const s = SUBSTANCES.find((x) => x.id === e.substanceId);
                  const t = new Date(e.timestamp);
                  return (
                    <li key={e.id} className="text-sm">
                      <span className="font-medium">{s?.name ?? e.substanceId}</span>
                      <span className="text-muted-foreground"> · {e.dose} {e.unit} · {e.route} · {t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Keine Einträge im Protokoll der letzten 12 Stunden.</p>
          )}
          {(info.medications || info.allergies || info.conditions || info.contactPhone) && (
            <div className="rounded-lg bg-background/60 p-2.5 space-y-1 text-sm">
              {info.medications && <div><span className="text-muted-foreground text-xs">Medikamente:</span> {info.medications}</div>}
              {info.allergies && <div><span className="text-muted-foreground text-xs">Allergien:</span> {info.allergies}</div>}
              {info.conditions && <div><span className="text-muted-foreground text-xs">Vorerkrankungen:</span> {info.conditions}</div>}
              {info.contactPhone && <div><span className="text-muted-foreground text-xs">Notfallkontakt:</span> {info.contactName ?? ""} {info.contactPhone}</div>}
            </div>
          )}
          {!hasData && (
            <p className="text-xs text-muted-foreground">
              Noch keine Protokoll- oder Notfall-Daten hinterlegt.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function MedicalCard() {
  const [info, setInfo] = useState<EmergencyInfo>(emptyEmergencyInfo());
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EmergencyInfo>(emptyEmergencyInfo());
  const [error, setError] = useState<string | null>(null);
  const [showcase, setShowcase] = useState(false);

  useEffect(() => {
    const loaded = loadEmergencyInfo();
    setInfo(loaded);
    setDraft(loaded);
    if (!hasAnyEmergencyInfo(loaded)) setEditing(true);
  }, []);

  // Bildschirm im Showcase wach halten + Helligkeit-Hinweis via Esc-Schließen
  useEffect(() => {
    if (!showcase) return;
    let sentinel: WakeLockSentinel | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinel> } };
    nav.wakeLock?.request("screen").then((s) => (sentinel = s)).catch(() => {});
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowcase(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      sentinel?.release().catch(() => {});
      window.removeEventListener("keydown", onKey);
    };
  }, [showcase]);

  function startEdit() {
    setDraft(info);
    setError(null);
    setEditing(true);
  }
  function cancel() {
    setDraft(info);
    setError(null);
    setEditing(false);
  }
  function save() {
    const parsed = emergencyInfoSchema.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Eingabe ungültig");
      return;
    }
    saveEmergencyInfo(parsed.data);
    setInfo(parsed.data);
    setEditing(false);
    setError(null);
  }
  function reset() {
    if (!confirm("Notfall-Infos wirklich löschen?")) return;
    clearEmergencyInfo();
    const empty = emptyEmergencyInfo();
    setInfo(empty);
    setDraft(empty);
    setEditing(true);
  }

  const has = hasAnyEmergencyInfo(info);

  return (
    <section className="rounded-2xl bg-secondary/10 ring-1 ring-secondary/30 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <IdCard className="h-4 w-4 text-secondary" /> Medizinische Notfall-Karte
        </h3>
        {!editing && (
          <div className="flex items-center gap-1.5">
            {has && (
              <button
                onClick={() => setShowcase(true)}
                className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-destructive-foreground hover:brightness-110"
              >
                <Maximize2 className="h-3 w-3" /> Jetzt zeigen
              </button>
            )}
            <button
              onClick={startEdit}
              className="inline-flex items-center gap-1 rounded-full glass px-2.5 py-1 text-xs hover:bg-muted/40"
            >
              <Pencil className="h-3 w-3" /> {has ? "Bearbeiten" : "Anlegen"}
            </button>
          </div>
        )}
      </div>

      {showcase && <FullscreenMedicalCard info={info} onClose={() => setShowcase(false)} />}

      {!editing && (
        has ? (
          <div className="space-y-2 text-sm">
            <p className="text-xs text-muted-foreground">
              Zeige diesen Bereich Ersthelfer:innen oder dem Rettungsdienst.
            </p>
            {(info.contactName || info.contactPhone) && (
              <div className="rounded-lg bg-background/50 p-2.5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Notfallkontakt</div>
                <div className="font-medium">
                  {info.contactName}
                  {info.contactRelation && <span className="text-muted-foreground"> · {info.contactRelation}</span>}
                </div>
                {info.contactPhone && (
                  <a href={`tel:${info.contactPhone.replace(/[^\d+]/g, "")}`} className="text-secondary underline">
                    {info.contactPhone}
                  </a>
                )}
              </div>
            )}
            <dl className="grid grid-cols-1 gap-1.5 text-sm">
              {info.bloodType && <Row label="Blutgruppe" value={info.bloodType} />}
              {info.allergies && <Row label="Allergien" value={info.allergies} highlight />}
              {info.conditions && <Row label="Vorerkrankungen" value={info.conditions} highlight />}
              {info.medications && <Row label="Aktuelle Medikamente" value={info.medications} highlight />}
              {info.notes && <Row label="Sonstiges" value={info.notes} />}
            </dl>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Noch nichts hinterlegt. Trag Allergien, Vorerkrankungen und einen Notfallkontakt ein — alles bleibt lokal in deinem Browser.
          </p>
        )
      )}

      {editing && (
        <div className="space-y-2.5 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Name Kontakt" value={draft.contactName ?? ""} max={80} onChange={(v) => setDraft({ ...draft, contactName: v })} />
            <Field label="Beziehung" value={draft.contactRelation ?? ""} max={40} placeholder="z. B. Partnerin" onChange={(v) => setDraft({ ...draft, contactRelation: v })} />
          </div>
          <Field label="Telefon Kontakt" value={draft.contactPhone ?? ""} max={40} placeholder="+49 …" onChange={(v) => setDraft({ ...draft, contactPhone: v })} />
          <Field label="Blutgruppe" value={draft.bloodType ?? ""} max={8} placeholder="0+, A−, …" onChange={(v) => setDraft({ ...draft, bloodType: v })} />
          <Area label="Allergien" value={draft.allergies ?? ""} max={500} placeholder="z. B. Penicillin, Erdnüsse" onChange={(v) => setDraft({ ...draft, allergies: v })} />
          <Area label="Vorerkrankungen" value={draft.conditions ?? ""} max={500} placeholder="z. B. Epilepsie, Asthma, Herzfehler" onChange={(v) => setDraft({ ...draft, conditions: v })} />
          <Area label="Aktuelle Medikamente" value={draft.medications ?? ""} max={500} placeholder="z. B. SSRI Sertralin 50 mg" onChange={(v) => setDraft({ ...draft, medications: v })} />
          <Area label="Sonstiges" value={draft.notes ?? ""} max={500} placeholder="Organspende-Ausweis, Sprache, …" onChange={(v) => setDraft({ ...draft, notes: v })} />

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={save} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:brightness-110">
              <Save className="h-3.5 w-3.5" /> Speichern
            </button>
            <button onClick={cancel} className="rounded-full glass px-3 py-1.5 text-xs hover:bg-muted/40">
              Abbrechen
            </button>
            {has && (
              <button onClick={reset} className="ml-auto inline-flex items-center gap-1 rounded-full bg-destructive/15 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/25">
                <Trash2 className="h-3.5 w-3.5" /> Löschen
              </button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Daten bleiben ausschließlich lokal in diesem Browser. Kein Server, kein Konto.
          </p>
        </div>
      )}
    </section>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-2.5 ${highlight ? "bg-destructive/10 ring-1 ring-destructive/20" : "bg-background/50"}`}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`whitespace-pre-wrap ${highlight ? "font-medium text-foreground" : ""}`}>{value}</div>
    </div>
  );
}

function Field({ label, value, onChange, max, placeholder }: { label: string; value: string; onChange: (v: string) => void; max: number; placeholder?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type="text"
        value={value}
        maxLength={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-background/60 px-2.5 py-1.5 text-sm ring-1 ring-border focus:ring-secondary outline-none"
      />
    </label>
  );
}

function Area({ label, value, onChange, max, placeholder }: { label: string; value: string; onChange: (v: string) => void; max: number; placeholder?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-muted-foreground">{label} <span className="text-[10px]">({value.length}/{max})</span></span>
      <textarea
        value={value}
        maxLength={max}
        placeholder={placeholder}
        rows={2}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-lg bg-background/60 px-2.5 py-1.5 text-sm ring-1 ring-border focus:ring-secondary outline-none"
      />
    </label>
  );
}

function FullscreenMedicalCard({ info, onClose }: { info: EmergencyInfo; onClose: () => void }) {
  const phoneHref = info.contactPhone ? `tel:${info.contactPhone.replace(/[^\d+]/g, "")}` : null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notfall-Karte Vollbild"
      className="fixed inset-0 z-[100] overflow-y-auto bg-background"
    >
      <div className="mx-auto min-h-full max-w-3xl px-5 py-6 sm:px-8 sm:py-10 space-y-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-destructive px-3 py-1 text-xs font-bold uppercase tracking-wider text-destructive-foreground">
              <Siren className="h-3.5 w-3.5" /> Medizinische Notfall-Karte
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Für Ersthelfer:innen und Rettungsdienst. Esc oder Schließen-Button beendet.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="rounded-full glass p-2 hover:bg-muted/40"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {(info.contactName || info.contactPhone) && (
          <section className="rounded-3xl bg-secondary/15 ring-2 ring-secondary/40 p-5 sm:p-7 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Notfallkontakt
            </div>
            <div className="text-3xl sm:text-4xl font-bold leading-tight break-words">
              {info.contactName || "—"}
              {info.contactRelation && (
                <span className="block text-base font-medium text-muted-foreground mt-1">
                  {info.contactRelation}
                </span>
              )}
            </div>
            {phoneHref && (
              <a
                href={phoneHref}
                className="flex items-center justify-center gap-3 rounded-2xl bg-secondary px-5 py-4 text-2xl font-bold text-secondary-foreground shadow-md hover:brightness-110"
              >
                <Phone className="h-7 w-7" /> {info.contactPhone}
              </a>
            )}
          </section>
        )}

        {info.bloodType && (
          <BigRow label="Blutgruppe" value={info.bloodType} />
        )}
        {info.allergies && (
          <BigRow label="Allergien" value={info.allergies} highlight />
        )}
        {info.conditions && (
          <BigRow label="Vorerkrankungen" value={info.conditions} highlight />
        )}
        {info.medications && (
          <BigRow label="Aktuelle Medikamente" value={info.medications} highlight />
        )}
        {info.notes && (
          <BigRow label="Sonstiges" value={info.notes} />
        )}

        <a
          href="tel:112"
          className="flex items-center justify-center gap-3 rounded-2xl bg-destructive px-5 py-5 text-2xl font-bold text-destructive-foreground shadow-md hover:brightness-110"
        >
          <Phone className="h-7 w-7" /> 112 anrufen
        </a>

        <p className="text-center text-xs text-muted-foreground">
          Daten lokal gespeichert. Bildschirm bleibt im Vollbild-Modus aktiv.
        </p>
      </div>
    </div>
  );
}

function BigRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <section
      className={`rounded-3xl p-5 sm:p-7 ${
        highlight
          ? "bg-destructive/15 ring-2 ring-destructive/40"
          : "bg-muted/20 ring-1 ring-border"
      }`}
    >
      <div
        className={`text-xs font-semibold uppercase tracking-widest ${
          highlight ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
      <div className="mt-2 whitespace-pre-wrap break-words text-2xl sm:text-3xl font-semibold leading-snug">
        {value}
      </div>
    </section>
  );
}
