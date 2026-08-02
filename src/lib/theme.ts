/**
 * Live-Theme-Runtime.
 *
 * Design-Tokens liegen in `site_theme` (öffentlich lesbar) und werden beim
 * Boot als CSS-Variablen auf `:root` gesetzt. Dadurch kann der Admin (bzw.
 * der Copilot) Farben, Rundungen und Effekte ohne Deploy ändern.
 *
 * Leere Werte werden ignoriert — dann gilt der Standard aus styles.css.
 */
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "rs_site_theme_v1";
const PREVIEW_KEY = "rs_site_theme_preview_v1";

export type ThemeMap = Record<string, string>;

/** Token-Key -> CSS-Variable. Nur diese Keys sind erlaubt. */
export const THEME_TOKENS: { key: string; cssVar: string; label: string; category: string }[] = [
  { key: "primary", cssVar: "--primary", label: "Primärfarbe", category: "color" },
  { key: "accent", cssVar: "--accent", label: "Akzentfarbe", category: "color" },
  { key: "background", cssVar: "--background", label: "Hintergrund", category: "color" },
  { key: "foreground", cssVar: "--foreground", label: "Textfarbe", category: "color" },
  { key: "radius", cssVar: "--radius", label: "Ecken-Rundung", category: "shape" },
  { key: "font-scale", cssVar: "--rs-font-scale", label: "Schrift-Skalierung", category: "shape" },
  { key: "glass-opacity", cssVar: "--rs-glass-opacity", label: "Glas-Deckkraft", category: "effect" },
];

export const THEME_KEYS = THEME_TOKENS.map((t) => t.key);

function cssVarFor(key: string): string | null {
  return THEME_TOKENS.find((t) => t.key === key)?.cssVar ?? null;
}

function loadCache(): ThemeMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as ThemeMap) : {};
  } catch {
    return {};
  }
}

/** Setzt die Tokens als CSS-Variablen; leere Werte werden entfernt. */
export function applyTheme(map: ThemeMap) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const token of THEME_TOKENS) {
    const value = (map[token.key] ?? "").trim();
    if (value) root.style.setProperty(token.cssVar, value);
    else root.style.removeProperty(token.cssVar);
  }
  if ((map["font-scale"] ?? "").trim()) {
    root.style.fontSize = `calc(1rem * ${map["font-scale"]})`;
  } else {
    root.style.removeProperty("font-size");
  }
}

/** Vorschau nur für den aktuellen Browser (Admin), überschreibt veröffentlichte Werte. */
export function setThemePreview(map: ThemeMap | null) {
  if (typeof window === "undefined") return;
  try {
    if (map) localStorage.setItem(PREVIEW_KEY, JSON.stringify(map));
    else localStorage.removeItem(PREVIEW_KEY);
  } catch {
    /* ignore */
  }
  applyTheme(map ?? loadCache());
}

export function getThemePreview(): ThemeMap | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREVIEW_KEY);
    return raw ? (JSON.parse(raw) as ThemeMap) : null;
  } catch {
    return null;
  }
}

/** Sofort aus dem Cache anwenden (kein Flackern). */
export function initTheme() {
  applyTheme(getThemePreview() ?? loadCache());
}

/** Frische Werte laden und anwenden. */
export async function refreshTheme(): Promise<ThemeMap> {
  const { data, error } = await supabase.from("site_theme").select("key, value");
  if (error || !data) return loadCache();
  const map: ThemeMap = {};
  for (const row of data as { key: string; value: string | null }[]) {
    if (cssVarFor(row.key)) map[row.key] = row.value ?? "";
  }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
  if (!getThemePreview()) applyTheme(map);
  return map;
}
