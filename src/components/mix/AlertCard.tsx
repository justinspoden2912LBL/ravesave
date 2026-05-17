import { AlertTriangle } from "lucide-react";
import { MIX_RISK_META, type MixRiskScore } from "@/lib/pharmacology";
import { SUBSTANCES } from "@/lib/substances";

interface Props {
  score: MixRiskScore;
}

export function AlertCard({ score }: Props) {
  const meta = MIX_RISK_META[score.key];
  const contributorNames = score.contributors
    .map((id) => SUBSTANCES.find((s) => s.id === id)?.name ?? id)
    .join(" + ");

  const color = score.level === "danger" ? "var(--danger)" : "var(--warn)";

  return (
    <div
      className="rounded-2xl glass p-4 flex gap-3 animate-rise-in border"
      style={{
        borderColor: color,
        boxShadow: `0 0 28px -10px ${color}`,
      }}
    >
      <div
        className="h-9 w-9 shrink-0 rounded-xl flex items-center justify-center"
        style={{ background: `color-mix(in oklch, ${color} 25%, transparent)` }}
      >
        <AlertTriangle className="h-5 w-5" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold text-sm">{meta.label}</h3>
          <span className="text-xs tabular font-bold" style={{ color }}>
            {Math.round(score.score)}/100
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{score.reason}</p>
        <p className="text-[11px] mt-2 leading-relaxed border-l-2 pl-2" style={{ borderColor: color }}>
          <span className="font-semibold text-foreground/80">Mechanismus: </span>
          {meta.blurb}
        </p>
        {contributorNames && (
          <p className="text-[10px] text-muted-foreground mt-1.5">
            Beitragend: <span className="text-foreground/70">{contributorNames}</span>
          </p>
        )}
      </div>
    </div>
  );
}
