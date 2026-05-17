import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

const TITLES: Record<string, string> = {
  "/": "Rave Safe",
  "/log": "Protokoll",
  "/mix": "Mix-Check",
  "/risks": "Risiken",
  "/substances": "Substanzen",
  "/knigge": "Knigge",
  "/chat": "KI-Chat",
  "/stats": "Statistik",
  "/about": "Über",
  "/settings": "Profil",
  "/onboarding": "Onboarding",
};

function titleFor(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/substances/")) return "Substanz";
  return "";
}

export function TopBar({ rightSlot }: { rightSlot?: React.ReactNode }) {
  const loc = useLocation();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = loc.pathname === "/";
  const title = titleFor(loc.pathname);

  return (
    <header
      className={`sticky top-0 z-40 safe-top transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-2xl bg-background/65 border-b border-white/[0.05]"
          : "backdrop-blur-0 bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-3xl h-12 px-3 flex items-center gap-2">
        {!isHome ? (
          <button
            onClick={() => router.history.back()}
            aria-label="Zurück"
            className="pressable flex items-center gap-0.5 -ml-1 px-2 h-9 rounded-full text-accent hover:bg-white/5"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm">Zurück</span>
          </button>
        ) : (
          <Link
            to="/"
            className="flex items-center gap-2 pressable"
            aria-label="Home"
          >
            <span className="h-7 w-7 rounded-xl bg-accent-gradient glow grid place-items-center text-[10px] font-bold text-primary-foreground">
              RS
            </span>
          </Link>
        )}
        <div className={`flex-1 text-center text-sm font-semibold tracking-tight transition-opacity ${scrolled ? "opacity-100" : "opacity-0"}`}>
          {title}
        </div>
        <div className="min-w-[64px] flex justify-end items-center gap-1">
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
