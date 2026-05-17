import { useEffect, useState } from "react";
import { MIX_RISK_META, type MixRiskScore } from "@/lib/pharmacology";

const LEVEL_TOKEN: Record<MixRiskScore["level"], string> = {
  ok: "var(--ok)",
  warn: "var(--warn)",
  danger: "var(--danger)",
};

const LEVEL_LABEL: Record<MixRiskScore["level"], string> = {
  ok: "Niedrig",
  warn: "Erhöht",
  danger: "Kritisch",
};

interface Props {
  score: MixRiskScore;
  size?: number;
}

export function RiskDial({ score, size = 120 }: Props) {
  const meta = MIX_RISK_META[score.key];
  const Icon = meta.icon;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = LEVEL_TOKEN[score.level];

  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(score.score));
    return () => cancelAnimationFrame(id);
  }, [score.score]);

  const dash = c - (animated / 100) * c;

  return (
    <div
      className="relative flex flex-col items-center gap-2 rounded-2xl glass p-4 pressable animate-rise-in"
      style={{ boxShadow: score.level === "danger" ? `0 0 32px -6px ${color}` : undefined }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="oklch(1 0 0 / 0.06)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={dash}
            style={{
              transition: "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)",
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="h-4 w-4 mb-0.5" style={{ color }} />
          <div className="text-xl font-bold tabular leading-none" style={{ color }}>
            {Math.round(score.score)}
          </div>
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
            {LEVEL_LABEL[score.level]}
          </div>
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold">{meta.label}</div>
        <div className="text-[10px] text-muted-foreground line-clamp-2 max-w-[140px]">
          {score.reason}
        </div>
      </div>
    </div>
  );
}
