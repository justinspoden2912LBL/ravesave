import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Paperclip, Send, Square, Volume2, VolumeX, X, FileText, Loader2, UserCircle2 } from "lucide-react";
import { loadProfile, summarizeProfile } from "@/lib/profile";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  head: () => ({ meta: [{ title: "KI-Chat — trace" }] }),
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
  const { messages, sendMessage, status, stop, error } = useChat({ transport });

  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [parsing, setParsing] = useState(false);
  const [listening, setListening] = useState(false);
  const [speak, setSpeak] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const spokenIdsRef = useRef<Set<string>>(new Set());

  const isLoading = status === "submitted" || status === "streaming";

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 flex flex-col h-[calc(100vh-8rem)]">
      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">KI-Chat</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Stelle Fragen zu Substanzen, lade Dokumente hoch (txt, md, pdf, docx, pages…) oder sprich direkt mit der KI.
          Alles bleibt zwischen dir und dem KI-Endpunkt — kein Verlauf wird gespeichert.
        </p>
      </header>

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
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                  isUser
                    ? "bg-aurora animate-aurora text-primary-foreground"
                    : "glass"
                }`}
              >
                {text}
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
            <label className="cursor-pointer rounded-full p-2 hover:bg-muted/40" title="Datei anhängen">
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
            <button type="button" onClick={() => stop()} className="rounded-full bg-destructive/80 p-2 text-destructive-foreground" title="Stoppen">
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() && attachments.length === 0}
              className="rounded-full bg-aurora animate-aurora p-2 text-primary-foreground glow disabled:opacity-40 disabled:bg-none"
              title="Senden"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
