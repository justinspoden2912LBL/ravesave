import { CYP_ROLE_META, type CypInteraction, type CypConflict } from "@/lib/pharmacology";

export function CypBadges({
  cyp,
  className = "",
}: {
  cyp: CypInteraction[];
  className?: string;
}) {
  if (cyp.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {cyp.map((c, i) => {
        const m = CYP_ROLE_META[c.role];
        return (
          <span
            key={i}
            title={`${c.enzyme} — ${m.label}`}
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 h-5 text-[10px] font-mono bg-background/40 ${m.tone}`}
          >
            <span>{c.enzyme.replace("CYP", "")}</span>
            <span className="opacity-80">{m.symbol}</span>
          </span>
        );
      })}
    </div>
  );
}

export function CypConflicts({ conflicts }: { conflicts: CypConflict[] }) {
  const issues = conflicts.filter((c) => c.conflict);
  if (issues.length === 0) return null;
  return (
    <div className="space-y-1.5">
      {issues.map((c) => (
        <div
          key={c.enzyme}
          className="rounded-lg border px-2.5 py-1.5 text-[11px] flex items-center gap-2 flex-wrap"
          style={{
            borderColor: "color-mix(in oklab, var(--flag-cardiotoxic) 55%, transparent)",
            backgroundColor: "color-mix(in oklab, var(--flag-cardiotoxic) 10%, transparent)",
          }}
        >
          <span className="font-mono font-semibold">{c.enzyme}</span>
          {c.inhibitors.length > 0 && (
            <span className="text-muted-foreground">
              Hemmer: <span className="text-foreground">{c.inhibitors.join(", ")}</span>
            </span>
          )}
          {c.inducers.length > 0 && (
            <span className="text-muted-foreground">
              Induktor: <span className="text-foreground">{c.inducers.join(", ")}</span>
            </span>
          )}
          {c.substrates.length > 0 && (
            <span className="text-muted-foreground">
              → Substrat: <span className="text-foreground">{c.substrates.join(", ")}</span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
