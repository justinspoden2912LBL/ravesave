import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { adminWhoami } from "@/lib/admin.functions";

/**
 * Client-Gate für Admin-Unterseiten. Die eigentliche Absicherung passiert
 * serverseitig in jeder Admin-Server-Funktion (requireAdmin / Session-Cookie).
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "in" | "out">("checking");

  useEffect(() => {
    adminWhoami()
      .then((r) => setState(r.isAdmin ? "in" : "out"))
      .catch(() => setState("out"));
  }, []);

  if (state === "checking") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-muted-foreground">
        Prüfe Admin-Sitzung…
      </div>
    );
  }

  if (state === "out") {
    return (
      <div className="mx-auto max-w-md space-y-3 px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Dieser Bereich ist nur für angemeldete Admins.
        </p>
        <Link to="/admin" className="inline-block border border-primary/40 px-4 py-2 text-sm text-primary">
          Zum Admin-Login
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
