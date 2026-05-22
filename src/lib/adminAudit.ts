// Lightweight, local-only admin audit log.
// Stored in localStorage to avoid extra backend surface for the first release.

export type AdminAuditType =
  | "login_success"
  | "login_failure"
  | "logout"
  | "session_expired"
  | "setup"
  | "recovery_request"
  | "lockout";

export type AdminAuditEntry = {
  ts: number;
  type: AdminAuditType;
  detail?: string;
};

const KEY = "ravesave_admin_audit_log";
const MAX_ENTRIES = 200;

export function readAdminAudit(): AdminAuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function logAdminAudit(type: AdminAuditType, detail?: string) {
  if (typeof window === "undefined") return;
  try {
    const list = readAdminAudit();
    list.unshift({ ts: Date.now(), type, detail });
    const trimmed = list.slice(0, MAX_ENTRIES);
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
}

export function clearAdminAudit() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function labelFor(type: AdminAuditType): string {
  switch (type) {
    case "login_success":
      return "Login erfolgreich";
    case "login_failure":
      return "Fehlversuch";
    case "logout":
      return "Abmeldung";
    case "session_expired":
      return "Session abgelaufen (24h)";
    case "setup":
      return "Admin-Setup";
    case "recovery_request":
      return "Recovery-Link angefordert";
    case "lockout":
      return "Konto gesperrt (zu viele Fehlversuche)";
  }
}
