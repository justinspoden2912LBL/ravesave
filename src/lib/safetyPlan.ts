/**
 * Persönlicher Party-Safety-Plan (lokal, pro Browser).
 *
 * Schritt 1 der Begleiter-Funktion: erstellen, bearbeiten, abschließen,
 * Marleen sieht eine kurze Zusammenfassung.
 *
 * Spätere Schritte (Check-ins, „sicher zuhause“-Reflexion, History-UI)
 * bauen auf diesen Typen auf — Felder sind hier schon vorgesehen.
 */

export interface CheckIn {
  at: string; // ISO timestamp
  score: 1 | 2 | 3 | 4 | 5; // 1 = ganz schlecht, 5 = top
  symptoms: string[];
  note?: string;
}

export interface SafetyPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "completed";
  event: string; // z.B. "Club X" / "Festival Y"
  companions: string; // freier Text (Namen/Spitznamen)
  homeRoute: string; // wie komme ich heim
  intentions: string; // Vorsätze (mehrzeilig)
  hasFirstAid: boolean; // Naloxon / Erste-Hilfe-Plan
  checkInsEnabled: boolean;
  checkInIntervalMin: number; // 60..120
  checkIns: CheckIn[];
  completedAt?: string;
  reflection?: string;
}

const INDEX_KEY = "ravesave.safetyplan.index.v1";
const ACTIVE_KEY = "ravesave.safetyplan.active.v1";
const PLAN_PREFIX = "ravesave.safetyplan:";

interface IndexEntry {
  id: string;
  event: string;
  createdAt: string;
  updatedAt: string;
  status: SafetyPlan["status"];
}

