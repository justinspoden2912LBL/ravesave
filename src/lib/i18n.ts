/**
 * Tiny i18n / content-override helper.
 *
 * - `t(key, fallback)` returns the admin override for `key` if present,
 *   otherwise the hard-coded fallback shipped in source.
 * - All overrides are loaded once on app boot from the public `ui_texts`
 *   table and cached in localStorage so subsequent boots are instant
 *   (and offline-friendly).
 * - Components subscribe via `useText(key, fallback)` to re-render when
 *   the cache refreshes.
 *
 * To make a string editable from the admin panel:
 *   1. Wrap it: `t("hero.headline", "Wissen statt Bauchgefühl")`
 *   2. (Optional) seed a row in `ui_texts` with the same key — the admin
 *      list shows every key seen by `t()` so you don't have to.
 */
import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

type TextMap = Record<string, string>;
const CACHE_KEY = "rs_ui_texts_v1";
const SEEN_KEY = "rs_ui_texts_seen_v1";

let texts: TextMap = {};
const seen = new Map<string, string>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function loadCache(): TextMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as TextMap) : {};
  } catch {
    return {};
  }
}
function saveCache(map: TextMap) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function rememberSeen(key: string, fallback: string) {
  if (seen.has(key)) return;
  seen.set(key, fallback);
  if (typeof window === "undefined") return;
  try {
    const prev = JSON.parse(localStorage.getItem(SEEN_KEY) || "{}") as TextMap;
    if (prev[key] !== fallback) {
      prev[key] = fallback;
      localStorage.setItem(SEEN_KEY, JSON.stringify(prev));
    }
  } catch {
    /* ignore */
  }
}

/** Get every key that `t()` has been called with (key → default). */
export function getSeenKeys(): TextMap {
  if (typeof window === "undefined") return Object.fromEntries(seen);
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}") as TextMap;
  } catch {
    return Object.fromEntries(seen);
  }
}

/** Eagerly initialize from localStorage (sync). Call once on boot. */
export function initI18n(): void {
  if (typeof window === "undefined") return;
  texts = loadCache();
}

/** Refresh from server. Best-effort, fails silently when offline. */
export async function refreshI18n(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("ui_texts")
      .select("key,value");
    if (error || !data) return;
    const next: TextMap = {};
    for (const row of data) {
      if (row.value && row.value.trim().length > 0) next[row.key] = row.value;
    }
    texts = next;
    saveCache(next);
    notify();
  } catch {
    /* offline → keep cache */
  }
}

/** Synchronous lookup with fallback. */
export function t(key: string, fallback: string): string {
  rememberSeen(key, fallback);
  const v = texts[key];
  return v && v.length > 0 ? v : fallback;
}

/** Reactive variant for components. */
export function useText(key: string, fallback: string): string {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => t(key, fallback),
    () => fallback,
  );
}
