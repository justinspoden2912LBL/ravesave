import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouterState } from "@tanstack/react-router";
import { Sparkles, Send, Square, X, AlertTriangle, ShieldAlert, Volume2, VolumeX } from "lucide-react";
import { loadProfile, summarizeProfile } from "@/lib/profile";
import {
  useAiContext,
  useAiMode,
  setAiMode,
  serializeAiContext,
  quickActionsFor,
  MODE_LABEL,
  type AiMode,
} from "@/lib/aiContext";

/**
 * Globaler "KI fragen"-Button — unten links als FAB.
 * - Versteckt auf /admin* und /reset-password
 * - Sendet App-Kontext (aktuelle Seite, Substanz, Mix, Log, Notfall) an die KI
 * - Modus Einfach / Normal / Experte steuert Antwortstil
 * - Kontextuelle Quick-Actions je nach Seite/Inhalt
 */

const PRIVACY_ACK_KEY = "ravesave_ai_panel_privacy_ack";
const PROFILE_OPTIN_KEY = "ravesave_ai_panel_profile_optin";
const VOICE_OPTIN_KEY = "ravesave_ai_panel_voice_optin";

const EMERGENCY_REGEX =
  /\b(bewusstlos|krampf|krampfanfall|atemnot|atem stockt|nicht ansprechbar|brustschmerz|herzrasen|kollaps|überhitz|hyperthermie|reagiert nicht|suizid|umkippen|umgekippt)\b/i;

