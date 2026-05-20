import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Edit3, Sparkles, GraduationCap } from "lucide-react";
import {
  clearProfile,
  loadProfile,
  saveProfile,
  summarizeProfile,
  getDetailLevel,
  PROFESSION_LABEL,
  EXPERTISE_LABEL,
  type UserProfile,
  type ExpertiseLevel,
  type Profession,
} from "@/lib/profile";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Einstellungen — Rave Safe, have Fun" },
      { name: "description", content: "Profil, Erfahrung und Notfallpass verwalten — alles lokal in deinem Browser." },
      { property: "og:title", content: "Einstellungen — Rave Safe, have Fun" },
      { property: "og:description", content: "Profil und Notfallpass lokal verwalten." },
      { property: "og:url", content: "https://ravesave.lovable.app/settings" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.lovable.app/settings" }],
  }),
});

function SettingsPage() {
  const [p, setP] = useState<UserProfile | null>(null);
  useEffect(() => setP(loadProfile()), []);

  function reset() {
    if (!confirm("Profil wirklich löschen? Diese Aktion ist nicht rückgängig zu machen.")) return;
    clearProfile();
    setP(null);
  }

  function toggleShare(v: boolean) {
    if (!p) return;
    const next = { ...p, shareWithAI: v };
    saveProfile(next);
    setP(next);
  }

  function updateField<K extends keyof UserProfile>(k: K, v: UserProfile[K]) {
    if (!p) return;
    const next = { ...p, [k]: v };
    saveProfile(next);
    setP(next);
  }

  const detail = p ? getDetailLevel(p) : "lay";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>

      <section className="rounded-3xl glass p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Dein Profil</h2>
          <Link to="/onboarding" className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs">
            <Edit3 className="h-3.5 w-3.5" /> Bearbeiten
          </Link>
        </div>

        {!p ? (
          <div className="rounded-xl bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            Noch kein Profil angelegt.{" "}
            <Link to="/onboarding" className="text-foreground underline">Jetzt einrichten</Link>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-muted/10 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <GraduationCap className="h-4 w-4 text-secondary" /> Detailtiefe & Fachsprache
              </div>
              <p className="text-xs text-muted-foreground">
                Bestimmt, wie ausführlich Mischkonsum-Risiken erklärt werden — und auf welchem Niveau die KI antwortet.
                Aktuell: <strong className="text-foreground">{detail}</strong>.
              </p>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Selbsteinschätzung</div>
                <div className="grid gap-1.5">
                  {(Object.keys(EXPERTISE_LABEL) as ExpertiseLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => updateField("expertiseLevel", lvl)}
                      className={`text-left rounded-lg px-3 py-2 text-xs ring-1 transition ${
                        p.expertiseLevel === lvl ? "ring-primary bg-primary/10" : "ring-border hover:ring-foreground/30"
                      }`}
                    >
                      {EXPERTISE_LABEL[lvl]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Beruflicher Hintergrund</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(PROFESSION_LABEL) as Profession[]).map((pr) => (
                    <button
                      key={pr}
                      onClick={() => updateField("profession", pr)}
                      className={`text-left rounded-lg px-3 py-2 text-xs ring-1 transition ${
                        p.profession === pr ? "ring-primary bg-primary/10" : "ring-border hover:ring-foreground/30"
                      }`}
                    >
                      {PROFESSION_LABEL[pr]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-xl bg-muted/10 p-4 text-sm">
              <input
                type="checkbox"
                checked={p.shareWithAI}
                onChange={(e) => toggleShare(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span>
                <strong>Mit KI-Chat teilen</strong>
                <span className="block text-muted-foreground mt-1">
                  KI bekommt dein Profil als Kontext für relevantere Antworten.
                </span>
              </span>
            </label>

            <details className="rounded-xl bg-muted/10 p-4">
              <summary className="cursor-pointer text-sm font-medium inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-secondary" /> Was die KI sieht
              </summary>
              <pre className="mt-3 whitespace-pre-wrap text-xs text-muted-foreground">
                {summarizeProfile(p) || "(Profil-Sharing ist deaktiviert)"}
              </pre>
            </details>

            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full bg-destructive/20 px-4 py-2 text-sm text-destructive hover:bg-destructive/30"
            >
              <Trash2 className="h-4 w-4" /> Profil löschen
            </button>
          </>
        )}
      </section>
    </div>
  );
}
