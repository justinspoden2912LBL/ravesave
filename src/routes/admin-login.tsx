import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isAdminEmail } from '@/lib/admin';

export const Route = createFileRoute('/admin-login')({ component: AdminLogin });

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('justin.spoden2912@gmail.com');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function sendMagicLink(event: React.FormEvent) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!isAdminEmail(normalizedEmail)) {
      setMessage('Diese E-Mail-Adresse ist nicht für den Adminzugang freigeschaltet.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const redirectTo = `${window.location.origin}/admin-login`;
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setMessage('Der Magic Link wurde an die Admin-E-Mail-Adresse gesendet.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Magic Link konnte nicht gesendet werden.');
    } finally {
      setBusy(false);
    }
  }

  async function continueAfterCallback() {
    const { data } = await supabase.auth.getSession();
    if (data.session && isAdminEmail(data.session.user.email)) {
      await navigate({ to: '/admin' });
    }
  }

  return (
    <main className="container mx-auto max-w-lg p-6">
      <h1 className="text-3xl font-bold">Admin-Login</h1>
      <p className="mt-2 text-muted-foreground">Fordere einen sicheren Magic Link an.</p>
      <form className="mt-6 space-y-4" onSubmit={sendMagicLink}>
        <label className="block">
          <span className="text-sm font-medium">Admin-E-Mail</span>
          <input className="mt-1 w-full rounded-md border bg-background p-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        </label>
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" type="submit" disabled={busy}>
          {busy ? 'Wird gesendet …' : 'Magic Link senden'}
        </button>
      </form>
      <button className="mt-4 text-sm underline" type="button" onClick={continueAfterCallback}>Nach Link-Klick fortfahren</button>
      {message && <p className="mt-4 text-sm" role="status">{message}</p>}
    </main>
  );
}
