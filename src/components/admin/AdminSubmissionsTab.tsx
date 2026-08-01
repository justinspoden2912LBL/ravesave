import { useEffect, useState } from "react";
import { Inbox, Trash2, FileUp, RefreshCw, Save } from "lucide-react";
import {
  adminListSubmissions,
  adminUpdateSubmission,
  adminDeleteSubmission,
  adminSubmissionToDraft,
} from "@/lib/admin.functions";

interface Submission {
  id: string;
  title: string;
  body: string;
  category: string | null;
  pseudonym: string | null;
  contact: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
}

const STATUS: { id: string; label: string }[] = [
  { id: "new", label: "Neu" },
  { id: "reviewing", label: "In Prüfung" },
  { id: "accepted", label: "Angenommen" },
  { id: "rejected", label: "Abgelehnt" },
];

export function AdminSubmissionsTab() {
  const [items, setItems] = useState<Submission[] | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setItems(null);
    const rows = (await adminListSubmissions()) as unknown as Submission[];
    setItems(rows);
    setNotes(Object.fromEntries(rows.map((r) => [r.id, r.admin_note ?? ""])));
  }
  useEffect(() => {
    void load();
  }, []);

  const shown = (items ?? []).filter((i) => filter === "all" || i.status === filter);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Inbox className="h-4 w-4" /> Einsendungen von Leser:innen
          </h2>
          <p className="text-xs text-muted-foreground">
            Nur hier sichtbar. Übernehmen erzeugt einen unveröffentlichten Entwurf unter
            „Beiträge“.
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-full glass px-3 py-2 text-xs min-h-11"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Neu laden
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {[{ id: "all", label: "Alle" }, ...STATUS].map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${
              filter === s.id ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {msg && <div className="rounded-xl glass p-3 text-xs text-secondary">{msg}</div>}

      {!items && <div className="rounded-2xl glass p-6 text-sm text-muted-foreground">Lade…</div>}
      {items && shown.length === 0 && (
        <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
          Keine Einsendungen in dieser Ansicht.
        </div>
      )}

      <ul className="space-y-3">
        {shown.map((s) => {
          const open = openId === s.id;
          return (
            <li key={s.id} className="rounded-2xl glass p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(s.created_at).toLocaleString("de-DE")}
                    {s.pseudonym ? ` · ${s.pseudonym}` : ""}
                    {s.category ? ` · ${s.category}` : ""}
                  </div>
                  <h3 className="font-semibold truncate">{s.title}</h3>
                </div>
                <span className="shrink-0 rounded-full bg-secondary/15 text-secondary px-2 py-0.5 text-[11px]">
                  {STATUS.find((x) => x.id === s.status)?.label ?? s.status}
                </span>
              </div>

              <button
                onClick={() => setOpenId(open ? null : s.id)}
                className="text-xs text-secondary min-h-11"
              >
                {open ? "Text einklappen" : "Vollen Text anzeigen"}
              </button>

              {open && (
                <>
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 max-h-[60vh] overflow-auto">
                    {s.body}
                  </pre>
                  {s.contact && (
                    <div className="text-xs text-muted-foreground">Kontakt: {s.contact}</div>
                  )}
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={notes[s.id] ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [s.id]: e.target.value }))}
                      placeholder="Interne Notiz"
                      className="w-full rounded-xl glass px-3 py-2 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={async () => {
                          await adminUpdateSubmission({
                            data: { id: s.id, admin_note: notes[s.id] ?? "" },
                          });
                          setMsg("Notiz gespeichert.");
                          void load();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-2 text-xs min-h-11"
                      >
                        <Save className="h-3.5 w-3.5" /> Notiz speichern
                      </button>
                      {STATUS.map((st) => (
                        <button
                          key={st.id}
                          onClick={async () => {
                            await adminUpdateSubmission({
                              data: { id: s.id, status: st.id as "new" },
                            });
                            void load();
                          }}
                          className="rounded-full glass px-3 py-2 text-xs min-h-11"
                        >
                          {st.label}
                        </button>
                      ))}
                      <button
                        onClick={async () => {
                          await adminSubmissionToDraft({ data: { id: s.id } });
                          setMsg("Als Entwurf unter „Beiträge“ angelegt.");
                          void load();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-2 text-xs min-h-11"
                      >
                        <FileUp className="h-3.5 w-3.5" /> Als Entwurf übernehmen
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm("Einsendung endgültig löschen?")) return;
                          await adminDeleteSubmission({ data: { id: s.id } });
                          void load();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-destructive/35 text-destructive px-3 py-2 text-xs min-h-11"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Löschen
                      </button>
                    </div>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
