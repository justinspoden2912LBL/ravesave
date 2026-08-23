import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/admin-passkey/register')({
  beforeLoad: () => {
    throw redirect({ to: '/admin-login' });
  },
  component: () => (
    <main className="container mx-auto max-w-lg p-6">
      <h1 className="text-3xl font-bold">Passkey deaktiviert</h1>
      <p className="mt-2 text-muted-foreground">Der Adminzugang verwendet jetzt den Magic Link.</p>
    </main>
  ),
});
