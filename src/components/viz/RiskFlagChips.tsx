import { RISK_FLAG_META, type RiskFlag } from "@/lib/pharmacology";

export function RiskFlagChips({
  flags,
  size = "sm",
  className = "",
}: {
  flags: RiskFlag[];
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  if (flags.length === 0) return null;
  const dim = size === "xs" ? "h-5 px-1.5 text-[9px]" : size === "md" ? "h-7 px-2.5 text-[11px]" : "h-6 px-2 text-[10px]";
  const icon = size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3";
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {flags.map((f) => {
        const m = RISK_FLAG_META[f];
        const Icon = m.icon;
        return (
          <span
            key={f}
            title={`${m.label} — ${m.blurb}`}
            className={`inline-flex items-center gap-1 rounded-full border ${dim}`}
            style={{
              color: m.token,
              borderColor: `color-mix(in oklab, ${m.token} 45%, transparent)`,
              backgroundColor: `color-mix(in oklab, ${m.token} 12%, transparent)`,
            }}
          >
            <Icon className={icon} />
            <span className="font-medium tracking-wide">{m.short}</span>
          </span>
        );
      })}
    </div>
  );
}
