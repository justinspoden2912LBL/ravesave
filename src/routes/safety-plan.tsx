import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Users,
  Home,
  ListChecks,
  HeartPulse,
  CheckCircle2,
  Trash2,
  Edit3,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  createPlan,
  updatePlan,
  completePlan,
  getActivePlan,
  listPlans,
  loadPlan,
  deletePlan,
  setActivePlanId,
  type SafetyPlan,
} from "@/lib/safetyPlan";

export const Route = createFileRoute("/safety-plan")({
  component: SafetyPlanPage,
  head: () => ({
    meta: [
      { title: "Safety-Plan — Rave Safe, have Fun" },
      {
        name: "description",
        content:
          "Persönlicher Party-Safety-Plan: Vorsätze, Heimweg, Begleitung. Lokal gespeichert, Marleen kennt ihn.",
      },
      { property: "og:title", content: "Safety-Plan — Rave Safe, have Fun" },
      {
        property: "og:description",
        content: "In wenigen Schritten einen Plan für die Nacht erstellen.",
      },
      { property: "og:url", content: "https://ravesave.fun/safety-plan" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.fun/safety-plan" }],
  }),
});

function SafetyPlanPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<SafetyPlan | null>(null);
  const [editing, setEditing] = useState(false);
  const [past, setPast] = useState<ReturnType<typeof listPlans>>([]);
  const [tick, setTick] = useState(0); // refresh trigger

  useEffect(() => {
    const a = getActivePlan();
    setActive(a);
    setEditing(!a);
    setPast(listPlans().filter((e) => e.status === "completed"));
  }, [tick]);

  function handleSaved(p: SafetyPlan) {
    setActive(p);
    setEditing(false);
    setTick((t) => t + 1);
  }

  function handleComplete() {
    if (!active) return;
    if (!confirm("Plan als abgeschlossen markieren? Du kannst danach einen neuen anlegen.")) return;
    const reflection = window.prompt(
      "Kurze Reflexion (optional): Was lief gut, was würdest du nächstes Mal anders machen?",
      "",
    );
    completePlan(active.id, reflection ?? undefined);
    setActive(null);
    setEditing(false);
    setTick((t) => t + 1);
  }

  function handleDeleteActive() {
    if (!active) return;
    if (!confirm("Aktiven Plan löschen?")) return;
    deletePlan(active.id);
    setActive(null);
    setEditing(true);
    setTick((t) => t + 1);
  }

  function handleReactivate(id: string) {
    const p = loadPlan(id);
    if (!p) return;
    if (!confirm("Diesen abgeschlossenen Plan wieder als aktiv setzen?")) return;
    // Markiere wieder als active und setze als active
    const reactivated = { ...p, status: "active" as const, updatedAt: new Date().toISOString() };
    // wiederverwenden: in localStorage schreiben + Index update über updatePlan mit leerem patch klappt nicht,
    // also direkt:
    try {
      window.localStorage.setItem(`ravesave.safetyplan:${p.id}`, JSON.stringify(reactivated));
    } catch {
      /* ignore */
    }
    setActivePlanId(p.id);
    setTick((t) => t + 1);
  }

  function handleDeletePast(id: string) {
    if (!confirm("Diesen Plan endgültig löschen?")) return;
    deletePlan(id);
    setTick((t) => t + 1);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6 pb-24">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-secondary">
          <ShieldCheck className="h-3.5 w-3.5" /> Safety-Plan
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Dein Plan für heute Nacht</h1>
        <p className="text-sm text-muted-foreground max-w-prose">
          In wenigen Feldern festhalten, was du dir vornimmst, mit wem du unterwegs bist und wie du
          heimkommst. Bleibt nur auf deinem Gerät — Marleen sieht eine kurze Zusammenfassung und
          erinnert dich freundlich daran.
        </p>
      </header>

      {!active && !editing && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="w-full rounded-2xl glass glass-shine border border-border p-6 text-left hover:bg-muted/10 transition"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-secondary/15 p-2 text-secondary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">Neuen Plan anlegen</div>
              <div className="text-xs text-muted-foreground">
                Dauert etwa 1 Minute. Nichts davon verlässt dein Gerät.
              </div>
            </div>
          </div>
        </button>
      )}

      {active && !editing && <ActiveSummary plan={active} onEdit={() => setEditing(true)} onComplete={handleComplete} onDelete={handleDeleteActive} />}

      {editing && (
        <PlanForm
          initial={active}
          onSaved={handleSaved}
          onCancel={() => {
            if (active) setEditing(false);
            else navigate({ to: "/" });
          }}
        />
      )}

      {past.length > 0 && (
        <section className="rounded-2xl glass border border-border/60 p-5 space-y-3">
          <h2 className="text-base font-semibold inline-flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-secondary" /> Frühere Nächte
          </h2>
          <ul className="divide-y divide-border/40">
            {past.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">{e.event || "Ohne Titel"}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(e.updatedAt).toLocaleString("de-DE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleReactivate(e.id)}
                    className="rounded-full px-2 py-1 text-[11px] ring-1 ring-border hover:ring-foreground/40"
                  >
                    Reaktivieren
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePast(e.id)}
                    className="rounded-full p-1.5 text-muted-foreground hover:text-destructive"
                    aria-label="Löschen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-[11px] text-muted-foreground">
        Alle Daten liegen lokal in deinem Browser. Du kannst sie jederzeit in den{" "}
        <Link to="/settings" className="underline">
          Einstellungen
        </Link>{" "}
        löschen.
      </p>
    </div>
  );
}

function ActiveSummary({
  plan,
  onEdit,
  onComplete,
  onDelete,
}: {
  plan: SafetyPlan;
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  return (
    <section className="rounded-2xl glass glass-shine border border-secondary/30 p-5 space-y-4 shine">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-secondary">Aktiver Plan</div>
          <h2 className="text-lg font-semibold">{plan.event || "Heute Nacht"}</h2>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 rounded-full glass px-3 py-1.5 text-xs hover:bg-muted/20"
        >
          <Edit3 className="h-3.5 w-3.5" /> Anpassen
        </button>
      </div>

      <ul className="space-y-2 text-sm">
        {plan.companions && (
          <Row icon={<Users className="h-4 w-4 text-secondary" />} label="Mit dabei" value={plan.companions} />
        )}
        {plan.homeRoute && (
          <Row icon={<Home className="h-4 w-4 text-secondary" />} label="Heimweg" value={plan.homeRoute} />
        )}
        {plan.intentions && (
          <Row
            icon={<ListChecks className="h-4 w-4 text-secondary" />}
            label="Vorsätze"
            value={plan.intentions}
          />
        )}
        <Row
          icon={<HeartPulse className={`h-4 w-4 ${plan.hasFirstAid ? "text-secondary" : "text-muted-foreground"}`} />}
          label="Erste-Hilfe / Naloxon"
          value={plan.hasFirstAid ? "dabei" : "nicht dabei"}
        />
      </ul>

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button
          type="button"
          onClick={onComplete}
          className="inline-flex items-center gap-2 rounded-full bg-secondary/95 px-4 py-2 text-sm font-semibold text-secondary-foreground shine hover:brightness-110"
        >
          <CheckCircle2 className="h-4 w-4" /> Plan abschließen
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" /> Verwerfen
        </button>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-secondary" /> Marleen kennt diesen Plan
        </span>
      </div>
    </section>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl bg-muted/10 px-3 py-2">
      <span className="mt-0.5">{icon}</span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm whitespace-pre-wrap break-words">{value}</div>
      </div>
    </li>
  );
}

function PlanForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: SafetyPlan | null;
  onSaved: (p: SafetyPlan) => void;
  onCancel: () => void;
}) {
  const [event, setEvent] = useState(initial?.event ?? "");
  const [companions, setCompanions] = useState(initial?.companions ?? "");
  const [homeRoute, setHomeRoute] = useState(initial?.homeRoute ?? "");
  const [intentions, setIntentions] = useState(
    initial?.intentions ??
      "• Alle 60–90 Minuten Wasser\n• Mindestens eine längere Pause\n• Maximal 2 Konsum-Ereignisse",
  );
  const [hasFirstAid, setHasFirstAid] = useState(initial?.hasFirstAid ?? false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      event: event.trim(),
      companions: companions.trim(),
      homeRoute: homeRoute.trim(),
      intentions: intentions.trim(),
      hasFirstAid,
      // Check-ins kommen in Schritt 2 — Defaults beibehalten
      checkInsEnabled: initial?.checkInsEnabled ?? false,
      checkInIntervalMin: initial?.checkInIntervalMin ?? 75,
    };
    if (!data.event && !data.intentions) {
      alert("Trag mindestens Event/Ort ODER deine Vorsätze ein.");
      return;
    }
    const saved = initial ? updatePlan(initial.id, data) : createPlan(data);
    if (saved) onSaved(saved);
  }

  const inputCls =
    "w-full rounded-xl bg-background/60 border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40";
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1";

  return (
    <form onSubmit={submit} className="rounded-2xl glass border border-border p-5 space-y-4">
      <div>
        <label className={labelCls} htmlFor="sp-event">Event / Ort</label>
        <input
          id="sp-event"
          type="text"
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          maxLength={120}
          placeholder="z.B. Club X, Festival Y"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="sp-companions">Mit wem bist du unterwegs?</label>
        <input
          id="sp-companions"
          type="text"
          value={companions}
          onChange={(e) => setCompanions(e.target.value)}
          maxLength={200}
          placeholder="Namen oder Spitznamen, ggf. nüchterne Begleitung"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="sp-home">Wie kommst du heim?</label>
        <input
          id="sp-home"
          type="text"
          value={homeRoute}
          onChange={(e) => setHomeRoute(e.target.value)}
          maxLength={200}
          placeholder="Nachtbus, Taxi, Freund:in, Schlafplatz …"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="sp-intent">Was nimmst du dir vor?</label>
        <textarea
          id="sp-intent"
          value={intentions}
          onChange={(e) => setIntentions(e.target.value)}
          maxLength={800}
          rows={4}
          placeholder="Konkrete Vorsätze für die Nacht — eine pro Zeile."
          className={inputCls + " resize-y"}
        />
      </div>

      <label className="flex items-start gap-3 rounded-xl bg-muted/10 p-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={hasFirstAid}
          onChange={(e) => setHasFirstAid(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-secondary"
        />
        <span>
          <strong>Erste-Hilfe / Naloxon dabei</strong>
          <span className="block text-xs text-muted-foreground mt-0.5">
            Wenn relevant: hast du jemanden, der notfalls reagieren kann?
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground shine hover:brightness-110"
        >
          <CheckCircle2 className="h-4 w-4" /> {initial ? "Plan speichern" : "Plan starten"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
