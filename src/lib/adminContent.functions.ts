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
    totals: {
      views: 0,
      sessions: 0,
      events: 0,
      newSessions: 0,
      returningSessions: 0,
      returningRate: 0,
      avgViewsPerSession: 0,
      bounceRate: 0,
      avgSessionSeconds: 0,
      uniquePaths: 0,
      pwaInstalls: 0,
    },
    prev: { views: 0, sessions: 0, events: 0 },
    delta: { views: 0, sessions: 0, events: 0 },
    topPaths: [] as { key: string; count: number; sessions: number }[],
    topEntryPaths: [] as { key: string; count: number }[],
    topCountries: [] as { key: string; count: number }[],
    topEvents: [] as { key: string; count: number }[],
    topEventDetails: [] as { key: string; count: number }[],
    topReferrers: [] as { key: string; count: number }[],
    byDay: [] as { day: string; count: number }[],
    sessionsByDay: [] as { day: string; count: number }[],
    eventsByDay: [] as { day: string; count: number }[],
    byHour: [] as { hour: number; count: number }[],
    byWeekday: [] as { weekday: number; label: string; count: number }[],
  };
}

function normalizeReferrer(raw: string | null | undefined): string {
  if (!raw) return "(direkt)";
  try {
    const u = new URL(raw);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "(direkt)";
  }
}

const WEEKDAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

// ─────────────────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────────────────

