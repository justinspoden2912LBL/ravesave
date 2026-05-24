import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Droplets, UtensilsCrossed, Moon, Sun } from "lucide-react";
import { GENERAL_AFTERCARE, SUBSTANCE_AFTERCARE } from "@/lib/aftercare";
import { SUBSTANCES } from "@/lib/substances";
import { DetailGate } from "@/components/DetailGate";
import { DetailLevelSwitch } from "@/components/DetailLevelSwitch";

export const Route = createFileRoute("/aftercare")({
  component: AftercarePage,
  head: () => ({
    meta: [
      { title: "Aftercare & Comedown — Rave Safe, have Fun" },
      { name: "description", content: "Tag danach: Schlaf, Elektrolyte, Stimmungstief. Allgemein und pro Substanz." },
      { property: "og:title", content: "Aftercare & Comedown — Rave Safe, have Fun" },
      { property: "og:description", content: "Erholung nach dem Konsum — evidenznahe Tipps." },
      { property: "og:url", content: "https://ravesave.fun/aftercare" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.fun/aftercare" }],
  }),
});

const RECOVERY_CARDS = [
  {
    icon: Droplets,
    title: "Wasser & Elektrolyte",
    short: "Schluckweise statt Liter — mit Salz oder Iso.",
    extended:
      "300–500 ml über die erste Stunde, danach nach Durst. Iso-Getränk oder Brühe deckt Natrium, Kalium, Magnesium ab. Reines Wasser in großen Mengen kann nach MDMA gefährlich werden (Hyponatriämie).",
    expert:
      "MDMA löst SIADH-ähnliche ADH-Sekretion aus → Wasser-Retention. Natrium-arme Flüssigkeit > 1 L/h erhöht Hyponatriämie-Risiko deutlich. Ziel: Na ≥ 135 mmol/L, leichte Salzaufnahme bevorzugen.",
  },
  {
    icon: UtensilsCrossed,
    title: "Echtes Essen",
    short: "Etwas Warmes, leicht verdaulich.",
    extended:
      "Komplexe Kohlenhydrate + Eiweiß: Haferbrei, Reis mit Ei, Suppe. Vermeide Alkohol und nochmal Stimulanzien (auch Energy-Drinks). Magnesium (Banane, Nüsse) hilft gegen Kieferspannung.",
    expert:
      "Tryptophan-haltige Lebensmittel (Eier, Käse, Hafer) unterstützen 5-HT-Resynthese. B-Vitamine (Folat, B6, B12) als Cofaktoren. Tyrosin nach Stimulanzien sinnvoll, aber kein Wundermittel — Schlaf bleibt wichtigster Faktor.",
  },
  {
    icon: Moon,
    title: "Schlaf",
    short: "Lange, dunkel, ohne Wecker.",
    extended:
      "Auch wenn Schlaf nicht kommt: Bett, Dunkelheit, ruhige Atmung. Magnesium und L-Theanin können helfen. Keine Schlafmittel auf Stimulanzien — Wechselwirkungs-Risiko.",
    expert:
      "Stimulanzien-Halbwertszeit beachten: MDMA ~8 h, Amphetamin 10–13 h, Methamphetamin 9–12 h, Kokain 1 h aber Metabolite länger. Schlaf-Architektur (REM, SWS) erst nach 24–48 h normalisiert. Keine BZD-Eigenmedikation.",
  },
  {
    icon: Sun,
    title: "Energie & Stimmung",
    short: "Tageslicht, sanfte Bewegung, Geduld.",
    extended:
      "„Suicide Tuesday" nach MDMA ist normal und vorübergehend. 20 Minuten Sonne, ein Spaziergang, ein vertrauter Mensch. Keine wichtigen Entscheidungen oder Konflikte — Wahrnehmung ist verzerrt.",
    expert:
      "Serotonin-Depletion senkt 5-HT-Tonus für 2–7 Tage; Dopamin-Erholung schneller. Lichttherapie und moderate Bewegung erhöhen BDNF. Bei wiederholtem Tief > 2 Wochen oder Suizidgedanken → fachliche Hilfe (Telefonseelsorge 0800 111 0 111).",
  },
];

function AftercarePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> zur Startseite
      </Link>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-secondary" />
            <h1 className="text-2xl font-bold">Aftercare & Comedown</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-prose">
            Der Tag danach ist die wichtigste Safer-Use-Phase und bekommt am wenigsten Aufmerksamkeit.
            Vier Dinge zählen — Wasser, Essen, Schlaf, Stimmung.
          </p>
        </div>
        <DetailLevelSwitch size="sm" />
      </div>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground">Die vier Säulen</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {RECOVERY_CARDS.map(({ icon: Icon, title, short, extended, expert }) => (
            <article key={title} className="rounded-2xl glass p-5 space-y-3">
              <header className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-xl bg-aurora animate-aurora grid place-items-center text-primary-foreground shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold leading-tight">{title}</h3>
                  <p className="text-sm text-muted-foreground">{short}</p>
                </div>
              </header>
              <DetailGate min="extended">
                <p className="text-sm leading-relaxed border-t border-border/40 pt-3">{extended}</p>
              </DetailGate>
              <DetailGate min="expert">
                <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-secondary/60 pl-3">
                  <span className="font-semibold text-secondary">Fachebene:</span> {expert}
                </p>
              </DetailGate>
            </article>
          ))}
        </div>
      </section>

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

