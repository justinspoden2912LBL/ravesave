/**
 * Applies admin-defined patches to the static SUBSTANCES list at runtime.
 *
 * - Fetched once on app boot from `substance_overrides`.
 * - Cached in localStorage so the patch survives offline restarts.
 * - Patches are shallow-merged onto the matching substance (by `id` /
 *   slug). Use this for short copy edits like `summary`, `effects`,
 *   `risks`, `safer_use`. For arrays, replace the whole array.
 */
import { supabase } from "@/integrations/supabase/client";
import { SUBSTANCES, type Substance } from "@/lib/substances";

const CACHE_KEY = "rs_substance_overrides_v1";

type Patch = Partial<Substance> & Record<string, unknown>;
type CacheRow = { slug: string; patch: Patch };

function loadCache(): CacheRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheRow[]) : [];
  } catch {
    return [];
  }
}
function saveCache(rows: CacheRow[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

function applyAll(rows: CacheRow[]) {
  for (const { slug, patch } of rows) {
    const idx = SUBSTANCES.findIndex(
      (s) => s.id === slug || s.slug === slug || s.name?.toLowerCase() === slug.toLowerCase(),
    );
    if (idx === -1) continue;
    SUBSTANCES[idx] = { ...SUBSTANCES[idx], ...(patch as Partial<Substance>) };
  }
}

export function initSubstanceOverrides(): void {
  applyAll(loadCache());
}

export async function refreshSubstanceOverrides(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("substance_overrides")
      .select("slug,patch");
    if (error || !data) return;
    const rows = data as CacheRow[];
    saveCache(rows);
    applyAll(rows);
  } catch {
    /* offline → keep cache */
  }
}
