import { useConversation } from "@elevenlabs/react";
import { useCallback, useEffect, useState } from "react";
import { Mic, PhoneOff, Loader2, AlertCircle } from "lucide-react";

interface VoiceModeProps {
  open: boolean;
  onClose: () => void;
}

export function VoiceMode({ open, onClose }: VoiceModeProps) {
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const conversation = useConversation({
    onConnect: () => setError(null),
    onError: (e) => setError(typeof e === "string" ? e : "Verbindungsfehler"),
  });

  const isConnected = conversation.status === "connected";

  const start = useCallback(async () => {
    setError(null);
    setConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const res = await fetch("/api/voice-token", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          res.status === 503
            ? "Sprachmodus noch nicht konfiguriert. Bitte Admin kontaktieren."
            : data.error || "Token-Fehler",
        );
      }
      const { token } = await res.json();
      await conversation.startSession({
        conversationToken: token,
        connectionType: "webrtc",
      });
    } catch (e: any) {
      setError(e?.message || "Mikrofon-Zugriff oder Verbindung fehlgeschlagen");
    } finally {
      setConnecting(false);
    }
  }, [conversation]);

  const stop = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  // auto-stop on close
  useEffect(() => {
    if (!open && isConnected) {
      void conversation.endSession();
    }
  }, [open, isConnected, conversation]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <div
              className={`h-32 w-32 rounded-full flex items-center justify-center transition-all ${
                isConnected
                  ? conversation.isSpeaking
                    ? "bg-primary/20 scale-110"
                    : "bg-primary/10"
                  : "bg-muted"
              }`}
            >
              <div
                className={`h-20 w-20 rounded-full flex items-center justify-center ${
                  isConnected ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20"
                }`}
              >
                <Mic className="h-8 w-8" />
              </div>
            </div>
            {isConnected && (
              <span
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-medium px-2 py-0.5 rounded-full ${
                  conversation.isSpeaking
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {conversation.isSpeaking ? "Marleen spricht" : "Hört zu"}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold">Sprachmodus mit Marleen</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isConnected
                ? "Sprich einfach los — Marleen hört zu."
                : "Echtzeit-Gespräch. Mikrofon nötig."}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3 w-full text-left">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 w-full">
            {!isConnected ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted"
                >
                  Schließen
                </button>
                <button
                  onClick={start}
                  disabled={connecting}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {connecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                  {connecting ? "Verbinde…" : "Gespräch starten"}
                </button>
              </>
            ) : (
              <button
                onClick={async () => {
                  await stop();
                  onClose();
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium flex items-center justify-center gap-2"
              >
                <PhoneOff className="h-4 w-4" />
                Beenden
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Audio wird in Echtzeit über ElevenLabs verarbeitet. Keine Speicherung des Gesprächs.
          </p>
        </div>
      </div>
    </div>
  );
}
