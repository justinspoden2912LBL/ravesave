import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatMissingConfig, getPublicSupabaseConfig } from '@/lib/runtime-config';

const ADMIN_EMAIL = 'justin.spoden2912@gmail.com';

export const Route = createFileRoute('/admin-login')({ component: AdminLogin });

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const config = getPublicSupabaseConfig();

  async function sendMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== ADMIN_EMAIL) {
      setMessage('Diese E-Mail-Adresse ist nicht für den Adminzugang freigeschaltet.');
      return;
    }
    if (!config.configured) {
      setMessage(formatMissingConfig(config));
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { emailRedirectTo: `${window.location.origin}/admin-login` },
      });
      if (error) throw error;
      setMessage('Der Magic Link wurde gesendet. Bitte prüfe dein Postfach.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Magic Link konnte nicht gesendet werden.');
    } finally {
      setLoading(false);
    }
  }

  async function continueAfterCallback() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      setMessage(error.message);
      return;
    }
    if (data.session?.user.email?.toLowerCase() === ADMIN_EMAIL) {
      await navigate({ to: '/admin' });
      return;
    }
    setMessage('Keine gültige Admin-Session gefunden.');
  }

  return (
    <main className="container mx-auto max-w-lg p-6">
      <h1 className="text-3xl font-bold">Admin-Login</h1>
      <p className="mt-2 text-muted-foreground">Zugang ausschließlich per Magic Link.</p>
      {!config.configured && <p className="mt-4 rounded-md border p-3 text-sm" role="alert">{formatMissingConfig(config)}</p>}
      <form className="mt-6 space-y-4" onSubmit={sendMagicLink}>
        <label className="block">
          <span className="text-sm font-medium">Admin-E-Mail</span>
          <input className="mt-1 w-full rounded-md border bg-background p-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" disabled={loading || !config.configured}>
          {loading ? 'Wird gesendet …' : 'Magic Link senden'}
        </button>
      </form>
      <button className="mt-4 text-sm underline" type="button" onClick={continueAfterCallback}>Nach dem Link-Klick fortfahren</button>
      {message && <p className="mt-4 text-sm" role="status">{message}</p>}
    </main>
  );
}
