import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { buildIndex, search, type SpotlightItem } from "@/lib/spotlight";

export function Spotlight() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const index = useMemo(() => buildIndex(), []);
  const results = useMemo(() => search(index, q), [index, q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("ravesave:open-spotlight", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ravesave:open-spotlight", onOpen);
    };
  }, []);

  if (!open) return null;

  function pick(item: SpotlightItem) {
    setOpen(false);
    setQ("");
    if (item.kind === "action") {
      if (item.id === "a-emergency") window.dispatchEvent(new CustomEvent("ravesave:open-emergency"));
      else if (item.id === "a-marleen") window.dispatchEvent(new CustomEvent("ravesave:open-marlene"));
      else if (item.to) navigate({ to: item.to as string, hash: item.hash });
      return;
    }
    if (item.to) navigate({ to: item.to as string, hash: item.hash });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-start justify-center p-4 pt-[12vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl glass border border-border/60 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Substanz, Seite, Aktion… (z. B. „Pep" oder „Reagent")"
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Schließen">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto py-1">
          {results.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">Nichts gefunden.</li>
          )}
          {results.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => pick(item)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 text-left transition"
              >
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-16 shrink-0">
                  {item.kind === "substance" ? "Stoff" : item.kind === "action" ? "Aktion" : "Seite"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.title}</div>
                  {item.subtitle && <div className="text-[11px] text-muted-foreground truncate">{item.subtitle}</div>}
                </div>
              </button>
            </li>
          ))}
        </ul>
        <div className="px-4 py-2 border-t border-border/40 text-[10px] text-muted-foreground flex justify-between">
          <span>↵ öffnen · Esc schließen</span>
          <span>⌘K / Strg+K</span>
        </div>
      </div>
    </div>
  );
}
