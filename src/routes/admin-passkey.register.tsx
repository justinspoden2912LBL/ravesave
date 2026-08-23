import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { requireConfiguredAdmin } from '@/lib/admin';

export const Route = createFileRoute('/admin-passkey/register')({ component: RegisterAdminPasskey });

function RegisterAdminPasskey() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function register() {
    setBusy(true);
    setMessage('Bitte Face ID, Touch ID oder Geräte-PIN bestätigen.');
    try {
      await requireConfiguredAdmin();
      const { error } = await supabase.auth.registerPasskey();
      if (error) throw error;
      setMessage('Passkey erfolgreich registriert.');
      await navigate({ to: '/admin' });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Passkey-Registrierung fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container mx-auto max-w-lg p-6">
      <h1 className="text-3xl font-bold">Admin-Passkey registrieren</h1>
      <p className="mt-2 text-muted-foreground">Registriere dieses Gerät als zusätzlichen Admin-Passkey.</p>
      <button className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={register} disabled={busy}>
        {busy ? 'Registrierung läuft …' : 'Passkey registrieren'}
      </button>
      {message && <p className="mt-4 text-sm" role="status">{message}</p>}
    </main>
  );
}
