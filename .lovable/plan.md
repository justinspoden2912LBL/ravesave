# RaveSave — Produktreife-Plan

Vor der Umsetzung: ich habe einen Runtime-Fehler im Preview gesehen (`Invariant failed: Expected to find a match below the root match in SPA mode`) — wahrscheinlich fehlt ein `<Outlet />` oder eine Route. Das fixe ich als allerersten Schritt, **bevor** irgendetwas anderes passiert.

---

## 1. Audit der aktuellen App

### Funktioniert gut
- Routen-Kern: `/notfall`, `/substances`, `/mix`, `/log`, `/aftercare`, `/drugchecking`, `/reagenztest`, `/tolerance`, `/session/active`, `/safety-plan`, `/chat`, `/stats`, `/erfahrungen`.
- Lokale Persistenz: Logbuch, Safety-Plan, Emergency-Info, Aftercare — alles `localStorage`, sauber getrennt.
- Active-Session-HUD, Spotlight (⌘K), Backup, Onboarding, Marleen-AI mit Modi (Einfach/Normal/Experte) für den Chat.
- Substanzdatenbank mit Mechanismus, Onset, Dauer, Dosierung, Quellen.

### Vorhanden, aber schwach
- **Expertenmodus** existiert nur im Chat (`aiContext.ts → AiMode`) — **nicht** in Substanzprofilen, Mix-Checker, Notfall, Recovery. Der Anspruch „abgestufte Informationsdichte überall" ist nicht eingelöst.
- **Startseite-Hierarchie**: Hero + 2×4 QuickTiles ist besser als Accordion, aber „Akute Hilfe" als Zwischenstufe zwischen normal und 112 fehlt komplett.
- **Notfall-Seite**: hat Tabs, aber keine klare Differenzierung Hyperthermie ↔ Serotonin-Syndrom als eigenständiger Block, und kein „Akut-aber-nicht-112"-Modus (Panik, Comedown-Krise, Überforderung).
- **Recovery/Aftercare**: existiert, aber keine sofort scanbare Karte für die häufigsten 4 Bedürfnisse (Wasser, Essen, Schlaf, Reize runter).
- **Vertrauensblock**: Disclaimer im Footer kurz, aber nirgendwo prominent „keine Cloud, kein Tracking, alles lokal" sichtbar.

### Fehlt komplett
- **Akute Hilfe** (`/akut` o. ä.): ruhige Soforthilfe-Seite zwischen Alltag und Notfall — Atemtechnik, „du bist sicher", Symptom-Triage.
- **Pre-Rave-Checkliste**: existiert nicht eigenständig (nur im Safety-Plan eingebettet).
- **Warnsignale-Karten**: Hyperthermie/Dehydration/Panik/Atemprobleme als wiederverwendbare, einzeln verlinkbare Karten.
- **Favoriten/Merkliste**: keine Möglichkeit, Substanzen oder Notfallkarten lokal zu pinnen.
- **Globaler Detail-Level-Switch** für Inhaltsseiten.

### Nur kosmetisch / nicht funktional
- Einige QuickTiles auf der Startseite (z. B. „Statistik", „Toleranz") führen zu Seiten, die kaum mehr als ein Header sind — niedriger Nutzwert vs. Sichtbarkeit.

---

## 2. Expertenmodus (das Kernstück)

### Architektur
Erweitere `aiContext.ts` zu einem allgemeinen `useDetailLevel()`-Hook (oder neu: `src/lib/detailLevel.ts`):

```ts
type DetailLevel = "basic" | "extended" | "expert";
// localStorage-Key: ravesave.detailLevel.v1
// Default: "basic"
```

Globaler Toggle in der Top-Nav (Segment-Control: Basis · Mehr · Experte). Existierender `AiMode` wird ein Alias auf denselben Store, damit Marleen weiter funktioniert.

### Wirkungsbereiche
| Bereich | Basis | Erweitert | Experte |
|---|---|---|---|
| **Substanzprofil** | Was ist es, Wirkdauer grob, 3 Risiken | + Dosis-Tabelle, ROAs, Onset/Peak/Comedown | + Mechanismus, HWZ, CYP-Interaktionen, Quellen |
| **Mix-Checker** | Ampel + 1-Satz-Erklärung | + Mechanismus warum riskant | + Pharmakologische Details, klinische Marker |
| **Notfall** | Symptome + 3 Schritte + 112 | + Differentialdiagnose | + Vital-Schwellen, Antidot-Hinweise (info, keine Anleitung) |
| **Recovery** | 4 Karten (Wasser/Essen/Schlaf/Reize) | + Timing, Mengen | + Neurochemie der Erholung, B12/5-HT-Refill |
| **Marleen** | bereits vorhanden | bereits vorhanden | bereits vorhanden |

Jede Seite bekommt ein einheitliches `<DetailGate level="expert">…</DetailGate>` Wrapping.

---

## 3. Neue Bereiche & Verbesserungen

### A. Akute Hilfe — neue Route `/akut`
Zwischen normal & 112. 4 Sofort-Karten:
- „Mir wird's zu viel" — Atemtechnik (Box 4-4-4-4), Reize runter.
- „Schlechter Trip" — Erden, Person dabei, sicher hinsetzen.
- „Comedown-Crash" — Wasser, Wärme, Reize runter, kein weiterer Konsum.
- „Ich bin nicht sicher, ob ich 112 brauche" — Triage-Liste → wenn ja, ein Tap zu `/notfall`.

