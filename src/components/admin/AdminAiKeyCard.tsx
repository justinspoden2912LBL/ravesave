import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Key, Loader2 } from "lucide-react";
import { adminGetAiKeyStatus, adminTestAiKey } from "@/lib/adminAiKey.functions";

export function AdminAiKeyCard() {
  const [authenticated, setAuthenticated] = useState(true);
  const [hasEnvKey, setHasEnvKey] = useState(false);
  const [last4, setLast4] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  async function refresh() {
    const s = await adminGetAiKeyStatus();
    setAuthenticated(s.authenticated);
    setHasEnvKey(s.hasEnvKey);
    setLast4(s.last4);
  }

  useEffect(() => {
    refresh()
      .catch(() => setMsg({ text: "Status konnte nicht geladen werden.", error: true }))
      .finally(() => setLoading(false));
  }, []);

  async function test() {
    setMsg(null);
    setLoading(true);
    try {
      await adminTestAiKey();
      setMsg({ text: "Verbindung zu Groq erfolgreich." });
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Test fehlgeschlagen.", error: true });
    } finally {
      setLoading(false);
    }
  }

  if (!authenticated)
    return (
      <section className="border border-border p-5">
        <p className="text-sm">Bitte zuerst unter /admin anmelden.</p>
      </section>
    );

  return (
    <section className="space-y-4 border border-border p-5">
      <div className="flex items-center gap-2">
        <Key className="text-muted-foreground" size={20} />
        <h3 className="text-lg font-medium">Groq API-Key</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {hasEnvKey ? `Gesetzt · …${last4}` : "Nicht gesetzt"}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        Der Key wird ausschliesslich serverseitig über die Environment Variable{" "}
        <code className="text-foreground">GROQ_API_KEY</code> geladen. Er wird nicht in der
        Datenbank, im Browser oder im LocalStorage gespeichert und kann hier nur getestet werden.
      </p>

      <button
        type="button"
        onClick={test}
        disabled={loading}
        className="inline-flex items-center gap-2 border border-primary/40 px-4 py-2 text-sm text-primary disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Verbindung testen
      </button>

      {msg && (
        <p className={`text-sm ${msg.error ? "text-destructive" : "text-emerald-400"}`}>
          {msg.error ? (
            <AlertCircle className="mr-1 inline h-4 w-4" />
          ) : (
            <CheckCircle className="mr-1 inline h-4 w-4" />
          )}
          {msg.text}
        </p>
      )}
    </section>
  );
}
