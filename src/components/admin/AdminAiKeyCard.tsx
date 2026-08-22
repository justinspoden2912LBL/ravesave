import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Key, Loader2 } from "lucide-react";
import { adminGetAiKeyStatus, adminSetAiKey, adminTestAiKey } from "@/lib/adminAiKey.functions";

export function AdminAiKeyCard() {
  const [authenticated, setAuthenticated] = useState(true);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [hasEnvKey, setHasEnvKey] = useState(false);
  const [last4, setLast4] = useState("");
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  async function refresh() {
    const s = await adminGetAiKeyStatus();
    setAuthenticated(s.authenticated); setHasStoredKey(s.hasStoredKey); setHasEnvKey(s.hasEnvKey); setLast4(s.last4);
  }
  useEffect(() => { refresh().catch(() => setMsg({ text: "Status konnte nicht geladen werden.", error: true })).finally(() => setLoading(false)); }, []);

  async function save() {
    setMsg(null); setLoading(true);
    try { const r = await adminSetAiKey({ data: { groqApiKey: key, clear: false } }); setKey(""); setHasStoredKey(r.hasStoredKey); setLast4(r.last4); setMsg({ text: "Key gespeichert." }); }
    catch (e) { setMsg({ text: e instanceof Error ? e.message : "Speichern fehlgeschlagen.", error: true }); }
    finally { setLoading(false); }
  }
  async function clear() {
    setMsg(null); setLoading(true);
    try { await adminSetAiKey({ data: { clear: true } }); setHasStoredKey(false); setLast4(""); setMsg({ text: "Gespeicherter Key entfernt." }); }
    catch (e) { setMsg({ text: e instanceof Error ? e.message : "Löschen fehlgeschlagen.", error: true }); }
    finally { setLoading(false); }
  }
  async function test() {
    setMsg(null); setLoading(true);
    try { await adminTestAiKey({ data: { groqApiKey: key || undefined } }); setMsg({ text: "Verbindung zu Groq erfolgreich." }); }
    catch (e) { setMsg({ text: e instanceof Error ? e.message : "Test fehlgeschlagen.", error: true }); }
    finally { setLoading(false); }
  }

  if (!authenticated) return <section className="rounded-2xl glass border border-white/10 p-5"><p className="text-sm">Bitte zuerst unter /admin anmelden.</p></section>;
  return <section className="space-y-4 rounded-2xl glass border border-white/10 p-5">
    <div className="flex items-center gap-2"><Key className="text-muted-foreground" size={20} /><h3 className="text-lg font-medium">Groq API-Key</h3><span className="ml-auto text-xs text-muted-foreground">{hasStoredKey ? `Gespeichert · …${last4}` : hasEnvKey ? "Nur Vercel-Env" : "Nicht gesetzt"}</span></div>
    <div className="space-y-2"><label className="text-xs font-medium">Key eingeben</label><div className="flex gap-2"><input type={show ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} placeholder={hasStoredKey ? `••••••••${last4}` : "gsk_..."} className="w-full rounded-xl glass px-3 py-2 text-sm" autoComplete="off" /><button type="button" onClick={() => setShow((v) => !v)} className="rounded-xl border border-white/10 px-3 text-xs">{show ? "Hide" : "Show"}</button></div></div>
    <div className="flex flex-wrap gap-2"><button type="button" onClick={save} disabled={loading || key.trim().length < 8} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Speichern"}</button><button type="button" onClick={test} disabled={loading || (!key.trim() && !hasStoredKey && !hasEnvKey)} className="rounded-xl border border-primary/30 px-4 py-2 text-sm text-primary disabled:opacity-50">Testen</button>{hasStoredKey && <button type="button" onClick={clear} disabled={loading} className="rounded-xl border border-destructive/40 px-4 py-2 text-sm text-destructive disabled:opacity-50">Entfernen</button>}</div>
    {msg && <p className={`text-sm ${msg.error ? "text-destructive" : "text-emerald-400"}`}>{msg.error ? <AlertCircle className="mr-1 inline h-4 w-4" /> : <CheckCircle className="mr-1 inline h-4 w-4" />}{msg.text}</p>}
    <p className="text-xs text-muted-foreground">Der Key wird gespeichert und nur maskiert angezeigt.</p>
  </section>;
}
