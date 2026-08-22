import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminAiKeyCard } from "@/components/admin/AdminAiKeyCard";

export const Route = createFileRoute("/admin-key")({ component: AdminKeyPage });

function AdminKeyPage() {
  return <div className="mx-auto max-w-2xl px-4 py-8"><header className="mb-6 space-y-2"><p className="text-xs text-muted-foreground"><Link to="/admin" className="underline">Zurück zum Admin</Link></p><h1 className="text-2xl font-bold">Admin KI-Token</h1><p className="text-sm text-muted-foreground">Groq-Key für Chat, Akut-Coach und Admin-Copilot.</p></header><AdminAiKeyCard /></div>;
}
