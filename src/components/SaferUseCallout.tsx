import { AlertTriangle, Info, Lightbulb, ShieldAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Wiederverwendbares Callout im Aurora-/Glass-Stil.
 * Variant steuert Farbe/Icon, Inhalt bleibt frei.
 *
 * Nutzung:
 *   <SaferUseCallout variant="tip" title="Start low, go slow">
 *     Beginne mit der niedrigsten Dosis.
 *   </SaferUseCallout>
 */

type Variant = "tip" | "info" | "warning" | "emergency";

const STYLES: Record<Variant, { ring: string; bg: string; iconColor: string; Icon: LucideIcon; label: string }> = {
  tip: {
    ring: "ring-secondary/40",
    bg: "bg-secondary/10",
    iconColor: "text-secondary",
    Icon: Lightbulb,
    label: "Tipp",
  },
  info: {
    ring: "ring-primary/30",
    bg: "bg-primary/10",
    iconColor: "text-primary",
    Icon: Info,
    label: "Info",
  },
  warning: {
    ring: "ring-accent/40",
    bg: "bg-accent/10",
    iconColor: "text-accent",
    Icon: AlertTriangle,
    label: "Warnung",
  },
  emergency: {
    ring: "ring-destructive/50",
    bg: "bg-destructive/10",
    iconColor: "text-destructive",
    Icon: ShieldAlert,
    label: "Notfall",
  },
};

export function SaferUseCallout({
  variant = "info",
  title,
  children,
  className = "",
}: {
  variant?: Variant;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const s = STYLES[variant];
  const Icon = s.Icon;
  return (
    <aside
      role={variant === "emergency" || variant === "warning" ? "alert" : "note"}
      className={`relative rounded-2xl border border-transparent ring-1 ${s.ring} ${s.bg} p-4 backdrop-blur-md ${className}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background/60 ${s.iconColor} ring-1 ${s.ring}`}
          aria-hidden="true"
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className={`text-[10px] font-semibold uppercase tracking-widest ${s.iconColor}`}>{s.label}</div>
          {title && <h3 className="mt-0.5 text-sm font-semibold leading-snug text-foreground">{title}</h3>}
          <div className="mt-1 text-sm leading-relaxed text-foreground/85">{children}</div>
        </div>
      </div>
    </aside>
  );
}
