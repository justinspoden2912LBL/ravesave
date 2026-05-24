import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Hourglass } from "lucide-react";
import { allToleranceStatuses, STATUS_META } from "@/lib/tolerance";

export const Route = createFileRoute("/tolerance")({
  component: TolerancePage,
  head: () => ({
    meta: [
      { title: "Toleranz & Cooldowns — Rave Safe, have Fun" },
      { name: "description", content: "Empfohlene Mindestabstände pro Substanz, automatisch aus deinem lokalen Log." },
      { property: "og:title", content: "Toleranz & Cooldowns — Rave Safe, have Fun" },
      { property: "og:description", content: "Cooldowns und Pausen — basierend auf deinem Log." },
      { property: "og:url", content: "https://ravesave.lovable.app/tolerance" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.lovable.app/tolerance" }],
  }),
});

function TolerancePage() {
  const [items, setItems] = useState<ReturnType<typeof allToleranceStatuses>>([]);
  useEffect(() => setItems(allToleranceStatuses()), []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> zur Startseite
      </Link>
      <div>
        <div className="flex items-center gap-2">
          <Hourglass className="h-5 w-5 text-secondary" />
          <h1 className="text-2xl font-bold">Toleranz & Cooldowns</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-prose">
          Pausen schützen Körper und Wirkung. Werte stammen aus deinem lokalen{" "}
          <Link to="/log" className="text-secondary underline">Konsum-Protokoll</Link>.
        </p>
      </div>

      <ul className="space-y-2">
        {items.map(({ id, name, status }) => {
          const meta = STATUS_META(status.status);
          return (
            <li key={id} className={`rounded-2xl glass p-4 ring-1 ${meta.ring}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link to="/substances" hash={id} className="font-semibold hover:text-secondary">
                    {name}
                  </Link>
                  <div className="text-xs text-muted-foreground mt-0.5">{status.message}</div>
                </div>
                <span className={`text-xs rounded-full px-3 py-1 ${meta.bg} ${meta.color} ring-1 ${meta.ring} shrink-0`}>
                  {meta.label}
                </span>
              </div>
              {status.cooldown && (
                <p className="text-[11px] text-muted-foreground mt-2 italic">
                  Empfohlen ≥ {status.cooldown.minDays} Tage · ideal {status.cooldown.idealDays} · {status.cooldown.reason}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
