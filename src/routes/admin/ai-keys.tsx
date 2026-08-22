import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/admin/ai-keys')({ component: AdminAiKeys });

const providers = [
  { id: 'openai', label: 'OpenAI', env: 'OPENAI_API_KEY' },
  { id: 'anthropic', label: 'Anthropic', env: 'ANTHROPIC_API_KEY' },
  { id: 'google', label: 'Google AI', env: 'GOOGLE_GENERATIVE_AI_API_KEY' },
  { id: 'openrouter', label: 'OpenRouter', env: 'OPENROUTER_API_KEY' },
] as const;

type ProviderId = (typeof providers)[number]['id'];

type KeyStatus = Record<ProviderId, { configured: boolean; masked: string }>;

export function AdminAiKeys() {
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const [values, setValues] = useState<Record<ProviderId, string>>({
    openai: '',
    anthropic: '',
    google: '',
    openrouter: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadStatus() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/ai-keys');
      if (!response.ok) throw new Error('Nicht autorisiert oder Serverfehler.');
      setStatus(await response.json());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Status konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/ai-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error((await response.text()) || 'Speichern fehlgeschlagen.');
      setValues({ openai: '', anthropic: '', google: '', openrouter: '' });
      await loadStatus();
      setMessage('Änderungen gespeichert. Die Werte werden niemals angezeigt.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Speichern fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Adminbereich</p>
          <h1 className="text-3xl font-bold">KI-Keys</h1>
        </div>
        <Link to="/admin" className="text-sm underline">Zur Übersicht</Link>
      </div>

      <section className="rounded-lg border p-5 shadow-sm">
        <h2 className="text-xl font-semibold">KI-gestütztes Coding und Admin-KI</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Hinterlege hier Provider-Keys für serverseitige KI-Funktionen. Leere Felder ändern den bestehenden Wert nicht.
          Die Klartexte werden nicht zurückgegeben, nicht im Browser gespeichert und nicht in Supabase abgelegt.
        </p>

        <div className="mt-5 space-y-4">
          {providers.map((provider) => (
            <label key={provider.id} className="block">
              <span className="text-sm font-medium">{provider.label}</span>
              <span className="mb-1 block text-xs text-muted-foreground">{provider.env}</span>
              <input
                className="w-full rounded-md border bg-background p-2"
                type="password"
                autoComplete="new-password"
                value={values[provider.id]}
                onChange={(event) => setValues({ ...values, [provider.id]: event.target.value })}
                placeholder={status?.[provider.id]?.configured ? status[provider.id].masked : 'Key nur bei Änderung eingeben'}
              />
            </label>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button className="rounded-md border px-4 py-2" onClick={loadStatus} disabled={loading}>
            Status prüfen
          </button>
          <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={save} disabled={loading}>
            Keys sicher speichern
          </button>
        </div>
        {message && <p className="mt-4 text-sm" role="status">{message}</p>}
      </section>

      <p className="mt-4 text-xs text-muted-foreground">
        Für echte Produktions-Secrets bleibt Vercel Environment Variables der bevorzugte Secret-Store. Diese Oberfläche darf nur verwendet werden,
        wenn der Server einen echten verschlüsselten Secret-Store anbietet; niemals Klartextwerte in Logs schreiben.
      </p>
    </main>
  );
}
