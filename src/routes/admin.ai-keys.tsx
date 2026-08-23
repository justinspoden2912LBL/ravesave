import { createFileRoute } from "@tanstack/react-router";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminAiKeyCard } from "@/components/admin/AdminAiKeyCard";

export const Route = createFileRoute("/admin/ai-keys")({
  component: AdminAiKeysPage,
  head: () => ({
    meta: [
      { title: "KI-Keys — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function AdminAiKeysPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">KI-Keys</h1>
          <p className="text-xs text-muted-foreground">
            Status der serverseitigen Schlüssel — nur lesbar, keine Speicherung im Browser.
          </p>
        </header>
        <AdminAiKeyCard />
      </div>
    </AdminGate>
  );
}
