# Großes Update — Plan

Ziel: Die in deiner Analyse priorisierten Lücken schließen, ohne den bestehenden Routen-/Datenkern zu zerschlagen. Alles bleibt lokal-first, DE/AT/CH, kein Tracking.

## Status-Check vorab (was schon existiert)
- Routen `/notfall`, `/substances`, `/mix`, `/log`, `/stats`, `/about`, `/aftercare`, `/drugchecking`, `/reagenztest`, `/tolerance`, `/session/active` sind bereits da → **kein Routing-Rebuild nötig**, Fokus auf Inhalte + Sichtbarkeit.
- Spotlight (⌘K), ActiveSessionHUD, Backup, Onboarding existieren → behalten, nicht duplizieren.

## P1 — Startseite & Notfall-Sichtbarkeit
- Index-Hero: 3 CTAs visuell hierarchisieren — **Notfall als dominanter roter Button** (groß, Puls, Sticky-Variante im Header bleibt).
- Unter dem Hero ein **2×2-Quick-Tile-Grid** (Wiki, Mix-Check, Protokoll, Notfall) mit Icon + 1-Zeiler — direkt klickbar, kein Accordion-Zwischenschritt.
- Header bekommt einen permanent sichtbaren `Notfall`-Pill (mobile + desktop), Puls-Animation via Tailwind keyframes.

## P2 — Notfall-Seite (/notfall) ausbauen
- Großer „112 anrufen"-Button ganz oben (`tel:112`).
- Tabs nach Substanzklasse: **Stimulanzien · Opioide · Depressiva (GHB/Benzos/Alkohol) · Psychedelika/Dissoziativa · Mischintoxikation**.
- Pro Tab: Symptome (Bullets) + Sofortmaßnahmen (nummeriert).
- **Hyperthermie vs. Serotonin-Syndrom** — eigener Abschnitt mit klarer Differenzierung (Kühlen vs. Cyproheptadin/medizinisch).
- **GHB-Entzug-Warnung** (>6 h ohne Dosis bei Daily-User → 112).
- **Fentanyl-Kontamination** Hinweis + Verlinkung zu Reagenztest/Drug-Checking.
- Kontakte: 112, 110, Giftnotruf Berlin (030 19240), Telefonseelsorge (0800 111 0 111), Sucht-/Krisendienste AT/CH.

## P3 — Wiki: neue Substanzen + Feinjustierung
Neu in `src/lib/substances.ts` (mit Dosis-Tabelle, Onset/Peak/Dauer, ROAs, Risiken, 1–2 Quellen):
- **GHB/GBL** (Umrechnung, enge therapeutische Breite, Entzug)
- **Ketamin** (k-hole, K-bladder bei >2×/Woche)
- **Lachgas / N₂O** (B12-Defizienz, Asphyxie)
- **Tramadol** (dual: Serotonin + µ-Opioid)
- **Pregabalin / Gabapentin** (Opioid-Potenzierung)
- **HHC / THCP / H4CBD** (Graubereich, unklare Toxizität)
- **4-FA** (Neurotox, in DE verboten)
- **Clonidin** (Comedown, RR-Abfall)
- **Designer-Benzos** (Flualprazolam, Clonazolam)
- **Kokain**: Levamisol-Hinweis ergänzen, Cocaethylen ist bereits Override.

Bestehende Einträge: ROA-Hinweis bei MDMA (nasal vs. oral), Amphetamin Sulfat vs. Base (×1.5), Fentanyl-Teststreifen-Empfehlung. Optional pro Substanz: „Dosis nach Körpergewicht" (nutzt bereits vorhandenes `lib/dose.ts`).

## P4 — Mix-Check-Overrides
Erweiterungen in der Mischmatrix (rote/orange/gelbe Overrides + Erklärtext):
- GHB + Alkohol/Benzos/Ketamin → ROT (Atemdepression)
- Tramadol + MDMA → ROT (Serotonin-Syndrom + Krampfschwelle)
- Tramadol + Alkohol/Benzos → ROT
- Pregabalin/Gabapentin + Opioide → ROT
- Kokain + Alkohol → ORANGE (Cocaethylen — schon vorhanden, Text präzisieren)
- N₂O + Dissoziativa → GELB
- Designer-Benzos + alles Sedierende → ROT (lange HWZ)

Unter dem Ergebnis: kleine Datenbasis-Zeile „TripSit Combo Chart v3 + klinische Review (EMCDDA, PubMed)".

## P5 — Design-Politur (Aurora)
- `src/styles.css`: Aurora-Gradient als sehr langsamer (~24 s) Loop hinter dem Body, `#080810` Basis, Lila/Teal-Tokens.
- Cards einheitlich `glass`-Klasse: `bg-white/5`, `backdrop-blur-xl`, `border-white/10`.
- Notfall-Rot-Token + `pulse-emergency` Keyframe.
- Touch-Targets ≥ 48 px (icon-buttons bekommen `min-h-11 min-w-11`).
- Kontrast-Pass: alle `text-muted-foreground/50` etc. ersetzen durch Tokens mit ≥ 4.5:1.

## P6 — PWA (installierbar, nicht offline-first)
- `public/manifest.webmanifest` ergänzen (Name, Icons 192/512, theme_color, `display: standalone`, `start_url: /`).
- Icons generieren (Aurora-Logo).
- **Kein Service Worker** — gemäß PWA-Knowledge-Regel (Preview-Iframes brechen mit SW). Reine „Add to Home Screen"-Installierbarkeit.
- Meta-Tags `apple-touch-icon`, `theme-color` in `__root.tsx`.

## P7 — Vertrauen & Recht
- Sichtbarer Footer-Disclaimer: „ravesave.fun ersetzt keine medizinische Beratung. Im Notfall: 112. Alle Daten bleiben lokal auf deinem Gerät."
- About-Seite: Datenbasis-Transparenz (TripSit, EMCDDA, checkit!, Saferparty, PubMed) — teils vorhanden, ergänzen.
- „AI-Begleitung" (Marleen-Chat) auf Index klar labeln: „Optional, läuft über verschlüsseltes Lovable-AI-Gateway — keine Speicherung deiner Eingaben."

## Was NICHT angefasst wird
- Bestehende Routen-Architektur, Auth, Backup-Logik, Spotlight, Active-Session-HUD.
- `routeTree.gen.ts`, Supabase-Clients.
- Kein Service Worker, kein Offline-Cache (bewusste Entscheidung).

## Technisch / Dateien (Größenordnung)
- Edits: `src/routes/index.tsx`, `src/routes/notfall.tsx`, `src/routes/mix.tsx`, `src/routes/about.tsx`, `src/routes/__root.tsx`, `src/lib/substances.ts`, `src/lib/mix.ts` (oder wo Overrides liegen), `src/styles.css`, `public/manifest.webmanifest`.
- Neu: 2–3 kleine Komponenten (`QuickTiles`, `EmergencyHeroButton`, `EmergencyTabs`), evtl. `src/components/Disclaimer.tsx`.
- Icons: 1–2 generierte PNGs unter `public/`.

Aufwand grob: passt in das verbleibende Credit-Budget; Wiki-Erweiterung ist der größte Posten.

Wenn du grünes Licht gibst, baue ich in der Reihenfolge P1 → P2 → P4 → P3 → P5 → P6 → P7 (sichtbarste Wirkung zuerst).