import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Smartphone, Apple, CheckCircle2, WifiOff, Share, Plus, MoreVertical } from "lucide-react";
import { isOfflineReady, offlineReadyAt, preloadOffline } from "@/lib/offlineCache";

export const Route = createFileRoute("/install")({
  component: InstallPage,
  head: () => ({
    meta: [
      { title: "App installieren — Rave Safe, have Fun" },
      { name: "description", content: "So installierst du Rave Safe auf dein Handy und nutzt sie offline." },
    ],
  }),
});

function InstallPage() {
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("ios");
  const [ready, setReady] = useState(false);
  const [readyAt, setReadyAt] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) setPlatform("ios");
      else if (/android/.test(ua)) setPlatform("android");
      else setPlatform("desktop");
    }
    setReady(isOfflineReady());
    setReadyAt(offlineReadyAt());
  }, []);

  async function handlePreload() {
    setProgress({ done: 0, total: 1 });
    await preloadOffline((done, total) => setProgress({ done, total }));
    setReady(true);
    setReadyAt(new Date().toISOString());
    setProgress(null);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">App installieren</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          In ein paar Sekunden hast du Rave Safe als Icon auf dem Homescreen — und kannst Wiki, Mix-Rechner, Checkliste und Notfall-Infos auch ohne Internet öffnen.
        </p>
      </header>

      <nav className="flex gap-1 overflow-x-auto pb-1">
        {(
          [
            { id: "ios", label: "iPhone", icon: <Apple className="h-3.5 w-3.5" /> },
            { id: "android", label: "Android", icon: <Smartphone className="h-3.5 w-3.5" /> },
            { id: "desktop", label: "Desktop", icon: <Download className="h-3.5 w-3.5" /> },
          ] as const
        ).map((p) => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium ${
              platform === p.id ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
            }`}
          >
            {p.icon}
            {p.label}
          </button>
        ))}
      </nav>

      {platform === "ios" && (
        <Steps
          title="So geht's auf dem iPhone (Safari)"
          steps={[
            { icon: <Share className="h-4 w-4" />, text: "Tippe auf das Teilen-Symbol unten in der Mitte." },
            { icon: <Plus className="h-4 w-4" />, text: "Zum Home-Bildschirm auswaehlen." },
            { icon: <CheckCircle2 className="h-4 w-4" />, text: "Mit Hinzufuegen bestaetigen - fertig." },
          ]}
          note="Funktioniert nur in Safari, nicht in Chrome/Firefox auf iOS."
        />
      )}
      {platform === "android" && (
        <Steps
          title="So geht's auf Android (Chrome)"
          steps={[
            { icon: <MoreVertical className="h-4 w-4" />, text: "Tippe oben rechts auf die drei Punkte." },
            { icon: <Plus className="h-4 w-4" />, text: "App installieren oder Zum Startbildschirm hinzufuegen waehlen." },
            { icon: <CheckCircle2 className="h-4 w-4" />, text: "Bestätigen — die App erscheint wie eine native App." },
          ]}
        />
      )}
      {platform === "desktop" && (
        <Steps
          title="So geht's am Desktop (Chrome/Edge)"
          steps={[
            { icon: <Download className="h-4 w-4" />, text: "Klicke auf das Installations-Symbol rechts in der Adressleiste." },
            { icon: <CheckCircle2 className="h-4 w-4" />, text: "Mit „Installieren" bestätigen." },
          ]}
        />
      )}

      <section className="rounded-2xl glass p-5 space-y-3">
        <div className="flex items-center gap-2">
          <WifiOff className="h-5 w-5 text-secondary" />
          <h2 className="text-lg font-semibold">Offline-Modus vorbereiten</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Lade einmal die wichtigsten Inhalte vor — danach funktionieren <strong>Substanz-Wiki, Mix-Rechner, Checkliste, Risiken und Notfall-Infos</strong> auch ohne Empfang.
        </p>
        {ready && (
          <div className="rounded-xl bg-secondary/10 text-secondary px-3 py-2 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Offline bereit{readyAt && ` · ${new Date(readyAt).toLocaleString("de-DE")}`}
          </div>
        )}
        {progress && (
          <div className="text-xs text-muted-foreground">
            Lade… {progress.done}/{progress.total}
          </div>
        )}
        <button
          onClick={handlePreload}
          disabled={!!progress}
          className="inline-flex items-center gap-2 rounded-full bg-aurora animate-aurora px-4 py-2 text-sm font-semibold text-primary-foreground glow disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {ready ? "Erneut vorladen" : "Jetzt vorladen"}
        </button>
        <p className="text-[11px] text-muted-foreground">
          Hinweis: Echte Offline-Verfügbarkeit hängt vom Browser-Cache ab. Für Notfälle gilt zusätzlich: 112 funktioniert immer, auch ohne Internet.
        </p>
      </section>
    </div>
  );
}

function Steps({
  title,
  steps,
  note,
}: {
  title: string;
  steps: { icon: React.ReactNode; text: string }[];
  note?: string;
}) {
  return (
    <section className="rounded-2xl glass p-5 space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ol className="space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <span className="shrink-0 mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
              {s.icon}
            </span>
            <span>
              <span className="font-mono text-[10px] text-muted-foreground mr-1">{i + 1}.</span>
              {s.text}
            </span>
          </li>
        ))}
      </ol>
      {note && <p className="text-[11px] text-muted-foreground">{note}</p>}
    </section>
  );
}
