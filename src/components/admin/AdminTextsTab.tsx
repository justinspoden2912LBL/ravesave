import { useEffect, useMemo, useState } from "react";
import { Save, Trash2, Search, Plus, RefreshCw } from "lucide-react";
import {
  adminListTexts,
  adminUpsertText,
  adminDeleteText,
} from "@/lib/adminContent.functions";
import { getSeenKeys, refreshI18n } from "@/lib/i18n";

type Row = {
  key: string;
  value: string;
  description: string | null;
  category: string | null;
  updated_at: string;
};

export function AdminTextsTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [seen, setSeen] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ value: string; description: string; category: string }>(
    { value: "", description: "", category: "" },
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await adminListTexts();
      setRows(data as Row[]);
      setSeen(getSeenKeys());
      setErr(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);

  // Merge: defaults seen by t() + DB rows. DB wins.
  const merged = useMemo(() => {
    const map = new Map<string, Row & { fallback: string; isOverride: boolean }>();
    for (const [k, fb] of Object.entries(seen)) {
      map.set(k, {
        key: k,
        value: "",
        description: null,
        category: null,
        updated_at: "",
        fallback: fb,
        isOverride: false,
      });
    }
    for (const r of rows) {
      const fb = seen[r.key] ?? "";
      map.set(r.key, { ...r, fallback: fb, isOverride: r.value.length > 0 });
    }
    const arr = [...map.values()];
    if (filter) {
      const f = filter.toLowerCase();
      return arr.filter(
        (r) =>
          r.key.toLowerCase().includes(f) ||
          r.value.toLowerCase().includes(f) ||
          r.fallback.toLowerCase().includes(f),
      );
    }
    return arr;
  }, [rows, seen, filter]);

  function startEdit(row: { key: string; value: string; description: string | null; category: string | null; fallback: string }) {
    setEditing(row.key);
    setDraft({
      value: row.value || row.fallback,
      description: row.description ?? "",
      category: row.category ?? "",
    });
  }

  async function save(key: string) {
    setBusy(true);
    try {
      await adminUpsertText({
        data: {
          key,
          value: draft.value,
          description: draft.description || null,
          category: draft.category || null,
        },
      });
      setEditing(null);
      await load();
      await refreshI18n();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  async function remove(key: string) {
    if (!confirm(`Override für "${key}" entfernen? Es wird wieder der Default-Text angezeigt.`)) return;
    try {
      await adminDeleteText({ data: { key } });
      await load();
      await refreshI18n();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Löschen fehlgeschlagen");
    }
  }

  const [newKey, setNewKey] = useState("");
  async function addNew() {
    if (!newKey.match(/^[a-zA-Z0-9._-]+$/)) {
      alert("Schlüssel: nur Buchstaben, Ziffern, Punkt, Unterstrich, Bindestrich.");
      return;
    }
    try {
      await adminUpsertText({ data: { key: newKey, value: "" } });
      setNewKey("");
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Fehler");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl glass p-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Alle UI-Texte, die mit <code className="px-1 rounded bg-muted/40">t(&quot;key&quot;, …)</code> markiert sind, erscheinen hier automatisch –
          sobald die jeweilige Seite einmal aufgerufen wurde. Lass das Wert-Feld leer, um den Default-Text aus dem Code zu zeigen.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Suche nach Schlüssel oder Inhalt…"
              className="w-full rounded-lg bg-input pl-9 pr-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={() => load()}
            className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Neu laden
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="neuer.key.name"
            className="flex-1 rounded-lg bg-input px-3 py-2 text-xs font-mono"
          />
          <button
            onClick={addNew}
            disabled={!newKey}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" /> Anlegen
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {err}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">Lade…</div>
      ) : merged.length === 0 ? (
        <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
          Keine Texte gefunden. Surfe einmal durch die App, damit Defaults registriert werden, oder lege oben einen Key an.
        </div>
      ) : (
        <ul className="space-y-2">
          {merged.map((r) => (
            <li key={r.key} className="rounded-2xl glass p-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs">{r.key}</span>
                    {r.isOverride && (
                      <span className="text-[10px] uppercase tracking-wider rounded-full bg-secondary/20 text-secondary px-2 py-0.5">
                        überschrieben
                      </span>
                    )}
                    {r.category && (
                      <span className="text-[10px] rounded-full bg-primary/15 text-primary px-2 py-0.5">{r.category}</span>
                    )}
                  </div>
                  {r.fallback && (
                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                      <span className="opacity-70">Default:</span> {r.fallback}
                    </p>
                  )}
                  {r.value && (
                    <p className="mt-1 text-xs text-foreground line-clamp-3">{r.value}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {editing !== r.key && (
                    <button
                      onClick={() => startEdit(r)}
                      className="rounded-full px-3 py-1 text-xs glass hover:bg-muted/40"
                    >
                      Bearbeiten
                    </button>
                  )}
                  {r.isOverride && (
                    <button
                      onClick={() => remove(r.key)}
                      className="rounded-full p-1.5 text-muted-foreground hover:text-destructive"
                      aria-label="Override entfernen"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {editing === r.key && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={draft.value}
                    onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                    rows={Math.min(8, Math.max(2, draft.value.split("\n").length))}
                    className="w-full rounded-lg bg-input px-3 py-2 text-sm resize-y"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={draft.category}
                      onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                      placeholder="Kategorie (optional)"
                      className="rounded-lg bg-input px-3 py-2 text-xs"
                    />
                    <input
                      value={draft.description}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                      placeholder="Notiz (optional)"
                      className="rounded-lg bg-input px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => save(r.key)}
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
          ))}
        </ul>
      )}
    </div>
  );
}
