import { useEffect, useState } from "react";
import { Save, RefreshCw, Bot, Power } from "lucide-react";
import { adminGetAiSettings, adminUpdateAiSettings } from "@/lib/adminAi.functions";
import { DEFAULT_AI_SETTINGS, FREE_GROQ_MODELS, type AiSettings } from "@/lib/aiSettings";

export function AdminAiTab() {
  const [s, setS] = useState<AiSettings>(DEFAULT_AI_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = (await adminGetAiSettings()) as AiSettings | null;
      if (!res) {
        setErr("Admin-Sitzung abgelaufen — bitte neu anmelden.");
      } else {
        setS(res);
        setErr(null);
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function save() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      await adminUpdateAiSettings({ data: s });
      setMsg("Gespeichert — wirkt innerhalb von ~20 Sekunden.");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  const set = <K extends keyof AiSettings>(k: K, v: AiSettings[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  if (loading) {
    return <p className="text-sm text-muted-foreground">Lade KI-Einstellungen…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4 space-y-1">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Bot className="h-4 w-4" /> Marleen (KI)
        </h2>
        <p className="text-xs text-muted-foreground">
          Marleen läuft über ein kostenfreies Modell (Groq Free-Tier) — keine Credits, keine
          Freigabe nötig. Hier legst du fest, was sie darf und wie sie antwortet.
        </p>
      </div>

      {err && <p className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive">{err}</p>}
      {msg && <p className="rounded-xl bg-primary/10 p-3 text-xs">{msg}</p>}

      <section className="glass rounded-2xl p-4 space-y-3">
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium inline-flex items-center gap-2">
            <Power className="h-4 w-4" /> Marleen aktiv
          </span>
          <input
            type="checkbox"
            className="h-5 w-9"
            checked={s.enabled}
            onChange={(e) => set("enabled", e.target.checked)}
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Aus = der Chat zeigt nur noch deinen Offline-Hinweis, die restliche App bleibt nutzbar.
        </p>

        <div>
          <label className="text-xs font-medium">Text, wenn Marleen aus ist</label>
          <textarea
            rows={2}
            value={s.disabled_message}
            onChange={(e) => set("disabled_message", e.target.value)}
            className="mt-1 w-full rounded-xl glass px-3 py-2 text-sm"
          />
        </div>
      </section>

      <section className="glass rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-semibold">Modell (alle kostenfrei)</h3>
        <select
          value={s.model}
          onChange={(e) => set("model", e.target.value)}
          className="w-full rounded-xl glass px-3 py-2 text-sm"
        >
          {FREE_GROQ_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          {FREE_GROQ_MODELS.find((m) => m.id === s.model)?.hint ?? "Eigenes Groq-Modell."}
        </p>

        <div>
          <label className="text-xs font-medium">Notfall-Fallback (nur falls Groq ausfällt)</label>
          <select
            value={s.fallback_model}
            onChange={(e) => set("fallback_model", e.target.value)}
            className="mt-1 w-full rounded-xl glass px-3 py-2 text-sm"
          >
            <option value="google/gemini-2.5-flash">Gemini 2.5 Flash (günstig)</option>
            <option value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (günstigst)</option>
            <option value="google/gemini-2.5-pro">Gemini 2.5 Pro (teurer)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium">Anbieter</label>
          <select
            value={s.provider}
            onChange={(e) => set("provider", e.target.value as AiSettings["provider"])}
            className="mt-1 w-full rounded-xl glass px-3 py-2 text-sm"
          >
            <option value="auto">Automatisch: erst kostenfrei, dann Fallback</option>
            <option value="groq">Nur kostenfrei (Groq) — nie Credits verbrauchen</option>
            <option value="lovable">Nur Fallback-Anbieter</option>
          </select>
        </div>
      </section>

      <section className="glass rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-semibold">Verhalten &amp; Grenzen</h3>

        <div>
          <label className="text-xs font-medium">Standard-Antworttiefe</label>
          <select
            value={s.answer_style}
            onChange={(e) => set("answer_style", e.target.value as AiSettings["answer_style"])}
            className="mt-1 w-full rounded-xl glass px-3 py-2 text-sm"
          >
            <option value="einfach">Kurz &amp; einfach</option>
            <option value="normal">Normal</option>
            <option value="experte">Experte</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium">
            Kreativität ({s.temperature.toFixed(2)}) — niedrig = nüchterner
          </label>
          <input
            type="range"
            min={0}
            max={1.2}
            step={0.05}
            value={s.temperature}
            onChange={(e) => set("temperature", Number(e.target.value))}
            className="mt-1 w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium">Max. Nachrichten pro Chat</label>
            <input
              type="number"
              min={2}
              max={200}
              value={s.max_messages}
              onChange={(e) => set("max_messages", Number(e.target.value))}
              className="mt-1 w-full rounded-xl glass px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Anfragen pro Minute</label>
            <input
              type="number"
              min={1}
              max={120}
              value={s.rate_limit_per_min}
              onChange={(e) => set("rate_limit_per_min", Number(e.target.value))}
              className="mt-1 w-full rounded-xl glass px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium">Eigene Regeln (was Marleen tun soll)</label>
          <textarea
            rows={4}
            placeholder="z. B. Immer auf den Mischkonsum-Check verlinken. Antworten max. 6 Sätze."
            value={s.extra_rules}
            onChange={(e) => set("extra_rules", e.target.value)}
            className="mt-1 w-full rounded-xl glass px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium">Gesperrte Themen (eins pro Zeile)</label>
          <textarea
            rows={3}
            placeholder={"Beschaffung / Bezugsquellen\nSynthese-Anleitungen\nRechtsberatung"}
            value={s.blocked_topics}
            onChange={(e) => set("blocked_topics", e.target.value)}
            className="mt-1 w-full rounded-xl glass px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Zu diesen Themen lehnt Marleen freundlich ab und lenkt auf Harm Reduction um.
          </p>
        </div>
      </section>

      <div className="flex gap-2">
        <button
          onClick={() => void save()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" /> Speichern
        </button>
        <button
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Neu laden
        </button>
      </div>
    </div>
  );
}
