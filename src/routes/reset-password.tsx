import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Passwort zurücksetzen — RaveSave" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery token from the URL hash automatically
    // and emits a PASSWORD_RECOVERY event with an active session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(true);
      }
      setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setHasSession(true);
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) {
      setErr("Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== confirm) {
      setErr("Die Passwörter stimmen nicht überein.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      // Sign out so the recovery session doesn't stay logged in implicitly
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate({ to: "/admin" });
      }, 1800);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Aktualisierung fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <div className="p-10 text-center text-sm text-muted-foreground">Lade…</div>;
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl glass p-6 space-y-4 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-secondary/15 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-secondary" />
          </div>
          <h1 className="text-xl font-bold">Passwort aktualisiert</h1>
          <p className="text-sm text-muted-foreground">
            Du wirst gleich zum Login weitergeleitet…
          </p>
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl glass p-6 space-y-4 text-center">
          <h1 className="text-xl font-bold">Link ungültig oder abgelaufen</h1>
          <p className="text-sm text-muted-foreground">
            Bitte fordere einen neuen Reset-Link an.
          </p>
          <Link
            to="/admin"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-aurora animate-aurora px-4 py-2.5 text-sm font-semibold text-primary-foreground glow min-h-11"
          >
            <ArrowLeft className="h-4 w-4" /> Zurück zum Admin-Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={submit} className="rounded-2xl glass p-6 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-secondary" />
          <h1 className="text-xl font-bold">Neuen Admin-Schlüssel setzen</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Wähle einen neuen Admin-Schlüssel mit mindestens 8 Zeichen. Bewahre ihn sicher auf.
        </p>

        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1">
            Neuer Admin-Schlüssel
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-input px-3 py-2 text-sm"
            autoComplete="new-password"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1">
            Schlüssel bestätigen
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg bg-input px-3 py-2 text-sm"
            autoComplete="new-password"
          />
        </label>


        {err && (
          <p className="text-xs text-destructive" role="alert">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-aurora animate-aurora py-2.5 text-sm font-semibold text-primary-foreground glow disabled:opacity-50 min-h-11"
        >
          <KeyRound className="h-4 w-4" /> Passwort speichern
        </button>
      </form>
    </div>
  );
}
