import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart } from "lucide-react";
import { GENERAL_AFTERCARE, SUBSTANCE_AFTERCARE } from "@/lib/aftercare";
import { SUBSTANCES } from "@/lib/substances";

export const Route = createFileRoute("/aftercare")({
  component: AftercarePage,
  head: () => ({
    meta: [
      { title: "Aftercare & Comedown — Rave Safe, have Fun" },
      { name: "description", content: "Tag danach: Schlaf, Elektrolyte, Stimmungstief. Allgemein und pro Substanz." },
      { property: "og:title", content: "Aftercare & Comedown — Rave Safe, have Fun" },
      { property: "og:description", content: "Erholung nach dem Konsum — evidenznahe Tipps." },
      { property: "og:url", content: "https://ravesave.lovable.app/aftercare" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.lovable.app/aftercare" }],
  }),
});

function AftercarePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> zur Startseite
      </Link>
      <div>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-secondary" />
          <h1 className="text-2xl font-bold">Aftercare & Comedown</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-prose">
          Der Tag danach ist die wichtigste Safer-Use-Phase und bekommt am wenigsten Aufmerksamkeit.
          Schlaf, Wasser, echtes Essen, etwas Sonne — keine Hausarbeit, keine schweren Gespräche.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground">Allgemein</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {GENERAL_AFTERCARE.map((t) => (
            <div key={t.title} className="rounded-2xl glass p-4">
              <h3 className="font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground">Substanz-spezifisch</h2>
        <div className="space-y-4">
          {Object.entries(SUBSTANCE_AFTERCARE).map(([id, topics]) => {
            const sub = SUBSTANCES.find((s) => s.id === id);
            if (!sub) return null;
            return (
              <div key={id} className="rounded-2xl glass p-4">
                <Link to="/substances" hash={id} className="font-semibold hover:text-secondary">
                  {sub.name}
                </Link>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {topics.map((t) => (
                    <div key={t.title} className="rounded-xl bg-muted/20 p-3">
                      <div className="text-sm font-medium">{t.title}</div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{t.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
