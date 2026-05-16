// Schlichte, klare SVG-Illustrationen für Erste-Hilfe-Schritte.
// Stilrichtlinie: 2px Stroke, currentColor, abgerundete Enden, keine Farben —
// erbt die Textfarbe des Kontexts (z. B. text-destructive im Notfall-Dialog).
import type { ReactElement, SVGProps } from "react";

export type IllusKey =
  | "recovery"
  | "airway"
  | "cpr"
  | "rescueBreath"
  | "cooling"
  | "seizurePad"
  | "noMouth"
  | "sitUp"
  | "breath"
  | "phone112"
  | "naloxone"
  | "checkBreath"
  | "talkdown"
  | "shake"
  | "coolRoom"
  | "hydrate"
  | "noSubstance"
  | "stopwatch"
  | "blanket"
  | "quietRoom"
  | "clearMouth"
  | "dontHold"
  | "dontStop";

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 120 80",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  xmlns: "http://www.w3.org/2000/svg",
};

function Recovery(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Boden */}
      <line x1="5" y1="68" x2="115" y2="68" strokeDasharray="3 4" />
      {/* Kopf seitlich */}
      <circle cx="28" cy="50" r="8" />
      {/* Körper als Bogen liegend auf der Seite */}
      <path d="M36 52 C 55 48, 70 50, 86 56" />
      {/* Oberer Arm angewinkelt nach oben */}
      <path d="M40 50 L 48 38 L 56 44" />
      {/* Unterer Arm vor Brust, Hand an Wange */}
      <path d="M44 56 L 38 60 L 34 56" />
      {/* Angewinkeltes oberes Bein */}
      <path d="M82 56 L 96 58 L 100 70 L 88 70" />
      {/* Unteres Bein gestreckt */}
      <path d="M82 60 L 110 64" />
    </svg>
  );
}

function Airway(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Kopf seitlich, Kopf überstreckt, Kinn hoch */}
      <circle cx="55" cy="40" r="14" />
      {/* Hals und Schulter */}
      <path d="M65 50 L 78 60 L 110 60" />
      {/* Hand am Kinn hebt an */}
      <path d="M68 36 L 76 30 L 84 32" />
      {/* Hand auf Stirn drückt zurück */}
      <path d="M52 26 L 44 20 L 36 22" />
      {/* Pfeil Luftweg */}
      <path d="M22 40 L 38 40" />
      <path d="M34 36 L 38 40 L 34 44" />
    </svg>
  );
}

function CPR(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="5" y1="68" x2="115" y2="68" strokeDasharray="3 4" />
      {/* Liegende Person */}
      <circle cx="25" cy="58" r="6" />
      <path d="M31 60 L 95 60" />
      <path d="M70 60 L 78 70 L 90 70" />
      {/* Helfer-Arme von oben gestreckt */}
      <path d="M58 18 L 58 44" />
      <path d="M66 18 L 66 44" />
      {/* Hände auf Brustmitte */}
      <rect x="54" y="44" width="16" height="8" rx="2" />
      {/* Druck-Pfeile */}
      <path d="M48 22 L 48 32" />
      <path d="M45 29 L 48 33 L 51 29" />
      <path d="M76 22 L 76 32" />
      <path d="M73 29 L 76 33 L 79 29" />
    </svg>
  );
}

function RescueBreath(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Liegender Kopf */}
      <circle cx="80" cy="50" r="12" />
      <path d="M90 56 L 115 60" />
      {/* Helfer-Kopf beugt sich */}
      <circle cx="40" cy="34" r="10" />
      <path d="M32 42 L 28 60" />
      {/* Atem-Pfeil */}
      <path d="M50 44 C 58 44, 64 46, 70 48" />
      <path d="M66 44 L 70 48 L 66 52" />
    </svg>
  );
}

function Cooling(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Person sitzend */}
      <circle cx="60" cy="22" r="10" />
      <path d="M60 32 L 60 56" />
      <path d="M60 40 L 46 50" />
      <path d="M60 40 L 74 50" />
      <path d="M60 56 L 50 70" />
      <path d="M60 56 L 70 70" />
      {/* Wassertropfen links */}
      <path d="M28 26 q -4 6 0 10 q 4 -4 0 -10 z" />
      <path d="M22 40 q -4 6 0 10 q 4 -4 0 -10 z" />
      {/* Wassertropfen rechts */}
      <path d="M96 26 q -4 6 0 10 q 4 -4 0 -10 z" />
      <path d="M102 40 q -4 6 0 10 q 4 -4 0 -10 z" />
    </svg>
  );
}

function SeizurePad(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="5" y1="68" x2="115" y2="68" strokeDasharray="3 4" />
      {/* Kopf mit Polster darunter */}
      <circle cx="30" cy="52" r="9" />
      <path d="M14 60 q 16 -10 32 0 z" />
      {/* Körper zuckend (Wellen) */}
      <path d="M40 56 q 6 -6 12 0 t 12 0 t 12 0 t 12 0" />
      {/* Hände-Weg-Symbol (Kreis mit Strich) über harten Kanten */}
      <circle cx="98" cy="28" r="8" />
      <line x1="92" y1="22" x2="104" y2="34" />
    </svg>
  );
}

