/**
 * Feature flags runtime.
 *
 * Flags are stored in `feature_flags` (public read) and let the admin
 * disable individual pages/features without deploying code.
 *
 * - `initFeatureFlags()` hydrates from localStorage on boot.
 * - `refreshFeatureFlags()` pulls fresh values from Supabase.
 * - `useFeatureEnabled(key, defaultEnabled)` is a reactive hook.
 * - `isFeatureEnabled(key, defaultEnabled)` is the sync version.
 */
import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FeatureFlag = {
  key: string;
  page: string;
  label: string;
  description: string | null;
  enabled: boolean;
  updated_at: string;
};

const CACHE_KEY = "rs_feature_flags_v1";

let flags: Record<string, boolean> = {};
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function loadCache(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}
function saveCache(map: Record<string, boolean>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function initFeatureFlags(): void {
  if (typeof window === "undefined") return;
  flags = loadCache();
}

export async function refreshFeatureFlags(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("feature_flags")
      .select("key,enabled");
    if (error || !data) return;
    const next: Record<string, boolean> = {};
    for (const row of data) next[row.key] = !!row.enabled;
    flags = next;
    saveCache(next);
    notify();
  } catch {
    /* offline → keep cache */
  }
}

export function isFeatureEnabled(key: string, defaultEnabled = true): boolean {
  const v = flags[key];
  return typeof v === "boolean" ? v : defaultEnabled;
}

export function useFeatureEnabled(key: string, defaultEnabled = true): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => isFeatureEnabled(key, defaultEnabled),
    () => defaultEnabled,
  );
}

/** Map a pathname → feature flag key. Returns null when always allowed. */
export function flagKeyForPath(pathname: string): string | null {
  // Always-allowed routes (admin, auth, root, settings, onboarding, …)
  const ALWAYS = [
    "/",
    "/admin",
    "/login",
    "/reset-password",
    "/onboarding",
    "/settings",
    "/sitemap.xml",
    "/session/active",
  ];
  if (ALWAYS.includes(pathname)) return null;

  const seg = pathname.replace(/^\/+/, "").split("/")[0] ?? "";
  if (!seg) return null;

  // erfahrungen/$slug → page.erfahrungen
  const KNOWN = new Set([
    "mix",
    "substances",
    "checkliste",
    "risks",
    "akut",
    "notfall",
    "chat",
    "drugchecking",
    "reagenztest",
    "knigge",
    "tolerance",
    "aftercare",
    "log",
    "safety-plan",
    "erfahrungen",
    "stats",
    "install",
    "about",
  ]);
  if (KNOWN.has(seg)) return `page.${seg}`;
  return null;
}
