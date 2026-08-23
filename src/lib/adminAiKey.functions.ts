import { createServerFn } from "@tanstack/react-start";
import { useSession as getTanstackSession } from "@tanstack/react-start/server";

/**
 * Read-only Status/Test für den Groq-Key. Der Key selbst wird ausschliesslich
 * serverseitig über Environment Variables (GROQ_API_KEY) bereitgestellt und
 * nie gespeichert, geloggt oder an den Client gesendet.
 */

const SESSION_MAX_AGE = 60 * 60 * 24;
type AdminSession = { admin?: boolean; loginAt?: number };

function sessionConfig() {
  const password = process.env.ADMIN_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!password || password.length < 32) throw new Error("Server session secret missing");
  return { password, name: "rs_admin", maxAge: SESSION_MAX_AGE, cookie: { httpOnly: true } };
}

async function requireAdmin() {
  const s = await getTanstackSession<AdminSession>(sessionConfig());
  if (!s.data.admin) throw new Error("Nicht angemeldet");
  if (s.data.loginAt && Date.now() - s.data.loginAt > SESSION_MAX_AGE * 1000)
    throw new Error("Sitzung abgelaufen");
}

export const adminGetAiKeyStatus = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await requireAdmin();
  } catch {
    return { authenticated: false, hasEnvKey: false, last4: "" };
  }
  const key = process.env.GROQ_API_KEY?.trim() ?? "";
  return {
    authenticated: true,
    hasEnvKey: key.length > 0,
    last4: key.length >= 4 ? key.slice(-4) : "",
  };
});

export const adminTestAiKey = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  const key = process.env.GROQ_API_KEY?.trim() ?? "";
  if (!key) throw new Error("Kein GROQ_API_KEY in den Server-Umgebungsvariablen hinterlegt.");
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Groq antwortet mit Status ${res.status}.`);
  return { ok: true };
});
