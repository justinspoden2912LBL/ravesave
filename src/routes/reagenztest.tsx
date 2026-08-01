import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FlaskConical, ArrowLeft } from "lucide-react";
import { REAGENT_DATA, REAGENT_LABEL, REAGENT_INTRO, type Reagent } from "@/lib/reagents";
import { SUBSTANCES } from "@/lib/substances";

export const Route = createFileRoute("/reagenztest")({
  component: ReagentPage,
  head: () => ({
    meta: [
      { title: "Reagent-Test-Guide — Rave Safe, have Fun" },
      { name: "description", content: "Marquis, Mecke, Mandelin & Co. — erwartete Farbreaktionen pro Substanz mit Hex-Vorschau." },
      { property: "og:title", content: "Reagent-Test-Guide — Rave Safe, have Fun" },
      { property: "og:description", content: "Farbreaktionen für Marquis/Mecke/Mandelin pro Substanz." },
      { property: "og:url", content: "https://ravesave.de/reagenztest" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.de/reagenztest" }],
  }),
});

const REAGENTS: Reagent[] = ["marquis", "mecke", "mandelin", "simons", "liebermann", "morris", "folin", "ehrlich"];

function ReagentPage() {
  const [filter, setFilter] = useState<Reagent | "all">("all");

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> zur Startseite
      </Link>
      <div>
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-secondary" />
          <h1 className="text-2xl font-bold">Reagent-Test-Guide</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-prose">
          Reagent-Tests sind das absolute Minimum vor dem Konsum. Sie zeigen, ob die <em>Hauptsubstanz</em>
          drin ist — sie erkennen <strong>keine</strong> Streckmittel, Dosierung oder gefährliche Beimischungen.
          Für Reinheit & Menge: Drug-Checking-Labor (siehe <Link to="/drugchecking" className="text-secondary underline">Anlaufstellen</Link>).
        </p>
      </div>

      <div className="rounded-2xl glass p-4 space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground">Reagenz</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1 text-xs ${filter === "all" ? "bg-aurora animate-aurora text-primary-foreground" : "bg-muted/40 hover:bg-muted/60"}`}
          >
            Alle
          </button>
          {REAGENTS.map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`rounded-full px-3 py-1 text-xs ${filter === r ? "bg-aurora animate-aurora text-primary-foreground" : "bg-muted/40 hover:bg-muted/60"}`}
            >
              {REAGENT_LABEL[r]}
            </button>
          ))}
        </div>
        {filter !== "all" && (
          <p className="text-xs text-muted-foreground pt-2 border-t border-border/40">
            <strong>{REAGENT_LABEL[filter]}:</strong> {REAGENT_INTRO[filter]}
          </p>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {REAGENT_DATA.map((entry) => {
          const sub = SUBSTANCES.find((s) => s.id === entry.substanceId);
          if (!sub) return null;
          const reactions = filter === "all" ? entry.reactions : entry.reactions.filter((r) => r.reagent === filter);
          if (reactions.length === 0) return null;
          return (
            <div key={entry.substanceId} className="rounded-2xl glass p-4 space-y-3">
              <Link to="/substances" hash={sub.id} className="font-semibold hover:text-secondary">
                {sub.name}
              </Link>
              <ul className="space-y-2">
                {reactions.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="h-8 w-8 rounded-md ring-1 ring-border/60 shrink-0"
                      style={{
                        background: r.swatch
                          ? `linear-gradient(135deg, ${r.swatch[0]}, ${r.swatch[1]})`
                          : "var(--muted)",
                      }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium">{REAGENT_LABEL[r.reagent]}</div>
                      <div className="text-xs text-muted-foreground">{r.color}</div>
                      {r.notes && <div className="text-[11px] text-muted-foreground mt-0.5 italic">{r.notes}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
