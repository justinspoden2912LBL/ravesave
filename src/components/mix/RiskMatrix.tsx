import { useMemo } from "react";
import { SUBSTANCES, assessPair, RISK_META, type RiskLevel } from "@/lib/substances";

const LEVEL_RANK: Record<RiskLevel, number> = {
  safe: 0,
  synergy: 0,
  unknown: 1,
  caution: 2,
  unsafe: 3,
  danger: 4,
};

const LEVEL_FILL: Record<RiskLevel, string> = {
  safe: "oklch(0.78 0.16 160 / 0.55)",
  synergy: "oklch(0.74 0.18 290 / 0.55)",
  unknown: "oklch(1 0 0 / 0.06)",
  caution: "oklch(0.82 0.17 85 / 0.7)",
  unsafe: "oklch(0.78 0.2 35 / 0.8)",
  danger: "oklch(0.66 0.24 22 / 0.95)",
};

interface Props {
  ids: string[];
}

export function RiskMatrix({ ids }: Props) {
  const subs = useMemo(
    () => ids.map((id) => SUBSTANCES.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s),
    [ids],
  );

  if (subs.length < 2) return null;

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="border-separate border-spacing-1 mx-auto">
        <thead>
          <tr>
            <th />
            {subs.map((s) => (
              <th
                key={s.id}
                className="text-[10px] font-medium text-muted-foreground align-bottom h-20 w-10 max-w-10"
              >
                <div className="origin-bottom-left rotate-[-55deg] translate-y-2 truncate w-20">
                  {s.name}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subs.map((rowS, ri) => (
            <tr key={rowS.id}>
              <th className="text-[10px] font-medium text-muted-foreground text-right pr-2 w-24 truncate">
                {rowS.name}
              </th>
              {subs.map((colS, ci) => {
                if (ri === ci) {
                  return (
                    <td key={colS.id}>
                      <div
                        className="h-10 w-10 rounded-md"
                        style={{ background: "oklch(1 0 0 / 0.03)" }}
                      />
                    </td>
                  );
                }
                const risk = assessPair(rowS.id, colS.id);
                const fill = LEVEL_FILL[risk.level];
                const isHigh = LEVEL_RANK[risk.level] >= 3;
                return (
                  <td key={colS.id}>
                    <div
                      title={`${rowS.name} + ${colS.name}: ${RISK_META[risk.level].label} — ${risk.reason}`}
                      className="h-10 w-10 rounded-md flex items-center justify-center text-[9px] font-bold text-background pressable"
                      style={{
                        background: fill,
                        boxShadow: isHigh ? `0 0 12px -2px ${fill}` : undefined,
                      }}
                    >
                      {risk.level === "danger" ? "✕" : risk.level === "unsafe" ? "!" : ""}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap gap-2 justify-center mt-3 text-[10px] text-muted-foreground">
        {(["safe", "synergy", "caution", "unsafe", "danger"] as RiskLevel[]).map((l) => (
          <div key={l} className="flex items-center gap-1">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ background: LEVEL_FILL[l] }}
            />
            {RISK_META[l].label}
          </div>
        ))}
      </div>
    </div>
  );
}
