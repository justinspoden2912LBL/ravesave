/**
 * TTS-Abstraktionsschicht für Marleen.
 *
 * Ziele:
 * - kostenlose Standard-Lösung (Web Speech API, läuft lokal im Browser)
 * - swappable Backends (ElevenLabs heute, lokaler Open-Source-Server morgen)
 * - deutsche, weibliche, warm/freundlich klingende Default-Stimme
 *
 * Eigenes Backend einbinden:
 *   1. Container starten, der eine HTTP-POST-Route bereitstellt:
 *        POST /tts  { text, voice? }  →  audio/mpeg
 *      Beispiele für freie Stacks:
 *        - Coqui-TTS / VITS (Docker: ghcr.io/coqui-ai/tts)
 *        - Piper (rhasspy/piper, sehr schnell, deutsche Stimmen verfügbar)
 *        - KittenTTS / Kokoro
 *   2. URL hier als Provider "custom" hinterlegen (siehe CUSTOM_TTS_URL).
 *   3. In den Settings (oder via setTTSProvider) auf "custom" umstellen.
 *
 * Eine docker-compose-Vorlage liegt unter docs/tts-selfhost.md.
 */

export type TTSProviderId = "browser" | "elevenlabs" | "custom";

export interface TTSVoice {
  id: string;
  label: string;
  lang: string;
  gender?: "female" | "male" | "neutral";
}

const KEY_PROVIDER = "ravesave.tts.provider.v1";
const KEY_VOICE = "ravesave.tts.voice.v1";

/** Optional: URL eines selbst gehosteten TTS-Servers (POST {text} → audio). */
const CUSTOM_TTS_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_CUSTOM_TTS_URL) || "";

// ---------- State ----------

export function getTTSProvider(): TTSProviderId {
  if (typeof window === "undefined") return "browser";
  const v = window.localStorage.getItem(KEY_PROVIDER);
  if (v === "elevenlabs" || v === "custom" || v === "browser") return v;
  return "browser";
}

export function setTTSProvider(p: TTSProviderId) {
  try {
    window.localStorage.setItem(KEY_PROVIDER, p);
  } catch {
    /* ignore */
  }
}

export function getPreferredVoiceId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY_VOICE);
}

export function setPreferredVoiceId(id: string | null) {
  try {
    if (id) window.localStorage.setItem(KEY_VOICE, id);
    else window.localStorage.removeItem(KEY_VOICE);
  } catch {
    /* ignore */
  }
}

// ---------- Browser (Web Speech API) ----------

/**
 * Wartet bis voiceslist geladen ist (Chrome lädt asynchron).
 */
function waitForVoices(timeout = 1500): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing.length) return resolve(existing);
    const t = setTimeout(() => resolve(synth.getVoices()), timeout);
    synth.addEventListener(
      "voiceschanged",
      () => {
        clearTimeout(t);
        resolve(synth.getVoices());
      },
      { once: true },
    );
  });
}

/** Heuristik: deutsch + weiblich, freundlich. */
function pickGermanFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const de = voices.filter((v) => v.lang?.toLowerCase().startsWith("de"));
  if (de.length === 0) return voices[0] ?? null;

  // bekannte freundliche, weibliche deutsche Stimmen
  const preferred = [
    "Anna", "Petra", "Helena", "Marlene", "Katja", "Vicki", "Hedda", "Eva",
    "Google Deutsch",
  ];
  for (const name of preferred) {
    const hit = de.find((v) => v.name.toLowerCase().includes(name.toLowerCase()));
    if (hit) return hit;
  }
  // fallback: weiblich klingende Namen-Heuristik
  const female = de.find((v) => /a|e|ie/i.test(v.name.slice(-2)));
  return female ?? de[0];
}

export async function listBrowserVoices(): Promise<TTSVoice[]> {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  const voices = await waitForVoices();
  return voices
    .filter((v) => v.lang?.toLowerCase().startsWith("de"))
    .map((v) => ({
      id: `browser:${v.voiceURI}`,
      label: `${v.name} (${v.lang})`,
      lang: v.lang,
    }));
}

async function speakBrowser(text: string, voiceId?: string | null): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    throw new Error("SpeechSynthesis nicht verfügbar");
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const voices = await waitForVoices();
  let chosen: SpeechSynthesisVoice | null = null;
  if (voiceId?.startsWith("browser:")) {
    const uri = voiceId.slice("browser:".length);
    chosen = voices.find((v) => v.voiceURI === uri) ?? null;
  }
  if (!chosen) chosen = pickGermanFemaleVoice(voices);

  return new Promise<void>((resolve, reject) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = chosen?.lang || "de-DE";
    if (chosen) u.voice = chosen;
    // warm, leicht lächelnd, locker → minimal höher als neutral, normales Tempo
    u.rate = 1.0;
    u.pitch = 1.05;
    u.volume = 1;
    u.onend = () => resolve();
    u.onerror = (e) => reject(new Error(e.error || "TTS-Fehler"));
    synth.speak(u);
  });
}

// ---------- HTTP-Backends (ElevenLabs / custom) ----------

async function speakHttp(url: string, text: string, signal?: AbortSignal): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal,
  });
  if (!res.ok) throw new Error(`TTS-Server ${res.status}`);
  const blob = await res.blob();
  const audioUrl = URL.createObjectURL(blob);
  const audio = new Audio(audioUrl);
  await new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      reject(new Error("Audio-Wiedergabe fehlgeschlagen"));
    };
    audio.play().catch(reject);
  });
}

// ---------- öffentliches API ----------

export interface SpeakOptions {
  /** Provider-Override; sonst aus localStorage */
  provider?: TTSProviderId;
  /** Voice-ID-Override */
  voiceId?: string | null;
  /** Abbruch-Signal */
  signal?: AbortSignal;
}

/**
 * Sprich `text` aus. Promise resolved, sobald die Wiedergabe fertig ist.
 * Wirft bei fatalen Fehlern; HTTP-Backends fallen automatisch auf Browser zurück.
 */
export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  const clean = text.trim();
  if (!clean) return;
  const provider = opts.provider ?? getTTSProvider();
  const voiceId = opts.voiceId ?? getPreferredVoiceId();

  try {
    if (provider === "elevenlabs") {
      return await speakHttp("/api/tts", clean, opts.signal);
    }
    if (provider === "custom") {
      if (!CUSTOM_TTS_URL) throw new Error("VITE_CUSTOM_TTS_URL nicht gesetzt");
      return await speakHttp(CUSTOM_TTS_URL, clean, opts.signal);
    }
    return await speakBrowser(clean, voiceId);
  } catch (e) {
    // Fallback auf Browser-TTS, damit "Vorlesen" zumindest etwas tut
    if (provider !== "browser") {
      console.warn("[tts] fallback to browser TTS:", e);
      return speakBrowser(clean, voiceId);
    }
    throw e;
  }
}

export function cancelSpeech() {
  try {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } catch {
    /* ignore */
  }
}

export const TTS_PROVIDER_LABEL: Record<TTSProviderId, string> = {
  browser: "Browser-Stimme (kostenlos, lokal)",
  elevenlabs: "ElevenLabs (natürlicher, online)",
  custom: "Eigener Server",
};
