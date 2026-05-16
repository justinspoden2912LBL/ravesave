import { createFileRoute, Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Mic, MicOff, Paperclip, Send, Square, Volume2, VolumeX, X, FileText, Loader2,
  UserCircle2, History, Plus, Download, Trash2, Save, Check, Pencil,
} from "lucide-react";
import { loadProfile, summarizeProfile } from "@/lib/profile";
import {
  isPersistEnabled, setPersistEnabled,
  listSessions, loadSession, saveSession, deleteSession, renameSession,
  newSessionId, exportSessionJson, exportSessionMarkdown, exportAllJson,
} from "@/lib/chatHistory";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  head: () => ({
    meta: [
      { title: "KI-Chat — Rave Safe, have Fun" },
      { name: "description", content: "Stelle Fragen zu Substanzen, Wechselwirkungen und Studienlage. Antworten basieren auf Harm-Reduction-Quellen — alles lokal in deinem Browser." },
      { property: "og:title", content: "KI-Chat — Rave Safe, have Fun" },
      { property: "og:description", content: "Frag den KI-Chat zu Pharmakologie, Mischkonsum und Harm Reduction." },
      { property: "og:url", content: "https://ravesave.lovable.app/chat" },
    ],
    links: [{ rel: "canonical", href: "https://ravesave.lovable.app/chat" }],
  }),
});

interface Attachment {
  name: string;
  size: number;
  text: string; // extracted plain text (truncated)
}

const MAX_CHARS = 20000;

async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  // Plain text-ish files
  if (
    name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".csv") ||
    name.endsWith(".json") || name.endsWith(".log") || file.type.startsWith("text/")
  ) {
    return (await file.text()).slice(0, MAX_CHARS);
  }
  // Pages / docx / pptx / xlsx — zipped XML, extract text crudely
  if (
    name.endsWith(".pages") || name.endsWith(".docx") || name.endsWith(".pptx") ||
    name.endsWith(".xlsx") || name.endsWith(".key") || name.endsWith(".numbers") ||
    file.type === "application/zip"
  ) {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const parts: string[] = [];
      const candidates = Object.keys(zip.files).filter((p) =>
        p.endsWith(".xml") || p.endsWith("index.xml") || p.endsWith(".txt") || p.includes("preview")
      );
      for (const p of candidates) {
        const f = zip.files[p];
        if (f.dir) continue;
        try {
          const raw = await f.async("string");
          // strip XML tags
          parts.push(raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
        } catch { /* skip binary */ }
        if (parts.join("").length > MAX_CHARS) break;
      }
      const joined = parts.join("\n").trim();
      return joined.slice(0, MAX_CHARS) || `[${file.name}: konnte keinen Text extrahieren]`;
    } catch (e) {
      return `[Fehler beim Lesen von ${file.name}]`;
    }
  }
  // PDF
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return `[PDF "${file.name}" hochgeladen — PDF-Textextraktion im Browser begrenzt. Inhalt bitte ggf. als .txt einfügen.]`;
  }
  return `[Datei ${file.name} (${file.type || "unbekannt"}) hochgeladen — Inhalt nicht lesbar.]`;
}

