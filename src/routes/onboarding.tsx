import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Heart,
  Flame,
  Moon,
  Users,
  User,
  Brain,
  Zap,
  Compass,
  Beaker,
  Music,
  Briefcase,
} from "lucide-react";
import {
  emptyProfile,
  saveProfile,
  dismissOnboarding,
  loadProfile,
  PROFESSION_LABEL,
  EXPERTISE_LABEL,
  type UserProfile,
  type SubstanceExperience,
  type Frequency,
  type RouteForm,
  type UsageContext,
  type Motivation,
  type Profession,
  type ExpertiseLevel,
} from "@/lib/profile";
import { SUBSTANCES } from "@/lib/substances";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
  head: () => ({ meta: [{ title: "Dein Profil — Rave Safe, have Fun" }] }),
});

const FREQS: { v: Frequency; label: string }[] = [
  { v: "never", label: "nie" },
  { v: "tried_once", label: "1×" },
  { v: "rare", label: "selten" },
  { v: "monthly", label: "monatlich" },
  { v: "weekly", label: "wöchentlich" },
  { v: "daily", label: "täglich" },
];

const ROUTES: { v: RouteForm; label: string }[] = [
  { v: "oral", label: "oral" },
  { v: "nasal", label: "nasal" },
  { v: "inhaled", label: "inhaliert" },
  { v: "smoked", label: "geraucht" },
  { v: "sublingual", label: "sublingual" },
  { v: "rectal", label: "rektal" },
  { v: "im", label: "i.m." },
  { v: "iv", label: "i.v." },
  { v: "transdermal", label: "transdermal" },
];

const CONTEXTS: { v: UsageContext; label: string; Icon: any }[] = [
  { v: "party", label: "Party", Icon: Music },
  { v: "social", label: "Sozial", Icon: Users },
  { v: "alone", label: "Allein", Icon: User },
  { v: "functional", label: "Funktional / Alltag", Icon: Briefcase },
  { v: "creative", label: "Kreativ", Icon: Sparkles },
  { v: "therapeutic", label: "Therapeutisch", Icon: Heart },
  { v: "spiritual", label: "Spirituell", Icon: Compass },
  { v: "sleep", label: "Schlaf", Icon: Moon },
];

const MOTIVATIONS: { v: Motivation; label: string; Icon: any }[] = [
  { v: "fun", label: "Spaß", Icon: Flame },
  { v: "curiosity", label: "Neugier", Icon: Sparkles },
  { v: "connection", label: "Verbindung", Icon: Heart },
  { v: "research", label: "Selbsterforschung", Icon: Compass },
  { v: "performance", label: "Leistung", Icon: Zap },
  { v: "coping", label: "Stressbewältigung", Icon: Brain },
  { v: "selfmed", label: "Selbstmedikation", Icon: Beaker },
  { v: "escape", label: "Eskapismus", Icon: Moon },
];

