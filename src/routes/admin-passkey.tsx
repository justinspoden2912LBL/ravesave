import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/admin-passkey')({ component: AdminPasskey });

function AdminPasskey() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [canUsePasskeys, setCanUsePasskeys] = useState(true);

  useEffect(() => {
    setCanUsePasskeys(typeof window !== 'undefined' && 'PublicKeyCredential' in window && window.isSecureContext);
  }, []);

  async function signIn() {
    setBusy(true);
    setMessage('Bitte Face ID, Touch ID oder Geräte-PIN bestätigen.');
    try {
      const { data, error } = await supabase.auth.signInWithPasskey();
      if (error) throw error;
      if (!data.user) throw new Error('Keine Benutzer-Session erhalten.');
      const configuredAdmin = import.meta.env.VITE_ADMIN_USER_ID;
      if (!configuredAdmin || data.user.id !== configuredAdmin) {
        await supabase.auth.signOut();
        throw new Error('Dieser Passkey besitzt keine Admin-Berechtigung.');
      }
      await navigate({ to: '/admin' });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Passkey-Anmeldung fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container mx-auto max-w-lg p-6">
      <h1 className="text-3xl font-bold">Admin-Passkey</h1>
      <p className="mt-2 text-muted-foreground">Melde dich sicher mit Face ID, Touch ID oder Geräte-PIN an.</p>
      {!canUsePasskeys && <p className="mt-4 rounded-md border p-3 text-sm">Passkeys benötigen HTTPS und einen unterstützten Browser.</p>}
      <button className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={signIn} disabled={busy || !canUsePasskeys}>
        {busy ? 'Anmeldung läuft …' : 'Mit Apple-Passkey anmelden'}
      </button>
      {message && <p className="mt-4 text-sm" role="status">{message}</p>}
    </main>
  );
}