function ChatPage() {
  const [profileSummary, setProfileSummary] = useState<string>("");
  useEffect(() => {
    const p = loadProfile();
    setProfileSummary(p ? summarizeProfile(p) : "");
  }, []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ profile: profileSummary || undefined }),
      }),
    [profileSummary],
  );
  const { messages, sendMessage, status, stop, error, setMessages } = useChat({ transport });
  const isLoading = status === "submitted" || status === "streaming";

  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [parsing, setParsing] = useState(false);
  const [listening, setListening] = useState(false);
  const [speak, setSpeak] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const spokenIdsRef = useRef<Set<string>>(new Set());

  // ----- Local persistence -----
  const [persist, setPersist] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => newSessionId());
  const [sessions, setSessions] = useState<ReturnType<typeof listSessions>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const refreshSessions = useCallback(() => setSessions(listSessions()), []);

  useEffect(() => {
    setPersist(isPersistEnabled());
    refreshSessions();
  }, [refreshSessions]);

  // Auto-save current chat whenever messages change (if enabled and non-empty)
  useEffect(() => {
    if (!persist || messages.length === 0) return;
    saveSession(sessionId, messages as UIMessage[]);
    refreshSessions();
  }, [messages, persist, sessionId, refreshSessions]);

  function togglePersist(v: boolean) {
    setPersistEnabled(v);
    setPersist(v);
    if (v && messages.length > 0) {
      saveSession(sessionId, messages as UIMessage[]);
      refreshSessions();
    }
  }

  function newChat() {
    setSessionId(newSessionId());
    setMessages([]);
    setInput("");
    setAttachments([]);
    spokenIdsRef.current = new Set();
  }

  function openSession(id: string) {
    const s = loadSession(id);
    if (!s) return;
    setSessionId(s.id);
    setMessages(s.messages);
    setShowHistory(false);
    spokenIdsRef.current = new Set();
  }

  function removeSession(id: string) {
    if (!confirm("Diesen Chat wirklich löschen?")) return;
    deleteSession(id);
    refreshSessions();
    if (id === sessionId) newChat();
  }

  function startRename(id: string, current: string) {
    setRenameId(id);
    setRenameVal(current);
  }
  function commitRename() {
    if (renameId) {
      renameSession(renameId, renameVal);
      refreshSessions();
    }
    setRenameId(null);
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading) taRef.current?.focus();
  }, [isLoading]);

  // TTS: speak assistant messages when finished
  useEffect(() => {
    if (!speak || isLoading) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (spokenIdsRef.current.has(last.id)) return;
    const text = last.parts.map((p: any) => (p.type === "text" ? p.text : "")).join(" ").trim();
    if (!text) return;
    spokenIdsRef.current.add(last.id);
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "de-DE";
      window.speechSynthesis.speak(u);
    } catch { /* ignore */ }
  }, [messages, isLoading, speak]);

  useEffect(() => () => { try { window.speechSynthesis.cancel(); } catch {} }, []);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setParsing(true);
    const list: Attachment[] = [];
    for (const f of Array.from(files)) {
      const text = await extractText(f);
      list.push({ name: f.name, size: f.size, text });
    }
    setAttachments((prev) => [...prev, ...list]);
    setParsing(false);
  }

  function toggleVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Spracherkennung wird in diesem Browser nicht unterstützt. Versuche Chrome/Safari.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const r = new SR();
    r.lang = "de-DE";
    r.interimResults = true;
    r.continuous = true;
    let finalText = input;
    r.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + " ";
        else interim += t;
      }
      setInput((finalText + interim).trimStart());
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start();
    recognitionRef.current = r;
    setListening(true);
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed && attachments.length === 0) return;
    if (isLoading) return;

    let text = trimmed;
    if (attachments.length > 0) {
      const ctx = attachments
        .map((a) => `--- Datei: ${a.name} ---\n${a.text}\n--- Ende ${a.name} ---`)
        .join("\n\n");
      text = `${trimmed}\n\n${ctx}`;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    }

    sendMessage({ text });
    setInput("");
    setAttachments([]);
  }

  const currentSession = sessions.find((s) => s.id === sessionId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 flex flex-col h-[calc(100vh-8rem)] relative">
      <header className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">KI-Chat</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Stelle Fragen, lade Dokumente hoch oder sprich direkt mit der KI.
              {persist
                ? " Verlauf wird lokal in deinem Browser gespeichert."
                : " Verlauf wird nicht gespeichert."}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={newChat} title="Neuer Chat" aria-label="Neuer Chat" className="rounded-full glass p-2 hover:bg-muted/30">
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => { refreshSessions(); setShowHistory(true); }}
              title="Verlauf" aria-label="Chat-Verlauf öffnen"
              className="rounded-full glass p-2 hover:bg-muted/30 relative"
            >
              <History className="h-4 w-4" />
              {sessions.length > 0 && (
                <span className="absolute -top-1 -right-1 rounded-full bg-aurora animate-aurora text-[10px] text-primary-foreground h-4 min-w-4 px-1 flex items-center justify-center">
                  {sessions.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {profileSummary ? (
            <Link to="/settings" className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs text-secondary">
              <UserCircle2 className="h-3.5 w-3.5" /> Profil aktiv
            </Link>
          ) : (
            <Link to="/onboarding" className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs">
              <UserCircle2 className="h-3.5 w-3.5" /> Profil einrichten
            </Link>
          )}

          <label className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={persist}
              onChange={(e) => togglePersist(e.target.checked)}
              className="h-3 w-3 accent-primary"
            />
            <Save className="h-3 w-3" /> Verlauf lokal speichern
          </label>

          {persist && currentSession && (
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
              <Check className="h-3 w-3 text-secondary" />
              {currentSession.title}
            </span>
          )}

          {persist && messages.length > 0 && (
            <>
              <button
                onClick={() => { const s = loadSession(sessionId); if (s) exportSessionMarkdown(s); }}
                className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs hover:bg-muted/30"
              >
                <Download className="h-3 w-3" /> .md
              </button>
              <button
                onClick={() => { const s = loadSession(sessionId); if (s) exportSessionJson(s); }}
                className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs hover:bg-muted/30"
              >
                <Download className="h-3 w-3" /> .json
              </button>
            </>
          )}
        </div>
      </header>

      {showHistory && (
        <div className="absolute inset-0 z-30 flex">
          <div className="flex-1 bg-background/60 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <aside className="w-full max-w-sm h-full glass border-l flex flex-col">
            <div className="p-4 flex items-center justify-between border-b">
              <h2 className="font-semibold">Chat-Verlauf</h2>
              <button onClick={() => setShowHistory(false)} aria-label="Verlauf schließen" className="rounded-full p-1.5 hover:bg-muted/30">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {sessions.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {persist
                    ? "Noch keine gespeicherten Chats."
                    : "Speichern ist deaktiviert. Aktiviere „Verlauf lokal speichern\" um Chats zu behalten."}
                </div>
              ) : (
                <ul className="space-y-1">
                  {sessions.map((s) => (
                    <li
                      key={s.id}
                      className={`rounded-xl p-2 group ${
                        s.id === sessionId ? "bg-primary/10 ring-1 ring-primary/40" : "hover:bg-muted/20"
                      }`}
                    >
                      {renameId === s.id ? (
                        <div className="flex gap-1">
                          <input
                            autoFocus
                            value={renameVal}
                            onChange={(e) => setRenameVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitRename();
                              if (e.key === "Escape") setRenameId(null);
                            }}
                            className="flex-1 rounded-md bg-background/40 px-2 py-1 text-sm outline-none ring-1 ring-border focus:ring-primary"
                          />
                          <button onClick={commitRename} className="rounded-md p-1 hover:bg-muted/30">
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button onClick={() => openSession(s.id)} className="flex-1 text-left min-w-0">
                            <div className="text-sm font-medium truncate">{s.title}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {new Date(s.updatedAt).toLocaleString("de-DE")}
                            </div>
                          </button>
                          <button
                            onClick={() => startRename(s.id, s.title)}
                            title="Umbenennen" aria-label="Umbenennen"
                            className="opacity-0 group-hover:opacity-100 rounded-md p-1 hover:bg-muted/30"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => { const sess = loadSession(s.id); if (sess) exportSessionMarkdown(sess); }}
                            title="Export .md" aria-label="Als Markdown exportieren"
                            className="opacity-0 group-hover:opacity-100 rounded-md p-1 hover:bg-muted/30"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => removeSession(s.id)}
                            title="Löschen" aria-label="Löschen"
                            className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-destructive hover:bg-destructive/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {sessions.length > 0 && (
              <div className="border-t p-3">
                <button
                  onClick={exportAllJson}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-full glass px-3 py-2 text-xs hover:bg-muted/30"
                >
                  <Download className="h-3.5 w-3.5" /> Alle exportieren (.json)
                </button>
              </div>
            )}
          </aside>
        </div>
      )}


      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-2xl glass p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
            <div className="h-16 w-16 rounded-full bg-aurora animate-aurora glow mb-4" />
            <p className="text-sm max-w-sm">
              z.B. „Was sagt die Studienlage zu MDMA-Therapie?" oder lade ein PDF hoch
              und frag „Fasse die wichtigsten Punkte zusammen".
            </p>
          </div>
        )}

        {messages.map((m) => {
          const text = m.parts.map((p: any) => (p.type === "text" ? p.text : "")).join("");
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-aurora animate-aurora text-primary-foreground whitespace-pre-wrap"
                    : "glass"
                }`}
              >
                {isUser ? (
                  text
                ) : (
                  <div className="space-y-2 [&_a]:text-secondary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_p]:my-1.5 [&_strong]:font-semibold [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:font-semibold [&_code]:rounded [&_code]:bg-muted/40 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ ...props }: any) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" />
                        ),
                      }}
                    >
                      {text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl px-4 py-2.5 text-sm text-muted-foreground inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              denkt…
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
            Fehler: {error.message}
          </div>
        )}
      </div>

      {/* Attachments preview */}
      {(attachments.length > 0 || parsing) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {parsing && (
            <div className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs">
              <Loader2 className="h-3 w-3 animate-spin" /> Datei wird gelesen…
            </div>
          )}
          {attachments.map((a, i) => (
            <div key={i} className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs">
              <FileText className="h-3 w-3" />
              <span className="max-w-[180px] truncate">{a.name}</span>
              <button
                onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Composer */}
      <form onSubmit={submit} className="mt-3 rounded-2xl glass p-2">
        <textarea
          ref={taRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
          placeholder={listening ? "Spricht… (Mikro tippen zum Stoppen)" : "Frag etwas oder lade eine Datei hoch…"}
          rows={2}
          className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between gap-2 px-1 pt-1">
          <div className="flex items-center gap-1">
            <label className="cursor-pointer rounded-full p-2 hover:bg-muted/40" title="Datei anhängen" aria-label="Datei anhängen">
              <Paperclip className="h-4 w-4" />
              <input
                type="file"
                multiple
                onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={toggleVoice}
              className={`rounded-full p-2 transition ${listening ? "bg-risk-danger/30 text-risk-danger" : "hover:bg-muted/40"}`}
              title={listening ? "Aufnahme stoppen" : "Sprache → Text"}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => { setSpeak(!speak); if (speak) window.speechSynthesis.cancel(); }}
              className={`rounded-full p-2 transition ${speak ? "bg-secondary/30 text-secondary" : "hover:bg-muted/40"}`}
              title={speak ? "Sprachausgabe an (klicken zum Ausschalten)" : "Antworten vorlesen"}
            >
              {speak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>

          {isLoading ? (
            <button type="button" onClick={() => stop()} className="rounded-full bg-destructive/80 p-2 text-destructive-foreground" title="Stoppen" aria-label="Antwort stoppen">
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() && attachments.length === 0}
              className="rounded-full bg-aurora animate-aurora p-2 text-primary-foreground glow disabled:opacity-40 disabled:bg-none"
              title="Senden" aria-label="Nachricht senden"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
