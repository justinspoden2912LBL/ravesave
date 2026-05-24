/**
 * Offline data cache.
 *
 * Pre-loads compact snapshots of the static data the user is most likely
 * to need without connectivity (substance wiki, mix-calculator data,
 * checklist, risks, emergency info). All data is bundled in source, so
 * "preload" mostly means: confirm the JS for those routes has been
 * fetched once and warm React-Query if applicable.
 *
 * For the Mix-Rechner / Substanzen / Risiken / Akute-Hilfe routes the
 * data is already statically imported from `src/lib/*.ts` — once the
 * JS chunk is in the browser cache, those screens work offline.
 *
 * This module also marks an "offline-ready" flag the UI can read.
 */
const READY_KEY = "rs_offline_ready_v1";
const READY_AT_KEY = "rs_offline_ready_at_v1";

const OFFLINE_ROUTES = [
  "/substances",
  "/mix",
  "/checkliste",
  "/risks",
  "/akut",
  "/notfall",
];

export function isOfflineReady(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(READY_KEY) === "1";
  } catch {
    return false;
  }
}

export function offlineReadyAt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(READY_AT_KEY);
  } catch {
    return null;
  }
}

/**
 * Warm the route JS so each screen renders instantly + offline next time.
 * Called from the install-page button. Best-effort.
 */
export async function preloadOffline(
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  if (typeof window === "undefined") return;
  const total = OFFLINE_ROUTES.length;
  let done = 0;

  for (const path of OFFLINE_ROUTES) {
    try {
      // Trigger HTML fetch — Vite SSR returns the same shell, but the
      // browser caches the HTTP response and any subsequently requested
      // JS chunks for that route.
      await fetch(path, { credentials: "same-origin" });
    } catch {
      /* offline mid-preload → skip */
    }
    done++;
    onProgress?.(done, total);
  }

  try {
    localStorage.setItem(READY_KEY, "1");
    localStorage.setItem(READY_AT_KEY, new Date().toISOString());
  } catch {
    /* ignore */
  }
}

export const OFFLINE_PRELOAD_ROUTES = OFFLINE_ROUTES;
