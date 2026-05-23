import { AlertTriangle, ChevronDown, Copy, Check, Info, Lightbulb, ShieldAlert, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

/**
 * Wiederverwendbares Callout im Aurora-/Glass-Stil.
 * Variant steuert Farbe/Icon, Inhalt bleibt frei.
 *
 * Optional:
 *  - collapsible: zeigt nur Titel + Pfeil; Inhalt wird per Klick aufgeklappt.
 *  - copyText:    blendet einen Copy-Button ein (kopiert den Text in die Zwischenablage).
 */

type Variant = "tip" | "info" | "warning" | "emergency";

const STYLES: Record<
  Variant,
  { ring: string; bg: string; iconColor: string; Icon: LucideIcon; label: string }
> = {
  tip: { ring: "ring-secondary/40", bg: "bg-secondary/10", iconColor: "text-secondary", Icon: Lightbulb, label: "Tipp" },
  info: { ring: "ring-primary/30", bg: "bg-primary/10", iconColor: "text-primary", Icon: Info, label: "Info" },
  warning: { ring: "ring-accent/40", bg: "bg-accent/10", iconColor: "text-accent", Icon: AlertTriangle, label: "Warnung" },
  emergency: { ring: "ring-destructive/50", bg: "bg-destructive/10", iconColor: "text-destructive", Icon: ShieldAlert, label: "Notfall" },
};

export function SaferUseCallout({
  variant = "info",
  title,
  children,
  className = "",
  collapsible = false,
  defaultOpen = false,
  copyText,
}: {
  variant?: Variant;
  title?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  copyText?: string;
}) {
  const s = STYLES[variant];
  const Icon = s.Icon;
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore — Clipboard API kann blockiert sein */
    }
  }

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
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className={`text-[10px] font-semibold uppercase tracking-widest ${s.iconColor}`}>{s.label}</div>
              {title && (
                collapsible ? (
                  <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    className="mt-0.5 inline-flex items-center gap-1.5 text-left text-sm font-semibold leading-snug text-foreground hover:underline"
                  >
                    <span>{title}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                ) : (
                  <h3 className="mt-0.5 text-sm font-semibold leading-snug text-foreground">{title}</h3>
                )
              )}
            </div>
            {copyText && (
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Hinweis in Zwischenablage kopieren"
                className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ring-1 transition ${
                  copied
                    ? "bg-secondary/25 text-secondary ring-secondary/40"
                    : "bg-background/60 text-foreground/80 ring-border/60 hover:bg-background/80"
                }`}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Kopiert" : "Kopieren"}
              </button>
            )}
          </div>
          {(!collapsible || open) && (
            <div className="mt-1 text-sm leading-relaxed text-foreground/85">{children}</div>
          )}
        </div>
      </div>
    </aside>
  );
}