export const adminGetStats = createServerFn({ method: "POST" })
  .inputValidator((d: { days?: number }) =>
    z.object({ days: z.number().int().min(1).max(365).default(30) }).parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return emptyStats(data.days, true);
    const windowMs = data.days * 86400_000;
    const sinceDate = new Date(Date.now() - windowMs);
    const since = sinceDate.toISOString();
    const prevSince = new Date(Date.now() - 2 * windowMs).toISOString();

    const [{ data: allViews, error: e1 }, { data: allEvents, error: e2 }] = await Promise.all([
      supabaseAdmin
        .from("page_views")
        .select("path,country,session_id,referrer,created_at")
        .gte("created_at", prevSince)
        .limit(40000),
      supabaseAdmin
        .from("usage_events")
        .select("event_type,detail,session_id,created_at")
        .gte("created_at", prevSince)
        .limit(40000),
    ]);

    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);

    const views = (allViews ?? []).filter((v) => (v.created_at as string) >= since);
    const events = (allEvents ?? []).filter((e) => (e.created_at as string) >= since);
    const prevViews = (allViews ?? []).filter((v) => (v.created_at as string) < since);
    const prevEvents = (allEvents ?? []).filter((e) => (e.created_at as string) < since);

    const byPath = new Map<string, number>();
    const pathSessions = new Map<string, Set<string>>();
    const byCountry = new Map<string, number>();
    const byReferrer = new Map<string, number>();
    const byDay = new Map<string, number>();
    const sessionsByDay = new Map<string, Set<string>>();
    const eventsByDay = new Map<string, number>();
    const byHour = new Map<number, number>();
    const byWeekday = new Map<number, number>();

    // Per-session aggregation for returning + bounce + duration metrics
    const sessionDays = new Map<string, Set<string>>();
    const sessionViews = new Map<string, number>();
    const sessionFirst = new Map<string, number>();
    const sessionLast = new Map<string, number>();
    const sessionEntry = new Map<string, { ts: number; path: string }>();

    const sorted = [...views].sort((a, b) =>
      (a.created_at as string) < (b.created_at as string) ? -1 : 1,
    );

    for (const v of sorted) {
      byPath.set(v.path, (byPath.get(v.path) ?? 0) + 1);
      const c = v.country || "??";
      byCountry.set(c, (byCountry.get(c) ?? 0) + 1);
      const ref = normalizeReferrer(v.referrer);
      byReferrer.set(ref, (byReferrer.get(ref) ?? 0) + 1);
      const createdAt = v.created_at as string;
      const ts = new Date(createdAt).getTime();
      const day = createdAt.slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
      byHour.set(new Date(createdAt).getUTCHours(), (byHour.get(new Date(createdAt).getUTCHours()) ?? 0) + 1);
      const wd = new Date(createdAt).getUTCDay();
      byWeekday.set(wd, (byWeekday.get(wd) ?? 0) + 1);

      if (v.session_id) {
        const sid = v.session_id;
        sessionViews.set(sid, (sessionViews.get(sid) ?? 0) + 1);
        if (!sessionDays.has(sid)) sessionDays.set(sid, new Set());
        sessionDays.get(sid)!.add(day);
        if (!sessionsByDay.has(day)) sessionsByDay.set(day, new Set());
        sessionsByDay.get(day)!.add(sid);
        if (!pathSessions.has(v.path)) pathSessions.set(v.path, new Set());
        pathSessions.get(v.path)!.add(sid);
        if (!sessionFirst.has(sid)) sessionFirst.set(sid, ts);
        sessionLast.set(sid, ts);
        if (!sessionEntry.has(sid)) sessionEntry.set(sid, { ts, path: v.path });
      }
    }

    const byEvent = new Map<string, number>();
    const byEventDetail = new Map<string, number>();
    for (const e of events) {
      byEvent.set(e.event_type, (byEvent.get(e.event_type) ?? 0) + 1);
      if (e.detail) {
        const k = `${e.event_type} → ${e.detail}`;
        byEventDetail.set(k, (byEventDetail.get(k) ?? 0) + 1);
      }
      const d = (e.created_at as string).slice(0, 10);
      eventsByDay.set(d, (eventsByDay.get(d) ?? 0) + 1);
    }

    const entryPaths = new Map<string, number>();
    for (const [, entry] of sessionEntry) {
      entryPaths.set(entry.path, (entryPaths.get(entry.path) ?? 0) + 1);
    }

    // Returning session = same session_id appears on 2+ distinct days in window
    let returningSessions = 0;
    let bounceSessions = 0;
    let durationSum = 0;
    let durationCount = 0;
    for (const [, ds] of sessionDays) {
      if (ds.size >= 2) returningSessions += 1;
    }
    for (const [sid, count] of sessionViews) {
      if (count <= 1) bounceSessions += 1;
      const first = sessionFirst.get(sid);
      const last = sessionLast.get(sid);
      if (first != null && last != null && last > first) {
        durationSum += (last - first) / 1000;
        durationCount += 1;
      }
    }
    const totalSessions = sessionDays.size;
    const newSessions = Math.max(0, totalSessions - returningSessions);
    const totalViews = views.length;

    const prevSessions = new Set(
      prevViews.map((v) => v.session_id).filter(Boolean) as string[],
    ).size;
    const pct = (now: number, before: number) =>
      before > 0 ? (now - before) / before : now > 0 ? 1 : 0;

    const sortDesc = <T>(m: Map<T, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);

    return {
      days: data.days,
      authRequired: false,
      totals: {
        views: totalViews,
        sessions: totalSessions,
        events: events.length,
        newSessions,
        returningSessions,
        returningRate: totalSessions > 0 ? returningSessions / totalSessions : 0,
        avgViewsPerSession: totalSessions > 0 ? totalViews / totalSessions : 0,
        bounceRate: totalSessions > 0 ? bounceSessions / totalSessions : 0,
        avgSessionSeconds: durationCount > 0 ? durationSum / durationCount : 0,
        uniquePaths: byPath.size,
        pwaInstalls: events.filter((e) => e.event_type.includes("install")).length,
      },
      prev: {
        views: prevViews.length,
        sessions: prevSessions,
        events: prevEvents.length,
      },
      delta: {
        views: pct(totalViews, prevViews.length),
        sessions: pct(totalSessions, prevSessions),
        events: pct(events.length, prevEvents.length),
      },
      topPaths: sortDesc(byPath)
        .slice(0, 30)
        .map(([k, v]) => ({ key: k, count: v, sessions: pathSessions.get(k)?.size ?? 0 })),
      topEntryPaths: sortDesc(entryPaths)
        .slice(0, 15)
        .map(([k, v]) => ({ key: k, count: v })),
      topCountries: sortDesc(byCountry)
        .slice(0, 30)
        .map(([k, v]) => ({ key: k, count: v })),
      topEvents: sortDesc(byEvent).map(([k, v]) => ({ key: k, count: v })),
      topEventDetails: sortDesc(byEventDetail)
        .slice(0, 20)
        .map(([k, v]) => ({ key: k, count: v })),
      topReferrers: sortDesc(byReferrer)
        .slice(0, 15)
        .map(([k, v]) => ({ key: k, count: v })),
      byDay: [...byDay.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([k, v]) => ({ day: k, count: v })),
      sessionsByDay: [...sessionsByDay.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([k, v]) => ({ day: k, count: v.size })),
      eventsByDay: [...eventsByDay.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([k, v]) => ({ day: k, count: v })),
      byHour: Array.from({ length: 24 }, (_, h) => ({ hour: h, count: byHour.get(h) ?? 0 })),
      byWeekday: Array.from({ length: 7 }, (_, w) => ({
        weekday: w,
        label: WEEKDAY_LABELS[w],
        count: byWeekday.get(w) ?? 0,
      })),
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

// ─────────────────────────────────────────────────────────────────────────
// SITE CONTENT (longform editorial blocks: about_intro, etc.)
// ─────────────────────────────────────────────────────────────────────────

export const adminListSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await useAdminSessionGate())) return [];
  const { data, error } = await supabaseAdmin
    .from("site_content")
    .select("key,content,updated_at")
    .order("key", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

const SiteContentInput = z.object({
  key: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-zA-Z0-9._-]+$/),
  content: z.string().max(50000),
});

