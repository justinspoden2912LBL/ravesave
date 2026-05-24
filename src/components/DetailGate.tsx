import type { ReactNode } from "react";
import { useDetailLevel, levelGte, type DetailLevel } from "@/lib/detailLevel";

/**
 * Zeigt children nur, wenn das aktive Detail-Level mindestens `min` ist.
 * Beispiel: <DetailGate min="expert">…</DetailGate>
 */
export function DetailGate({ min, children }: { min: DetailLevel; children: ReactNode }) {
  const current = useDetailLevel();
  if (!levelGte(current, min)) return null;
  return <>{children}</>;
}
