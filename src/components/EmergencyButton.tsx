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
      { do: "112 anrufen", detail: "Lautsprecher an, Adresse zuerst." },
      { do: "Auf den Rücken legen, Kopf überstrecken, Kinn anheben", detail: "Atemweg frei machen." },
      { do: "Falls Naloxon (Nyxoid/Narcan) verfügbar: 1 Sprühstoß pro Nasenloch", detail: "Bei Opioid-Verdacht. Alle 2–3 min wiederholen, bis Atmung kommt." },
      { do: "Keine eigenständige Atmung? Beatmen: 2 Atemstöße, dann 30 Herzdruckmassagen", detail: "Tempo 100–120/min, 5–6 cm tief, Mitte Brustkorb." },
      { do: "Nicht aufhören, bis Rettung übernimmt", detail: "Auch wenn es ewig wirkt." },
    ],
    followup: { label: "Mehr zu Opioiden & Naloxon", to: "/substances" },
  },
  unconscious: {
    title: "Bewusstlos, aber atmet",
    call112: true,
    intro: "Stabile Seitenlage rettet Leben — verhindert Ersticken an Erbrochenem.",
    steps: [
      { do: "Ansprechen, Schulter rütteln, Schmerzreiz (Brustbein reiben)", detail: "Wirklich bewusstlos?" },
      { do: "112 anrufen", detail: "Substanz(en) und Zeitpunkt ehrlich nennen." },
      { do: "Atmung 10 Sek prüfen", detail: "Hören, sehen, fühlen. Keine Atmung → Herzdruckmassage." },
      { do: "Stabile Seitenlage", detail: "Arm 90°, andere Hand an Wange, fernes Bein anwinkeln, zu dir drehen, Kopf überstrecken." },
      { do: "Bleib daneben, beobachte Atmung", detail: "Erbricht die Person, Mund ausräumen." },
    ],
  },
  seizure: {
    title: "Krampfanfall",
    call112: true,
    intro: "Häufig bei Stimulanzien-Überdosis, GHB-Entzug, Tramadol, Mischkonsum oder unbekannter RC.",
    steps: [
      { do: "Person nicht festhalten", detail: "Krampf nicht stoppen wollen — Verletzungsgefahr." },
      { do: "Umgebung sichern: harte Kanten weg, Kopf weich polstern", detail: "Jacke unter den Kopf." },
      { do: "Nichts in den Mund stecken", detail: "Kein Löffel, kein Finger — Erstickungs- und Bissgefahr." },
      { do: "Zeit messen", detail: "Krampf >2 Min oder zweiter Anfall hintereinander = sofort 112." },
      { do: "Nach dem Krampf: stabile Seitenlage, ansprechen, ruhig bleiben", detail: "Verwirrung danach ist normal." },
    ],
    followup: { label: "Risiken nachschlagen", to: "/risks" },
  },
  overheating: {
    title: "Überhitzung / Hyperthermie",
    call112: true,
    intro: "Klassiker bei MDMA, Amphetamin, Kokain, 2C-B + Tanzen + warmer Raum. Ab 40 °C lebensbedrohlich.",
    steps: [
      { do: "Sofort raus aus der Hitze", detail: "Kühler Raum, Schatten, vor den Lüfter." },
      { do: "Kleidung lockern, Haut nass machen", detail: "Lauwarmes Wasser auf Hals, Achseln, Leisten. Fächeln." },
      { do: "Schluckweise Wasser oder isotonisches Getränk", detail: "Max ~500 ml/h — kein Wasser ex, sonst Hyponatriämie." },
      { do: "Bewusstsein & Atmung beobachten", detail: "Verwirrung, Krampf, Bewusstlosigkeit → 112." },
      { do: "Nicht weiter tanzen, nicht nachlegen", detail: "Der Abend ist vorbei. Wirklich." },
    ],
    followup: { label: "Stimulanzien-Risiken", to: "/risks" },
  },
  chest_pain: {
    title: "Brustschmerz / Herzrasen extrem",
    call112: true,
    intro: "Stimulanzien (Kokain, Speed, MDMA) + Vorerkrankung oder hohe Dosis können Herzinfarkt auslösen.",
    steps: [
      { do: "112 anrufen", detail: "Genau sagen: Brustschmerz, Substanz, Dosis." },
      { do: "Hinsetzen, Oberkörper hoch, beruhigen", detail: "Nicht hinlegen — erleichtert die Atmung." },
      { do: "Keine weitere Substanz, kein Alkohol", detail: "Keine Aufputscher, kein Energy Drink." },
      { do: "Wenn Atmung aussetzt: Herzdruckmassage", detail: "100–120/min, ohne Pause bis Rettung kommt." },
    ],
  },
  panic: {
    title: "Bad Trip / akute Panik",
    call112: false,
    intro: "Meistens psychisch, nicht akut lebensgefährlich — solange Atmung und Bewusstsein stabil sind.",
    steps: [
      { do: "Ruhigen, vertrauten Ort aufsuchen", detail: "Weg von Crowd, Stroboskop, lauter Musik." },
      { do: "Atem führen: 4 Sek ein, 6 Sek aus", detail: "Gemeinsam atmen, sanft Hand auf den Bauch." },
      { do: "Sätze wie 'Das geht vorbei. Du bist sicher. Ich bleibe da.'", detail: "Talkdown — nicht diskutieren, nicht widersprechen." },
      { do: "Wasser, evtl. Süßes, warme Decke", detail: "Erdung über den Körper." },
      { do: "Bei Atemnot, Krampf, Bewusstlosigkeit → 112", detail: "Auch bei Suizidgedanken sofort Hilfe holen." },
    ],
    followup: { label: "Drogenknigge & Awareness", to: "/knigge" },
  },
};

export function EmergencyButton() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<SymptomId | null>(null);

  function reset() {
    setActive(null);
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
          className="fixed bottom-4 right-4 z-50 print:hidden inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground shadow-lg ring-2 ring-destructive/40 hover:brightness-110 transition motion-safe:animate-pulse motion-reduce:animate-none"
        >
          <Siren className="h-5 w-5" />
          <span>Notfall</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Siren className="h-5 w-5" /> Notfall-Hilfe
          </DialogTitle>
          <DialogDescription>
            {guide ? "Schritt-für-Schritt-Anleitung. Ruhig bleiben." : "Ruhig bleiben. Atmen. Person nicht allein lassen."}
          </DialogDescription>
        </DialogHeader>

        {/* Always-visible 112 */}
        <a
          href="tel:112"
          className="flex items-center justify-center gap-2 rounded-2xl bg-destructive px-4 py-4 text-lg font-bold text-destructive-foreground shadow-md hover:brightness-110"
        >
          <Phone className="h-6 w-6" /> 112 anrufen
        </a>

        {/* Medical ID — immer sichtbar, damit Ersthelfer:innen Infos finden */}
        <MedicalCard />

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
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Zurück zum Symptom-Check
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
              {guide.steps.map((step, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-muted/20 p-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-destructive/20 text-sm font-bold text-destructive">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{step.do}</p>
                    {step.detail && (
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>

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
