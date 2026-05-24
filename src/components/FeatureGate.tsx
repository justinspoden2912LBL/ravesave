import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useFeatureEnabled, flagKeyForPath } from "@/lib/featureFlags";

/** Renders a friendly "feature disabled" placeholder. */
export function FeatureDisabled({ label }: { label?: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="rounded-2xl glass p-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold">
          {label ?? "Diese Funktion ist gerade deaktiviert"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Wir arbeiten daran. Schau später nochmal vorbei.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}

/** Path-based gate used inside the root <Outlet />. */
export function PathFeatureGate({
  pathname,
  children,
}: {
  pathname: string;
  children: React.ReactNode;
}) {
  const key = flagKeyForPath(pathname);
  const enabled = useFeatureEnabled(key ?? "__none__", true);
  if (key && !enabled) return <FeatureDisabled />;
  return <>{children}</>;
}
