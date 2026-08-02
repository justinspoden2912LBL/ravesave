import { useEffect, useState } from "react";
import { Wand2, Send, Check, Undo2, RefreshCw, Eye, Save, RotateCcw } from "lucide-react";
import {
  copilotPlan,
  copilotApply,
  copilotHistory,
  copilotRevert,
  copilotGetTheme,
  copilotSaveTheme,
} from "@/lib/adminCopilot.functions";
import { THEME_TOKENS, setThemePreview, refreshTheme, type ThemeMap } from "@/lib/theme";

type Proposal = {
  tool: string;
  target: string;
  old_value: string | null;
  new_value: string;
  summary: string;
};

type LogRow = {
  id: string;
  tool: string;
  target: string;
  old_value: string | null;
  new_value: string | null;
  summary: string | null;
  reverted: boolean;
  created_at: string;
};

const EXAMPLES = [
  "Mach die Akzentfarbe wärmer, mehr orange",
  "Blende die Seite Toleranz aus",
  "Ändere die Startseiten-Überschrift zu „Sicher feiern beginnt hier“",
  "Schreib Marleens Regeln: keine Dosierungsempfehlungen für Minderjährige",
];

function short(v: string | null | undefined, n = 90) {
  if (!v) return "—";
  return v.length > n ? `${v.slice(0, n)}…` : v;
}

