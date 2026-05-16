import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Siren, Phone, HeartPulse, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

const SCENARIOS: { label: string; to: string; hint: string }[] = [
  { label: "Opioid-Überdosis (Atemstillstand)", to: "/substances", hint: "Naloxon, Atemspende" },
  { label: "Serotonin-Syndrom", to: "/risks", hint: "MDMA + SSRI/MAOI" },
  { label: "GHB + Alkohol (Bewusstlosigkeit)", to: "/mix", hint: "Atemdepression" },
  { label: "Bad Trip (Psychedelika)", to: "/substances", hint: "Set & Setting, Talkdown" },
  { label: "Stimulanzien-Überhitzung", to: "/risks", hint: "Hyperthermie, Wasser, Pause" },
  { label: "Benzo/Alkohol-Mix", to: "/mix", hint: "Atemdepression" },
];

const POISON: { region: string; number: string }[] = [
  { region: "Berlin", number: "030 19240" },
  { region: "München", number: "089 19240" },
  { region: "Bonn", number: "0228 19240" },
  { region: "Wien (AT)", number: "+43 1 406 43 43" },
  { region: "Zürich (CH)", number: "145" },
];

export function EmergencyButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Notfall-Hilfe öffnen"
          className="fixed bottom-4 right-4 z-50 print:hidden inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground shadow-lg ring-2 ring-destructive/40 hover:brightness-110 transition motion-safe:animate-pulse motion-reduce:animate-none"
        >
          <Siren className="h-5 w-5" />
          <span>Notfall</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Siren className="h-5 w-5" /> Notfall-Hilfe
          </DialogTitle>
          <DialogDescription>
            Ruhig bleiben. Atmen. Person nicht allein lassen.
          </DialogDescription>
        </DialogHeader>

        {/* a) 112 */}
        <section className="space-y-2">
          <a
            href="tel:112"
            className="flex items-center justify-center gap-2 rounded-2xl bg-destructive px-4 py-4 text-lg font-bold text-destructive-foreground shadow-md hover:brightness-110"
          >
            <Phone className="h-6 w-6" /> 112 anrufen
          </a>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sag <strong>ehrlich</strong>, was konsumiert wurde — Menge, Zeitpunkt, Mischkonsum.
            Der Rettungsdienst hat kein Interesse an Strafverfolgung. Polizei kommt bei
            medizinischem Notruf in der Regel nicht mit.
          </p>
        </section>

        {/* b) Stabile Seitenlage */}
        <section className="rounded-2xl bg-muted/20 p-4 space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <HeartPulse className="h-4 w-4 text-destructive" /> Stabile Seitenlage — 4 Schritte
          </h3>
          <ol className="space-y-1.5 text-sm leading-relaxed list-decimal pl-5">
            <li>Naheliegenden Arm im 90°-Winkel <strong>nach oben</strong> anwinkeln.</li>
            <li>Anderen Arm über die Brust, <strong>Handrücken an die Wange</strong> der Person.</li>
            <li>Fernes Bein anwinkeln, am Knie zu dir <strong>zur Seite ziehen</strong>.</li>
            <li>Kopf <strong>leicht überstrecken</strong>, Mund öffnen — Atemweg frei.</li>
          </ol>
          <p className="text-xs text-muted-foreground">
            Atmung kontrollieren. Keine Atmung → <strong>Herzdruckmassage 100–120/min</strong>,
            5–6 cm tief, Mitte des Brustkorbs. Nicht aufhören, bis Hilfe da ist.
          </p>
        </section>

        {/* c) Szenarien */}
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Szenario nachschlagen</h3>
          <div className="grid gap-1.5">
            {SCENARIOS.map((s) => (
              <Link
                key={s.label}
                to={s.to}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-2 rounded-lg bg-muted/20 px-3 py-2 text-sm hover:bg-muted/40 transition"
              >
                <span>
                  <span className="font-medium">{s.label}</span>
                  <span className="block text-xs text-muted-foreground">{s.hint}</span>
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>

        {/* d) Hotlines */}
        <section className="rounded-2xl bg-muted/10 p-4 space-y-2 text-xs">
          <h3 className="text-sm font-semibold text-foreground">Hotlines & Giftnotruf</h3>
          <ul className="space-y-1">
            <li>Sucht- & Drogen-Hotline DE: <a className="font-medium underline" href="tel:01806313031">01806 313031</a></li>
            <li>Telefonseelsorge DE: <a className="font-medium underline" href="tel:08001110111">0800 111 0 111</a></li>
            <li>Drogennotruf AT: <a className="font-medium underline" href="tel:+4314069595">01 406 95 95</a></li>
          </ul>
          <details>
            <summary className="cursor-pointer text-muted-foreground">Giftnotruf (DACH)</summary>
            <ul className="mt-1 space-y-0.5">
              {POISON.map((p) => (
                <li key={p.region}>
                  {p.region}: <a className="underline" href={`tel:${p.number.replace(/\s/g, "")}`}>{p.number}</a>
                </li>
              ))}
            </ul>
          </details>
        </section>
      </DialogContent>
    </Dialog>
  );
}
