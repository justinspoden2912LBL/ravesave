import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouterState } from "@tanstack/react-router";
import { Sparkles, Send, Square, X, AlertTriangle, ShieldAlert } from "lucide-react";
import { loadProfile, summarizeProfile } from "@/lib/profile";

/**
 * Globaler "KI fragen"-Button — unten links als FAB.
 * - Versteckt auf /admin* und /reset-password
 * - Verdeckt den Notfall-Button (unten rechts) bewusst nicht.
 * - Datenschutz-Hinweis vor erster Nutzung.
 * - Opt-in für lokales Profil als Antwort-Kontext.
 */

const PRIVACY_ACK_KEY = "ravesave_ai_panel_privacy_ack";
const PROFILE_OPTIN_KEY = "ravesave_ai_panel_profile_optin";

const SUGGESTIONS = [
  "Erklär mir diese Substanz einfacher",
  "Was bedeutet diese Risikostufe?",
  "Wie nutze ich den Mix-Check?",
  "Was soll ich im Notfall sagen?",
  "Wo finde ich mein Protokoll?",
];

const EMERGENCY_REGEX =
  /\b(bewusstlos|krampf|krampfanfall|atemnot|atem stockt|nicht ansprechbar|brustschmerz|herzrasen|kollaps|überhitz|hyperthermie|reagiert nicht|suizid|umkippen|umgekippt)\b/i;

