import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Lock, Send, CheckCircle2 } from "lucide-react";
import { submitReaderPost } from "@/lib/admin.functions";

export const Route = createFileRoute("/erfahrungen/einsenden")({
  component: SubmitPage,
  head: () => ({
    meta: [
      { title: "Beitrag einsenden — Rave Safe, have Fun" },
      {
        name: "description",
        content:
          "Sende deinen eigenen Erfahrungsbericht anonym an die Redaktion. Nur der Admin sieht deine Einsendung.",
      },
      { property: "og:title", content: "Beitrag einsenden — Rave Safe, have Fun" },
      {
        property: "og:description",
        content: "Teile deine Erfahrung anonym — nur der Admin sieht die Einsendung.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ravesave.de/erfahrungen/einsenden" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.de/erfahrungen/einsenden" }],
  }),
});

function SubmitPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [pseudonym, setPseudonym] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await submitReaderPost({
        data: {
          title: title.trim(),
          body: body.trim(),
          category: category.trim() || null,
          pseudonym: pseudonym.trim() || null,
          contact: contact.trim() || null,
        },
      });
      setDone(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Einsendung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <CheckCircle2 className="h-10 w-10 mx-auto text-secondary" />
        <h1 className="text-2xl font-bold">Danke für deinen Beitrag</h1>
        <p className="text-muted-foreground">
          Deine Einsendung liegt jetzt ausschließlich im Admin-Bereich. Sie wird erst
          öffentlich, wenn der Admin sie freigibt.
        </p>
        <Link
          to="/erfahrungen"
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm min-h-11"
        >
          <ArrowLeft className="h-4 w-4" /> Zur Übersicht
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <Link
        to="/erfahrungen"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Alle Beiträge
      </Link>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Eigenen Beitrag einsenden</h1>
        <p className="text-muted-foreground">
          Deine Erfahrung kann anderen helfen. Schreib so ausführlich, wie du magst.
        </p>
      </header>

      <aside className="rounded-2xl border border-secondary/30 bg-secondary/10 p-4 text-sm space-y-2">
        <div className="flex items-center gap-2 font-semibold text-secondary">
          <Lock className="h-4 w-4" /> Nur für den Admin sichtbar
        </div>
        <ul className="list-disc pl-5 text-foreground/90 space-y-1">
          <li>Deine Einsendung ist nicht öffentlich — nur der Admin kann sie lesen.</li>
          <li>
            Es werden keine datenschutzrechtlich relevanten Daten erhoben: kein Konto, keine
            E-Mail-Pflicht, keine IP-Speicherung, kein Tracking deiner Eingaben.
          </li>
          <li>
            Auch der Entwickler dieser App hat keinen Einblick in personenbezogene Daten —
            es gibt schlicht keine.
          </li>
          <li>Ein Beitrag wird erst öffentlich, wenn der Admin ihn freigibt.</li>
        </ul>
      </aside>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="sub-title" className="text-xs text-muted-foreground">
            Titel *
          </label>
          <input
            id="sub-title"
            required
            maxLength={300}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl glass px-3 py-3 text-sm min-h-11"
            placeholder="z. B. Mein erster Comedown — was geholfen hat"
          />
        </div>

        <div>
          <label htmlFor="sub-cat" className="text-xs text-muted-foreground">
            Kategorie (optional)
          </label>
          <input
            id="sub-cat"
            maxLength={80}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-xl glass px-3 py-3 text-sm min-h-11"
            placeholder="z. B. Aftercare, Festival, Mischkonsum"
          />
        </div>

        <div>
          <label htmlFor="sub-body" className="text-xs text-muted-foreground">
            Dein Bericht * (mind. 50 Zeichen)
          </label>
          <textarea
            id="sub-body"
            required
            minLength={50}
            maxLength={20000}
            rows={14}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 w-full rounded-xl glass px-3 py-3 text-sm leading-relaxed"
            placeholder="Erzähl, was passiert ist, was geholfen hat und was du heute anders machen würdest…"
          />
          <div className="mt-1 text-right text-[11px] text-muted-foreground">
            {body.length} / 20.000
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sub-pseudo" className="text-xs text-muted-foreground">
              Pseudonym (optional)
            </label>
            <input
              id="sub-pseudo"
              maxLength={80}
              value={pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
              className="mt-1 w-full rounded-xl glass px-3 py-3 text-sm min-h-11"
              placeholder="wie du genannt werden willst"
            />
          </div>
          <div>
            <label htmlFor="sub-contact" className="text-xs text-muted-foreground">
              Kontakt für Rückfragen (optional)
            </label>
            <input
              id="sub-contact"
              maxLength={200}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="mt-1 w-full rounded-xl glass px-3 py-3 text-sm min-h-11"
              placeholder="freiwillig — kann leer bleiben"
            />
          </div>
        </div>

        {err && (
          <div className="rounded-xl border border-destructive/35 bg-destructive/10 p-3 text-sm text-destructive">
            {err}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium min-h-11 disabled:opacity-60"
        >
          <Send className="h-4 w-4" /> {busy ? "Wird gesendet…" : "An den Admin senden"}
        </button>
      </form>
    </div>
  );
}
