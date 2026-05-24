import { useEffect, useMemo, useState } from "react";
import { Save, Trash2, Search, Plus } from "lucide-react";
import {
  adminListSubstanceOverrides,
  adminUpsertSubstanceOverride,
  adminDeleteSubstanceOverride,
} from "@/lib/adminContent.functions";
import { SUBSTANCES } from "@/lib/substances";
import { refreshSubstanceOverrides } from "@/lib/substancesRuntime";

type Row = { slug: string; patch: Record<string, unknown>; updated_at: string };

const EDITABLE_FIELDS = [
  "name",
  "summary",
  "duration",
  "onset",
  "effects",
  "risks",
  "safer_use",
  "interactions",
  "tolerance",
  "comeup",
  "comedown",
];

export function AdminSubstancesTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      const data = await adminListSubstanceOverrides();
      setRows(data as Row[]);
      setErr(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Fehler");
    }
  }
  useEffect(() => {
    void load();
  }, []);

  const overrideMap = useMemo(() => {
    const m = new Map<string, Row>();
    for (const r of rows) m.set(r.slug, r);
    return m;
  }, [rows]);

  const filtered = useMemo(() => {
    const f = filter.toLowerCase();
    return SUBSTANCES.filter((s) =>
      !f ? true : s.name.toLowerCase().includes(f) || s.id.toLowerCase().includes(f),
    ).slice(0, 80);
  }, [filter]);

  function startEdit(slug: string) {
    setEditing(slug);
    const cur = overrideMap.get(slug);
    setDraft(cur ? JSON.stringify(cur.patch, null, 2) : "{\n  \n}");
  }

  async function save(slug: string) {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(draft);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        throw new Error("must be a JSON object");
    } catch (e) {
      alert("Ungültiges JSON: " + (e instanceof Error ? e.message : ""));
      return;
    }
    setBusy(true);
    try {
      await adminUpsertSubstanceOverride({ data: { slug, patch: parsed } });
      setEditing(null);
      await load();
      await refreshSubstanceOverrides();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  async function remove(slug: string) {
    if (!confirm(`Override für "${slug}" entfernen?`)) return;
    try {
      await adminDeleteSubstanceOverride({ data: { slug } });
      await load();
      await refreshSubstanceOverrides();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Fehler");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl glass p-4 space-y-2">
        <p className="text-xs text-muted-foreground">
          Patches werden flach auf den jeweiligen Substanz-Eintrag gemerged. Setze nur Felder, die du überschreiben willst, z. B.:
        </p>
        <pre className="text-[11px] bg-muted/30 rounded p-2 overflow-x-auto">
{`{
  "summary": "Neuer Kurztext…",
  "safer_use": ["Tipp 1", "Tipp 2"]
}`}
        </pre>
        <p className="text-[11px] text-muted-foreground">
          Bekannte Felder: {EDITABLE_FIELDS.join(", ")}.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Substanz suchen…"
          className="w-full rounded-lg bg-input pl-9 pr-3 py-2 text-sm"
        />
      </div>

      {err && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {err}
        </div>
      )}

      <ul className="space-y-2">
        {filtered.map((s) => {
          const ov = overrideMap.get(s.id);
          return (
            <li key={s.id} className="rounded-2xl glass p-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{s.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{s.id}</span>
                    {ov && (
                      <span className="text-[10px] uppercase tracking-wider rounded-full bg-secondary/20 text-secondary px-2 py-0.5">
                        überschrieben
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {editing !== s.id && (
                    <button
                      onClick={() => startEdit(s.id)}
                      className="rounded-full px-3 py-1 text-xs glass hover:bg-muted/40"
                    >
                      Bearbeiten
                    </button>
                  )}
                  {ov && (
                    <button
                      onClick={() => remove(s.id)}
                      className="rounded-full p-1.5 text-muted-foreground hover:text-destructive"
                      aria-label="Override entfernen"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {editing === s.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={10}
                    className="w-full rounded-lg bg-input px-3 py-2 text-xs font-mono resize-y"
                    spellCheck={false}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => save(s.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" /> Speichern
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="rounded-full glass px-3 py-1.5 text-xs"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
