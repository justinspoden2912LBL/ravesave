// Local chat history — stored in localStorage, optionally exportable.
import type { UIMessage } from "ai";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: UIMessage[];
}

const INDEX_KEY = "trace.chat.index.v1";
const SESSION_PREFIX = "trace.chat.session.v1:";
const ENABLED_KEY = "trace.chat.persist.enabled";

export function isPersistEnabled(): boolean {
  if (typeof window === "undefined") return false;
  // default ON once user opts in; default OFF initially to respect privacy
  return localStorage.getItem(ENABLED_KEY) === "1";
}
export function setPersistEnabled(v: boolean) {
  localStorage.setItem(ENABLED_KEY, v ? "1" : "0");
}

interface IndexEntry { id: string; title: string; updatedAt: string; createdAt: string }

export function listSessions(): IndexEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    const arr = raw ? (JSON.parse(raw) as IndexEntry[]) : [];
    return arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

function writeIndex(entries: IndexEntry[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(entries));
}

export function loadSession(id: string): ChatSession | null {
  try {
    const raw = localStorage.getItem(SESSION_PREFIX + id);
    return raw ? (JSON.parse(raw) as ChatSession) : null;
  } catch {
    return null;
  }
}

function deriveTitle(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "Neuer Chat";
  const text = (first.parts ?? [])
    .map((p: any) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  // strip attachment context block
  const clean = text.split("\n\n--- Datei:")[0].trim();
  return (clean || "Neuer Chat").slice(0, 60);
}

export function saveSession(id: string, messages: UIMessage[], existingTitle?: string): ChatSession {
  const now = new Date().toISOString();
  const prev = loadSession(id);
  const session: ChatSession = {
    id,
    title: existingTitle ?? prev?.title ?? deriveTitle(messages),
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
    messages,
  };
  // auto-update title if still default and we now have a user message
  if (session.title === "Neuer Chat") session.title = deriveTitle(messages);

  localStorage.setItem(SESSION_PREFIX + id, JSON.stringify(session));
  const idx = listSessions().filter((e) => e.id !== id);
  idx.unshift({ id, title: session.title, createdAt: session.createdAt, updatedAt: session.updatedAt });
  writeIndex(idx);
  return session;
}

export function renameSession(id: string, title: string) {
  const s = loadSession(id);
  if (!s) return;
  s.title = title.trim() || s.title;
  s.updatedAt = new Date().toISOString();
  localStorage.setItem(SESSION_PREFIX + id, JSON.stringify(s));
  const idx = listSessions().map((e) => (e.id === id ? { ...e, title: s.title, updatedAt: s.updatedAt } : e));
  writeIndex(idx);
}

export function deleteSession(id: string) {
  localStorage.removeItem(SESSION_PREFIX + id);
  writeIndex(listSessions().filter((e) => e.id !== id));
}

export function clearAllSessions() {
  for (const e of listSessions()) localStorage.removeItem(SESSION_PREFIX + e.id);
  localStorage.removeItem(INDEX_KEY);
}

export function newSessionId(): string {
  return (
    "c-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

// ---------- Export ----------
export function sessionToMarkdown(s: ChatSession): string {
  const lines: string[] = [`# ${s.title}`, "", `_Erstellt: ${s.createdAt}_`, ""];
  for (const m of s.messages) {
    const role = m.role === "user" ? "**Du**" : m.role === "assistant" ? "**trace KI**" : `**${m.role}**`;
    const text = (m.parts ?? []).map((p: any) => (p.type === "text" ? p.text : "")).join("");
    lines.push(role, "", text, "", "---", "");
  }
  return lines.join("\n");
}

export function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportSessionJson(s: ChatSession) {
  downloadBlob(`trace-chat-${s.id}.json`, JSON.stringify(s, null, 2), "application/json");
}
export function exportSessionMarkdown(s: ChatSession) {
  downloadBlob(`trace-chat-${s.id}.md`, sessionToMarkdown(s), "text/markdown");
}
export function exportAllJson() {
  const all = listSessions().map((e) => loadSession(e.id)).filter(Boolean);
  downloadBlob(`trace-chats-${Date.now()}.json`, JSON.stringify(all, null, 2), "application/json");
}
