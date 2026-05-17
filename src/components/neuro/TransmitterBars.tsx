import { useEffect, useState } from "react";
import type { TransmitterProfile } from "@/lib/pharmacology";

const ROWS: { key: keyof TransmitterProfile; label: string; sub: string }[] = [
  { key: "DAT", label: "DAT", sub: "Dopamin" },
  { key: "NET", label: "NET", sub: "Noradrenalin" },
  { key: "SERT", label: "SERT", sub: "Serotonin" },
  { key: "VMAT2", label: "VMAT2", sub: "Vesikulär" },
];

// Bar from -3..+3, center at 0. Positive = release (warm), negative = inhibition (cool).
export function TransmitterBars({ profile }: { profile?: TransmitterProfile }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!profile) {
    return (
      <p className="text-xs text-muted-foreground italic">Kein Transmitter-Profil hinterlegt.</p>
    );
  }
  return (
    <div className="space-y-2">
      {ROWS.map((r) => {
        const v = profile[r.key];
        const pct = mounted ? Math.min(100, (Math.abs(v) / 3) * 50) : 0;
        const isPos = v >= 0;
        return (
          <div key={r.key} className="flex items-center gap-2">
            <div className="w-24 shrink-0">
              <div className="text-[11px] font-mono font-semibold">{r.label}</div>
              <div className="text-[9px] text-muted-foreground">{r.sub}</div>
            </div>
            <div className="flex-1 relative h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
              <div className="absolute inset-y-0 left-1/2 w-px bg-white/15" />
              {v !== 0 && (
                <div
                  className="absolute top-0 bottom-0 rounded-full transition-all duration-700 ease-out"
                  style={{
                    left: isPos ? "50%" : `${50 - pct}%`,
                    width: `${pct}%`,
                    background: isPos
                      ? "linear-gradient(90deg, oklch(0.7 0.22 22 / 0.85), oklch(0.78 0.2 60))"
                      : "linear-gradient(90deg, oklch(0.78 0.18 220), oklch(0.7 0.22 290 / 0.85))",
                    boxShadow: isPos
                      ? "0 0 12px oklch(0.7 0.22 22 / 0.55)"
                      : "0 0 12px oklch(0.7 0.22 280 / 0.55)",
                  }}
                />
              )}
            </div>
            <div className="w-10 text-right text-[11px] tabular font-mono text-muted-foreground">
              {v > 0 ? `+${v}` : v}
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between text-[9px] text-muted-foreground/70 px-1 pt-1">
        <span>← Reuptake hemmen</span>
        <span>0</span>
        <span>Releaser →</span>
      </div>
    </div>
  );
}
