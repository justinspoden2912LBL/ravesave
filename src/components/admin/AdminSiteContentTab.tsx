import { useEffect, useMemo, useState } from "react";
import { Save, RefreshCw, Trash2, Plus, FileText } from "lucide-react";
import {
  adminListSiteContent,
  adminUpsertSiteContent,
  adminDeleteSiteContent,
} from "@/lib/adminContent.functions";

type Row = { key: string; content: string; updated_at: string };

/** Bekannte Content-Blöcke mit kurzer Erklärung — werden auch dann angezeigt,
 *  wenn sie in der DB noch nicht angelegt sind, damit Justin sie ohne Rätsel
 *  finden kann. */
const KNOWN: { key: string; label: string; hint: string; placeholder: string }[] = [
  {
    key: "about_intro",
    label: "Über-mich-Text (Justin)",
    hint: "Der persönliche Einleitungstext auf /about. Markdown-light: **fett**, Absätze durch Leerzeile.",
    placeholder:
      "Ich habe selbst Erfahrungen mit über **84 psychoaktiven Substanzen** gemacht …",
  },
  {
    key: "home_hero_lead",
    label: "Startseiten-Lead",
    hint: "Optional: Untertitel auf der Startseite. Leer lassen = Default aus dem Code.",
    placeholder: "Konsum protokollieren, Mischkonsum prüfen, Substanzen verstehen.",
  },
  {
    key: "ai_info",
    label: "KI-Info-Hinweis",
    hint: "Erklärtext über Marleen / KI-Chat. Wird im Chat-Panel angezeigt.",
    placeholder: "Marleen ist eine KI-Begleiterin … kein Ersatz für medizinische Hilfe.",
  },
];

export function AdminSiteContentTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await adminListSiteContent();
      setRows(r as Row[]);
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

  // Merge: bekannte Keys + bereits gespeicherte Keys
  const merged = useMemo(() => {
    const map = new Map<string, Row & { hint?: string; label?: string; placeholder?: string }>();
    for (const k of KNOWN) {
      map.set(k.key, {
        key: k.key,
        content: "",
        updated_at: "",
        hint: k.hint,
        label: k.label,
        placeholder: k.placeholder,
      });
    }
    for (const r of rows) {
      const known = KNOWN.find((k) => k.key === r.key);
      map.set(r.key, {
        ...r,
        hint: known?.hint,
        label: known?.label,
        placeholder: known?.placeholder,
      });
    }
    return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [rows]);

  async function addCustom() {
    const k = newKey.trim();
    if (!/^[a-zA-Z0-9._-]+$/.test(k)) {
      alert("Ungültiger Key. Erlaubt: a–z, 0–9, . _ -");
      return;
    }
    try {
      await adminUpsertSiteContent({ data: { key: k, content: "" } });
      setNewKey("");
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Fehler");
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl glass p-4 space-y-2">
        <p className="text-sm">
          <strong>Info-Texte direkt bearbeiten.</strong> Hier wird der lange Fließtext der
          Seiten gepflegt — z. B. Justins Über-mich-Text oder andere Editorial-Blöcke.
        </p>
        <p className="text-xs text-muted-foreground">
          Speichern wirkt sofort live. Leer lassen = es greift der im Code hinterlegte Default.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => load()}
            className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Neu laden
          </button>
          <div className="inline-flex items-center gap-1.5">
            <input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="neuer key (z. B. impressum)"
              className="rounded-full bg-input px-3 py-1.5 text-xs w-56"
            />
            <button
              onClick={addCustom}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Anlegen
            </button>
          </div>
        </div>
      </div>

      {err && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {err}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
          Lade…
        </div>
      ) : (
        <ul className="space-y-2">
          {merged.map((row) => (
            <ContentRow key={row.key} row={row} reload={load} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ContentRow({
  row,
  reload,
}: {
  row: { key: string; content: string; updated_at: string; hint?: string; label?: string; placeholder?: string };
  reload: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(row.content);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(row.content);
  }, [row.content]);

  const isStored = row.updated_at.length > 0;

  async function save() {
    setBusy(true);
    try {
      await adminUpsertSiteContent({ data: { key: row.key, content: draft } });
      setEditing(false);
      await reload();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Inhalt für "${row.key}" wirklich löschen? Es greift wieder der Default.`)) return;
    try {
      await adminDeleteSiteContent({ data: { key: row.key } });
      await reload();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Fehler");
    }
  }

  return (
    <li className="rounded-2xl glass p-4 space-y-2">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <FileText className="h-4 w-4 text-secondary shrink-0" />
            <span className="font-semibold">{row.label ?? row.key}</span>
            <span className="font-mono text-[11px] rounded-full bg-muted/40 text-muted-foreground px-2 py-0.5">
              {row.key}
            </span>
            {isStored ? (
              <span className="text-[10px] uppercase tracking-wider rounded-full bg-secondary/20 text-secondary px-2 py-0.5">
                überschrieben
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wider rounded-full bg-muted/40 text-muted-foreground px-2 py-0.5">
                Default
              </span>
            )}
          </div>
          {row.hint && (
            <p className="text-xs text-muted-foreground mt-1">{row.hint}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!editing && (
            <button
              onClick={() => {
                setDraft(row.content);
                setEditing(true);
              }}
              className="rounded-full px-3 py-1.5 text-xs glass hover:bg-muted/40"
            >
              {isStored ? "Bearbeiten" : "Erstellen"}
            </button>
          )}
          {isStored && !editing && (
            <button
              onClick={remove}
              className="rounded-full p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Override entfernen (Default greift wieder)"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {!editing && row.content && (
        <p className="text-sm text-foreground/90 whitespace-pre-wrap line-clamp-6 rounded-lg bg-muted/20 p-3">
          {row.content}
        </p>
      )}

      {editing && (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={row.placeholder ?? ""}
            rows={Math.min(20, Math.max(6, draft.split("\n").length + 1))}
            className="w-full rounded-lg bg-input px-3 py-2 text-sm font-mono leading-relaxed resize-y"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {busy ? "Speichern…" : "Speichern"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-full glass px-4 py-2 text-sm"
            >
              Abbrechen
            </button>
          </div>
          {row.updated_at && (
            <p className="text-[11px] text-muted-foreground">
              Zuletzt: {new Date(row.updated_at).toLocaleString("de-DE")}
            </p>
          )}
        </div>
      )}
    </li>
  );
}