export const adminUpsertSiteContent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SiteContentInput.parse(d))
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const { error } = await supabaseAdmin.from("site_content").upsert({
      key: data.key,
      content: data.content,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteSiteContent = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string }) => z.object({ key: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const { error } = await supabaseAdmin.from("site_content").delete().eq("key", data.key);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─────────────────────────────────────────────────────────────────────────
// CONTENT SNAPSHOT (Export / Import all admin-managed data as JSON)
// ─────────────────────────────────────────────────────────────────────────

const SNAPSHOT_TABLES = [
  "feature_flags",
  "ui_texts",
  "site_content",
  "substance_overrides",
  "posts",
] as const;

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [k: string]: JsonValue }
  | JsonValue[];
type JsonRow = { [k: string]: JsonValue };
type SnapshotPayload = {
  ok: true;
  app: "ravesafe";
  kind: "content-snapshot";
  version: 1;
  exportedAt: string;
  tables: Record<string, JsonRow[]>;
};
type SnapshotAuthFail = { ok: false; authRequired: true };

export const adminExportSnapshot = createServerFn({ method: "POST" }).handler(
  async (): Promise<SnapshotPayload | SnapshotAuthFail> => {
    if (!(await useAdminSessionGate())) {
      return { ok: false, authRequired: true };
    }
    const out: Record<string, JsonRow[]> = {};
    for (const t of SNAPSHOT_TABLES) {
      const { data, error } = await supabaseAdmin.from(t).select("*");
      if (error) throw new Error(`${t}: ${error.message}`);
      out[t] = JSON.parse(JSON.stringify(data ?? [])) as JsonRow[];
    }
    return {
      ok: true,
      app: "ravesafe",
      kind: "content-snapshot",
      version: 1,
      exportedAt: new Date().toISOString(),
      tables: out,
    };
  },
);

const SnapshotInput = z.object({
  app: z.literal("ravesafe"),
  kind: z.literal("content-snapshot"),
  version: z.literal(1),
  tables: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))),
  mode: z.enum(["merge", "replace"]).default("merge"),
});

export const adminImportSnapshot = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SnapshotInput.parse(d))
  .handler(
    async ({
      data,
    }): Promise<
      { ok: true; counts: Record<string, number> } | SnapshotAuthFail
    > => {
      if (!(await useAdminSessionGate())) {
        return { ok: false, authRequired: true };
      }
      const counts: Record<string, number> = {};
      for (const t of SNAPSHOT_TABLES) {
        const rows = data.tables[t];
        if (!rows || rows.length === 0) {
          counts[t] = 0;
          continue;
        }
        if (data.mode === "replace") {
          const guard =
            t === "posts"
              ? "id.neq.00000000-0000-0000-0000-000000000000"
              : t === "substance_overrides"
                ? "slug.neq.__never__"
                : "key.neq.__never__";
          const { error: delErr } = await supabaseAdmin.from(t).delete().or(guard);
          if (delErr) throw new Error(`${t} clear: ${delErr.message}`);
        }
        const conflictKey =
          t === "posts" ? "id" : t === "substance_overrides" ? "slug" : "key";
        // Snapshot rows are validated by Zod; cast to bypass generated row type
        // since we round-trip the exact shape that came from the same table.
        const { error } = await supabaseAdmin
          .from(t)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .upsert(rows as any, { onConflict: conflictKey });
        if (error) throw new Error(`${t}: ${error.message}`);
        counts[t] = rows.length;
      }
      return { ok: true, counts };
    },
  );

// ─────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT (Auth-Nutzer + Rollen)
// ─────────────────────────────────────────────────────────────────────────

