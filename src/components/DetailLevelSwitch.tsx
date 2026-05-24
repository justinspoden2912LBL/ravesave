import { useDetailLevel, setDetailLevel, DETAIL_LABEL, type DetailLevel } from "@/lib/detailLevel";

const LEVELS: DetailLevel[] = ["basic", "extended", "expert"];

/**
 * Segment-Control für Basis · Mehr · Experte.
 * Benutzt überall, wo wir den Tiefe-Schalter zeigen wollen (Header, Settings, FAB).
 */
export function DetailLevelSwitch({ size = "md" }: { size?: "sm" | "md" }) {
  const current = useDetailLevel();
  const padding = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs";
  return (
    <div
      role="radiogroup"
      aria-label="Informationstiefe"
      className="inline-flex items-center rounded-full glass border border-border/40 p-0.5"
    >
      {LEVELS.map((lvl) => {
        const active = current === lvl;
        return (
          <button
            key={lvl}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setDetailLevel(lvl)}
            className={`rounded-full font-semibold transition ${padding} ${
              active
                ? "bg-aurora animate-aurora text-primary-foreground glow"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
            title={`Informationstiefe: ${DETAIL_LABEL[lvl]}`}
          >
            {DETAIL_LABEL[lvl]}
          </button>
        );
      })}
    </div>
  );
}