export function AiAskButton() {
  const router = useRouterState();
  const path = router.location.pathname;
  const hidden = path.startsWith("/admin") || path.startsWith("/reset-password");

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
        aria-label="Marlene fragen — KI-Assistentin"
        onClick={() => setOpen(true)}
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)",
          left: "calc(env(safe-area-inset-left, 0px) + 1rem)",
        }}
        className="fixed z-40 print:hidden inline-flex items-center gap-2 rounded-full bg-secondary/95 px-3.5 py-2.5 text-sm font-semibold text-secondary-foreground shadow-lg ring-1 ring-secondary/40 hover:brightness-110 transition min-h-11"
      >
        <Sparkles className="h-4 w-4" />
        <span>Marlene fragen</span>
      </button>

      {open && (
        <AiPanel
          onClose={() => setOpen(false)}
          privacyAck={privacyAck}
          onAck={ack}
          profileOptIn={profileOptIn}
          onToggleProfile={toggleProfile}
          currentPath={path}
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
  currentPath,
}: {
  onClose: () => void;
  privacyAck: boolean;
  onAck: () => void;
  profileOptIn: boolean;
  onToggleProfile: (v: boolean) => void;
  currentPath: string;
}) {
  const mode = useAiMode();
  const ctx = useAiContext();
  // route immer mitgeben, auch wenn keine Seite es explizit registriert hat
  const effectiveCtx = useMemo(() => ({ ...ctx, route: ctx.route ?? currentPath }), [ctx, currentPath]);
  const appContextStr = useMemo(() => serializeAiContext(effectiveCtx), [effectiveCtx]);
  const quickActions = useMemo(() => quickActionsFor(effectiveCtx), [effectiveCtx]);

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
        body: () => ({
          profile: profileSummary || undefined,
          appContext: appContextStr || undefined,
          mode,
        }),
      }),
    [profileSummary, appContextStr, mode],
  );
  const { messages, sendMessage, status, stop, error } = useChat({ transport });
  const isLoading = status === "submitted" || status === "streaming";

  const [input, setInput] = useState("");
  const [emergencyWarn, setEmergencyWarn] = useState(false);
  const [easterEgg, setEasterEgg] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, emergencyWarn]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

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
    // 🐯 Easter Egg — kleine Liebesnachricht des Entwicklers
    if (/🐯/.test(t)) {
      setEasterEgg(true);
      setInput("");
      return;
    }
    if (EMERGENCY_REGEX.test(t) || effectiveCtx.emergencyActive) {
      setEmergencyWarn(true);
    }
    sendMessage({ text: t });
    setInput("");
  }

  // kompakter Kontext-Chip, der zeigt was die KI gerade sieht
  const ctxChips: string[] = [];
  if (effectiveCtx.wikiSubstance) ctxChips.push(`Substanz: ${effectiveCtx.wikiSubstance.name}`);
  if (effectiveCtx.mixSelected?.length) ctxChips.push(`Mix: ${effectiveCtx.mixSelected.map((s) => s.name).join(" + ")}`);
  if (effectiveCtx.mixRisk) ctxChips.push(`Risiko: ${effectiveCtx.mixRisk.level}`);
  if (effectiveCtx.logForm?.substance) ctxChips.push(`Log: ${effectiveCtx.logForm.substance}`);
  if (effectiveCtx.emergencyActive) ctxChips.push("Notfall-Modus");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="KI fragen"
      className="fixed inset-0 z-[90] print:hidden flex items-end sm:items-center justify-center"
    >
      {easterEgg && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/85 backdrop-blur-md p-6"
          onClick={() => setEasterEgg(false)}
          role="dialog"
          aria-label="Nachricht des Entwicklers"
        >
          <div className="relative max-w-sm w-full rounded-2xl border border-secondary/40 bg-card/90 p-6 text-center shadow-2xl glow animate-in fade-in zoom-in duration-500">
            <div className="text-5xl mb-3 animate-bounce">🐯❤️</div>
            <p className="text-xs uppercase tracking-widest text-secondary mb-2">
              Nachricht des Entwicklers
            </p>
            <p className="text-lg font-semibold leading-snug">
              Du bist für mich die schönste Droge <span className="text-destructive">❤️</span>
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEasterEgg(false);
              }}
              className="mt-5 rounded-full bg-aurora animate-aurora px-4 py-2 text-sm font-semibold text-primary-foreground glow min-h-11"
            >
              ❤️
            </button>
          </div>
        </div>
      )}
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full sm:max-w-lg sm:m-4 max-h-[88dvh] sm:max-h-[80vh] flex flex-col rounded-t-2xl sm:rounded-2xl glass border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 p-4 border-b border-border/60">
          <div className="min-w-0">
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
            className="rounded-full p-1.5 hover:bg-muted/40 min-h-9 min-w-9 inline-flex items-center justify-center shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode toggle + Context preview */}
        {privacyAck && (
          <div className="px-4 py-2 border-b border-border/60 flex flex-wrap items-center gap-2">
            <div
              role="radiogroup"
              aria-label="Antwortmodus"
              className="inline-flex rounded-full bg-muted/40 p-0.5"
            >
              {(["einfach", "normal", "experte"] as AiMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => setAiMode(m)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                    mode === m
                      ? "bg-secondary text-secondary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {MODE_LABEL[m]}
                </button>
              ))}
            </div>
            {ctxChips.length > 0 && (
              <div className="flex flex-wrap gap-1 min-w-0">
                {ctxChips.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary/90 ring-1 ring-primary/20 truncate max-w-[12rem]"
                    title={c}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

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
              Die KI sieht außerdem, auf welcher Seite du gerade bist (z.B. „Mix-Checker mit MDMA + Alkohol"), um
              passend zu antworten — keine personenbezogenen Daten.
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
                  <p>Stell eine Frage oder wähle einen passenden Vorschlag:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickActions.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => send(s.prompt)}
                        className="rounded-full glass px-3 py-1.5 text-xs hover:bg-muted/30 min-h-9"
                      >
                        {s.label}
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

            {/* Quick chips above input — auch nach erster Nachricht erreichbar */}
            {messages.length > 0 && (
              <div className="px-3 py-2 border-t border-border/60 flex flex-wrap gap-1.5">
                {quickActions.slice(0, 4).map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => send(s.prompt)}
                    disabled={isLoading}
                    className="rounded-full glass px-2.5 py-1 text-[11px] hover:bg-muted/30 disabled:opacity-50"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

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
