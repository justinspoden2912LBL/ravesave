import { createServerFn } from "@tanstack/react-start";
import {
  useSession as getTanstackSession,
  getRequestIP,
  getRequestHeader,
} from "@tanstack/react-start/server";
import { z } from "zod";
import { createHash, timingSafeEqual } from "crypto";
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
  return getTanstackSession<AdminSession>(sessionConfig());
}

async function useAdminSessionGate() {
  const s = await getAdminSession();
  if (!s.data.admin) {
    return null;
  }
  // 24h enforce
  if (s.data.loginAt && Date.now() - s.data.loginAt > SESSION_MAX_AGE * 1000) {
    await s.clear();
    return null;
  }
  return s;
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string }) => z.object({ key: z.string().min(1).max(256) }).parse(d))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_ACCESS_KEY;
    if (!expected) throw new Error("Admin key not configured");
    const ckey = clientKey();
    checkLockout(ckey);
    // Hash both sides to equal-length buffers, then timing-safe compare.
    const a = createHash("sha256").update(data.key).digest();
    const b = createHash("sha256").update(expected).digest();
    const ok = timingSafeEqual(a, b);
    // small delay to slow brute force
    await new Promise((r) => setTimeout(r, 250));
    if (!ok) {
      recordFailure(ckey);
      throw new Error("Ungültiger Admin-Schlüssel");
    }
    recordSuccess(ckey);
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
    !!s.data.admin && (!s.data.loginAt || Date.now() - s.data.loginAt <= SESSION_MAX_AGE * 1000);
  return { isAdmin, loginAt: s.data.loginAt ?? null };
});

export const adminListPosts = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await useAdminSessionGate())) return [];
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
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).nullable().optional(),
  category: z.string().max(80).nullable().optional(),
  content: z.string().max(100000),
  published: z.boolean(),
});

export const adminUpsertPost = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PostInput.parse(d))
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const now = new Date().toISOString();
    if (data.id) {
      const { data: existing } = await supabaseAdmin
        .from("posts")
        .select("published_at")
        .eq("id", data.id)
        .maybeSingle();
      const published_at = data.published
        ? (existing?.published_at ?? now)
        : (existing?.published_at ?? null);
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
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
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
        published_at: next
          ? (existing.published_at ?? new Date().toISOString())
          : existing.published_at,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, published: next };
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const { error } = await supabaseAdmin.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Leser:innen-Einsendungen (Blog)
// ---------------------------------------------------------------------------

const SubmissionInput = z.object({
  title: z.string().trim().min(3).max(300),
  body: z.string().trim().min(50).max(20000),
  category: z.string().trim().max(80).optional().nullable(),
  pseudonym: z.string().trim().max(80).optional().nullable(),
  contact: z.string().trim().max(200).optional().nullable(),
});

const submitWindow = new Map<string, { count: number; firstAt: number }>();

export const submitReaderPost = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SubmissionInput.parse(d))
  .handler(async ({ data }) => {
    // simple abuse guard: max 3 Einsendungen / Stunde pro IP
    const key = clientKey();
    const now = Date.now();
    const rec = submitWindow.get(key);
    if (!rec || now - rec.firstAt > 60 * 60 * 1000) {
      submitWindow.set(key, { count: 1, firstAt: now });
    } else {
      rec.count += 1;
      if (rec.count > 3) throw new Error("Zu viele Einsendungen. Bitte später erneut versuchen.");
    }
    const { error } = await supabaseAdmin.from("post_submissions").insert({
      title: data.title,
      body: data.body,
      category: data.category || null,
      pseudonym: data.pseudonym || null,
      contact: data.contact || null,
    });
    if (error) throw new Error("Einsendung konnte nicht gespeichert werden.");
    return { ok: true };
  });

export const adminListSubmissions = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await useAdminSessionGate())) return [];
  const { data, error } = await supabaseAdmin
    .from("post_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminUpdateSubmission = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "reviewing", "accepted", "rejected"]).optional(),
        admin_note: z.string().max(2000).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const patch: Record<string, unknown> = {};
    if (data.status) patch.status = data.status;
    if (data.admin_note !== undefined) patch.admin_note = data.admin_note;
    const { error } = await supabaseAdmin.from("post_submissions").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteSubmission = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const { error } = await supabaseAdmin.from("post_submissions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Übernimmt eine Einsendung als unveröffentlichten Beitrags-Entwurf. */
export const adminSubmissionToDraft = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const { data: sub, error: e1 } = await supabaseAdmin
      .from("post_submissions")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (e1) throw new Error(e1.message);
    if (!sub) throw new Error("Einsendung nicht gefunden");
    const base =
      sub.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 70) || "beitrag";
    const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabaseAdmin.from("posts").insert({
      title: sub.title,
      slug,
      excerpt: sub.body.slice(0, 200),
      category: sub.category,
      content: sub.body,
      published: false,
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("post_submissions").update({ status: "accepted" }).eq("id", data.id);
    return { ok: true, slug };
  });
