export interface LogEntry {
  id: string;
  substanceId: string;
  dose: string;
  unit: string;
  route: string;
  timestamp: number; // ms
  notes?: string;
  mood?: number; // 1-5
}

const KEY = "trace_log_v1";

export function loadEntries(): LogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveEntries(entries: LogEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function addEntry(e: Omit<LogEntry, "id">): LogEntry {
  const entries = loadEntries();
  const entry: LogEntry = { ...e, id: crypto.randomUUID() };
  entries.unshift(entry);
  saveEntries(entries);
  return entry;
}

export function deleteEntry(id: string) {
  saveEntries(loadEntries().filter((e) => e.id !== id));
}

// Return entries within a time window around `now` to flag active substances
export function activeNear(timestamp: number, windowHours = 12): LogEntry[] {
  const ms = windowHours * 3600 * 1000;
  return loadEntries().filter((e) => Math.abs(e.timestamp - timestamp) <= ms);
}
