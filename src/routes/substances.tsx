import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { SUBSTANCES, CATEGORY_LABEL, type SubstanceCategory } from "@/lib/substances";

export const Route = createFileRoute("/substances")({
  component: SubstancesPage,
  head: () => ({ meta: [{ title: "Substanzen — trace" }] }),
});

function SubstancesPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<SubstanceCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.toLowerCase().trim();
    return SUBSTANCES.filter((s) => {
      if (cat !== "all" && s.category !== cat) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.aliases.some((a) => a.toLowerCase().includes(q));
    });
  }, [query, cat]);

  const cats = Array.from(new Set(SUBSTANCES.map((s) => s.category)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Substanz-Wiki</h1>
        <p className="text-muted-foreground mt-1">
          Pharmakologie, Dosis-Orientierung und Studienlinks. Tippe für Details an.
        </p>
      </header>

      <div className="rounded-2xl glass p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche (Name oder Alias)..."
            className="w-full rounded-lg bg-input pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <CatBtn active={cat === "all"} onClick={() => setCat("all")}>Alle</CatBtn>
          {cats.map((c) => (
            <CatBtn key={c} active={cat === c} onClick={() => setCat(c)}>
              {CATEGORY_LABEL[c]}
            </CatBtn>
          ))}
        </div>
      </div>

      <ul className="grid gap-3 md:grid-cols-2">
        {list.map((s) => {
          const open = openId === s.id;
          return (
            <li
              key={s.id}
              className={`rounded-2xl glass p-5 transition-all ${open ? "ring-1 ring-primary/50" : ""}`}
            >
              <button onClick={() => setOpenId(open ? null : s.id)} className="w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{s.name}</h3>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                      {CATEGORY_LABEL[s.category]}
                      {s.aliases.length > 0 && <> · {s.aliases.join(", ")}</>}
                    </div>
                  </div>
                  <div className="h-10 w-10 shrink-0 rounded-full bg-aurora animate-aurora opacity-80" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{s.shortDescription}</p>
              </button>

              {open && (
                <div className="mt-4 space-y-4 border-t border-border pt-4 text-sm">
                  <Row label="Mechanismus">{s.mechanism}</Row>
                  <Row label="Wirkungseintritt">{s.onset}</Row>
                  <Row label="Dauer">{s.duration}</Row>

                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Dosis-Bereiche</div>
                    {s.doses.map((d, i) => (
                      <div key={i} className="rounded-xl glass p-3 mb-2">
                        <div className="font-medium text-xs mb-2">{d.route}</div>
                        <div className="grid grid-cols-5 gap-1 text-[11px]">
                          <Dose label="Schwelle" v={d.threshold} />
                          <Dose label="Leicht" v={d.light} />
                          <Dose label="Üblich" v={d.common} />
                          <Dose label="Stark" v={d.strong} />
                          <Dose label="Heavy" v={d.heavy} />
                        </div>
                        {d.notes && <p className="text-xs text-muted-foreground mt-2">{d.notes}</p>}
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Warnungen</div>
                    <ul className="list-disc pl-4 space-y-1">
                      {s.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Quellen / Evidenz</div>
                    <ul className="space-y-1">
                      {s.evidence.map((e, i) => (
                        <li key={i}>
                          <a
                            href={e.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-secondary hover:underline"
                          >
                            {e.label} <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                      ))}
                    </ul>
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

function CatBtn({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs transition ${
        active ? "bg-aurora animate-aurora text-primary-foreground" : "glass hover:bg-muted/40"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="w-32 shrink-0 text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="flex-1">{children}</span>
    </div>
  );
}

function Dose({ label, v }: { label: string; v?: string }) {
  return (
    <div className={`rounded-md px-1.5 py-1 text-center ${v ? "bg-muted/60" : "bg-muted/20 text-muted-foreground/40"}`}>
      <div className="text-[9px] uppercase tracking-wider opacity-60">{label}</div>
      <div className="font-mono">{v ?? "—"}</div>
    </div>
  );
}
