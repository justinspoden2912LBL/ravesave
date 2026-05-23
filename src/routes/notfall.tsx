import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Phone,
  HeartPulse,
  Siren,
  ShieldAlert,
  Wind,
  Brain,
  Zap,
  Thermometer,
  Volume2,
  Square,
  Sparkles,
  Syringe,
  FlaskConical,
  ExternalLink,
} from "lucide-react";
import { SaferUseCallout } from "@/components/SaferUseCallout";

export const Route = createFileRoute("/notfall")({
  component: NotfallPage,
  head: () => ({
    meta: [
      { title: "Notfall — Erste Hilfe bei Drogen-Notfällen | RaveSave" },
      {
        name: "description",
        content:
          "Was tun bei Atemstillstand, Bewusstlosigkeit, Krampfanfall oder Überhitzung? Schritt-für-Schritt-Erste-Hilfe und Notfallnummern — DACH.",
      },
      { property: "og:title", content: "Notfall — Erste Hilfe bei Drogen-Notfällen" },
      {
        property: "og:description",
        content: "112, stabile Seitenlage, Naloxon, Talkdown — schnell und ruhig erklärt.",
      },
      { property: "og:url", content: "https://ravesave.lovable.app/notfall" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.lovable.app/notfall" }],
  }),
});

const RECOVERY_STEPS = [
  "Naheliegenden Arm im 90-Grad-Winkel nach oben anwinkeln.",
  "Anderen Arm über die Brust, Handrücken an die Wange.",
  "Fernes Bein anwinkeln, am Knie zur Seite ziehen.",
  "Kopf leicht überstrecken, Mund öffnen — Atemweg frei.",
];

const EMERGENCY_COPY_TEXT =
  "Notfall: 112 rufen. Person ansprechen, Atmung prüfen. Atmet nicht: 30 Herzdruckmassagen + 2 Atemstöße im Wechsel. Atmet noch, bewusstlos: stabile Seitenlage, dabeibleiben. Konsum offen sagen — keine Polizei automatisch.";

function NotfallPage() {
  // Double-Tap-Schutz für 112
  const [calling, setCalling] = useState(false);
  const callTimer = useRef<number | null>(null);
  useEffect(() => () => { if (callTimer.current) window.clearTimeout(callTimer.current); }, []);

  function onCall112(e: React.MouseEvent<HTMLAnchorElement>) {
    if (calling) {
      e.preventDefault();
      return;
    }
    setCalling(true);
    callTimer.current = window.setTimeout(() => setCalling(false), 4000);
  }

  // Vorlesen der stabilen Seitenlage via SpeechSynthesis
  const [reading, setReading] = useState(false);
  const ttsAvailable = typeof window !== "undefined" && "speechSynthesis" in window;

  function speakRecovery() {
    if (!ttsAvailable) return;
    if (reading) {
      window.speechSynthesis.cancel();
      setReading(false);
      return;
    }
    const text = "Stabile Seitenlage in vier Schritten. " + RECOVERY_STEPS.join(" ");
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "de-DE";
    utter.rate = 0.95;
    utter.pitch = 1.05;
    utter.onend = () => setReading(false);
    utter.onerror = () => setReading(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    setReading(true);
  }

  useEffect(() => () => {
    if (ttsAvailable) window.speechSynthesis.cancel();
  }, [ttsAvailable]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-destructive/15 px-3 py-1 text-xs font-medium text-destructive ring-1 ring-destructive/30">
          <Siren className="h-3.5 w-3.5" /> Notfall
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Erste Hilfe — schnell und ruhig.</h1>
        <p className="text-muted-foreground">
          Im Zweifel immer <strong className="text-foreground">112</strong> rufen. Lieber einmal zu viel als einmal zu wenig.
        </p>
      </header>

      <div className="space-y-1.5">
        <a
          href="tel:112"
          onClick={onCall112}
          aria-label="Notruf 112 anrufen"
          aria-disabled={calling}
          className={`flex items-center justify-center gap-3 rounded-2xl px-4 py-5 text-xl font-bold text-destructive-foreground shadow-lg ring-2 transition ${
            calling
              ? "bg-destructive/70 ring-destructive/30 pointer-events-none opacity-80"
              : "bg-destructive ring-destructive/40 hover:brightness-110 active:scale-[0.98]"
          }`}
        >
          <Phone className={`h-6 w-6 ${calling ? "animate-pulse" : ""}`} />
          {calling ? "Anruf wird gestartet…" : "112 anrufen"}
        </a>
        <p className="text-[11px] text-muted-foreground text-center">
          Tippt nur den Anruf an — RaveSave speichert dabei keine Daten und sendet keine Standortinfos.
        </p>
      </div>

      <SaferUseCallout
        variant="emergency"
        title="Polizei kommt nicht automatisch mit."
        collapsible
        copyText={EMERGENCY_COPY_TEXT}
      >
        Beim Notruf gilt Schweigepflicht. Sag offen, was konsumiert wurde — die Sanitäter brauchen das, um zu helfen.
        Es gibt in DE/AT/CH keine automatische Anzeige bei der Polizei.
      </SaferUseCallout>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Symptome &amp; was zu tun ist</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card icon={Wind} title="Atemstillstand / flache Atmung" tone="critical">
            112 rufen. Auf Rücken legen, Kopf überstrecken, Kinn anheben. Bei Opioid-Verdacht Naloxon (Nasenspray).
            Keine Atmung → 30 Herzdruckmassagen, 2 Atemstöße, im Wechsel.
          </Card>
          <Card icon={Brain} title="Bewusstlos, atmet noch" tone="critical">
            112 rufen. Stabile Seitenlage, Atmung beobachten, dabeibleiben. Bei Erbrechen Mund ausräumen.
          </Card>
          <Card icon={Zap} title="Krampfanfall" tone="critical">
            Nicht festhalten. Kopf weich polstern, harte Kanten weg. Nichts in den Mund. Krampf &gt;2 Min → 112.
          </Card>
          <Card icon={Thermometer} title="Überhitzung" tone="high">
            Sofort raus aus der Hitze. Haut nass machen (Hals, Achseln, Leisten), fächeln, schluckweise Wasser.
            Keine weitere Substanz.
          </Card>
          <Card icon={HeartPulse} title="Herzrasen / Brustschmerz" tone="critical">
            Hinsetzen oder hinlegen, Beine hoch, ruhig atmen (4-4-4-4). Kein weiterer Stim, kein Kaffee, kein Alkohol.
            Brustschmerz &gt;5 Min, Engegefühl, Schweißausbruch → 112.
          </Card>
          <Card icon={Sparkles} title="Bad Trip / Panik" tone="high">
            Ruhiger, gedimmter Ort. Augenbinde, vertraute Musik. Mit fester, leiser Stimme:
            „Du bist sicher, das geht vorbei, ich bleibe da." Atmung mitführen (4-4-8). Kein zweites Psychedelikum,
            kein Alkohol. Wenn Panik in Aggression oder Krampf kippt → 112.
          </Card>
        </div>
      </section>

      <section className="rounded-2xl glass p-5 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <HeartPulse className="h-4 w-4 text-destructive" /> Stabile Seitenlage in 4 Schritten
          </h2>
          {ttsAvailable && (
            <button
              type="button"
              onClick={speakRecovery}
              aria-pressed={reading}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition min-h-9 ${
                reading
                  ? "bg-secondary/25 text-secondary ring-secondary/40"
                  : "bg-background/60 text-foreground/80 ring-border/60 hover:bg-background/80"
              }`}
            >
              {reading ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              {reading ? "Stop" : "Vorlesen"}
            </button>
          )}
        </div>
        <ol className="list-decimal pl-5 text-sm leading-relaxed space-y-1">
          {RECOVERY_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl ring-1 ring-destructive/30 bg-destructive/5 p-5 space-y-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Syringe className="h-4 w-4 text-destructive" /> Naloxon — Opioid-Notfall
        </h2>
        <p className="text-sm text-foreground/90">
          Naloxon (Nasenspray <strong>Nyxoid</strong> / <strong>Nalscue</strong>) hebt die Atemdepression bei Opioiden
          (Heroin, Fentanyl, Tilidin, Tramadol, Nitazene) sekundenschnell auf. Es schadet nicht, wenn kein Opioid
          beteiligt ist — also im Zweifel geben.
        </p>
        <ol className="list-decimal pl-5 text-sm leading-relaxed space-y-1">
          <li>Person flach auf den Rücken legen, Kopf leicht in den Nacken.</li>
          <li>Eine Sprühdose komplett in <strong>ein</strong> Nasenloch — voller Hub, nicht teilen.</li>
          <li>112 anrufen. Stabile Seitenlage, weiter beobachten.</li>
          <li>Nach 2–3 Min keine Besserung → zweite Dose ins andere Nasenloch. Bei Fentanyl/Nitazenen oft mehrere nötig.</li>
          <li>Naloxon wirkt 30–90 Min, viele Opioide länger — Person darf nicht allein bleiben, auch wenn sie wach wirkt.</li>
        </ol>
        <p className="text-xs text-muted-foreground">
          Bezugsquellen: in DE über{" "}
          <a className="underline" href="https://naloxontraining.de" target="_blank" rel="noopener noreferrer">naloxontraining.de</a>{" "}
          (Schulung + Kit), Suchthilfe-Stellen, in AT/CH über Substitutionsambulanzen und Drogenhilfe.
        </p>
      </section>

      <section className="rounded-2xl glass p-5 space-y-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FlaskConical className="h-4 w-4 text-secondary" /> Drug-Checking DACH
        </h2>
        <p className="text-sm text-muted-foreground">
          Anonyme Substanz-Analyse vor dem Konsum — sinnvoll besonders bei MDMA, Kokain, „LSD"-Trips und
          unbekannten Pulvern. Ergebnisse fließen in regionale Frühwarnsysteme.
        </p>
        <ul className="text-sm space-y-1.5">
          <li>
            <a className="inline-flex items-center gap-1 underline font-medium" href="https://drugchecking.berlin" target="_blank" rel="noopener noreferrer">
              drugchecking.berlin <ExternalLink className="h-3 w-3" />
            </a>{" "}
            <span className="text-muted-foreground">— Berlin (DE), Vista/Schwulenberatung/Fixpunkt</span>
          </li>
          <li>
            <a className="inline-flex items-center gap-1 underline font-medium" href="https://checkit.wien" target="_blank" rel="noopener noreferrer">
              checkit.wien <ExternalLink className="h-3 w-3" />
            </a>{" "}
            <span className="text-muted-foreground">— Wien (AT), Suchthilfe Wien</span>
          </li>
          <li>
            <a className="inline-flex items-center gap-1 underline font-medium" href="https://saferparty.ch" target="_blank" rel="noopener noreferrer">
              saferparty.ch <ExternalLink className="h-3 w-3" />
            </a>{" "}
            <span className="text-muted-foreground">— Zürich (CH), DIZ</span>
          </li>
          <li>
            <a className="inline-flex items-center gap-1 underline font-medium" href="https://www.saferparty.ch/angebote/drug-checking" target="_blank" rel="noopener noreferrer">
              Bern / Luzern / Solothurn <ExternalLink className="h-3 w-3" />
            </a>{" "}
            <span className="text-muted-foreground">— mobile DIZ-Standorte</span>
          </li>
        </ul>
        <p className="text-[11px] text-muted-foreground italic">
          Hinweis: externe Anbieter, RaveSave hat keinen Einfluss auf Verfügbarkeit, Öffnungszeiten oder Datenschutz.
        </p>
      </section>

      <section className="rounded-2xl glass p-5 space-y-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ShieldAlert className="h-4 w-4 text-secondary" /> Hotlines &amp; Giftnotruf
        </h2>
        <ul className="text-sm space-y-1">
          <li>Sucht- &amp; Drogen-Hotline (DE): <a className="font-medium underline" href="tel:01806313031">01806 313031</a></li>
          <li>Telefonseelsorge (DE): <a className="font-medium underline" href="tel:08001110111">0800 111 0 111</a></li>
          <li>Drogennotruf (AT): <a className="font-medium underline" href="tel:+4314069595">01 406 95 95</a></li>
          <li>Giftnotruf Berlin: <a className="font-medium underline" href="tel:03019240">030 19240</a></li>
          <li>Giftnotruf Wien: <a className="font-medium underline" href="tel:+4314064343">+43 1 406 43 43</a></li>
          <li>Tox Zürich: <a className="font-medium underline" href="tel:145">145</a></li>
        </ul>
      </section>

      <section className="text-sm text-muted-foreground">
        <p>
          Mehr Details zu Substanzen findest du im{" "}
          <Link to="/substances" className="underline font-medium text-foreground">
            Substanz-Wiki
          </Link>{" "}
          und im{" "}
          <Link to="/mix" className="underline font-medium text-foreground">
            Mischkonsum-Check
          </Link>
          . Diese Seite ersetzt keine medizinische Versorgung.
        </p>
      </section>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: typeof Wind;
  title: string;
  tone: "critical" | "high";
  children: React.ReactNode;
}) {
  const ring =
    tone === "critical" ? "ring-destructive/40 bg-destructive/10" : "ring-orange-500/40 bg-orange-500/10";
  return (
    <article className={`rounded-2xl ring-1 p-4 ${ring} hover-lift`}>
      <h3 className="flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4" /> {title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-foreground/90">{children}</p>
    </article>
  );
}
