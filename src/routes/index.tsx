import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  ChevronDown,
  GitMerge,
  HeartPulse,
  MessageCircle,
  Shield,
  ShieldAlert,
  Sparkles,
  UserCircle2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SUBSTANCES } from "@/lib/substances";
import { loadProfile, isDismissed, dismissOnboarding } from "@/lib/profile";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Rave Safe, have Fun — Harm Reduction Companion" },
      { name: "description", content: "Konsum protokollieren, Mischkonsum prüfen, Substanzen verstehen — alles lokal im Browser." },
      { property: "og:title", content: "Rave Safe, have Fun — Harm Reduction Companion" },
      { property: "og:description", content: "Konsum protokollieren, Mischkonsum prüfen, Substanzen verstehen — alles lokal im Browser." },
      { property: "og:url", content: "https://ravesave.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.lovable.app/" }],
  }),
});

function Home() {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!loadProfile() && !isDismissed()) {
      setShowPrompt(true);
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4">
      {showPrompt && (
        <div className="mt-6 rounded-2xl glass p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-5 border border-primary/30">
          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs text-secondary">
              <UserCircle2 className="h-3.5 w-3.5" /> Erstes Mal hier?
            </div>
            <h2 className="text-lg md:text-xl font-semibold leading-snug">
              Richte dein Profil ein — ca. 2 Minuten.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
              Damit Dosis-Hinweise, Mischkonsum-Checks und KI-Antworten zu dir passen.
              Komplett lokal, jederzeit löschbar.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate({ to: "/onboarding" })}
              className="inline-flex items-center gap-2 rounded-full bg-aurora animate-aurora px-6 py-3 text-sm font-semibold text-primary-foreground glow ring-2 ring-primary/40 hover:scale-[1.02] transition"
            >
              <Sparkles className="h-4 w-4" /> Jetzt starten
            </button>
            <button
              onClick={() => { dismissOnboarding(); setShowPrompt(false); }}
              className="inline-flex items-center justify-center rounded-full p-3 min-h-11 min-w-11 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
              title="Später"
              aria-label="Onboarding-Hinweis schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl glass mt-8 p-8 md:p-14">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-aurora animate-aurora opacity-40 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-aurora animate-aurora opacity-30 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
            <Shield className="h-3.5 w-3.5 text-secondary" />
            <span>100% lokal — keine Daten verlassen dein Gerät</span>
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            <span className="text-aurora animate-aurora bg-aurora bg-clip-text">Rave Safe</span>
            <span className="text-foreground">, have </span>
            <span className="text-aurora animate-aurora bg-aurora bg-clip-text">Fun</span>
            <br />
            <span className="text-foreground/80 text-2xl md:text-4xl font-medium">Wissen statt Bauchgefühl.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-muted-foreground text-lg">
            Protokolliere deinen Konsum, prüfe Mischkonsum-Risiken in Echtzeit
            und greife auf evidenzbasierte Informationen zu {SUBSTANCES.length}+ Substanzen zu.
            Ohne Belehrung, ohne Drama — nur Fakten.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/log"
              className="inline-flex items-center gap-2 rounded-full bg-aurora animate-aurora px-6 py-3 text-sm font-semibold text-primary-foreground glow transition-transform hover:scale-105"
            >
              <Activity className="h-4 w-4" /> Eintrag anlegen
            </Link>
            <Link
              to="/mix"
              className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted/40"
            >
              <GitMerge className="h-4 w-4" /> Mischkonsum prüfen
            </Link>
          </div>
        </div>
      </section>

      {/* Category hub — kompakt, klappt einzeln auf */}
      <section className="mt-8 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
            Was möchtest du tun?
          </h2>
          <span className="text-xs text-muted-foreground">Zum Öffnen antippen</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <CategoryCard
            icon={Activity}
            title="Tracken"
            subtitle="Konsum & Stimmung dokumentieren"
            items={[
              { to: "/log", icon: Activity, label: "Eintrag anlegen", desc: "Substanz, Dosis, Set & Setting." },
              { to: "/stats", icon: Sparkles, label: "Statistik", desc: "Muster, Häufigkeiten, Trends." },
            ]}
          />
          <CategoryCard
            icon={ShieldAlert}
            title="Risiko prüfen"
            subtitle="Bevor du kombinierst"
            items={[
              { to: "/mix", icon: GitMerge, label: "Mischkonsum-Check", desc: "Ampel für 2+ Substanzen." },
              { to: "/risks", icon: ShieldAlert, label: "Risiko-Übersicht", desc: "Alle Paarungen pro Substanz." },
            ]}
          />
          <CategoryCard
            icon={BookOpen}
            title="Lernen"
            subtitle="Pharmakologie verstehen"
            items={[
              { to: "/substances", icon: BookOpen, label: "Substanz-Wiki", desc: `${SUBSTANCES.length}+ Substanzen, gruppiert.` },
              { to: "/chat", icon: MessageCircle, label: "KI-Chat", desc: "Fragen zur Studienlage stellen." },
            ]}
          />
          <CategoryCard
            icon={HeartPulse}
            title="Notfall & Profil"
            subtitle="Vorbereitet sein"
            items={[
              { to: "/settings", icon: UserCircle2, label: "Profil & Notfallpass", desc: "Erfahrung, Beruf, Notfallplan." },
            ]}
          />
        </div>
      </section>

      {/* Principles */}
      <section className="mt-12 rounded-3xl glass p-8">
        <h2 className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" /> Grundprinzipien
        </h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <Principle title="Start low, go slow.">
            Beginne immer mit der niedrigsten Dosis — besonders bei neuen Substanzen oder Chargen.
          </Principle>
          <Principle title="Test, was du nimmst.">
            Drug-Checking-Angebote (z.B. checkit!, Saferparty, DIMS) nutzen. Reagenztests sind ein Minimum.
          </Principle>
          <Principle title="Mischkonsum ist der größte Risikofaktor.">
            Die meisten Notfälle entstehen durch Kombinationen — vor allem Atemdepressiva untereinander.
          </Principle>
          <Principle title="Sei nicht allein.">
            Eine nüchterne Vertrauensperson ist die wirksamste Sicherheitsmaßnahme. Im Notfall: 112.
          </Principle>
        </div>
      </section>
    </div>
  );
}

type CatItem = { to: string; icon: LucideIcon; label: string; desc: string };

function CategoryCard({
  icon: Icon,
  title,
  subtitle,
  items,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  items: CatItem[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl glass overflow-hidden transition-all hover:ring-1 hover:ring-primary/30 ${
        open ? "ring-1 ring-primary/40" : ""
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-4 text-left cursor-pointer hover:bg-muted/30 focus-visible:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition"
        aria-expanded={open}
        aria-label={`${title}: ${open ? "zuklappen" : "aufklappen"}`}
      >
        <div className="h-10 w-10 shrink-0 rounded-xl bg-aurora animate-aurora grid place-items-center text-primary-foreground glow">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground truncate">{subtitle}</div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul className="px-3 pb-3 space-y-2 border-t border-border/40 pt-3">
          {items.map((it) => (
            <li key={it.to}>
              <Link
                to={it.to}
                className="group flex items-start gap-3 rounded-xl bg-background/40 border border-border/40 px-3 py-2.5 hover:bg-muted/30 transition"
              >
                <it.icon className="h-4 w-4 mt-0.5 text-aurora shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium group-hover:text-foreground">{it.label}</div>
                  <div className="text-[11px] text-muted-foreground">{it.desc}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Principle({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