function safeLS(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readIndex(): IndexEntry[] {
  const ls = safeLS();
  if (!ls) return [];
  try {
    const raw = ls.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as IndexEntry[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(idx: IndexEntry[]) {
  const ls = safeLS();
  if (!ls) return;
  try {
    ls.setItem(INDEX_KEY, JSON.stringify(idx));
  } catch {
    /* ignore */
  }
}

function newId() {
  return "sp-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

export function listPlans(): IndexEntry[] {
  return readIndex().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function loadPlan(id: string): SafetyPlan | null {
  const ls = safeLS();
  if (!ls) return null;
  try {
    const raw = ls.getItem(PLAN_PREFIX + id);
    return raw ? (JSON.parse(raw) as SafetyPlan) : null;
  } catch {
    return null;
  }
}

export function getActivePlanId(): string | null {
  const ls = safeLS();
  if (!ls) return null;
  try {
    return ls.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function getActivePlan(): SafetyPlan | null {
  const id = getActivePlanId();
  if (!id) return null;
  const p = loadPlan(id);
  return p && p.status === "active" ? p : null;
}

export function setActivePlanId(id: string | null) {
  const ls = safeLS();
  if (!ls) return;
  try {
    if (id) ls.setItem(ACTIVE_KEY, id);
    else ls.removeItem(ACTIVE_KEY);
  } catch {
    /* ignore */
  }
}

type DraftInput = Omit<
  Partial<SafetyPlan>,
  "id" | "createdAt" | "updatedAt" | "status" | "checkIns"
>;

export function createPlan(input: DraftInput): SafetyPlan {
  const now = new Date().toISOString();
  const plan: SafetyPlan = {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    status: "active",
    event: (input.event ?? "").trim(),
    companions: (input.companions ?? "").trim(),
    homeRoute: (input.homeRoute ?? "").trim(),
    intentions: (input.intentions ?? "").trim(),
    hasFirstAid: !!input.hasFirstAid,
    checkInsEnabled: input.checkInsEnabled ?? false,
    checkInIntervalMin: clampInterval(input.checkInIntervalMin ?? 75),
    checkIns: [],
  };
  persistPlan(plan);
  setActivePlanId(plan.id);
  return plan;
}

export function updatePlan(id: string, patch: DraftInput): SafetyPlan | null {
  const cur = loadPlan(id);
  if (!cur) return null;
  const next: SafetyPlan = {
    ...cur,
    event: patch.event !== undefined ? String(patch.event).trim() : cur.event,
    companions: patch.companions !== undefined ? String(patch.companions).trim() : cur.companions,
    homeRoute: patch.homeRoute !== undefined ? String(patch.homeRoute).trim() : cur.homeRoute,
    intentions: patch.intentions !== undefined ? String(patch.intentions).trim() : cur.intentions,
    hasFirstAid: patch.hasFirstAid !== undefined ? !!patch.hasFirstAid : cur.hasFirstAid,
    checkInsEnabled:
      patch.checkInsEnabled !== undefined ? !!patch.checkInsEnabled : cur.checkInsEnabled,
    checkInIntervalMin:
      patch.checkInIntervalMin !== undefined
        ? clampInterval(Number(patch.checkInIntervalMin))
        : cur.checkInIntervalMin,
    updatedAt: new Date().toISOString(),
  };
  persistPlan(next);
  return next;
}

export function completePlan(id: string, reflection?: string): SafetyPlan | null {
  const cur = loadPlan(id);
  if (!cur) return null;
  const now = new Date().toISOString();
  const next: SafetyPlan = {
    ...cur,
    status: "completed",
    completedAt: now,
    updatedAt: now,
    reflection: reflection?.trim() || cur.reflection,
  };
  persistPlan(next);
  if (getActivePlanId() === id) setActivePlanId(null);
  return next;
}

export function deletePlan(id: string) {
  const ls = safeLS();
  if (!ls) return;
  try {
    ls.removeItem(PLAN_PREFIX + id);
  } catch {
    /* ignore */
  }
  writeIndex(readIndex().filter((e) => e.id !== id));
  if (getActivePlanId() === id) setActivePlanId(null);
}

export function clearAllPlans() {
  for (const e of readIndex()) {
    const ls = safeLS();
    try {
      ls?.removeItem(PLAN_PREFIX + e.id);
    } catch {
      /* ignore */
    }
  }
  const ls = safeLS();
  try {
    ls?.removeItem(INDEX_KEY);
    ls?.removeItem(ACTIVE_KEY);
  } catch {
    /* ignore */
  }
}

function persistPlan(plan: SafetyPlan) {
  const ls = safeLS();
  if (!ls) return;
  try {
    ls.setItem(PLAN_PREFIX + plan.id, JSON.stringify(plan));
  } catch {
    /* ignore */
  }
  const idx = readIndex().filter((e) => e.id !== plan.id);
  idx.unshift({
    id: plan.id,
    event: plan.event || "Ohne Titel",
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    status: plan.status,
  });
  writeIndex(idx);
}

function clampInterval(n: number) {
  if (!Number.isFinite(n)) return 75;
  return Math.max(30, Math.min(240, Math.round(n)));
}

/**
 * Kurze, KI-taugliche Zusammenfassung des aktiven Plans.
 * Wird in den Marleen-Kontext eingespeist.
 */
export function summarizePlanForAI(plan: SafetyPlan): string {
  const parts: string[] = [];
  parts.push(`Aktiver Safety-Plan (vom Nutzer für heute Nacht erstellt):`);
  if (plan.event) parts.push(`- Event/Ort: ${plan.event}`);
  if (plan.companions) parts.push(`- Mit dabei: ${plan.companions}`);
  if (plan.homeRoute) parts.push(`- Heimweg: ${plan.homeRoute}`);
  if (plan.intentions) parts.push(`- Vorsätze: ${plan.intentions.replace(/\s+/g, " ")}`);
  parts.push(`- Erste-Hilfe / Naloxon dabei: ${plan.hasFirstAid ? "ja" : "nein"}`);
  parts.push(
    `- Check-ins: ${plan.checkInsEnabled ? `aktiv (alle ${plan.checkInIntervalMin} min)` : "aus"}`,
  );
  return parts.join("\n");
}
