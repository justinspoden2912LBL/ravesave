import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShieldAlert, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "Über den Entwickler — Rave Safe, have Fun" },
      {
        name: "description",
        content:
          "Warum es Rave Safe, have Fun gibt — eine persönliche Notiz von Justin, dem Entwickler, über Erfahrung, Verantwortung und Harm Reduction.",
      },
      { property: "og:title", content: "Über den Entwickler — Rave Safe, have Fun" },
      { property: "og:description", content: "Eine persönliche Notiz von Justin: Motivation, Erfahrung und Harm Reduction." },
      { property: "og:url", content: "https://ravesave.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.lovable.app/about" }],
  }),
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-secondary" /> Über den Entwickler
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Hi, ich bin Justin.</h1>
        <p className="text-lg text-muted-foreground">
          Rave Safe, have Fun ist aus persönlicher Erfahrung entstanden — und aus dem Wunsch,
          dass andere möglichst sicher durch ihre eigene reisen.
        </p>
      </header>

      <section className="rounded-3xl glass p-6 space-y-4 text-[15px] leading-relaxed">
        <p>
          Ich habe selbst Erfahrungen mit über <strong>84 psychoaktiven Substanzen</strong>{" "}
          gemacht — über praktisch jeden denkbaren Applikationsweg. Diese Reise hat mir eines
          sehr deutlich gezeigt: Konsum kann Genuss, Verbindung und tiefe Selbsterkenntnis
          bedeuten — und im selben Atemzug ernsthaft gefährlich werden.
        </p>
        <p>
          Genau deshalb gibt es dieses Tool. Es soll dir helfen, in wenigen Sekunden
          einzuschätzen, was du gerade vorhast: Welche Wechselwirkungen sind kritisch,
          welche Dosis ist realistisch, worauf solltest du achten. Ziel ist nicht, dir
          irgendwas auszureden — sondern dass du eine gute, bewusste Erfahrung machst und
          das Risiko dabei so klein wie möglich hältst.
        </p>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <div className="flex items-center gap-2 font-semibold text-destructive">
            <ShieldAlert className="h-4 w-4" /> Ehrlich bleiben
          </div>
          <p className="mt-2 text-foreground/90">
            Auch wenn dieses Tool Risiken minimiert — Drogenkonsum bleibt nie risikofrei.
            Reinheit, Tagesform, Set &amp; Setting, individuelle Veranlagung: vieles lässt
            sich nicht vollständig kontrollieren. Im Zweifel gilt immer: lieber eine Nummer
            vorsichtiger als eine zu mutig. Niedriger dosieren, länger warten, jemanden
            dabei haben, der nüchtern ist. Das ist nicht uncool — das ist erfahren.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Mit Respekt und in der Hoffnung, dass niemand etwas Schlimmes erlebt, was sich
          mit ein bisschen Wissen hätte vermeiden lassen — <strong className="text-foreground">Justin</strong>
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link
          to="/knigge"
          className="inline-flex items-center gap-2 rounded-full bg-aurora animate-aurora px-4 py-2 text-sm font-medium text-primary-foreground glow"
        >
          <Heart className="h-4 w-4" /> Drogenknigge lesen
        </Link>
        <Link
          to="/substances"
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm"
        >
          Substanzen erkunden
        </Link>
      </div>
    </div>
  );
}