function NoMouth(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Kopf seitlich */}
      <circle cx="50" cy="40" r="18" />
      {/* Mund-Linie */}
      <line x1="56" y1="48" x2="68" y2="48" />
      {/* Verbots-Kreis darüber */}
      <circle cx="84" cy="40" r="14" />
      <line x1="74" y1="30" x2="94" y2="50" />
      {/* Löffel im Verbot */}
      <ellipse cx="84" cy="36" rx="3" ry="4" />
      <line x1="84" y1="40" x2="84" y2="46" />
    </svg>
  );
}

function SitUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="5" y1="70" x2="115" y2="70" strokeDasharray="3 4" />
      {/* Rückenlehne / Stütze */}
      <path d="M30 70 L 30 24 L 44 24" />
      {/* Person sitzend, Oberkörper aufrecht */}
      <circle cx="58" cy="28" r="8" />
      <path d="M58 36 L 58 58 L 82 58" />
      <path d="M58 44 L 74 42" />
      <path d="M58 44 L 72 50" />
      <path d="M82 58 L 96 70" />
    </svg>
  );
}

function Breath(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Person frontal */}
      <circle cx="60" cy="26" r="10" />
      <path d="M60 36 L 60 60" />
      <path d="M60 44 L 46 54" />
      <path d="M60 44 L 74 54" />
      {/* Hand auf Bauch */}
      <path d="M52 50 q 4 4 12 4 q 8 0 12 -4" />
      {/* Atem-Ringe */}
      <circle cx="60" cy="26" r="18" strokeDasharray="2 4" />
      <circle cx="60" cy="26" r="26" strokeDasharray="2 4" />
    </svg>
  );
}

function Phone112(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="40" y="14" width="40" height="56" rx="6" />
      <line x1="56" y1="64" x2="64" y2="64" />
      <text
        x="60"
        y="42"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontSize="16"
        fontWeight="700"
        fill="currentColor"
        stroke="none"
      >
        112
      </text>
      {/* Wellen */}
      <path d="M22 30 q -6 8 0 16" />
      <path d="M16 24 q -10 14 0 28" />
      <path d="M98 30 q 6 8 0 16" />
      <path d="M104 24 q 10 14 0 28" />
    </svg>
  );
}

function Naloxone(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Kopf seitlich */}
      <circle cx="78" cy="44" r="14" />
      {/* Nasenspray */}
      <rect x="34" y="34" width="22" height="14" rx="2" />
      <rect x="48" y="28" width="8" height="6" />
      {/* Sprühpfeile in Nase */}
      <path d="M58 40 L 66 40" />
      <path d="M62 36 L 66 40 L 62 44" />
      {/* Daumen-Druckpfeil */}
      <path d="M45 26 L 45 32" />
      <path d="M42 29 L 45 33 L 48 29" />
    </svg>
  );
}

function CheckBreath(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="5" y1="68" x2="115" y2="68" strokeDasharray="3 4" />
      {/* Liegende Person */}
      <circle cx="30" cy="56" r="8" />
      <path d="M38 60 L 100 60" />
      {/* Helfer-Wange über Mund */}
      <path d="M52 36 q 8 -6 16 0" />
      {/* Auge */}
      <circle cx="58" cy="30" r="2" />
      {/* Brustkorb-Heben Pfeil */}
      <path d="M72 50 L 72 42" />
      <path d="M69 45 L 72 42 L 75 45" />
    </svg>
  );
}

function Talkdown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Zwei Köpfe einander zugewandt */}
      <circle cx="38" cy="40" r="12" />
      <circle cx="82" cy="40" r="12" />
      {/* Sprechblase mit Herz */}
      <path d="M50 18 q 10 -10 20 0 q 0 10 -10 14 q -10 -4 -10 -14 z" />
      {/* Hand-Reichen */}
      <path d="M50 52 q 10 8 20 0" />
    </svg>
  );
}

const MAP: Record<IllusKey, (p: SVGProps<SVGSVGElement>) => ReactElement> = {
  recovery: Recovery,
  airway: Airway,
  cpr: CPR,
  rescueBreath: RescueBreath,
  cooling: Cooling,
  seizurePad: SeizurePad,
  noMouth: NoMouth,
  sitUp: SitUp,
  breath: Breath,
  phone112: Phone112,
  naloxone: Naloxone,
  checkBreath: CheckBreath,
  talkdown: Talkdown,
};

export const ILLUSTRATION_LABEL: Record<IllusKey, string> = {
  recovery: "Stabile Seitenlage",
  airway: "Atemweg freimachen",
  cpr: "Herzdruckmassage",
  rescueBreath: "Beatmung",
  cooling: "Kühlen",
  seizurePad: "Kopf polstern",
  noMouth: "Nichts in den Mund",
  sitUp: "Aufrecht sitzen",
  breath: "Geführte Atmung",
  phone112: "112 anrufen",
  naloxone: "Naloxon-Spray",
  checkBreath: "Atmung prüfen",
  talkdown: "Talkdown",
};

export function StepIllustration({ name, className }: { name: IllusKey; className?: string }) {
  const C = MAP[name];
  return <C className={className} aria-label={ILLUSTRATION_LABEL[name]} role="img" />;
}
