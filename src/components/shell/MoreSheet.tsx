import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  FlaskConical,
  HandHeart,
  Info,
  MessageCircle,
  Settings as SettingsIcon,
  ShieldAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect } from "react";

type Item = { to: string; label: string; desc: string; icon: LucideIcon };

const items: Item[] = [
  { to: "/risks", label: "Risiken", desc: "Wechselwirkungs-Matrix pro Substanz", icon: ShieldAlert },
  { to: "/knigge", label: "Knigge", desc: "Verhalten & Etikette beim Konsum", icon: HandHeart },
  { to: "/chat", label: "KI-Chat", desc: "Fragen zur Studienlage", icon: MessageCircle },
  { to: "/stats", label: "Statistik", desc: "Muster, Häufigkeiten, Trends", icon: FlaskConical },
  { to: "/about", label: "Über", desc: "Mission, Daten, Quellen", icon: Info },
  { to: "/settings", label: "Profil", desc: "Erfahrung, Sprache, Notfall", icon: SettingsIcon },
  { to: "/substances", label: "Substanz-Wiki", desc: "Pharmakologie & Profile", icon: BookOpen },
];

export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 animate-slide-up">
        <div className="mx-auto max-w-3xl p-3 safe-bottom">
          <div className="glass-strong rounded-3xl shadow-[var(--shadow-pop)] overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4">
              <div className="h-1 w-10 rounded-full bg-white/15 mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
              <h2 className="text-base font-semibold">Mehr</h2>
              <button
                onClick={onClose}
                aria-label="Schließen"
                className="pressable rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="p-3 grid gap-1.5 max-h-[60vh] overflow-y-auto">
              {items.map((it) => (
                <li key={it.to}>
                  <Link
                    to={it.to}
                    onClick={onClose}
                    className="pressable flex items-center gap-3 rounded-2xl p-3 hover:bg-white/5 transition-colors"
                  >
                    <span className="h-10 w-10 rounded-xl bg-white/5 ring-1 ring-white/10 grid place-items-center text-accent">
                      <it.icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium">{it.label}</span>
                      <span className="block text-[11px] text-muted-foreground truncate">{it.desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
