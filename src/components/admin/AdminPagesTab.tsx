import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Save, RefreshCw, Power, FileText } from "lucide-react";
import {
  adminListFeatureFlags,
  adminToggleFeatureFlag,
  adminListTexts,
  adminUpsertText,
  adminDeleteText,
} from "@/lib/adminContent.functions";
import { getSeenKeys, refreshI18n } from "@/lib/i18n";
import { refreshFeatureFlags } from "@/lib/featureFlags";

type Flag = {
  key: string;
  page: string;
  label: string;
  description: string | null;
  enabled: boolean;
  updated_at: string;
};
type TextRow = {
  key: string;
  value: string;
  description: string | null;
  category: string | null;
  updated_at: string;
};

export function AdminPagesTab() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [texts, setTexts] = useState<TextRow[]>([]);
  const [seen, setSeen] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [openPage, setOpenPage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [f, t] = await Promise.all([adminListFeatureFlags(), adminListTexts()]);
      setFlags(f as Flag[]);
      setTexts(t as TextRow[]);
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

  async function toggle(flag: Flag) {
    try {
      await adminToggleFeatureFlag({ data: { key: flag.key, enabled: !flag.enabled } });
      setFlags((arr) =>
        arr.map((f) => (f.key === flag.key ? { ...f, enabled: !f.enabled } : f)),
      );
      void refreshFeatureFlags();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Fehler");
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl glass p-4 space-y-2">
        <p className="text-sm">
          <strong>Hier verwaltest du jede Seite zentral.</strong> Pro Seite kannst du:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5">
          <li>
            <strong>An/Aus</strong> – die Seite wird für alle Besucher gesperrt oder freigeschaltet.
          </li>
          <li>
            <strong>Texte bearbeiten</strong> – alle UI-Texte der Seite werden gelistet, sobald sie
            einmal aufgerufen wurde.
          </li>
        </ul>
        <button
          onClick={() => load()}
          className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Neu laden
        </button>
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
      ) : flags.length === 0 ? (
        <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
          Keine Seiten gefunden.
        </div>
      ) : (
        <ul className="space-y-2">
          {flags.map((flag) => (
            <PageCard
              key={flag.key}
              flag={flag}
              isOpen={openPage === flag.page}
              onToggleOpen={() => setOpenPage(openPage === flag.page ? null : flag.page)}
              onToggle={() => toggle(flag)}
              texts={texts}
              seen={seen}
              reloadTexts={async () => {
                const t = await adminListTexts();
                setTexts(t as TextRow[]);
                await refreshI18n();
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────

function PageCard({
  flag,
  isOpen,
  onToggleOpen,
  onToggle,
  texts,
  seen,
  reloadTexts,
}: {
  flag: Flag;
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggle: () => void;
  texts: TextRow[];
  seen: Record<string, string>;
  reloadTexts: () => Promise<void>;
}) {
  // Filter texts that belong to this page: prefix `<page>.` or category `<page>`.
  const prefix = `${flag.page}.`;
  const merged = useMemo(() => {
    const map = new Map<
      string,
      { key: string; value: string; description: string | null; category: string | null; fallback: string; isOverride: boolean }
    >();
    for (const [k, fb] of Object.entries(seen)) {
      if (!k.startsWith(prefix)) continue;
      map.set(k, {
        key: k,
        value: "",
        description: null,
        category: flag.page,
        fallback: fb,
        isOverride: false,
      });
    }
    for (const r of texts) {
      const matches = r.key.startsWith(prefix) || r.category === flag.page;
      if (!matches) continue;
      const fb = seen[r.key] ?? "";
      map.set(r.key, {
        key: r.key,
        value: r.value,
        description: r.description,
        category: r.category,
        fallback: fb,
        isOverride: r.value.length > 0,
      });
    }
    return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [texts, seen, prefix, flag.page]);

  return (
    <li className={`rounded-2xl glass p-3 transition-opacity ${flag.enabled ? "" : "opacity-70"}`}>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onToggleOpen}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{flag.label}</span>
              <span
                className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 ${
                  flag.enabled
                    ? "bg-secondary/20 text-secondary"
                    : "bg-destructive/20 text-destructive"
                }`}
              >
                {flag.enabled ? "aktiv" : "gesperrt"}
              </span>
              <span className="text-[10px] rounded-full bg-muted/40 text-muted-foreground px-2 py-0.5">
                /{flag.page}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <FileText className="h-3 w-3" /> {merged.length} Texte
              </span>
            </div>
            {flag.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>
            )}
          </div>
        </button>
        <button
          onClick={onToggle}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
            flag.enabled
              ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
              : "bg-secondary/15 text-secondary hover:bg-secondary/25"
          }`}
        >
          <Power className="h-3.5 w-3.5" />
          {flag.enabled ? "Sperren" : "Aktivieren"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
          {merged.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              Noch keine Texte registriert. Öffne die Seite einmal im Frontend, damit ihre Default-Texte hier erscheinen.
            </p>
          ) : (
            <ul className="space-y-2">
              {merged.map((row) => (
                <TextRowEditor
                  key={row.key}
                  row={row}
                  page={flag.page}
                  reload={reloadTexts}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

function TextRowEditor({
  row,
  page,
  reload,
}: {
  row: { key: string; value: string; description: string | null; category: string | null; fallback: string; isOverride: boolean };
  page: string;
  reload: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(row.value || row.fallback);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await adminUpsertText({
        data: {
          key: row.key,
          value: draft,
          description: row.description,
          category: row.category ?? page,
        },
      });
      setEditing(false);
      await reload();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!confirm(`Override für "${row.key}" entfernen? Es gilt wieder der Default-Text.`)) return;
    try {
      await adminDeleteText({ data: { key: row.key } });
      await reload();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Fehler");
    }
  }

  return (
    <li className="rounded-xl bg-muted/20 p-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px]">{row.key}</span>
            {row.isOverride && (
              <span className="text-[10px] uppercase tracking-wider rounded-full bg-secondary/20 text-secondary px-2 py-0.5">
                überschrieben
              </span>
            )}
          </div>
          {row.fallback && !editing && (
            <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
              <span className="opacity-70">Default:</span> {row.fallback}
            </p>
          )}
          {row.value && !editing && (
            <p className="mt-1 text-xs text-foreground line-clamp-3">{row.value}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!editing && (
            <button
              onClick={() => {
                setDraft(row.value || row.fallback);
                setEditing(true);
              }}
              className="rounded-full px-3 py-1 text-xs glass hover:bg-muted/40"
            >
              Bearbeiten
            </button>
          )}
          {row.isOverride && !editing && (
            <button
              onClick={reset}
              className="rounded-full px-2 py-1 text-[11px] text-muted-foreground hover:text-destructive"
              title="Override entfernen"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      {editing && (
        <div className="mt-2 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={Math.min(8, Math.max(2, draft.split("\n").length))}
            className="w-full rounded-lg bg-input px-3 py-2 text-sm resize-y"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" /> Speichern
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-full glass px-3 py-1.5 text-xs"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
