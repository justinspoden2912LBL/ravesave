import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, ArrowLeft, ExternalLink } from "lucide-react";
import { DRUG_CHECK_SITES, COUNTRY_LABEL, SITE_TYPE_LABEL, type Country } from "@/lib/drugCheckingSites";

export const Route = createFileRoute("/drugchecking")({
  component: DrugCheckingPage,
  head: () => ({
    meta: [
      { title: "Drug-Checking — Anlaufstellen DE/AT/CH" },
      { name: "description", content: "Kuratierte Liste echter Drug-Checking-Stellen in Deutschland, Österreich und der Schweiz." },
      { property: "og:title", content: "Drug-Checking-Anlaufstellen — Rave Safe, have Fun" },
      { property: "og:description", content: "checkit!, Saferparty, drugchecking.berlin & Co. — Stellen mit Adresse und Link." },
      { property: "og:url", content: "https://ravesave.lovable.app/drugchecking" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.lovable.app/drugchecking" }],
  }),
});

function DrugCheckingPage() {
  const [country, setCountry] = useState<Country | "all">("all");
  const sites = DRUG_CHECK_SITES.filter((s) => country === "all" || s.country === country);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> zur Startseite
      </Link>
      <div>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-secondary" />
          <h1 className="text-2xl font-bold">Drug-Checking-Anlaufstellen</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-prose">
          Echte Labor-Analyse statt Reagent-Test. Diese Stellen sind frei zugänglich, anonym und meist kostenlos.
          Adressen und Öffnungszeiten ändern sich — bitte vor Anfahrt auf der jeweiligen Webseite verifizieren.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "DE", "AT", "CH", "EU"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCountry(c)}
            className={`rounded-full px-3 py-1.5 text-xs ${country === c ? "bg-aurora animate-aurora text-primary-foreground" : "bg-muted/40 hover:bg-muted/60"}`}
          >
            {c === "all" ? "Alle" : COUNTRY_LABEL[c]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {sites.map((s) => (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl glass p-4 hover:ring-1 hover:ring-primary/40 transition group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{COUNTRY_LABEL[s.country]} · {s.city}</div>
                <div className="font-semibold truncate group-hover:text-secondary">{s.name}</div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-[10px] rounded-full px-2 py-0.5 bg-secondary/15 text-secondary ring-1 ring-secondary/30">
                {SITE_TYPE_LABEL[s.type]}
              </span>
              {s.free && (
                <span className="text-[10px] rounded-full px-2 py-0.5 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
                  Kostenlos
                </span>
              )}
              {s.remoteResults && (
                <span className="text-[10px] rounded-full px-2 py-0.5 bg-muted/40">
                  Online-Ergebnis
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{s.description}</p>
            {s.address && <p className="mt-1.5 text-[11px] text-muted-foreground">📍 {s.address}</p>}
            {s.hours && <p className="text-[11px] text-muted-foreground">🕒 {s.hours}</p>}
          </a>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Stelle fehlt? <a className="text-secondary underline" href="mailto:ravesafe.live@gmail.com?subject=Drug-Checking-Stelle">Schreib uns.</a>
      </p>
    </div>
  );
}
