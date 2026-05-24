import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Trash2, Edit3, Sparkles, GraduationCap, Download, Upload, Volume2, BookOpen, History as HistoryIcon } from "lucide-react";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sound";
import { clearAllSessions, listSessions } from "@/lib/chatHistory";
import { downloadBackup, readBackupFile, applyBackup } from "@/lib/backup";
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
  const [sounds, setSounds] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  useEffect(() => {
    setP(loadProfile());
    setSounds(isSoundEnabled());
    setHistoryCount(listSessions().length);
  }, []);

  function toggleSounds(v: boolean) {
    setSoundEnabled(v);
    setSounds(v);
  }
  function clearHistory() {
    if (!confirm("Alle Marleen-Verläufe löschen? Das lässt sich nicht rückgängig machen.")) return;
    clearAllSessions();
    setHistoryCount(0);
  }
  function replayOnboarding() {
    try {
      window.localStorage.removeItem("ravesave_welcome_seen");
    } catch {
      /* ignore */
    }
    location.reload();
  }


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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function exportLog() {
    downloadBackup();
  }

  async function handleImportFile(file: File) {
    try {
      const bundle = await readBackupFile(file);
      const mode = confirm(
        "Backup importieren:\n\nOK = Mit aktuellen Daten zusammenführen\nAbbrechen = Vorhandene App-Daten ersetzen",
      )
        ? "merge"
        : "replace";
      const { imported } = applyBackup(bundle, mode);
      alert(`${imported} Einträge importiert. App wird neu geladen.`);
      location.reload();
    } catch (err) {
      alert("Import fehlgeschlagen: " + (err instanceof Error ? err.message : String(err)));
    }
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

            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportLog}
                className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-2 text-sm text-secondary hover:bg-secondary/30"
              >
                <Download className="h-4 w-4" /> Backup exportieren
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full bg-muted/30 px-4 py-2 text-sm hover:bg-muted/50"
              >
                <Upload className="h-4 w-4" /> Backup importieren
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImportFile(f);
                  e.target.value = "";
                }}
              />
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full bg-destructive/20 px-4 py-2 text-sm text-destructive hover:bg-destructive/30"
              >
                <Trash2 className="h-4 w-4" /> Profil löschen
              </button>
            </div>
          </>
        )}
      </section>

      {!p && (
        <section className="rounded-3xl glass p-6">
          <button
            onClick={exportLog}
            className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-2 text-sm text-secondary hover:bg-secondary/30"
          >
            <Download className="h-4 w-4" /> Konsum-Protokoll exportieren (JSON)
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            Lädt alle lokal gespeicherten Log-Einträge als Backup-Datei herunter.
          </p>
        </section>
      )}

      <section className="rounded-3xl glass p-6 space-y-4">
        <h2 className="text-lg font-semibold inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-secondary" /> Marleen & Voice
        </h2>

        <label className="flex items-start gap-3 rounded-xl bg-muted/10 p-4 text-sm">
          <input
            type="checkbox"
            checked={sounds}
            onChange={(e) => toggleSounds(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-secondary"
          />
          <span>
            <strong className="inline-flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-secondary" /> Soundeffekte
            </strong>
            <span className="block text-muted-foreground mt-1">
              Sehr leise Töne bei Aufnahme-Start/-Ende und nach Marleens Sprachantwort. System-Lautstärke wird respektiert.
            </span>
          </span>
        </label>

        <div className="rounded-xl bg-muted/10 p-4 space-y-2 text-sm">
          <div className="font-medium inline-flex items-center gap-1.5">
            <HistoryIcon className="h-4 w-4 text-secondary" /> Chat-Verlauf
          </div>
          <p className="text-xs text-muted-foreground">
            Verläufe mit Marleen werden lokal in deinem Browser gespeichert ({historyCount} gespeichert). Sie verlassen dein Gerät nicht.
          </p>
          <button
            onClick={clearHistory}
            className="inline-flex items-center gap-2 rounded-full bg-destructive/20 px-4 py-2 text-sm text-destructive hover:bg-destructive/30"
          >
            <Trash2 className="h-4 w-4" /> Alle Verläufe löschen
          </button>
        </div>

        <div className="rounded-xl bg-muted/10 p-4 space-y-2 text-sm">
          <div className="font-medium inline-flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-secondary" /> Onboarding
          </div>
          <p className="text-xs text-muted-foreground">
            Die kurze Einführung zu Marleen und dem Notfall-Hinweis erneut anzeigen.
          </p>
          <button
            onClick={replayOnboarding}
            className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-2 text-sm text-secondary hover:bg-secondary/30"
          >
            <BookOpen className="h-4 w-4" /> Onboarding erneut anzeigen
          </button>
        </div>
      </section>
    </div>
  );
}
