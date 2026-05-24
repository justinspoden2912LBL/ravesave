/**
 * Lightweight client-side analytics + offline cache.
 * - Page views: fires on every route change.
 * - Events: small named counters (akut_coach, chat_message, voice_session…).
 * - Anonymous: a per-browser session id (localStorage), no PII.
 */

const SID_KEY = "rs_sid";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = localStorage.getItem(SID_KEY);
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return "";
  }
}

function send(body: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({ ...body, sid: getSessionId() });
    const url = "/api/public/track";
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    }
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* swallow */
  }
}

let lastPath = "";

export function trackPageView(path: string): void {
  if (!path || path === lastPath) return;
  lastPath = path;
  // Strip query/hash so analytics stays compact.
  const clean = path.split("?")[0].split("#")[0];
  send({
    type: "pageview",
    path: clean,
    ref: typeof document !== "undefined" ? document.referrer || "" : "",
  });
}

export function trackEvent(event: string, detail?: string): void {
  if (!event) return;
  send({ type: "event", event, detail });
}
