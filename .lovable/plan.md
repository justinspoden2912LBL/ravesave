# Ravesave Beta 1.2 — Implementierungsplan

Großer Umfang. Ich arbeite in 6 Blöcken (A–F) und prüfe nach jedem Block Voice-Flow, Chat und Navigation.

## Block A — Substanz-Datenbank
- Bestehende `src/lib/substances.ts` zu vollständiger DB erweitern (oder neue `src/data/substances.ts`).
- Felder pro Substanz: `id, name, aliases[], category, shortDescription, effects[], onset/duration, risks[], saferUse[], emergencySigns[], combosRef`.
- Substanzen: MDMA, Amphetamin (Speed), Kokain, Ketamin, LSD, Psilocybin, 2C-B, MDA, Mephedron, GHB/GBL, Lachgas (N2O), Cannabis, Alkohol, Benzos, Tramadol, SSRI/MAOI (Hinweis-Eintrag), Fentanyl, NBOMe, Poppers, Koffein.
- Slang-Erkennung über `aliases` + Lookup-Helper `findSubstance(query)`.

## Block B — Mischkonsum-Matrix
- Neue `src/data/combinations.ts` mit Risiko-Stufen `green | yellow | red | black`.
- Alle vom User gelisteten Kombinationen + Wildcard-Regeln (Fentanyl/NBOMe → black).
- Lookup `getCombinationRisk(a, b)` symmetrisch + Wildcard-Match.
- `src/routes/mix.tsx` aufwerten: Suchfeld mit Alias-Match, 2–3 Auswahl, große Ampel (Kreis, Farbe, Icon), Kurzbegründung, Safer-Use-Punkte, Marleen-CTA, Substanz-Profil-Links, bei `black` zusätzlich roter 112-Banner mit Naloxon-Hinweis bei Opioid-Beteiligung.

## Block C — ChatGPT-ähnliches Chat-UI
- `src/routes/chat.tsx` Bubbles überarbeiten:
  - User: rechts, Akzentfarbe, leichter Glow, Fade-in von rechts unten.
  - Marleen: links, Glassmorphism (blur 14px), Top-Edge-Highlight, Neon-Glow, Fade+Scale+Blur-to-Clear via Framer Motion (bereits vorhanden? → sonst CSS-keyframes nutzen, kein neues Dep).
- „Marleen tippt…" Pulse-Dots-Komponente.
- Ambient-Hintergrund nur im Chat-Bereich: 2–3 langsame Blur-Blobs (CSS, `prefers-reduced-motion` respektieren).
- Voice-Status-Animationen aufpolieren: hört zu (Pulse-Wellen), denkt (Orbit-Spinner), spricht (Wellenform-Bars).

## Block D — Admin-Mode
- `src/lib/adminMode.ts`: Aktivierung via 5× Logo-Tap ODER Settings-Button + lokales Passwort (in `localStorage`, default aus env/const, änderbar).
- `src/lib/substanceOverrides.ts`: Overrides in localStorage; Lookup mergt Defaults + Overrides.
- Substanz-Profile (neue Route `src/routes/substances.$id.tsx` falls nicht existent — sonst inline in `substances.tsx`): bearbeitbare Felder mit Edit-Icon, Modal mit Textarea.
- Top-Banner „Admin-Mode aktiv".
- Buttons „Standard wiederherstellen" pro Substanz + global.

## Block E — Notfall-Screen
- Bestehende `src/routes/notfall.tsx` aufräumen/erweitern:
  - Großer 112-CTA (`tel:112`).
  - Checklisten: Bewusstlosigkeit, Herzrasen/Brustschmerz, Bad Trip.
  - Naloxon-Info-Card.
  - Drug-Checking-Stellen DE/AT/CH (extern, Disclaimer).
- Hoher Kontrast, kein Glow-Overkill.

## Block F — Persona-Feinschliff
- `src/lib/aiConfig.ts` `AI_PERSONA_BLOCK` ergänzen:
  - Wissensbasis = Substanz-DB + Kombi-Matrix.
  - HRI-Prinzipien (akzeptierend, nicht moralisch, kleinste Risikoreduktion, Selbstwirksamkeit).
  - Bei Fentanyl/NBOMe/GHB+Alk → klarer Notruf-/Naloxon-Verweis.
  - Verweise auf `/mix`, `/substances`, `/safety-plan`, `/notfall`.
- `src/lib/aiContext.ts`: kompakte DB-Zusammenfassung als System-Kontext anhängen (nur Namen + Kategorie + Top-Risiken, um Tokens zu sparen).

## Selbstcheck-Schritte nach jedem Block
- Voice-Toggle öffnet Mic, Status-Pill arbeitet.
- Chat sendet/empfängt, TTS-Fallback-Banner intakt.
- Bottom-Nav navigiert zu allen Routen ohne 404.
- Keine TS-Fehler, kein Build-Bruch.

## Technische Hinweise
- Keine neuen Backends, alles lokal (`localStorage`).
- Framer Motion ist bereits installiert (in package.json prüfen) — sonst CSS-Animations + bestehende Tailwind-Animate-Utilities.
- Design-Tokens aus `src/styles.css` (Aurora, Risk-Farben) wiederverwenden — keine Hardcodes.
- Routen via TanStack File-Routing; `routeTree.gen.ts` wird automatisch regeneriert.

Bestätige den Plan, dann lege ich mit Block A los.