export function AdminCopilotTab() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<LogRow[]>([]);
  const [theme, setTheme] = useState<ThemeMap>({});
  const [sessionOk, setSessionOk] = useState(true);

  async function loadAll() {
    const [t, h] = await Promise.all([copilotGetTheme(), copilotHistory()]);
    if (t === null || h === null) {
      setSessionOk(false);
      return;
    }
    setSessionOk(true);
    const map: ThemeMap = {};
    for (const row of t) map[row.key] = row.value ?? "";
    setTheme(map);
    setHistory(h);
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function run(p?: string) {
    const text = (p ?? prompt).trim();
    if (!text) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    setProposals([]);
    try {
      const res = await copilotPlan({ data: { prompt: text } });
      setReply(res.reply);
      setProposals(res.proposals);
      if (res.proposals.length === 0) setMsg("Keine konkrete Änderung erkannt — formuliere es etwas genauer.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    setBusy(true);
    setErr(null);
    try {
      const res = await copilotApply({ data: { proposals } });
      const failed = res.results.filter((r) => !r.ok);
      setMsg(
        failed.length
          ? `${res.results.length - failed.length} übernommen, ${failed.length} fehlgeschlagen.`
          : "Alle Änderungen sind live.",
      );
      setProposals([]);
      await refreshTheme();
      await loadAll();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy(false);
    }
  }

  async function undo(id: string) {
    setBusy(true);
    try {
      await copilotRevert({ data: { id } });
      await refreshTheme();
      await loadAll();
      setMsg("Änderung zurückgesetzt.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy(false);
    }
  }

  async function saveTheme() {
    setBusy(true);
    setErr(null);
    try {
      await copilotSaveTheme({ data: { values: theme } });
      setThemePreview(null);
      await refreshTheme();
      setMsg("Design veröffentlicht.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy(false);
    }
  }

  if (!sessionOk) {
    return <p className="text-sm text-muted-foreground">Admin-Sitzung abgelaufen — bitte neu anmelden.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4 space-y-1">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Wand2 className="h-4 w-4" /> Copilot — Änderungen per Prompt
        </h2>
        <p className="text-xs text-muted-foreground">
          Beschreibe in einfachen Worten, was sich ändern soll. Du siehst erst einen Vorschlag (Vorher → Nachher)
          und bestätigst selbst. Läuft über das kostenfreie KI-Modell aus dem KI-Tab.
        </p>
      </div>

      {/* Prompt */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void run();
            }}
            placeholder="z. B. Primärfarbe wärmer machen"
            className="min-h-11 flex-1 rounded-xl bg-background/60 px-3 text-sm outline-none ring-1 ring-border focus:ring-primary"
          />
          <button
            onClick={() => void run()}
            disabled={busy || !prompt.trim()}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> Vorschlagen
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((e) => (
            <button
              key={e}
              onClick={() => {
                setPrompt(e);
                void run(e);
              }}
              className="rounded-full glass px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              {e}
            </button>
          ))}
        </div>
        {busy && <p className="text-xs text-muted-foreground">Arbeite…</p>}
        {err && <p className="text-xs text-destructive">{err}</p>}
        {msg && <p className="text-xs text-primary">{msg}</p>}
        {reply && <p className="text-sm">{reply}</p>}
      </div>

      {/* Vorschläge */}
      {proposals.length > 0 && (
        <div className="glass rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold">Vorschläge ({proposals.length})</h3>
          <ul className="space-y-2">
            {proposals.map((p, i) => (
              <li key={`${p.target}-${i}`} className="rounded-xl bg-background/50 p-3 text-xs">
                <p className="font-medium">{p.target}</p>
                <p className="mt-1 text-muted-foreground">Vorher: {short(p.old_value)}</p>
                <p className="text-foreground">Nachher: {short(p.new_value)}</p>
                <button
                  onClick={() => setProposals((prev) => prev.filter((_, j) => j !== i))}
                  className="mt-2 text-[11px] text-muted-foreground underline"
                >
                  Entfernen
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => void apply()}
            disabled={busy}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            <Check className="h-4 w-4" /> Übernehmen
          </button>
        </div>
      )}

      {/* Manuelle Design-Regler */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-semibold">Design manuell</h3>
        <p className="text-xs text-muted-foreground">
          Leer lassen = Standardwert. Farben als Hex (#ff8a3d) oder oklch(...).
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {THEME_TOKENS.map((t) => (
            <label key={t.key} className="text-xs">
              <span className="text-muted-foreground">{t.label}</span>
              <div className="mt-1 flex gap-2">
                <input
                  value={theme[t.key] ?? ""}
                  onChange={(e) => setTheme((prev) => ({ ...prev, [t.key]: e.target.value }))}
                  placeholder="Standard"
                  className="min-h-11 flex-1 rounded-xl bg-background/60 px-3 text-sm outline-none ring-1 ring-border focus:ring-primary"
                />
                {t.category === "color" && (
                  <input
                    type="color"
                    aria-label={`${t.label} wählen`}
                    onChange={(e) => setTheme((prev) => ({ ...prev, [t.key]: e.target.value }))}
                    className="h-11 w-11 rounded-xl bg-transparent"
                  />
                )}
              </div>
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setThemePreview(theme)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl glass px-4 text-sm"
          >
            <Eye className="h-4 w-4" /> Vorschau (nur hier)
          </button>
          <button
            onClick={() => void saveTheme()}
            disabled={busy}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Veröffentlichen
          </button>
          <button
            onClick={() => {
              const empty: ThemeMap = {};
              for (const t of THEME_TOKENS) empty[t.key] = "";
              setTheme(empty);
              setThemePreview(empty);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl glass px-4 text-sm"
          >
            <RotateCcw className="h-4 w-4" /> Auf Standard
          </button>
        </div>
      </div>

      {/* Verlauf */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Verlauf</h3>
          <button onClick={() => void loadAll()} className="text-xs text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground">Noch keine Änderungen.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="rounded-xl bg-background/50 p-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{h.target}</p>
                    <p className="text-muted-foreground">
                      {short(h.old_value, 40)} → {short(h.new_value, 40)}
                    </p>
                    <time className="text-[11px] text-muted-foreground">
                      {new Date(h.created_at).toLocaleString("de-DE")}
                    </time>
                  </div>
                  {h.reverted ? (
                    <span className="text-[11px] text-muted-foreground">zurückgesetzt</span>
                  ) : (
                    <button
                      onClick={() => void undo(h.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1 rounded-full glass px-3 py-1 text-[11px] disabled:opacity-50"
                    >
                      <Undo2 className="h-3 w-3" /> Rückgängig
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
