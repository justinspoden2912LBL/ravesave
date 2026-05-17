import { createFileRoute } from "@tanstack/react-router";
import {
  AlertOctagon,
  HandHeart,
  Heart,
  Phone,
  Scale,
  ShieldAlert,
  Users,
  Eye,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/knigge")({
  component: KniggePage,
  head: () => ({
    meta: [
      { title: "Drogenknigge — Verhaltenskodex | Rave Safe, have Fun" },
      {
        name: "description",
        content:
          "Verhaltenskodex für bewussten Konsum: Konsens, Aufklärung, Verantwortung füreinander. KO-Tropfen und heimliches Verabreichen sind eine Straftat — was du wissen und tun solltest.",
      },
    ],
  }),
});

interface Rule {
  icon: LucideIcon;
  title: string;
  body: string;
  tone?: "default" | "danger";
}

const RULES: Rule[] = [
  {
    icon: AlertOctagon,
    tone: "danger",
    title: "Niemals heimlich verabreichen — niemals.",
    body:
      "Jemandem unwissentlich eine Substanz zu geben — ob KO-Tropfen, ein 'lustig' präpariertes Getränk, ein heimlich gerolltes Joint-Tütchen oder ein 'überraschend' starker Keks — ist nicht nur moralisch unentschuldbar, sondern in den meisten Ländern eine Straftat (in Deutschland u. a. gefährliche Körperverletzung, ggf. Vergewaltigung). Konsens ist nicht verhandelbar. Punkt.",
  },
  {
    icon: HandHeart,
    title: "Keine Substanzen an Unerfahrene.",
    body:
      "Wenn jemand Wirkung, Dauer und mögliche Nebenwirkungen nicht selbst kennt, gib ihm/ihr nichts — auch nicht 'nur eine halbe'. Erkläre vorher in Ruhe, was passiert, wie lange, was unangenehm werden kann. Lieber gemeinsam recherchieren als später improvisieren.",
  },
  {
    icon: Users,
    title: "Niemanden überreden — und sich nicht überreden lassen.",
    body:
      "'Komm schon, einmal nur' ist die schlechteste Grundlage für eine gute Erfahrung. Jede:r entscheidet selbst, in eigenem Tempo. Ein klares Nein wird respektiert — ohne Augenrollen, ohne Diskussion. Und wenn du selbst zögerst: dein Bauchgefühl hat in 9 von 10 Fällen recht.",
  },
  {
    icon: Eye,
    title: "Schaut aufeinander.",
    body:
      "Im Zweifel ist eine nüchterne Person die beste Versicherung des Abends. Achtet auf Atmung, Temperatur, Bewusstsein. Lasst niemanden allein, der wackelt — auch nicht 'kurz, der schläft nur'. Stabile Seitenlage kann Leben retten; im Notfall sofort 112 anrufen. Polizei kommt bei medizinischem Notruf in der Regel nicht mit.",
  },
  {
    icon: Sparkles,
    title: "Set &amp; Setting ernst nehmen.",
    body:
      "Schlechter Tag, ungelöster Streit, fremde Wohnung, laute Crowd? Das ist keine Grundlage für eine gute Erfahrung. Verschieben ist keine Niederlage — es ist Erfahrung. Die Substanz läuft dir nicht weg.",
  },
  {
    icon: Scale,
    title: "Low &amp; slow. Immer.",
    body:
      "Neue Charge, neue Quelle, neue Kombination = halbe Dosis und mindestens 90 Minuten warten (oral oft länger). Nachlegen kann man, zurücknehmen nicht. 'Ich spür noch nichts' ist die teuerste Standardfehlentscheidung überhaupt.",
  },
  {
    icon: ShieldAlert,
    title: "Mischkonsum ist die größte Risikoquelle.",
    body:
      "Die meisten ernsten Zwischenfälle passieren nicht durch eine Substanz, sondern durch Kombinationen — besonders mit Alkohol, Opioiden, Benzodiazepinen oder GHB. Nutze den Mix-Check, bevor du Entscheidungen triffst, die du später nicht mehr rückgängig machen kannst.",
  },
  {
    icon: Trash2,
    title: "Hinterlass nichts und niemanden im Müll.",
    body:
      "Räumt zusammen auf — Locations, Bühnen, Freundschaften. Wer mit euch feiert, geht im besten Fall auch mit euch nach Hause oder zumindest sicher in ein Taxi. Drug-Checking nutzen, wenn verfügbar. Und: kein Fahren unter Einfluss. Nie.",
  },
  {
    icon: Heart,
    title: "Reden hilft — vorher, während, danach.",
    body:
      "Sprecht über Erwartungen, Ängste, Grenzen, bevor es losgeht. Checkt euch mittendrin ('Alles gut bei dir?'). Und sprecht am Tag danach drüber — was war schön, was war zu viel, was machen wir nächstes Mal anders. So lernt man.",
  },
];

function KniggePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
          <HandHeart className="h-3.5 w-3.5 text-secondary" /> Verhaltenskodex
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Drogenknigge</h1>
        <p className="text-lg text-muted-foreground">
          Harm Reduction ist nicht nur Pharmakologie — es ist auch eine Frage des Umgangs
          miteinander. Diese Regeln sind keine Moralpredigt, sondern das, was erfahrene
          Konsument:innen, Awareness-Teams und Notärzt:innen seit Jahren wiederholen.
        </p>
      </header>

      <section className="grid gap-3">
        {RULES.map(({ icon: Icon, title, body, tone }, i) => (
          <article
            key={i}
            className={`rounded-2xl p-5 ring-1 transition ${
              tone === "danger"
                ? "bg-destructive/10 ring-destructive/30"
                : "glass ring-border hover:ring-foreground/20"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                  tone === "danger" ? "bg-destructive/20 text-destructive" : "bg-muted/30 text-foreground"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 space-y-1">
                <h2
                  className={`text-base font-semibold leading-tight ${
                    tone === "danger" ? "text-destructive" : "text-foreground"
                  }`}
                  dangerouslySetInnerHTML={{ __html: title }}
                />
                <p
                  className="text-sm leading-relaxed text-foreground/90"
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl glass p-6 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Phone className="h-4 w-4 text-destructive" /> Im Notfall
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">
          <strong>112</strong> wählen. Sag klar, was eingenommen wurde — Ehrlichkeit
          rettet Leben, der Rettungsdienst hat kein Interesse an Strafverfolgung. Bleib
          bei der Person, halte sie wach und in stabiler Seitenlage, falls sie nicht
          ansprechbar ist.
        </p>
        <p className="text-xs text-muted-foreground">
          Sucht- und Drogen-Hotline (DE): <strong>01806 313031</strong> · Telefonseelsorge:{" "}
          <strong>0800 111 0 111</strong>
        </p>
      </section>
    </div>
  );
}
