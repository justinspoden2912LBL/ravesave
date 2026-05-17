import { useEffect, useState } from "react";
import type { EffectProfile } from "@/lib/pharmacology";

const METERS: {
  key: keyof EffectProfile;
  label: string;
  color: (v: number) => string;
}[] = [
  { key: "warmth", label: "Wärme", color: () => "oklch(0.78 0.18 30)" },
  { key: "stimulation", label: "Stimulation", color: () => "oklch(0.82 0.2 85)" },
  { key: "compulsiveness", label: "Compulsiv.", color: (v) => (v >= 2 ? "oklch(0.7 0.22 22)" : "oklch(0.78 0.18 70)") },
  { key: "psychosis", label: "Psychose", color: (v) => (v >= 2 ? "oklch(0.7 0.22 22)" : "oklch(0.78 0.18 290)") },
  { key: "neurotoxicity", label: "Neurotox.", color: (v) => (v >= 2 ? "oklch(0.66 0.26 18)" : "oklch(0.78 0.18 60)") },
];

export function EffectMeters({ profile }: { profile?: EffectProfile }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!profile) {
    return (
      <p className="text-xs text-muted-foreground italic">Kein Effekt-Profil hinterlegt.</p>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      {METERS.map((m) => {
        const v = profile[m.key];
        const pct = mounted ? (v / 3) * 100 : 0;
        const c = m.color(v);
        return (
          <div key={m.key} className="flex flex-col items-center gap-1.5">
            <div className="relative h-20 w-3.5 rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-700 ease-out"
                style={{
                  height: `${pct}%`,
                  background: `linear-gradient(to top, ${c}, oklch(0.95 0.04 240 / 0.85))`,
                  boxShadow: `0 0 14px ${c}`,
                }}
              />
            </div>
            <div className="text-[9px] text-muted-foreground text-center leading-tight">
              {m.label}
            </div>
            <div className="text-[10px] font-mono tabular" style={{ color: c }}>
              {v}/3
            </div>
          </div>
        );
      })}
    </div>
  );
}
