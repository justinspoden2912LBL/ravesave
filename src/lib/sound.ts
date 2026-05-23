/**
 * Sehr dezente UI-Sounds für Voice-Interaktionen.
 * Per Web Audio API erzeugt — keine Assets, kein Netzwerk.
 * Respektiert einen User-Toggle in den Einstellungen (Default: AUS).
 */

const ENABLED_KEY = "ravesave_sounds_enabled";

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ENABLED_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSoundEnabled(v: boolean) {
  try {
    window.localStorage.setItem(ENABLED_KEY, v ? "1" : "0");
  } catch {
    /* ignore */
  }
}

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    return ctx;
  } catch {
    return null;
  }
}

function beep(freq: number, durationMs = 110, volume = 0.04) {
  if (!isSoundEnabled()) return;
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0;
    osc.connect(gain).connect(c.destination);
    const now = c.currentTime;
    // schneller, weicher Attack/Release — kein Klick
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.linearRampToValueAtTime(0, now + durationMs / 1000);
    osc.start(now);
    osc.stop(now + durationMs / 1000 + 0.02);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  listenStart: () => beep(660, 90),
  listenEnd: () => beep(440, 90),
  speakDone: () => beep(540, 70, 0.025),
};
