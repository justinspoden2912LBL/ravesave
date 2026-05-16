import { RISK_FLAG_META, type RiskFlag, type FlagLoad } from "@/lib/pharmacology";

export function RiskLoadBars({
  loads,
  max,
  className = "",
}: {
  loads: FlagLoad[];
  /** Skala für Balken; default = max(score, 3) */
  max?: number;
  className?: string;
}) {
  if (loads.length === 0) {
    return (
      <p className={`text-xs text-muted-foreground italic ${className}`}>
        Keine pharmakologischen Risiko-Flags für diese Auswahl hinterlegt.
      </p>
    );
  }
  const scale = Math.max(max ?? 3, ...loads.map((l) => l.score));
  return (
    <div className={`space-y-1.5 ${className}`}>
      {loads.map((l) => {
        const m = RISK_FLAG_META[l.flag as RiskFlag];
        const Icon = m.icon;
        const pct = Math.min(100, (l.score / scale) * 100);
        return (
          <div key={l.flag} className="flex items-center gap-2" title={m.blurb}>
            <div className="flex items-center gap-1.5 w-32 shrink-0 text-[11px]" style={{ color: m.token }}>
              <Icon className="h-3 w-3" />
              <span className="truncate font-medium">{m.label}</span>
            </div>
            <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, color-mix(in oklab, ${m.token} 40%, transparent), ${m.token})` }}
              />
            </div>
            <span className="text-[10px] tabular-nums w-6 text-right text-muted-foreground">×{l.score}</span>
          </div>
        );
      })}
    </div>
  );
}
