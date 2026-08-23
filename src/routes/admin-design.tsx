import { createFileRoute } from "@tanstack/react-router";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminDesignStudioTab } from "@/components/admin/AdminDesignStudioTab";

export const Route = createFileRoute("/admin-design")({
  component: AdminDesignPage,
  head: () => ({
    meta: [
      { title: "Design Studio — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function AdminDesignPage() {
  return (
    <AdminGate>
      <div className="mx-auto max-w-4xl space-y-5 px-4 py-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Design Studio</h1>
          <p className="text-xs text-muted-foreground">
            KI-gestützte Design-Änderungen mit Vorschau und Commit.
          </p>
        </header>
        <AdminDesignStudioTab />
      </div>
    </AdminGate>
  );
}
