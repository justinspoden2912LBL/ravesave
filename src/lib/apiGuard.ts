// Abuse protection for the paid AI proxy endpoints (/api/chat, /api/tts).
// - Same-origin check: only our own frontend may call these endpoints.
// - Sliding-window per-IP rate limit (best effort, per worker isolate).
// No secrets are read here, so this module is safe to import from route files.

type Bucket = { hits: number[] };
const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

export function clientIp(request: Request): string {
  const h = request.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

/** Returns true when the request is within the limit. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > MAX_KEYS) buckets.clear();
  let b = buckets.get(key);
  if (!b) {
    b = { hits: [] };
    buckets.set(key, b);
  }
  b.hits = b.hits.filter((t) => now - t < windowMs);
  if (b.hits.length >= limit) return false;
  b.hits.push(now);
  return true;
}

/** Rejects cross-origin / scripted callers. Same-origin browser calls always pass. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  if (!host) return false;
  const candidate = origin ?? referer;
  // Browsers always send Origin on cross-origin POSTs; a missing value means
  // same-origin form/fetch in some engines — accept only if Referer matches too.
  if (!candidate) return false;
  try {
    return new URL(candidate).host === host;
  } catch {
    return false;
  }
}

export type GuardOptions = { limit: number; windowMs: number; name: string };

/** Returns a Response when the request must be rejected, otherwise null. */
export function guardRequest(request: Request, opts: GuardOptions): Response | null {
  if (!sameOrigin(request)) {
    return new Response("Forbidden", { status: 403 });
  }
  const ok = rateLimit(`${opts.name}:${clientIp(request)}`, opts.limit, opts.windowMs);
  if (!ok) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(opts.windowMs / 1000)) },
    });
  }
  return null;
}
