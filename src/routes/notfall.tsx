import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, HeartPulse, Siren, ShieldAlert, Wind, Brain, Zap, Thermometer } from "lucide-react";
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

function NotfallPage() {
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

      <a
        href="tel:112"
        aria-label="Notruf 112 anrufen"
        className="flex items-center justify-center gap-3 rounded-2xl bg-destructive px-4 py-5 text-xl font-bold text-destructive-foreground shadow-lg ring-2 ring-destructive/40 hover:brightness-110 active:scale-[0.98] transition"
      >
        <Phone className="h-6 w-6" /> 112 anrufen
      </a>

      <SaferUseCallout variant="emergency" title="Polizei kommt nicht automatisch mit.">
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
        </div>
      </section>

      <section className="rounded-2xl glass p-5 space-y-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <HeartPulse className="h-4 w-4 text-destructive" /> Stabile Seitenlage in 4 Schritten
        </h2>
        <ol className="list-decimal pl-5 text-sm leading-relaxed space-y-1">
          <li>Naheliegenden Arm im 90°-Winkel nach oben anwinkeln.</li>
          <li>Anderen Arm über die Brust, Handrücken an die Wange.</li>
          <li>Fernes Bein anwinkeln, am Knie zur Seite ziehen.</li>
          <li>Kopf leicht überstrecken, Mund öffnen — Atemweg frei.</li>
        </ol>
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
