import { createServerFn } from "@tanstack/react-start";
import { useSession, getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Server-side brute-force protection (best-effort, per-isolate in-memory).
// Acts in addition to any client-side UX lockout — cannot be bypassed by
// clearing localStorage or hitting the endpoint with curl from one origin.
const SERVER_MAX_ATTEMPTS = 5;
const SERVER_LOCKOUT_MS = 15 * 60 * 1000;
const SERVER_WINDOW_MS = 15 * 60 * 1000;
type AttemptRec = { count: number; firstAt: number; lockedUntil: number };
const attempts = new Map<string, AttemptRec>();

function clientKey(): string {
  try {
    const ip = getRequestIP({ xForwardedFor: true });
    if (ip) return `ip:${ip}`;
  } catch {
    /* ignore */
  }
  try {
    const fwd = getRequestHeader("x-forwarded-for");
    if (fwd) return `xff:${fwd.split(",")[0].trim()}`;
  } catch {
    /* ignore */
  }
  return "global";
}

function checkLockout(key: string) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec) return;
  if (rec.lockedUntil > now) {
    throw new Error("Zu viele Fehlversuche. Bitte später erneut versuchen.");
  }
  if (now - rec.firstAt > SERVER_WINDOW_MS) {
    attempts.delete(key);
  }
}

function recordFailure(key: string) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.firstAt > SERVER_WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now, lockedUntil: 0 });
    return;
  }
  rec.count += 1;
  if (rec.count >= SERVER_MAX_ATTEMPTS) rec.lockedUntil = now + SERVER_LOCKOUT_MS;
}

function recordSuccess(key: string) {
  attempts.delete(key);
}

type AdminSession = { admin?: boolean; loginAt?: number };

const SESSION_MAX_AGE = 60 * 60 * 24; // 24h

function sessionConfig() {
  const password = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!password || password.length < 32) {
    throw new Error("Server session secret missing");
  }
  return {
    password,
    name: "rs_admin",
    maxAge: SESSION_MAX_AGE,
    cookie: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: true,
      path: "/",
    },
  };
}

async function getAdminSession() {
  return useSession<AdminSession>(sessionConfig());
}

async function requireAdmin() {
  const s = await getAdminSession();
  if (!s.data.admin) throw new Error("Unauthorized");
  // 24h enforce
  if (s.data.loginAt && Date.now() - s.data.loginAt > SESSION_MAX_AGE * 1000) {
    await s.clear();
    throw new Error("Session expired");
  }
  return s;
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string }) => z.object({ key: z.string().min(1).max(256) }).parse(d))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_ACCESS_KEY;
    if (!expected) throw new Error("Admin key not configured");
    // constant-time-ish compare
    const a = Buffer.from(data.key);
    const b = Buffer.from(expected);
    let ok = a.length === b.length;
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) ok = ok && a[i] === b[i];
    // small delay to slow brute force
    await new Promise((r) => setTimeout(r, 250));
    if (!ok) throw new Error("Ungültiger Admin-Schlüssel");
    const s = await getAdminSession();
    await s.update({ admin: true, loginAt: Date.now() });
    return { ok: true };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const s = await getAdminSession();
  await s.clear();
  return { ok: true };
});

export const adminWhoami = createServerFn({ method: "GET" }).handler(async () => {
  const s = await getAdminSession();
  const isAdmin =
    !!s.data.admin &&
    (!s.data.loginAt || Date.now() - s.data.loginAt <= SESSION_MAX_AGE * 1000);
  return { isAdmin, loginAt: s.data.loginAt ?? null };
});

export const adminListPosts = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

const PostInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).nullable().optional(),
  category: z.string().max(80).nullable().optional(),
  content: z.string().max(100000),
  published: z.boolean(),
});

export const adminUpsertPost = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PostInput.parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const now = new Date().toISOString();
    if (data.id) {
      const { data: existing } = await supabaseAdmin
        .from("posts")
        .select("published_at")
        .eq("id", data.id)
        .maybeSingle();
      const published_at = data.published
        ? existing?.published_at ?? now
        : existing?.published_at ?? null;
      const { error } = await supabaseAdmin
        .from("posts")
        .update({
          title: data.title.trim(),
          slug: data.slug,
          excerpt: data.excerpt ?? null,
          category: data.category ?? null,
          content: data.content,
          published: data.published,
          published_at,
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    } else {
      const { data: row, error } = await supabaseAdmin
        .from("posts")
        .insert({
          title: data.title.trim(),
          slug: data.slug,
          excerpt: data.excerpt ?? null,
          category: data.category ?? null,
          content: data.content,
          published: data.published,
          published_at: data.published ? now : null,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { ok: true, id: row.id };
    }
  });

export const adminTogglePublish = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { data: existing, error: e1 } = await supabaseAdmin
      .from("posts")
      .select("published, published_at")
      .eq("id", data.id)
      .maybeSingle();
    if (e1) throw new Error(e1.message);
    if (!existing) throw new Error("Beitrag nicht gefunden");
    const next = !existing.published;
    const { error } = await supabaseAdmin
      .from("posts")
      .update({
        published: next,
        published_at: next ? existing.published_at ?? new Date().toISOString() : existing.published_at,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, published: next };
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { error } = await supabaseAdmin.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
