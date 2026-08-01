import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Heart, Mail, Pencil, Save, ShieldAlert, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      { property: "og:url", content: "https://ravesave.fun/about" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.fun/about" }],
  }),
});

const FALLBACK_INTRO = `Ich habe selbst Erfahrungen mit über **84 psychoaktiven Substanzen** gemacht — über praktisch jeden denkbaren Applikationsweg. Diese Reise hat mir eines sehr deutlich gezeigt: Konsum kann Genuss, Verbindung und tiefe Selbsterkenntnis bedeuten — und im selben Atemzug ernsthaft gefährlich werden.

Genau deshalb gibt es dieses Tool. Es soll dir helfen, in wenigen Sekunden einzuschätzen, was du gerade vorhast: Welche Wechselwirkungen sind kritisch, welche Dosis ist realistisch, worauf solltest du achten. Ziel ist nicht, dir irgendwas auszureden — sondern dass du eine gute, bewusste Erfahrung machst und das Risiko dabei so klein wie möglich hältst.`;

function renderMarkdownish(text: string) {
  return text.split(/\n{2,}/).map((para, i) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
      seg.startsWith("**") && seg.endsWith("**") ? (
        <strong key={j}>{seg.slice(2, -2)}</strong>
      ) : (
        <span key={j}>{seg}</span>
      )
    );
    return <p key={i}>{parts}</p>;
  });
}

function AboutPage() {
  const [intro, setIntro] = useState<string>(FALLBACK_INTRO);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("key", "about_intro")
        .maybeSingle();
      if (!cancelled && data?.content) setIntro(data.content);

      const { data: userData } = await supabase.auth.getUser();
      if (cancelled || !userData.user) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id);
      if (!cancelled && roles?.some((r) => r.role === "admin")) setIsAdmin(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const startEdit = () => {
    setDraft(intro);
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("site_content")
      .upsert({ key: "about_intro", content: draft, updated_by: userData.user?.id ?? null });
    setSaving(false);
    if (error) {
      alert("Speichern fehlgeschlagen: " + error.message);
      return;
    }
    setIntro(draft);
    setEditing(false);
    setSavedAt(Date.now());
  };

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

      <section className="rounded-3xl glass p-6 space-y-4 text-[15px] leading-relaxed relative">
        {isAdmin && !editing && (
          <button
            onClick={startEdit}
            className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-3 py-1 text-xs hover:bg-primary/25 transition"
            title="Info-Text bearbeiten (Admin)"
          >
            <Pencil className="h-3 w-3" /> Bearbeiten
          </button>
        )}

        {editing ? (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Markdown-light: **fett**, Absätze durch Leerzeile.
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={14}
              className="w-full rounded-lg bg-input p-3 text-sm font-mono leading-relaxed"
            />
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> {saving ? "Speichern…" : "Speichern"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-4 py-2 text-sm"
              >
                <X className="h-4 w-4" /> Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <>
            {renderMarkdownish(intro)}
            {savedAt && (
              <div className="text-[11px] text-secondary">Gespeichert ✓</div>
            )}
          </>
        )}

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

      <section className="rounded-2xl glass p-5 flex items-center justify-between gap-4 flex-wrap border border-secondary/30">
        <div>
          <h2 className="text-base font-semibold">Meine Erfahrungen</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Persönliche Berichte, Reflexionen und Safer-Use-Notizen.
          </p>
        </div>
        <Link
          to="/erfahrungen"
          className="inline-flex items-center gap-2 rounded-full bg-secondary/20 text-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/30 transition"
        >
          <BookOpen className="h-4 w-4" /> Beiträge lesen
        </Link>
      </section>

      <section className="rounded-2xl glass p-5 space-y-3">
        <h2 className="flex items-center gap-2 font-semibold text-base">
          <BookOpen className="h-4 w-4 text-secondary" /> Quellen &amp; Vertrauen
        </h2>
        <p className="text-sm text-muted-foreground">
          Dosis-Bereiche, Wechselwirkungen und Wirkdauern werden mit folgenden öffentlichen,
          fachlich anerkannten Quellen abgeglichen:
        </p>
        <ul className="grid sm:grid-cols-3 gap-2 text-sm">
          <li>
            <a
              href="https://tripsit.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg bg-background/40 border border-border/60 px-3 py-2 hover:border-secondary/60 hover:text-foreground transition"
            >
              <div className="font-medium">TripSit</div>
              <div className="text-xs text-muted-foreground">Wechselwirkungs-Matrix &amp; Factsheets</div>
            </a>
          </li>
          <li>
            <a
              href="https://www.emcdda.europa.eu/"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg bg-background/40 border border-border/60 px-3 py-2 hover:border-secondary/60 hover:text-foreground transition"
            >
              <div className="font-medium">EMCDDA / EUDA</div>
              <div className="text-xs text-muted-foreground">Europäische Drogen­beobachtungs­stelle</div>
            </a>
          </li>
          <li>
            <a
              href="https://psychonautwiki.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg bg-background/40 border border-border/60 px-3 py-2 hover:border-secondary/60 hover:text-foreground transition"
            >
              <div className="font-medium">PsychonautWiki</div>
              <div className="text-xs text-muted-foreground">Pharmakologie &amp; subjektive Effekte</div>
            </a>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl glass p-5 space-y-2">
        <h2 className="flex items-center gap-2 font-semibold text-base">
          <Mail className="h-4 w-4 text-secondary" /> Feedback &amp; Anregungen
        </h2>
        <p className="text-sm text-muted-foreground">
          Bug gefunden, Verbesserungsvorschlag oder einfach Feedback? Immer her damit:
        </p>
        <a
          href="mailto:Ravesafe.live@gmail.com?subject=Rave%20Safe%20Feedback"
          className="inline-flex items-center gap-2 rounded-full bg-primary/15 text-primary px-4 py-2 text-sm font-medium hover:bg-primary/25 transition"
        >
          <Mail className="h-4 w-4" /> Ravesafe.live@gmail.com
        </a>
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
