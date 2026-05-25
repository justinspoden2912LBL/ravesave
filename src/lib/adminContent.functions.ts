import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// NOTE: this file extends the admin server-fn surface for stats,
// editable UI text, and substance overrides. It re-implements the
// `requireAdmin` gate locally to avoid a circular import with
// `admin.functions.ts`.
import { useSession as getTanstackSession } from "@tanstack/react-start/server";

type AdminSession = { admin?: boolean; loginAt?: number };
const SESSION_MAX_AGE = 60 * 60 * 24;

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

async function useAdminSessionGate() {
  const s = await getTanstackSession<AdminSession>(sessionConfig());
  if (!s.data.admin) return null;
  if (s.data.loginAt && Date.now() - s.data.loginAt > SESSION_MAX_AGE * 1000) {
    await s.clear();
    return null;
  }
  return s;
}

function emptyStats(days: number, authRequired = false) {
  return {
    days,
    authRequired,
    totals: { views: 0, sessions: 0, events: 0 },
    topPaths: [] as { key: string; count: number }[],
    topCountries: [] as { key: string; count: number }[],
    topEvents: [] as { key: string; count: number }[],
    byDay: [] as { day: string; count: number }[],
  };
}

// ─────────────────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────────────────

export const adminGetStats = createServerFn({ method: "POST" })
  .inputValidator((d: { days?: number }) =>
    z.object({ days: z.number().int().min(1).max(365).default(30) }).parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return emptyStats(data.days, true);
    const since = new Date(Date.now() - data.days * 86400_000).toISOString();

    const [{ data: views, error: e1 }, { data: events, error: e2 }] = await Promise.all([
      supabaseAdmin
        .from("page_views")
        .select("path,country,session_id,created_at")
        .gte("created_at", since)
        .limit(20000),
      supabaseAdmin
        .from("usage_events")
        .select("event_type,detail,created_at")
        .gte("created_at", since)
        .limit(20000),
    ]);

    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);

    // Aggregate by path
    const byPath = new Map<string, number>();
    const byCountry = new Map<string, number>();
    const sessions = new Set<string>();
    const byDay = new Map<string, number>();

    for (const v of views ?? []) {
      byPath.set(v.path, (byPath.get(v.path) ?? 0) + 1);
      const c = v.country || "??";
      byCountry.set(c, (byCountry.get(c) ?? 0) + 1);
      if (v.session_id) sessions.add(v.session_id);
      const day = (v.created_at as string).slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }

    const byEvent = new Map<string, number>();
    for (const e of events ?? []) {
      byEvent.set(e.event_type, (byEvent.get(e.event_type) ?? 0) + 1);
    }

    const sortDesc = <T>(m: Map<T, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);

    return {
      days: data.days,
      authRequired: false,
      totals: {
        views: views?.length ?? 0,
        sessions: sessions.size,
        events: events?.length ?? 0,
      },
      topPaths: sortDesc(byPath)
        .slice(0, 30)
        .map(([k, v]) => ({ key: k, count: v })),
      topCountries: sortDesc(byCountry)
        .slice(0, 30)
        .map(([k, v]) => ({ key: k, count: v })),
      topEvents: sortDesc(byEvent).map(([k, v]) => ({ key: k, count: v })),
      byDay: [...byDay.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([k, v]) => ({ day: k, count: v })),
    };
  });

// ─────────────────────────────────────────────────────────────────────────
// UI TEXTS
// ─────────────────────────────────────────────────────────────────────────

export const adminListTexts = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await useAdminSessionGate())) return [];
  const { data, error } = await supabaseAdmin
    .from("ui_texts")
    .select("*")
    .order("key", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

const TextInput = z.object({
  key: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-zA-Z0-9._-]+$/),
  value: z.string().max(20000),
  description: z.string().max(500).nullable().optional(),
  category: z.string().max(80).nullable().optional(),
});

export const adminUpsertText = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TextInput.parse(d))
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const { error } = await supabaseAdmin.from("ui_texts").upsert({
      key: data.key,
      value: data.value,
      description: data.description ?? null,
      category: data.category ?? null,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteText = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string }) => z.object({ key: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const { error } = await supabaseAdmin.from("ui_texts").delete().eq("key", data.key);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─────────────────────────────────────────────────────────────────────────
// SUBSTANCE OVERRIDES (JSON patch per slug)
// ─────────────────────────────────────────────────────────────────────────

export const adminListSubstanceOverrides = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await useAdminSessionGate())) return [];
  const { data, error } = await supabaseAdmin
    .from("substance_overrides")
    .select("*")
    .order("slug", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

const SubstancePatch = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-zA-Z0-9._-]+$/),
  patch: z.record(z.string(), z.unknown()),
});

