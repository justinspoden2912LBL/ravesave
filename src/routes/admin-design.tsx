import { createFileRoute } from "@tanstack/react-router";
import { AdminDesignStudioTab } from "@/components/admin/AdminDesignStudioTab";

export const Route = createFileRoute("/admin-design")({
  component: AdminDesignStudioRoute,
});

function AdminDesignStudioRoute() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <AdminDesignStudioTab />
    </main>
  );
}
