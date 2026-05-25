import { useEffect, useState } from "react";
import {
  Github,
  Download,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Code2,
  BookOpen,
} from "lucide-react";
import { adminGetStats } from "@/lib/adminContent.functions";

const PROJECT_ID = "91fcc3dc-3809-4b8b-b992-beef8f90afa1";
const LOVABLE_PROJECT_URL = `https://lovable.dev/projects/${PROJECT_ID}`;
const SUGGESTED_REPO_NAMES = [
  "ravesafe-life",
  "ravesafe-app",
  "ravesafe-web",
  "ravesafe-fun",
];

export function AdminDevTab() {
  const [installs, setInstalls] = useState<{
    installed: number;
    promptShown: number;
    standaloneOpens: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await adminGetStats({ data: { days: 90 } });
        const find = (k: string) =>
          res.topEvents?.find((e) => e.key === k)?.count ?? 0;
        setInstalls({
          installed: find("pwa_installed"),
          promptShown: find("pwa_install_prompt_shown"),
          standaloneOpens: find("pwa_standalone_open"),
        });
      } catch {
        setInstalls({ installed: 0, promptShown: 0, standaloneOpens: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function copy(text: string, key: string) {
    void navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-5">
      {/* Quick-Access: Aktuellster Code für GitHub */}
      <section className="rounded-2xl glass p-5 space-y-3 border border-primary/30">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Aktuellsten Quellcode holen</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Immer die neueste Version — vollständiger TypeScript-Quellcode,
          direkt für GitHub nutzbar. Zwei Ein-Klick-Wege:
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href={LOVABLE_PROJECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-1 rounded-xl bg-aurora animate-aurora p-4 text-primary-foreground glow"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Download className="h-4 w-4" />
              Code als ZIP herunterladen
            </span>
            <span className="text-[11px] opacity-90">
              Öffnet Lovable → Code-Ansicht → „Download codebase". Enthält den
              kompletten Quellcode, fertig zum Hochladen auf GitHub.
            </span>
          </a>
          <a
            href={LOVABLE_PROJECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-1 rounded-xl glass p-4 border border-foreground/10"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Github className="h-4 w-4" />
              GitHub-Repo verbinden / öffnen
            </span>
            <span className="text-[11px] text-muted-foreground">
              Einmal verbinden (+ Menü → GitHub) — danach pusht jede Änderung
              automatisch live in dein Repository.
            </span>
          </a>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Hinweis: Aus Sicherheitsgründen kann die laufende Web-App den
          Quellcode nicht selbst ausliefern — sie kennt nur ihren kompilierten
          Build. Beide Buttons führen direkt zum echten, immer aktuellen Code.
        </p>
      </section>

      {/* PWA-Installationen */}
      <section className="rounded-2xl glass p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-secondary" />
          <h2 className="text-lg font-semibold">App-Installationen (Home-Bildschirm)</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Zählt, wie oft die App tatsächlich als PWA installiert oder im
          Standalone-Modus geöffnet wurde (letzte 90 Tage).
        </p>
        {loading ? (
          <p className="text-sm text-muted-foreground">Lade…</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Installiert" value={installs?.installed ?? 0} highlight />
            <Stat label="Prompt gezeigt" value={installs?.promptShown ?? 0} />
            <Stat label="App-Starts" value={installs?.standaloneOpens ?? 0} />
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">
          Hinweis: iOS Safari liefert kein „appinstalled"-Event. Dort wird
          jeder erste Start im Home-Bildschirm-Modus als „App-Start" gezählt.
        </p>
      </section>

      {/* GitHub Integration */}
      <section className="rounded-2xl glass p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Code auf GitHub übertragen</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          So bekommst du deinen Code in ein eigenes GitHub-Repository — komplett
          automatisch, ohne Programmier-Kenntnisse:
        </p>
        <ol className="space-y-2 text-sm list-decimal list-inside text-foreground/90">
          <li>
            Öffne im Lovable-Editor unten links das <strong>+ Menü</strong> →{" "}
            <strong>GitHub</strong> → <strong>Connect project</strong>.
          </li>
          <li>Autorisiere die Lovable GitHub-App und wähle dein GitHub-Konto.</li>
          <li>
            Klicke <strong>„Create Repository"</strong> — Lovable legt das Repo
            an und überträgt den gesamten Code.
          </li>
          <li>
            Ab jetzt sind beide Seiten verbunden: Änderungen hier werden
            automatisch zu GitHub gepusht — und umgekehrt.
          </li>
        </ol>
        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href={LOVABLE_PROJECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-aurora animate-aurora px-4 py-2 text-xs font-semibold text-primary-foreground glow"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Projekt im Lovable-Editor öffnen
          </a>
          <a
            href="https://docs.lovable.dev/integrations/github"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs"
          >
            <BookOpen className="h-3.5 w-3.5" />
            GitHub-Anleitung (offiziell)
          </a>
        </div>
      </section>

      {/* Code Download */}
      <section className="rounded-2xl glass p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Code als ZIP herunterladen</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Du willst den Code nur einmalig sichern oder lokal weiterarbeiten?
        </p>
        <ol className="space-y-2 text-sm list-decimal list-inside text-foreground/90">
          <li>Öffne das Projekt im <strong>Lovable-Editor</strong> (Button oben).</li>
          <li>Wechsle oben links zur <strong>Code-Ansicht</strong> („&lt;/&gt;"-Symbol).</li>
          <li>
            Klicke unten in der Datei-Seitenleiste auf{" "}
            <strong>„Download codebase"</strong> — fertig.
          </li>
        </ol>
      </section>

      {/* Code im Browser bearbeiten */}
      <section className="rounded-2xl glass p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-secondary" />
          <h2 className="text-lg font-semibold">Code direkt im Browser bearbeiten</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Sobald dein Repo bei GitHub liegt, kannst du jede Datei direkt online
          editieren — kein Editor-Setup nötig. Drücke einfach <kbd className="px-1.5 py-0.5 rounded bg-muted text-[11px]">.</kbd>{" "}
          (Punkt-Taste) auf der GitHub-Seite deines Repos und du landest in
          einem vollwertigen VS-Code im Browser. Änderungen committen → Lovable
          übernimmt sie automatisch.
        </p>
      </section>

      {/* Projekt-Infos */}
      <section className="rounded-2xl glass p-5 space-y-3">
        <h2 className="text-lg font-semibold">Projekt-Daten</h2>
        <p className="text-xs text-muted-foreground">
          Wichtige IDs für Support, externe Tools oder Webhooks.
        </p>
        <ul className="space-y-1.5 text-xs">
          <CopyRow
            label="Projekt-ID"
            value={PROJECT_ID}
            copied={copied === "pid"}
            onCopy={() => copy(PROJECT_ID, "pid")}
          />
          <CopyRow
            label="Live-URL"
            value="https://ravesave.fun"
            copied={copied === "live"}
            onCopy={() => copy("https://ravesave.fun", "live")}
          />
          <CopyRow
            label="Feedback-Mail"
            value="Ravesafe.life@gmail.com"
            copied={copied === "mail"}
            onCopy={() => copy("Ravesafe.life@gmail.com", "mail")}
          />
        </ul>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 ${
        highlight ? "bg-secondary/15 border border-secondary/30" : "bg-muted/30"
      }`}
    >
      <div
        className={`text-2xl font-bold tabular-nums ${
          highlight ? "text-secondary" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
}

function CopyRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-lg bg-muted/20 px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="font-mono truncate">{value}</div>
      </div>
      <button
        onClick={onCopy}
        className="shrink-0 rounded-full p-2 hover:bg-muted/40"
        aria-label="Kopieren"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-secondary" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </li>
  );
}