export function AiAskButton() {
  const router = useRouterState();
  const path = router.location.pathname;
  const hidden =
    path.startsWith("/admin") ||
    path.startsWith("/reset-password");

  const [open, setOpen] = useState(false);
  const [privacyAck, setPrivacyAck] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(PRIVACY_ACK_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [profileOptIn, setProfileOptIn] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(PROFILE_OPTIN_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (hidden) return null;

  function ack() {
    setPrivacyAck(true);
    try {
      window.localStorage.setItem(PRIVACY_ACK_KEY, "1");
    } catch {
      /* ignore */
    }
  }
  function toggleProfile(v: boolean) {
    setProfileOptIn(v);
    try {
      window.localStorage.setItem(PROFILE_OPTIN_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="KI fragen"
        onClick={() => setOpen(true)}
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)",
          left: "calc(env(safe-area-inset-left, 0px) + 1rem)",
        }}
        className="fixed z-40 print:hidden inline-flex items-center gap-2 rounded-full bg-secondary/95 px-3.5 py-2.5 text-sm font-semibold text-secondary-foreground shadow-lg ring-1 ring-secondary/40 hover:brightness-110 transition min-h-11"
      >
        <Sparkles className="h-4 w-4" />
        <span>KI fragen</span>
      </button>

      {open && (
        <AiPanel
          onClose={() => setOpen(false)}
          privacyAck={privacyAck}
          onAck={ack}
          profileOptIn={profileOptIn}
          onToggleProfile={toggleProfile}
        />
      )}
    </>
  );
}

function AiPanel({
  onClose,
  privacyAck,
  onAck,
  profileOptIn,
  onToggleProfile,
}: {
  onClose: () => void;
  privacyAck: boolean;
  onAck: () => void;
  profileOptIn: boolean;
  onToggleProfile: (v: boolean) => void;
}) {
  const [profileSummary, setProfileSummary] = useState("");
  useEffect(() => {
    if (!profileOptIn) {
      setProfileSummary("");
      return;
    }
    const p = loadProfile();
    setProfileSummary(p ? summarizeProfile(p) : "");
  }, [profileOptIn]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ profile: profileSummary || undefined }),
      }),
    [profileSummary],
  );
  const { messages, sendMessage, status, stop, error } = useChat({ transport });
  const isLoading = status === "submitted" || status === "streaming";

  const [input, setInput] = useState("");
  const [emergencyWarn, setEmergencyWarn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, emergencyWarn]);

  // Lock body scroll while panel open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function send(text: string) {
    const t = text.trim();
    if (!t || isLoading) return;
    if (EMERGENCY_REGEX.test(t)) {
      setEmergencyWarn(true);
    }
    sendMessage({ text: t });
    setInput("");
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="KI fragen"
      className="fixed inset-0 z-[90] print:hidden flex items-end sm:items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full sm:max-w-lg sm:m-4 max-h-[88dvh] sm:max-h-[80vh] flex flex-col rounded-t-2xl sm:rounded-2xl glass border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 p-4 border-b border-border/60">
          <div>
            <h2 className="text-base font-bold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-secondary" /> KI fragen
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              KI kann Fehler machen. Keine medizinische Beratung. Bei akuten Symptomen{" "}
              <a href="tel:112" className="font-semibold text-destructive hover:underline">
                112
              </a>{" "}
              rufen.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="rounded-full p-1.5 hover:bg-muted/40 min-h-9 min-w-9 inline-flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Privacy gate */}
        {!privacyAck ? (
          <div className="p-5 space-y-3 text-sm">
            <div className="flex items-start gap-2 text-muted-foreground">
              <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-secondary" />
              <p>
                Deine Eingaben werden zur Beantwortung an einen externen KI-Anbieter gesendet.
                <strong className="text-foreground"> Gib keine Informationen ein, die du nicht teilen möchtest.</strong>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Lokale Profil- und Protokolldaten werden nur einbezogen, wenn du das unten ausdrücklich aktivierst.
            </p>
            <button
              type="button"
              onClick={onAck}
              className="w-full rounded-full bg-aurora animate-aurora py-2.5 text-sm font-semibold text-primary-foreground glow min-h-11"
            >
              Verstanden — KI nutzen
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && !emergencyWarn && (
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>Stell eine Frage oder wähle einen Vorschlag:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-full glass px-3 py-1.5 text-xs hover:bg-muted/30 min-h-9"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {emergencyWarn && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive flex gap-2 items-start">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Klingt nach einem Notfall.</p>
                    <p className="text-xs mt-1">
                      Ruf jetzt{" "}
                      <a href="tel:112" className="underline font-semibold">
                        112
                      </a>
                      . KI ersetzt keinen Rettungsdienst.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((m) => {
                const text = m.parts
                  ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                  .map((p) => p.text)
                  .join("") ?? "";
                return (
                  <div
                    key={m.id}
                    className={
                      m.role === "user"
                        ? "rounded-2xl rounded-br-sm bg-primary/15 px-3 py-2 text-sm ml-6"
                        : "rounded-2xl rounded-bl-sm bg-muted/40 px-3 py-2 text-sm mr-6 prose prose-sm prose-invert max-w-none"
                    }
                  >
                    {m.role === "user" ? (
                      <p className="whitespace-pre-wrap">{text}</p>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                    )}
                  </div>
                );
              })}

              {error && (
                <p className="text-xs text-destructive" role="alert">
                  Fehler: {error.message}
                </p>
              )}
            </div>

            {/* Opt-in profile */}
            <div className="px-4 py-2 border-t border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground">
              <input
                id="ai-profile-optin"
                type="checkbox"
                checked={profileOptIn}
                onChange={(e) => onToggleProfile(e.target.checked)}
                className="h-3.5 w-3.5 accent-secondary"
              />
              <label htmlFor="ai-profile-optin" className="cursor-pointer">
                Lokale Profil-/Protokolldaten für diese Antwort berücksichtigen
              </label>
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="p-3 border-t border-border/60 flex items-end gap-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Frag die KI…"
                aria-label="Nachricht an die KI"
                className="flex-1 resize-none rounded-xl bg-input px-3 py-2 text-sm max-h-32 min-h-11"
              />
              {isLoading ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  aria-label="Antwort stoppen"
                  className="rounded-full bg-muted px-3 py-2 text-sm min-h-11"
                >
                  <Square className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Senden"
                  className="rounded-full bg-aurora animate-aurora px-3 py-2 text-sm font-semibold text-primary-foreground glow disabled:opacity-50 min-h-11"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
