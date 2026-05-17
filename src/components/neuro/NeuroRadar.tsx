import { useEffect, useState } from "react";
import type { PharmaProfile } from "@/lib/pharmacology";

// Animated SVG radar chart for receptor + transporter activity.
// Maps relevant targets to 0..3 strength scale.

const AXES = [
  { key: "DAT", label: "DAT" },
  { key: "NET", label: "NET" },
  { key: "SERT", label: "SERT" },
  { key: "5HT2A", label: "5-HT2A" },
  { key: "NMDA", label: "NMDA" },
  { key: "MOR", label: "MOR" },
  { key: "GABA-A", label: "GABA" },
  { key: "CB1", label: "CB1" },
] as const;

function strengthFor(profile: PharmaProfile, key: string): number {
  const b = profile.targets.find((t) => t.target === key);
  if (!b) return 0;
  const s = b.strength ?? 2;
  return s;
}

export function NeuroRadar({
  profile,
  size = 260,
}: {
  profile: PharmaProfile;
  size?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const max = Math.min(cx, cy) - 36;

  const points = AXES.map((a, i) => {
    const angle = (i / AXES.length) * Math.PI * 2 - Math.PI / 2;
    const v = strengthFor(profile, a.key) / 3;
    const r = max * (mounted ? v : 0);
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      lx: cx + Math.cos(angle) * (max + 16),
      ly: cy + Math.sin(angle) * (max + 16),
      label: a.label,
      v,
    };
  });

  const ringPaths = [0.25, 0.5, 0.75, 1].map((f) => {
    const r = max * f;
    return AXES.map((_, i) => {
      const angle = (i / AXES.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ") + " Z";
  });

  const polyPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height={size} className="block">
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%">
          <stop offset="0%" stopColor="oklch(0.78 0.16 220)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.7 0.22 290)" stopOpacity="0.05" />
        </radialGradient>
        <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* axis spokes */}
      {AXES.map((_, i) => {
        const angle = (i / AXES.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * max;
        const y = cy + Math.sin(angle) * max;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="oklch(1 0 0 / 0.07)"
            strokeWidth="1"
          />
        );
      })}

      {/* rings */}
      {ringPaths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="oklch(1 0 0 / 0.07)"
          strokeWidth="1"
        />
      ))}

      {/* data polygon */}
      <path
        d={polyPath}
        fill="url(#radarFill)"
        stroke="oklch(0.78 0.18 240)"
        strokeWidth="1.5"
        filter="url(#radarGlow)"
        style={{ transition: "all 800ms cubic-bezier(0.2, 0.8, 0.2, 1)" }}
      />

      {/* points */}
      {points.map((p, i) => (
        <g key={i}>
          {p.v > 0 && (
            <circle
              cx={p.x}
              cy={p.y}
              r={3}
              fill="oklch(0.85 0.16 230)"
              filter="url(#radarGlow)"
              style={{ transition: "all 800ms cubic-bezier(0.2, 0.8, 0.2, 1)" }}
            />
          )}
          <text
            x={p.lx}
            y={p.ly}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-mono"
            fontSize="10"
            fill={p.v > 0 ? "oklch(0.92 0.05 240)" : "oklch(0.6 0.02 270)"}
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
