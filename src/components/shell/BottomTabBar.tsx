import { Link, useLocation } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  GitMerge,
  Home,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { MoreSheet } from "./MoreSheet";

type Tab = { to: string; label: string; icon: LucideIcon };

const tabs: Tab[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/log", label: "Protokoll", icon: Activity },
  { to: "/mix", label: "Mix", icon: GitMerge },
  { to: "/substances", label: "Wiki", icon: BookOpen },
];

export function BottomTabBar() {
  const loc = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Hauptnavigation"
        className="fixed bottom-0 inset-x-0 z-40 safe-bottom"
      >
        <div className="mx-auto max-w-3xl px-3 pb-2">
          <div className="glass-strong rounded-3xl shadow-[var(--shadow-pop)] px-2 py-1.5 grid grid-cols-5 gap-1">
            {tabs.map((t) => {
              const active =
                t.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(t.to);
              return <TabButton key={t.to} {...t} active={active} />;
            })}
            <button
              onClick={() => setMoreOpen(true)}
              aria-label="Mehr"
              className={`pressable flex flex-col items-center justify-center gap-0.5 h-12 rounded-2xl text-[10px] font-medium transition-colors ${
                moreOpen ? "text-accent" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span>Mehr</span>
            </button>
          </div>
        </div>
      </nav>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}

function TabButton({ to, label, icon: Icon, active }: Tab & { active: boolean }) {
  return (
    <Link
      to={to}
      className={`pressable relative flex flex-col items-center justify-center gap-0.5 h-12 rounded-2xl text-[10px] font-medium transition-colors ${
        active ? "text-accent" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {active && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-2xl bg-accent/10 ring-1 ring-accent/30"
        />
      )}
      <Icon className="relative h-5 w-5" />
      <span className="relative">{label}</span>
    </Link>
  );
}