Verlinkung prominent auf Startseite (rote Karte direkt unter dem 112-Pill).

### B. Recovery polishen (`/aftercare`)
4 große Karten mit Icon + Mikro-Aktion. Im Experten-Level: Refill-Tabelle (Magnesium, B-Komplex, 5-HTP-Kontroverse mit Quellenhinweis).

### C. Pre-Rave-Checkliste — neue Route `/checkliste`
Interaktive Liste mit lokalem Persist (genau wie Aftercare). Auch im Spotlight erreichbar.

### D. Warnsignale-Karten
Eigene Komponente `<WarnSign type="hyperthermia" />`, wiederverwendet auf Notfall-Seite und auf Akut-Seite.

### E. Favoriten
`src/lib/favorites.ts` (lokal). Stern-Icon auf Substanz-Detail, Notfall-Karten, Akut-Karten. Eigene Sektion auf Startseite („Deine Pins") — nur sichtbar, wenn nicht leer.

### F. Vertrauensblock
Komponente `<TrustBadge />` — eine kompakte 1-Zeile-Variante (Footer/Header) und eine ausführliche auf der About-Seite. Inhalt: keine Cloud, kein Tracking, kein Backend für Nutzerdaten, Open about Lovable-AI-Gateway.

---

## 4. UI/UX-Politur
- Startseite-Reihenfolge **neu**: Notfall → Akute Hilfe → Safer Use (Wiki) → Mix → Logbuch → Recovery → Tools (Drug-Checking/Reagent/Toleranz/Statistik in „Praxis"-Block).
- Touch-Targets ≥ 48 px durchsetzen (audit + fix wo nötig).
- Kontrast-Pass: alle `text-muted-foreground/50` ersetzen.
- Konsistente `glass`-Karten-Klasse auf allen Hauptseiten.
- Detail-Level-Switch sichtbar in Header (Desktop) / Settings (Mobile, plus FAB-Button auf Wiki-Seiten).

---

## 5. Inhaltliche Feinschliffe
- Mix-Checker: 1-Absatz „Warum Mischkonsum besonders riskant ist" (Synergie, Maskierung, Pharmakokinetik) — nur in Erweitert/Experte.
- Drug-Checking-Seite: Sprache prüfen — ist HR-Hinweis, keine Anleitung. (vermutlich schon ok, kurzer Review.)

---

## 6. Betroffene Dateien

**Neu**
- `src/lib/detailLevel.ts` (Store + Hook)
- `src/lib/favorites.ts` (lokal)
- `src/components/DetailLevelSwitch.tsx`
- `src/components/DetailGate.tsx`
- `src/components/TrustBadge.tsx`
- `src/components/WarnSign.tsx`
- `src/components/FavoriteButton.tsx`
- `src/routes/akut.tsx`
- `src/routes/checkliste.tsx`

**Edits**
- `src/routes/__root.tsx` (Header-Switch, Trust-Badge)
- `src/routes/index.tsx` (neue Reihenfolge, Akut-Karte, Pins-Sektion)
- `src/routes/substances.tsx` + Detail-View (DetailGate)
- `src/routes/mix.tsx` (DetailGate + Erklärabsatz)
- `src/routes/notfall.tsx` (WarnSign-Komponenten, DetailGate)
- `src/routes/aftercare.tsx` (4-Karten-Layout)
- `src/lib/aiContext.ts` (AiMode → DetailLevel-Alias)
- `src/components/Spotlight.tsx` (neue Routen registrieren)
- `src/lib/spotlight.ts`
- evtl. `src/components/Nav.tsx` / `BottomNav.tsx`

---

## 7. Reihenfolge der Umsetzung (inkrementell)

1. **Runtime-Fix**: SPA-Match-Fehler beheben (vermutlich fehlender `<Outlet />` oder kaputte Route nach letzten Edits).
2. **Detail-Level-System**: `detailLevel.ts` + Switch + Gate + Alias zu AiMode.
3. **DetailGate auf Substanz-Detail**: erste echte Anwendung, als Referenzimplementierung.
4. **Akute-Hilfe-Seite** + Startseiten-Karte.
5. **Recovery-Karten-Layout**.
6. **Pre-Rave-Checkliste**.
7. **Warnsignal-Karten** + Einbau in Notfall + Akut.
8. **Favoriten-System** + Pins-Sektion auf Startseite.
9. **TrustBadge** sichtbar machen.
10. **Mix-Checker Erklärung + DetailGate**.
11. **UI-Polish-Pass**: Touch-Targets, Kontrast, Konsistenz.

Jeder Schritt ist ein eigener kleiner Commit, einzeln testbar. Nach jedem Schritt kannst du im Preview prüfen, ob es sich richtig anfühlt, bevor wir weitermachen.

---

## Was NICHT angefasst wird
- Auth, Supabase-Schema, Backup-Logik, Active-Session-HUD-Kern, Spotlight-Engine.
- Keine neuen Server-Abhängigkeiten — alle neuen Daten (Detail-Level, Favoriten, Checkliste) lokal.
- Kein Service Worker.
- `routeTree.gen.ts`, Supabase-Clients.

---

**Sag mir bitte: Plan ok, oder willst du Schwerpunkte verschieben?** Z. B. wenn dir der Expertenmodus wichtiger ist als Favoriten, mache ich Schritt 2–3 zuerst und ziehe Favoriten ans Ende.