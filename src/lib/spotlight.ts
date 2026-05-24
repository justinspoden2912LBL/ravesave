/**
 * Spotlight-Suche: vereinheitlichter Index über Substanzen, Routen, Inhalte.
 */
import { SUBSTANCES, CATEGORY_LABEL } from "./substances";

export type SpotlightKind = "substance" | "route" | "action";

export interface SpotlightItem {
  id: string;
  kind: SpotlightKind;
  title: string;
  subtitle?: string;
  to?: string;
  hash?: string;
  keywords: string[];
}

const ROUTES: SpotlightItem[] = [
  { id: "r-home", kind: "route", title: "Startseite", to: "/", keywords: ["home", "start"] },
  { id: "r-mix", kind: "route", title: "Mischkonsum-Check", to: "/mix", keywords: ["mix", "kombi", "kombination", "ampel"] },
  { id: "r-risks", kind: "route", title: "Risiko-Übersicht", to: "/risks", keywords: ["risiko", "gefahr"] },
  { id: "r-substances", kind: "route", title: "Substanz-Wiki", to: "/substances", keywords: ["substanz", "wiki", "wirkstoff"] },
  { id: "r-log", kind: "route", title: "Konsum-Protokoll", to: "/log", keywords: ["log", "protokoll", "tagebuch"] },
  { id: "r-stats", kind: "route", title: "Statistik", to: "/stats", keywords: ["stats", "statistik", "trend"] },
  { id: "r-chat", kind: "route", title: "Marleen — KI-Chat", to: "/chat", keywords: ["chat", "marleen", "ki", "ai", "fragen"] },
  { id: "r-knigge", kind: "route", title: "Knigge", to: "/knigge", keywords: ["knigge", "etikette", "verhalten"] },
  { id: "r-erfahrungen", kind: "route", title: "Erfahrungen", to: "/erfahrungen", keywords: ["trip", "report", "erfahrung"] },
  { id: "r-safety", kind: "route", title: "Safety-Plan", to: "/safety-plan", keywords: ["safety", "plan", "vorsatz"] },
  { id: "r-notfall", kind: "route", title: "Notfall", to: "/notfall", keywords: ["notfall", "112", "hilfe"] },
  { id: "r-settings", kind: "route", title: "Profil & Einstellungen", to: "/settings", keywords: ["profil", "settings", "einstellung"] },
  { id: "r-onboarding", kind: "route", title: "Onboarding", to: "/onboarding", keywords: ["onboarding", "intro"] },
  // Neue Routen ↓
  { id: "r-session", kind: "route", title: "Aktive Session", to: "/session/active", keywords: ["session", "trip", "aktiv", "timer", "phase"] },
  { id: "r-reagents", kind: "route", title: "Reagent-Test-Guide", to: "/reagenztest", keywords: ["reagent", "test", "marquis", "mecke", "mandelin", "farbe"] },
  { id: "r-drugcheck", kind: "route", title: "Drug-Checking-Anlaufstellen", to: "/drugchecking", keywords: ["drugchecking", "checkit", "saferparty", "labor", "test"] },
  { id: "r-aftercare", kind: "route", title: "Aftercare & Comedown", to: "/aftercare", keywords: ["aftercare", "comedown", "tag danach", "kater", "tuesday"] },
  { id: "r-tolerance", kind: "route", title: "Toleranz & Cooldowns", to: "/tolerance", keywords: ["toleranz", "cooldown", "abstand", "pause"] },
];

const ACTIONS: SpotlightItem[] = [
  { id: "a-emergency", kind: "action", title: "Notfall-Panel öffnen", subtitle: "Erste-Hilfe-Schritte", keywords: ["112", "notfall", "hilfe"] },
  { id: "a-marleen", kind: "action", title: "Marleen fragen", subtitle: "KI-Begleiterin öffnen", keywords: ["chat", "marleen", "ki", "frage"] },
  { id: "a-export", kind: "action", title: "Backup exportieren", subtitle: "JSON herunterladen", to: "/settings", hash: "#daten", keywords: ["backup", "export", "download"] },
];

export function buildIndex(): SpotlightItem[] {
  const subs: SpotlightItem[] = SUBSTANCES.map((s) => ({
    id: `s-${s.id}`,
    kind: "substance",
    title: s.name,
    subtitle: CATEGORY_LABEL[s.category],
    to: `/substances`,
    hash: `#${s.id}`,
    keywords: [s.name, ...(s.aliases || []), s.id, s.category],
  }));
  return [...subs, ...ROUTES, ...ACTIONS];
}

export function search(index: SpotlightItem[], q: string, limit = 12): SpotlightItem[] {
  const query = q.trim().toLowerCase();
  if (!query) return index.filter((i) => i.kind === "route").slice(0, limit);
  const tokens = query.split(/\s+/);
  const scored: { item: SpotlightItem; score: number }[] = [];
  for (const item of index) {
    const hay = [item.title, item.subtitle ?? "", ...item.keywords].join(" ").toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (!hay.includes(t)) {
        score = -1;
        break;
      }
      // exact title match boost
      if (item.title.toLowerCase() === t) score += 50;
      else if (item.title.toLowerCase().startsWith(t)) score += 30;
      else if (item.keywords.some((k) => k.toLowerCase() === t)) score += 25;
      else if (item.title.toLowerCase().includes(t)) score += 10;
      else score += 3;
    }
    if (score > 0) scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}
