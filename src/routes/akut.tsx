import { createFileRoute, Link } from "@tanstack/react-router";
import { Wind, Brain, Snowflake, ShieldAlert, ArrowRight, Phone } from "lucide-react";
import { DetailGate } from "@/components/DetailGate";

export const Route = createFileRoute("/akut")({
  component: AkutPage,
  head: () => ({
    meta: [
      { title: "Akute Hilfe — wenn's gerade nicht gut ist · RaveSave" },
      {
        name: "description",
        content:
          "Ruhige Soforthilfe bei Überforderung, schlechtem Trip oder Comedown — bevor es ein Notfall ist.",
      },
      { property: "og:title", content: "Akute Hilfe · RaveSave" },
      {
        property: "og:description",
        content: "Ruhige Soforthilfe zwischen Alltag und 112.",
      },
      { property: "og:url", content: "https://ravesave.fun/akut" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.fun/akut" }],
  }),
});

function AkutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-secondary">Akute Hilfe</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Atme. Du bist hier richtig.
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Wenn dir gerade viel ist, aber es (noch) kein Notfall ist. Wähle, was am ehesten
          passt — die Schritte sind kurz und in der Reihenfolge, die hilft.
        </p>
      </header>

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
          <>
            <p>
              Was du spürst, ist meist Sympathikus-Aktivität (Stress­achse). Box-Atmung
              aktiviert den Vagus und senkt Herzfrequenz und gefühlte Bedrohung
              messbar in 60–90 Sekunden.
            </p>
          </>
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
          <>
            <p>
              Psychedelika und Dissoziativa verstärken Erwartung. Setting ändern, vertraute
              Stimme hören, Körper wahrnehmen — das verschiebt die Erfahrung sehr
              zuverlässig in Richtung sicher.
            </p>
          </>
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
          <>
            <p>
              Nach Stimulanzien sind Dopamin- und Serotonin-Speicher kurzzeitig leer.
              Mehr nachlegen verstärkt nur den Crash. Schlaf, Magnesium und ein leichtes
              Frühstück sind die schnellste Hilfe — siehe{" "}
              <Link to="/aftercare" className="underline text-secondary">
                Aftercare
              </Link>
              .
            </p>
          </>
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
        Das ersetzt keine medizinische Beratung. Im Zweifel immer 112.
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
  icon: typeof Wind;
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
