import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/risks')({
  component: RisksPage,
});

function RisksPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-bold">Risiken</h1>
      <p className="mt-4">Informationen zu Risiken und Safer Use.</p>
    </main>
  );
}
