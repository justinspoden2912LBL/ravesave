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

function Shake(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Kopf liegend */}
      <circle cx="40" cy="50" r="8" />
      {/* Körper */}
      <path d="M48 52 L 95 58" />
      {/* Hand an Schulter */}
      <path d="M50 44 q 6 -4 12 0 q 2 4 -2 6 l -8 2" />
      {/* Bewegungslinien */}
      <path d="M64 32 l 6 -4 M70 38 l 8 -2 M62 26 l 4 -6" />
    </svg>
  );
}

function CoolRoom(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Sonne links */}
      <circle cx="20" cy="22" r="6" />
      <path d="M20 10 v -4 M20 38 v 4 M8 22 h -4 M32 22 h 4 M11 13 l -3 -3 M29 13 l 3 -3" />
      {/* Pfeil nach rechts */}
      <path d="M44 50 h 32 M70 44 l 6 6 -6 6" />
      {/* Schneeflocke rechts */}
      <path d="M100 22 v 18 M91 31 h 18 M94 25 l 12 12 M106 25 l -12 12" />
    </svg>
  );
}

function Hydrate(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Glas */}
      <path d="M44 20 L 50 70 L 78 70 L 84 20 Z" />
      {/* Wasserlinie */}
      <path d="M48 38 q 8 -4 16 0 t 16 0" />
      {/* Tropfen oben */}
      <path d="M64 6 q 4 6 0 10 q -4 -4 0 -10 Z" />
    </svg>
  );
}

function NoSubstance(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Pille */}
      <rect x="40" y="36" width="40" height="16" rx="8" />
      <line x1="60" y1="36" x2="60" y2="52" />
      {/* Verbotskreis */}
      <circle cx="60" cy="44" r="28" />
      <line x1="40" y1="24" x2="80" y2="64" />
    </svg>
  );
}

function Stopwatch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Knopf oben */}
      <path d="M56 10 h 8 M60 10 v 6" />
      {/* Gehäuse */}
      <circle cx="60" cy="46" r="24" />
      {/* Zeiger */}
      <path d="M60 46 L 60 30 M60 46 L 72 50" />
      {/* Markierungen */}
      <path d="M60 24 v 3 M60 65 v 3 M38 46 h 3 M79 46 h 3" />
    </svg>
  );
}

function Blanket(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Boden */}
      <line x1="20" y1="72" x2="100" y2="72" strokeDasharray="3 4" />
      {/* Kopf */}
      <circle cx="60" cy="26" r="7" />
      {/* Decke um sitzende Person */}
      <path d="M38 70 q 4 -30 22 -30 q 18 0 22 30 Z" />
      {/* Deckenfalten */}
      <path d="M50 60 l 4 6 M70 60 l -4 6" />
    </svg>
  );
}

function QuietRoom(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Note */}
      <path d="M40 18 v 30" />
      <ellipse cx="34" cy="48" rx="6" ry="4" />
      <path d="M40 18 q 12 4 14 14" />
      {/* Durchgestrichen */}
      <circle cx="42" cy="40" r="22" />
      <line x1="26" y1="24" x2="58" y2="56" />
      {/* Person rechts */}
      <circle cx="84" cy="36" r="6" />
      <path d="M84 42 v 18 M84 50 l -8 6 M84 50 l 8 6" />
    </svg>
  );
}

function ClearMouth(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Kopf seitlich */}
      <path d="M44 30 q 20 -14 36 4 q 6 14 -4 24 q -16 8 -28 -2 q -10 -10 -4 -26 Z" />
      {/* Mund offen */}
      <path d="M70 48 q 6 2 10 0" />
      {/* Finger zeigt zum Mund */}
      <path d="M96 60 L 82 50 M82 50 l -2 -6 M82 50 l -6 -2" />
    </svg>
  );
}

function DontHold(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Person mittig */}
      <circle cx="60" cy="26" r="7" />
      <path d="M60 33 v 24 M60 42 l -10 -4 M60 42 l 10 -4 M60 57 l -8 12 M60 57 l 8 12" />
      {/* Hände greifen von außen */}
      <path d="M28 44 q 8 -2 14 2 M92 44 q -8 -2 -14 2" />
      {/* Verbotszeichen */}
      <circle cx="60" cy="44" r="30" />
      <line x1="38" y1="22" x2="82" y2="66" />
    </svg>
  );
}

function DontStop(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* Hand drückend */}
      <path d="M44 38 q 0 -10 8 -10 q 8 0 8 10 v 8 q 0 8 -8 8 q -8 0 -8 -8 Z" />
      <path d="M44 46 l -6 -2 M60 46 l 6 -2" />
      {/* Endlos-Pfeil */}
      <path d="M76 56 q 16 0 16 -12 q 0 -12 -16 -12 M76 56 l -4 -4 M76 56 l -4 4" />
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
  shake: Shake,
  coolRoom: CoolRoom,
  hydrate: Hydrate,
  noSubstance: NoSubstance,
  stopwatch: Stopwatch,
  blanket: Blanket,
  quietRoom: QuietRoom,
  clearMouth: ClearMouth,
  dontHold: DontHold,
  dontStop: DontStop,
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
  shake: "Ansprechen & rütteln",
  coolRoom: "Kühler Ort",
  hydrate: "Schluckweise Wasser",
  noSubstance: "Nichts nachlegen",
  stopwatch: "Zeit messen",
  blanket: "Wärmen & erden",
  quietRoom: "Ruhige Umgebung",
  clearMouth: "Mund ausräumen",
  dontHold: "Nicht festhalten",
  dontStop: "Nicht aufhören",
};

export function StepIllustration({ name, className }: { name: IllusKey; className?: string }) {
  const C = MAP[name];
  return <C className={className} aria-label={ILLUSTRATION_LABEL[name]} role="img" />;
}