const STEPS = ["Hallo", "Über dich", "Erfahrung", "Settings", "Motivation", "Gesundheit", "Fertig"] as const;

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [p, setP] = useState<UserProfile>(() => loadProfile() ?? emptyProfile());

  function update<K extends keyof UserProfile>(k: K, v: UserProfile[K]) {
    setP((prev) => ({ ...prev, [k]: v }));
  }

  function toggleArr<T>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  function setExp(name: string, patch: Partial<SubstanceExperience>) {
    setP((prev) => {
      const exists = prev.experiences.find((e) => e.substance === name);
      const next: SubstanceExperience = exists
        ? { ...exists, ...patch }
        : { substance: name, frequency: "never", routes: [], ...patch };
      const without = prev.experiences.filter((e) => e.substance !== name);
      return { ...prev, experiences: [...without, next] };
    });
  }

  function getExp(name: string): SubstanceExperience {
    return p.experiences.find((e) => e.substance === name) ?? { substance: name, frequency: "never", routes: [] };
  }

  function finish() {
    saveProfile({ ...p, experiences: p.experiences.filter((e) => e.frequency !== "never" || e.routes.length > 0) });
    navigate({ to: "/" });
  }

  function skip() {
    dismissOnboarding();
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* progress */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i <= step ? "bg-aurora animate-aurora" : "bg-muted/40"
            }`}
          />
        ))}
      </div>

      <div className="rounded-3xl glass p-6 md:p-10">
        {step === 0 && (
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-secondary" /> ~2 Minuten · komplett lokal
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Hey. <span className="text-aurora bg-aurora animate-aurora bg-clip-text">Erzähl uns</span> kurz von dir.
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Damit Rave Safe, have Fun dir relevantere Hinweise geben kann — bessere Dosis-Bereiche, präzisere
              Wechselwirkungs-Checks, eine KI, die weiß, wovon du sprichst. Es geht nicht um Bewertung.
              Du entscheidest, was du teilst, alles bleibt auf deinem Gerät.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><Check className="h-4 w-4 text-secondary mt-0.5" /> Keine Konten, keine Cloud, kein Tracking.</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-secondary mt-0.5" /> Jede Frage ist optional — überspring, was du nicht teilen willst.</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-secondary mt-0.5" /> Jederzeit in den Einstellungen änder- oder löschbar.</li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-full bg-aurora animate-aurora px-6 py-3 text-sm font-semibold text-primary-foreground glow">
                Los geht's <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={skip} className="rounded-full px-5 py-3 text-sm text-muted-foreground hover:text-foreground">
                Später
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Über dich</h2>
            <Field label="Wie sollen wir dich nennen? (optional)">
              <input
                value={p.nickname ?? ""}
                onChange={(e) => update("nickname", e.target.value)}
                placeholder="z.B. Nova"
                className="w-full rounded-xl bg-background/40 px-4 py-2.5 outline-none ring-1 ring-border focus:ring-primary"
              />
            </Field>
            <Field label="Altersgruppe">
              <Chips
                options={[
                  { v: "u18", label: "<18" },
                  { v: "18-24", label: "18–24" },
                  { v: "25-34", label: "25–34" },
                  { v: "35-44", label: "35–44" },
                  { v: "45+", label: "45+" },
                ]}
                value={p.ageRange ?? ""}
                onSelect={(v) => update("ageRange", v as any)}
              />
            </Field>
            <Field label="Körpergewicht (kg) — hilft bei Dosis-Schätzungen">
              <input
                type="number"
                value={p.bodyWeightKg ?? ""}
                onChange={(e) => update("bodyWeightKg", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="z.B. 72"
                className="w-32 rounded-xl bg-background/40 px-4 py-2.5 outline-none ring-1 ring-border focus:ring-primary"
              />
            </Field>

            <Field label="Wie tief sollen Erklärungen sein? — bestimmt Sprache & Fachtiefe in der ganzen App.">
              <div className="space-y-1.5">
                {(Object.keys(EXPERTISE_LABEL) as ExpertiseLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => update("expertiseLevel", lvl)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-sm ring-1 transition ${
                      p.expertiseLevel === lvl ? "ring-primary bg-primary/10" : "ring-border hover:ring-foreground/30"
                    }`}
                  >
                    {EXPERTISE_LABEL[lvl]}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Beruflicher Hintergrund (optional) — Fachberufe schalten den Expert-Modus frei.">
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(PROFESSION_LABEL) as Profession[]).map((pr) => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => update("profession", pr)}
                    className={`text-left rounded-xl px-3 py-2 text-xs ring-1 transition ${
                      p.profession === pr ? "ring-primary bg-primary/10" : "ring-border hover:ring-foreground/30"
                    }`}
                  >
                    {PROFESSION_LABEL[pr]}
                  </button>
                ))}
              </div>
            </Field>

            <NavRow onBack={() => setStep(0)} onNext={() => setStep(2)} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold">Erfahrung</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Häufigkeit & Applikationsform pro Substanz. Lass leer, was nicht zutrifft — du kannst es jederzeit ergänzen.
              </p>
            </div>
            <div className="max-h-[420px] overflow-y-auto pr-2 space-y-2">
              {SUBSTANCES.map((s) => {
                const e = getExp(s.name);
                const active = e.frequency !== "never" || e.routes.length > 0;
                return (
                  <details
                    key={s.id}
                    className={`rounded-xl ring-1 transition ${active ? "ring-primary/50 bg-primary/5" : "ring-border"}`}
                  >
                    <summary className="cursor-pointer list-none px-4 py-2.5 flex items-center justify-between">
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {active ? `${e.frequency} · ${e.routes.join("/") || "—"}` : "tippen"}
                      </span>
                    </summary>
                    <div className="px-4 pb-3 space-y-2">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Häufigkeit</div>
                        <Chips
                          options={FREQS.map((f) => ({ v: f.v, label: f.label }))}
                          value={e.frequency}
                          onSelect={(v) => setExp(s.name, { frequency: v as Frequency })}
                        />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Applikation</div>
                        <Chips
                          multi
                          options={ROUTES.map((r) => ({ v: r.v, label: r.label }))}
                          values={e.routes}
                          onToggle={(v) =>
                            setExp(s.name, { routes: toggleArr(e.routes, v as RouteForm) })
                          }
                        />
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
            <NavRow onBack={() => setStep(1)} onNext={() => setStep(3)} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">In welchen Settings?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Mehrfachauswahl. Hilft uns, Kontext-spezifische Hinweise zu geben (z.B. Hitze auf Festivals, Mischkonsum-Trigger).
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CONTEXTS.map(({ v, label, Icon }) => {
                const on = p.contexts.includes(v);
                return (
                  <button
                    key={v}
                    onClick={() => update("contexts", toggleArr(p.contexts, v))}
                    className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-sm transition ${
                      on ? "bg-aurora animate-aurora text-primary-foreground glow" : "glass hover:bg-muted/30"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                );
              })}
            </div>

            <Field label="Typisches Intervall">
              <Chips
                options={[
                  { v: "daily", label: "täglich" },
                  { v: "weekly", label: "wöchentlich" },
                  { v: "monthly", label: "monatlich" },
                  { v: "occasional", label: "gelegentlich" },
                  { v: "rare", label: "sehr selten" },
                ]}
                value={p.typicalInterval ?? ""}
                onSelect={(v) => update("typicalInterval", v as any)}
              />
            </Field>
            <NavRow onBack={() => setStep(2)} onNext={() => setStep(4)} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Was holst du dir daraus?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Kein richtig oder falsch — Motivation ist individuell und ändert sich.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {MOTIVATIONS.map(({ v, label, Icon }) => {
                const on = p.motivations.includes(v);
                return (
                  <button
                    key={v}
                    onClick={() => update("motivations", toggleArr(p.motivations, v))}
                    className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-sm transition ${
                      on ? "bg-aurora animate-aurora text-primary-foreground glow" : "glass hover:bg-muted/30"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                );
              })}
            </div>
            <Field label="Eigene Safer-Use-Ziele (optional)">
              <textarea
                value={p.saferUseGoals}
                onChange={(e) => update("saferUseGoals", e.target.value)}
                rows={3}
                placeholder="z.B. „Pausen einbauen, nie mit Alkohol mischen, Drug-Checking nutzen"
                className="w-full rounded-xl bg-background/40 px-4 py-2.5 outline-none ring-1 ring-border focus:ring-primary resize-none"
              />
            </Field>
            <NavRow onBack={() => setStep(3)} onNext={() => setStep(5)} />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Gesundheit</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Wichtig für Wechselwirkungs-Checks. Bleibt lokal.
              </p>
            </div>
            <Field label="Medikamente (regelmäßig oder bedarfsweise)">
              <textarea
                value={p.medications}
                onChange={(e) => update("medications", e.target.value)}
                rows={3}
                placeholder="z.B. SSRIs (Sertralin 50mg), Lisdexamfetamin, MAO-Hemmer …"
                className="w-full rounded-xl bg-background/40 px-4 py-2.5 outline-none ring-1 ring-border focus:ring-primary resize-none"
              />
            </Field>
            <Field label="Vorerkrankungen (körperlich / psychisch)">
              <textarea
                value={p.preexistingConditions}
                onChange={(e) => update("preexistingConditions", e.target.value)}
                rows={3}
                placeholder="z.B. Asthma, ADHS, Bipolar, Long-QT, Leber …"
                className="w-full rounded-xl bg-background/40 px-4 py-2.5 outline-none ring-1 ring-border focus:ring-primary resize-none"
              />
            </Field>
            <Field label="Suchterkrankung">
              <Chips
                options={[
                  { v: "none", label: "keine" },
                  { v: "past", label: "in der Vergangenheit" },
                  { v: "current", label: "aktuell" },
                  { v: "unsure", label: "unsicher" },
                ]}
                value={p.pastAddiction}
                onSelect={(v) => update("pastAddiction", v as any)}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={p.inTreatment}
                onChange={(e) => update("inTreatment", e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Aktuell in Behandlung / Therapie
            </label>
            <NavRow onBack={() => setStep(4)} onNext={() => setStep(6)} />
          </div>
        )}

        {step === 6 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold">Fertig.</h2>
            <p className="text-muted-foreground">
              Dein Profil wird ausschließlich lokal in deinem Browser gespeichert. Du kannst es jederzeit
              ändern oder löschen unter <Link to="/settings" className="underline">Einstellungen</Link>.
            </p>
            <label className="flex items-start gap-3 rounded-xl glass p-4 text-sm">
              <input
                type="checkbox"
                checked={p.shareWithAI}
                onChange={(e) => update("shareWithAI", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span>
                <strong>Profil mit KI-Chat teilen.</strong>
                <span className="block text-muted-foreground mt-1">
                  Wenn aktiv, bekommt die KI dein Profil als Kontext, um dir präzisere Antworten zu geben.
                  Wird pro Anfrage mitgeschickt — kein dauerhafter Speicher beim Anbieter.
                </span>
              </span>
            </label>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setStep(5)} className="inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm">
                <ArrowLeft className="h-4 w-4" /> Zurück
              </button>
              <button onClick={finish} className="inline-flex items-center gap-2 rounded-full bg-aurora animate-aurora px-6 py-3 text-sm font-semibold text-primary-foreground glow">
                <Check className="h-4 w-4" /> Profil speichern
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function NavRow({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex justify-between pt-2">
      <button onClick={onBack} className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm">
        <ArrowLeft className="h-4 w-4" /> Zurück
      </button>
      <button onClick={onNext} className="inline-flex items-center gap-2 rounded-full bg-aurora animate-aurora px-6 py-2.5 text-sm font-semibold text-primary-foreground glow">
        Weiter <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Chips({
  options,
  value,
  values,
  onSelect,
  onToggle,
  multi,
}: {
  options: { v: string; label: string }[];
  value?: string;
  values?: string[];
  onSelect?: (v: string) => void;
  onToggle?: (v: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = multi ? values?.includes(o.v) : value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => (multi ? onToggle?.(o.v) : onSelect?.(o.v))}
            className={`rounded-full px-3 py-1.5 text-xs transition ${
              on ? "bg-aurora animate-aurora text-primary-foreground glow" : "glass hover:bg-muted/30"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
