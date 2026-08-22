import { useEffect, useMemo, useState } from "react";
import {
  designStudioList,
  designStudioPropose,
  designStudioPush,
  designStudioRead,
  designStudioStatus,
} from "@/lib/adminDesign.functions";

type RepoFile = { path: string; type: "file" | "dir"; size?: number };
type Proposal = {
  path: string;
  sha: string;
  oldContent: string;
  newContent: string;
  reason: string;
  message: string;
};

const START_PATHS = ["src/routes", "src/components", "src/lib/theme.ts", "src/styles.css"];

function lineDiff(oldText: string, newText: string) {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const max = Math.max(oldLines.length, newLines.length);
  const rows: Array<{ kind: "same" | "add" | "del"; text: string }> = [];
  for (let i = 0; i < max; i++) {
    const a = oldLines[i];
    const b = newLines[i];
    if (a === b) {
      if (a !== undefined) rows.push({ kind: "same", text: a });
    } else {
      if (a !== undefined) rows.push({ kind: "del", text: a });
      if (b !== undefined) rows.push({ kind: "add", text: b });
    }
  }
  return rows.filter((row) => row.kind !== "same").slice(0, 80);
}

export function AdminDesignStudioTab() {
  const [githubReady, setGithubReady] = useState(false);
  const [path, setPath] = useState("src/routes");
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [source, setSource] = useState("");
  const [prompt, setPrompt] = useState("");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const changed = useMemo(
    () => (proposal ? lineDiff(proposal.oldContent, proposal.newContent) : []),
    [proposal],
  );

  async function loadList(nextPath = path) {
    setError(null);
    const list = await designStudioList({ data: { path: nextPath } });
    setFiles(list);
    setPath(nextPath);
  }

  useEffect(() => {
    designStudioStatus()
      .then((s) => setGithubReady(s.githubReady))
      .catch(() => setGithubReady(false));
    loadList("src/routes").catch((e) => setError(e instanceof Error ? e.message : "Liste fehlgeschlagen"));
  }, []);

  async function openFile(next: string) {
    setBusy(true);
    setError(null);
    setOk(null);
    setProposal(null);
    try {
      const file = await designStudioRead({ data: { path: next } });
      setSelected(file.path);
      setSource(file.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Datei konnte nicht gelesen werden.");
    } finally {
      setBusy(false);
    }
  }

  async function propose() {
    if (!selected || prompt.trim().length < 8) return;
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const next = await designStudioPropose({ data: { path: selected, prompt: prompt.trim() } });
      setProposal(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Vorschlag fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function push() {
    if (!proposal) return;
    setBusy(true);
    setError(null);
    try {
      const result = await designStudioPush({
        data: {
          path: proposal.path,
          sha: proposal.sha,
          content: proposal.newContent,
          message: proposal.message,
          prompt,
        },
      });
      setOk(`Gepusht auf main: ${result.sha.slice(0, 8)}`);
      setSource(proposal.newContent);
      setProposal(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Push fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">Design Studio</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Datei wählen, Änderung beschreiben, Vorschlag prüfen, direkt auf main pushen.
          </p>
        </div>
        <span className={`text-xs rounded-full px-3 py-1 ${githubReady ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
          {githubReady ? "GitHub verbunden" : "GITHUB_TOKEN fehlt"}
        </span>
      </header>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl glass p-4 border border-border/40 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {START_PATHS.map((p) => (
              <button
                key={p}
                onClick={() => loadList(p).catch((e) => setError(e instanceof Error ? e.message : "Liste fehlgeschlagen"))}
                className={`rounded-full px-2.5 py-1 text-[11px] ${path === p ? "bg-foreground text-background" : "glass text-muted-foreground"}`}
              >
                {p.replace("src/", "")}
              </button>
            ))}
          </div>
          <ul className="space-y-1 max-h-[28rem] overflow-auto">
            {files.map((file) => (
              <li key={file.path}>
                <button
                  onClick={() => (file.type === "dir" ? loadList(file.path) : openFile(file.path))}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm ${selected === file.path ? "bg-aurora animate-aurora text-primary-foreground" : "hover:bg-muted/40"}`}
                >
                  {file.type === "dir" ? "📁 " : "📄 "}{file.path.split("/").pop()}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="space-y-4">
          <div className="rounded-2xl glass p-5 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{selected || "Keine Datei gewählt"}</div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="z. B. Mache den Header auf /risks größer und rücke den Toggle nach rechts."
              className="w-full min-h-28 rounded-xl bg-input p-3 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <button disabled={busy || !selected} onClick={propose} className="rounded-full bg-aurora animate-aurora px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
                {busy ? "Arbeitet…" : "Vorschlag erzeugen"}
              </button>
              <button disabled={busy || !proposal} onClick={push} className="rounded-full glass px-4 py-2 text-sm disabled:opacity-50">
                Auf main pushen
              </button>
            </div>
          </div>

          {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
          {ok && <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">{ok}</div>}

          {proposal && (
            <div className="rounded-2xl glass p-5 space-y-3">
              <h3 className="font-semibold">{proposal.reason}</h3>
              <p className="text-xs text-muted-foreground">{proposal.message}</p>
              <div className="max-h-72 overflow-auto rounded-xl border border-border/40 text-[12px] font-mono">
                {changed.map((row, i) => (
                  <div key={i} className={`px-3 py-1 ${row.kind === "add" ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
                    {row.kind === "add" ? "+ " : "- "}{row.text}
                  </div>
                ))}
                {changed.length === 0 && <div className="px-3 py-2 text-muted-foreground">Keine sichtbaren Zeilenunterschiede.</div>}
              </div>
            </div>
          )}

          {source && (
            <div className="rounded-2xl glass p-5">
              <h3 className="font-semibold mb-2">Aktuelle Datei</h3>
              <pre className="max-h-80 overflow-auto text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap">{source}</pre>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
