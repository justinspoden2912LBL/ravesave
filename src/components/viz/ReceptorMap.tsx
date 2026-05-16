import {
  ACTION_LABEL,
  ACTION_SYMBOL,
  TARGET_META,
  type ReceptorBinding,
  type ReceptorTarget,
} from "@/lib/pharmacology";

// Slot-Layout: fix positionierte Slots pro Target auf einem 120×120 SVG.
// Familien gruppiert: Monoamine links, Opioid oben, GABA/Glutamat rechts, andere unten.
const SLOTS: Record<ReceptorTarget, { x: number; y: number }> = {
  // monoamine (left column)
  "5HT2A": { x: 22, y: 28 },
  "5HT1A": { x: 14, y: 50 },
  "5HT2C": { x: 14, y: 72 },
  SERT:    { x: 30, y: 60 },
  DAT:     { x: 30, y: 78 },
  NET:     { x: 30, y: 96 },
  VMAT2:   { x: 14, y: 96 },
  D2:      { x: 30, y: 42 },
  // opioid (top row)
  MOR:     { x: 60, y: 14 },
  KOR:     { x: 78, y: 14 },
  DOR:     { x: 96, y: 14 },
  // glutamate (right column)
  NMDA:    { x: 108, y: 50 },
  Sigma1:  { x: 108, y: 70 },
  // gaba (right-bottom)
  "GABA-A": { x: 92, y: 90 },
  "GABA-B": { x: 108, y: 90 },
  // cannabinoid (bottom)
  CB1:     { x: 60, y: 108 },
  CB2:     { x: 78, y: 108 },
  // other
  "α4β2":  { x: 48, y: 60 },
  H1:      { x: 48, y: 80 },
};

const SIZE: Record<NonNullable<ReceptorBinding["strength"]>, number> = { 1: 4, 2: 6, 3: 8 };

function dotFor(binding: ReceptorBinding, color: string) {
  const slot = SLOTS[binding.target];
  if (!slot) return null;
  const r = SIZE[binding.strength ?? 2];
  const sym = ACTION_SYMBOL[binding.action];
  return (
    <g key={binding.target + binding.action}>
      <circle
        cx={slot.x}
        cy={slot.y}
        r={r}
        fill={`color-mix(in oklab, ${color} 35%, transparent)`}
        stroke={color}
        strokeWidth={1}
      />
      <text
        x={slot.x}
        y={slot.y + r * 0.4}
        textAnchor="middle"
        fontSize={r * 1.4}
        fill={color}
        style={{ fontWeight: 700 }}
      >
        {sym}
      </text>
    </g>
  );
}

function familyOutlines() {
  // Subtile Hintergrund-Zonen pro Familie
  return (
    <g opacity={0.18}>
      <rect x={4} y={20} width={32} height={88} rx={8} fill="var(--target-monoamine)" />
      <rect x={48} y={4} width={68} height={20} rx={8} fill="var(--target-opioid)" />
      <rect x={100} y={40} width={18} height={40} rx={8} fill="var(--target-glutamate)" />
      <rect x={84} y={80} width={32} height={22} rx={8} fill="var(--target-gaba)" />
      <rect x={48} y={98} width={42} height={20} rx={8} fill="var(--target-cannabinoid)" />
      <rect x={40} y={52} width={20} height={36} rx={8} fill="var(--target-cholinergic)" />
    </g>
  );
}

export function ReceptorMap({
  targets,
  size = 120,
  showLegend = false,
  className = "",
}: {
  targets: ReceptorBinding[];
  size?: number;
  showLegend?: boolean;
  className?: string;
}) {
  if (targets.length === 0) {
    return (
      <div className={`text-[10px] text-muted-foreground italic ${className}`}>
        Keine Target-Daten.
      </div>
    );
  }
  return (
    <div className={className}>
      <svg viewBox="0 0 120 120" width={size} height={size} className="block">
        {familyOutlines()}
        {targets.map((b) => {
          const meta = TARGET_META[b.target];
          if (!meta) return null;
          return dotFor(b, meta.token);
        })}
      </svg>
      {showLegend && <ReceptorLegend targets={targets} />}
    </div>
  );
}

export function ReceptorLegend({ targets }: { targets: ReceptorBinding[] }) {
  return (
    <ul className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
      {targets.map((b, i) => {
        const m = TARGET_META[b.target];
        return (
          <li key={i} className="flex items-center gap-1.5 min-w-0">
            <span
              className="inline-block h-2 w-2 rounded-full shrink-0"
              style={{ background: m.token }}
            />
            <span className="font-mono" style={{ color: m.token }}>
              {ACTION_SYMBOL[b.action]}
            </span>
            <span className="truncate">
              {m.label} <span className="text-muted-foreground">{ACTION_LABEL[b.action]}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// Mehrere Substanzen auf derselben Map: jede bekommt eine eigene Farbe (HSL-rotation),
// um Überlappungen sichtbar zu machen.
const SUBSTANCE_HUES = [320, 200, 90, 25, 145, 270, 60, 350];

export function ReceptorOverlap({
  layers,
  size = 140,
}: {
  layers: { id: string; name: string; targets: ReceptorBinding[] }[];
  size?: number;
}) {
  const used = layers.filter((l) => l.targets.length > 0);
  if (used.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground italic">
        Keine Target-Daten für diese Auswahl.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      <svg viewBox="0 0 120 120" width={size} height={size} className="block">
        {familyOutlines()}
        {used.map((layer, li) => {
          const hue = SUBSTANCE_HUES[li % SUBSTANCE_HUES.length];
          const color = `oklch(0.78 0.22 ${hue})`;
          return (
            <g key={layer.id} opacity={0.85}>
              {layer.targets.map((b) => {
                const slot = SLOTS[b.target];
                if (!slot) return null;
                const r = SIZE[b.strength ?? 2];
                return (
                  <circle
                    key={layer.id + b.target + b.action}
                    cx={slot.x}
                    cy={slot.y}
                    r={r}
                    fill={`color-mix(in oklab, ${color} 28%, transparent)`}
                    stroke={color}
                    strokeWidth={1.2}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
        {used.map((l, i) => {
          const hue = SUBSTANCE_HUES[i % SUBSTANCE_HUES.length];
          return (
            <li key={l.id} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: `oklch(0.78 0.22 ${hue})` }}
              />
              <span className="text-foreground/85">{l.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