export const adminListAuthUsers = createServerFn({ method: "POST" })
  .inputValidator((d: { page?: number; perPage?: number; search?: string }) =>
    z
      .object({
        page: z.number().int().min(1).max(500).default(1),
        perPage: z.number().int().min(1).max(200).default(50),
        search: z.string().max(200).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate()))
      return { authRequired: true as const, users: [], total: 0, adminIds: [] as string[] };
    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
      page: data.page,
      perPage: data.perPage,
    });
    if (error) throw new Error(error.message);
    const q = data.search?.toLowerCase().trim();
    const filtered = q
      ? (list?.users ?? []).filter(
          (u) =>
            (u.email ?? "").toLowerCase().includes(q) ||
            u.id.toLowerCase().includes(q),
        )
      : (list?.users ?? []);
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id,role")
      .eq("role", "admin");
    const adminIds = (roles ?? []).map((r) => r.user_id);
    return {
      authRequired: false as const,
      total: list?.users?.length ?? 0,
      adminIds,
      users: filtered.map((u) => ({
        id: u.id,
        email: u.email ?? null,
        createdAt: u.created_at ?? null,
        lastSignIn: u.last_sign_in_at ?? null,
        emailConfirmed: !!u.email_confirmed_at,
        banned: !!(u as { banned_until?: string }).banned_until,
        provider: u.app_metadata?.provider ?? null,
      })),
    };
  });

export const adminDeleteAuthUser = createServerFn({ method: "POST" })
  .inputValidator((d: { userId: string }) =>
    z.object({ userId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSendPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) =>
    z.object({ email: z.string().email().max(320) }).parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: data.email,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSetUserBan = createServerFn({ method: "POST" })
  .inputValidator((d: { userId: string; banned: boolean }) =>
    z
      .object({ userId: z.string().uuid(), banned: z.boolean() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.banned ? "876000h" : "none", // ~100 Jahre
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSetAdminRole = createServerFn({ method: "POST" })
  .inputValidator((d: { userId: string; isAdmin: boolean }) =>
    z
      .object({ userId: z.string().uuid(), isAdmin: z.boolean() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    if (data.isAdmin) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert(
          { user_id: data.userId, role: "admin" },
          { onConflict: "user_id,role" },
        );
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", "admin");
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ─────────────────────────────────────────────────────────────────────────
// DATA / ANALYTICS PURGE (DSGVO)
// ─────────────────────────────────────────────────────────────────────────

export const adminPurgeAnalytics = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { olderThanDays?: number; sessionId?: string; all?: boolean }) =>
      z
        .object({
          olderThanDays: z.number().int().min(1).max(3650).optional(),
          sessionId: z.string().min(1).max(200).optional(),
          all: z.boolean().optional(),
        })
        .refine((v) => v.olderThanDays || v.sessionId || v.all, {
          message: "Mindestens ein Filter erforderlich",
        })
        .parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    let deletedViews = 0;
    let deletedEvents = 0;
    const tables = ["page_views", "usage_events"] as const;
    for (const t of tables) {
      let q = supabaseAdmin.from(t).delete({ count: "exact" });
      if (data.all) {
        q = q.neq("id", "00000000-0000-0000-0000-000000000000");
      } else {
        if (data.olderThanDays) {
          const cutoff = new Date(
            Date.now() - data.olderThanDays * 86400_000,
          ).toISOString();
          q = q.lt("created_at", cutoff);
        }
        if (data.sessionId) {
          q = q.eq("session_id", data.sessionId);
        }
      }
      const { error, count } = await q;
      if (error) throw new Error(`${t}: ${error.message}`);
      if (t === "page_views") deletedViews = count ?? 0;
      else deletedEvents = count ?? 0;
    }
    return { ok: true, deletedViews, deletedEvents };
  });

export const adminAnalyticsSummary = createServerFn({ method: "GET" }).handler(
  async () => {
    if (!(await useAdminSessionGate()))
      return { authRequired: true as const, views: 0, events: 0, oldestView: null };
    const [{ count: views }, { count: events }, { data: oldest }] = await Promise.all([
      supabaseAdmin.from("page_views").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("usage_events").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("page_views")
        .select("created_at")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);
    return {
      authRequired: false as const,
      views: views ?? 0,
      events: events ?? 0,
      oldestView: oldest?.created_at ?? null,
    };
  },
);





// ─────────────────────────────────────────────────────────────────────────
// FEATURE FLAG: löschen (Admin kann Seiten/Funktionen selbst entfernen)
// ─────────────────────────────────────────────────────────────────────────

export const adminDeleteFeatureFlag = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string }) => z.object({ key: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    if (!(await useAdminSessionGate())) return { ok: false, authRequired: true as const };
    const { error } = await supabaseAdmin.from("feature_flags").delete().eq("key", data.key);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
