import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ListChecks, RotateCcw } from "lucide-react";
import { DetailGate } from "@/components/DetailGate";
import { DetailLevelSwitch } from "@/components/DetailLevelSwitch";

export const Route = createFileRoute("/checkliste")({
  component: ChecklistePage,
  head: () => ({
    meta: [
      { title: "Pre-Rave-Checkliste — Rave Safe, have Fun" },
      {
        name: "description",
        content:
          "Kurze Checkliste vor dem Rave: gegessen, Wasser, Buddy, Heimweg, Notfall — alles in 2 Minuten.",
      },
      { property: "og:title", content: "Pre-Rave-Checkliste · RaveSave" },
      {
        property: "og:description",
        content: "Vor dem Rave kurz durchgehen — sicherer und entspannter starten.",
      },
      { property: "og:url", content: "https://ravesave.de/checkliste" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.de/checkliste" }],
  }),
});

type Item = {
  id: string;
  label: string;
  why: string;
  expert?: string;
};

const SECTIONS: { title: string; subtitle: string; items: Item[] }[] = [
  {
    title: "Körper",
    subtitle: "Damit du nicht auf leerem Tank startest.",
    items: [
      {
        id: "food",
        label: "In den letzten 3–4 h gegessen",
        why: "Stimulanzien dämpfen Hunger — Unterzucker auf der Tanzfläche fühlt sich an wie Kreislaufkollaps.",
        expert:
          "Niedriger Glukose-Spiegel verstärkt Sympathikus-Aktivität und kann mit serotonerger Aktivität Übelkeit, Tremor und Synkopen begünstigen.",
      },
      {
        id: "water",
        label: "Wasserflasche dabei (oder im Club kostenlos)",
        why: "Schluckweise trinken — nicht literweise, vor allem auf MDMA.",
        expert:
          "MDMA → SIADH-ähnliche ADH-Sekretion. Richtwert: 250–500 ml/h bei moderater Bewegung, weniger im Stand.",
      },
      {
        id: "rested",
        label: "Halbwegs ausgeschlafen",
        why: "Schlafmangel verstärkt Angst, Paranoia und Comedown deutlich.",
      },
      {
        id: "meds",
        label: "Medikamente / Wechselwirkungen geprüft",
        why: "SSRIs, MAO-Hemmer, Lithium, Tramadol, einige Migräne-Mittel — das gehört vorher gecheckt.",
        expert:
          "Klassische Risikokombis: SSRI/SNRI + MDMA → Serotonin-Syndrom; MAOI + Stimulanzien → hypertensive Krise; Tramadol senkt Krampfschwelle.",
      },
    ],
  },
  {
    title: "Substanz",
    subtitle: "Wenn überhaupt — dann mit Plan.",
    items: [
      {
        id: "test",
        label: "Substanz getestet (Drug-Checking oder Reagenz)",
        why: "Pillen sind häufig nicht das, was draufsteht. Drug-Checking ist anonym.",
      },
      {
        id: "dose",
        label: "Dosis festgelegt — und niedriger als gedacht",
        why: "Start low, go slow. Nachlegen ist immer einfacher als zu reduzieren.",
        expert:
          "Lineare Dosisannahme bei MDMA gilt nur eingeschränkt — CYP2D6-Polymorphismen erzeugen 5–10-fach Plasmaspiegel-Unterschiede.",
      },
      {
        id: "mix",
        label: "Mix-Risiko bewusst (Alkohol zählt)",
        why: "Alkohol + Stimulanzien = mehr Hitze, weniger Wahrnehmung. Keine smarte Kombi.",
      },
      {
        id: "naloxon",
        label: "Bei Opioiden: Naloxon dabei",
        why: "Nasenspray rettet Leben. Kostenlos bei vielen Drogenhilfen.",
        expert:
          "Naloxon (0,4–2 mg intranasal) verdrängt µ-Opioid-Agonisten kompetitiv. HWZ kürzer als Heroin/Methadon — Nachsorge nötig.",
      },
    ],
  },
  {
    title: "Crew & Ort",
    subtitle: "Niemand sollte allein heimgehen.",
    items: [
      {
        id: "buddy",
        label: "Mindestens eine Person, die weiß was du nimmst",
        why: "Im Notfall zählt jede Sekunde. Schweigepflicht gilt für Sanitäter:innen.",
      },
      {
        id: "meet",
        label: "Treffpunkt & Uhrzeit ausgemacht",
        why: "Handy-Akku stirbt zuverlässig um 3 Uhr.",
      },
      {
        id: "exit",
        label: "Heimweg geklärt (Bahn, Taxi, Fahrer:in)",
        why: "Nicht selbst Auto fahren. Punkt.",
      },
      {
        id: "id",
        label: "Ausweis und etwas Bargeld dabei",
        why: "Für Einlass und Notfall — wenn das Handy aus ist.",
      },
    ],
  },
  {
    title: "Notfall",
    subtitle: "Hoffentlich nie — aber dann sofort.",
    items: [
      {
        id: "112",
        label: "Notruf 112 — keine Polizei automatisch",
        why: "Sanitäter:innen haben Schweigepflicht. Lieber einmal zu früh anrufen.",
      },
      {
        id: "signs",
        label: "Notfallzeichen kenne ich",
        why: "Bewusstlosigkeit, Krampf, blaue Lippen, sehr hohe Temperatur, Brustschmerz.",
      },
    ],
  },
];

const STORAGE_KEY = "ravesave.checkliste.v1";

function ChecklistePage() {
  const allIds = useMemo(() => SECTIONS.flatMap((s) => s.items.map((i) => i.id)), []);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      /* ignore */
    }
  }, [checked]);

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const reset = () => setChecked({});

  const doneCount = allIds.filter((id) => checked[id]).length;
  const total = allIds.length;
  const pct = Math.round((doneCount / total) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> zur Startseite
      </Link>

      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-secondary" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Pre-Rave-Checkliste
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-prose">
            Zwei Minuten, einmal durchklicken. Wird lokal in deinem Browser
            gespeichert — verlässt dein Gerät nicht.
          </p>
        </div>
        <DetailLevelSwitch size="sm" />
      </header>

      <div className="rounded-2xl glass p-4 flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0">
          <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="3"
              opacity="0.3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="3"
              strokeDasharray={`${pct} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-xs font-semibold tabular-nums">
            {pct}%
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-semibold tabular-nums">
              {doneCount} / {total}
            </span>{" "}
            erledigt
          </p>
          <p className="text-xs text-muted-foreground">
            Du musst nicht alle haken — aber Notfallzeichen und Buddy lohnen
            sich immer.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          aria-label="Liste zurücksetzen"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.title} className="space-y-2">
          <header>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h2>
            <p className="text-sm text-muted-foreground">{section.subtitle}</p>
          </header>
          <ul className="space-y-2">
            {section.items.map((item) => {
              const isOn = !!checked[item.id];
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-pressed={isOn}
                    className={`w-full text-left rounded-2xl glass p-4 transition border ${
                      isOn
                        ? "border-secondary/50 bg-secondary/5"
                        : "border-border/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${
                          isOn
                            ? "border-secondary bg-secondary text-secondary-foreground"
                            : "border-border"
                        }`}
                        aria-hidden="true"
                      >
                        {isOn && <CheckCircle2 className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <div
                          className={`text-sm font-medium leading-tight ${
                            isOn ? "" : ""
                          }`}
                        >
                          {item.label}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.why}
                        </p>
                        {item.expert && (
                          <DetailGate min="expert">
                            <p className="text-[11px] text-muted-foreground/80 leading-relaxed border-l-2 border-secondary/60 pl-2">
                              <span className="font-semibold text-secondary">
                                Fachebene:
                              </span>{" "}
                              {item.expert}
                            </p>
                          </DetailGate>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="text-xs text-muted-foreground">
        Im Notfall: <strong>112</strong>. Brauchst du jetzt Hilfe? →{" "}
        <Link to="/akut" className="underline text-secondary">
          Akute Hilfe
        </Link>{" "}
        ·{" "}
        <Link to="/notfall" className="underline text-secondary">
          Notfall-Seite
        </Link>
      </p>
    </div>
  );
}