export const adminUpsertSubstanceOverride = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SubstancePatch.parse(d))
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const { error } = await supabaseAdmin.from("substance_overrides").upsert({
      slug: data.slug,
      patch: data.patch as never,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteSubstanceOverride = createServerFn({ method: "POST" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const { error } = await supabaseAdmin
      .from("substance_overrides")
      .delete()
      .eq("slug", data.slug);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─────────────────────────────────────────────────────────────────────────
// FEATURE FLAGS
// ─────────────────────────────────────────────────────────────────────────

export const adminListFeatureFlags = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await useAdminSessionGate())) return [];
  const { data, error } = await supabaseAdmin
    .from("feature_flags")
    .select("*")
    .order("label", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

const FlagInput = z.object({
  key: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-zA-Z0-9._-]+$/),
  page: z.string().min(1).max(80),
  label: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  enabled: z.boolean(),
});

export const adminUpsertFeatureFlag = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => FlagInput.parse(d))
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const { error } = await supabaseAdmin.from("feature_flags").upsert({
      key: data.key,
      page: data.page,
      label: data.label,
      description: data.description ?? null,
      enabled: data.enabled,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminToggleFeatureFlag = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string; enabled: boolean }) =>
    z.object({ key: z.string().min(1).max(120), enabled: z.boolean() }).parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const { error } = await supabaseAdmin
      .from("feature_flags")
      .update({ enabled: data.enabled, updated_at: new Date().toISOString() })
      .eq("key", data.key);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─────────────────────────────────────────────────────────────────────────
// AKTIVE SESSIONS (Live-Übersicht)
// ─────────────────────────────────────────────────────────────────────────

export const adminGetActiveSessions = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await useAdminSessionGate())) {
    return {
      authRequired: true as const,
      liveVisitors: [],
      authUsers: [],
      substanceSessions: [],
    };
  }

  const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
  const thirtyMinAgo = new Date(Date.now() - 30 * 60_000).toISOString();

  // 1) Live-Besucher: page_views der letzten 5 Min, gruppiert nach session_id
  const { data: views } = await supabaseAdmin
    .from("page_views")
    .select("path,country,session_id,created_at,referrer")
    .gte("created_at", fiveMinAgo)
    .order("created_at", { ascending: false })
    .limit(2000);

  const liveMap = new Map<
    string,
    { sid: string; path: string; country: string | null; lastSeen: string; views: number; referrer: string | null }
  >();
  for (const v of views ?? []) {
    const sid = v.session_id || "anon";
    const existing = liveMap.get(sid);
    if (existing) {
      existing.views += 1;
    } else {
      liveMap.set(sid, {
        sid,
        path: v.path,
        country: v.country,
        lastSeen: v.created_at as string,
        views: 1,
        referrer: v.referrer,
      });
    }
  }
  const liveVisitors = [...liveMap.values()].sort((a, b) =>
    a.lastSeen < b.lastSeen ? 1 : -1,
  );

  // 2) Eingeloggte Auth-User (letzte Aktivität < 30 Min)
  let authUsers: { id: string; email: string | null; lastSignIn: string | null }[] = [];
  try {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    authUsers = (data?.users ?? [])
      .filter((u) => u.last_sign_in_at && u.last_sign_in_at >= thirtyMinAgo)
      .map((u) => ({ id: u.id, email: u.email ?? null, lastSignIn: u.last_sign_in_at ?? null }))
      .sort((a, b) => (a.lastSignIn! < b.lastSignIn! ? 1 : -1));
  } catch (e) {
    console.error("listUsers failed", e);
  }

  // 3) Aktive Substanz-Sessions: usage_events mit event_type='substance_active' < 5 Min
  const { data: subEvents } = await supabaseAdmin
    .from("usage_events")
    .select("session_id,detail,created_at")
    .eq("event_type", "substance_active")
    .gte("created_at", fiveMinAgo)
    .order("created_at", { ascending: false })
    .limit(1000);

  const subMap = new Map<
    string,
    { sid: string; substance: string; lastSeen: string }
  >();
  for (const e of subEvents ?? []) {
    const sid = e.session_id || "anon";
    const key = `${sid}::${e.detail}`;
    if (!subMap.has(key)) {
      subMap.set(key, {
        sid,
        substance: e.detail || "?",
        lastSeen: e.created_at as string,
      });
    }
  }
  const substanceSessions = [...subMap.values()].sort((a, b) =>
    a.lastSeen < b.lastSeen ? 1 : -1,
  );

  return {
    authRequired: false as const,
    liveVisitors,
    authUsers,
    substanceSessions,
  };
});

