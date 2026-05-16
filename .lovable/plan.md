# Globaler Notfall-Button

## Ziel

Auf **jeder** Seite jederzeit erreichbar: ein roter „Notfall"-Button, der mit einem Tap die wichtigsten Lebensretter-Infos zeigt — 112-Anruf, stabile Seitenlage in 4 Schritten, Hotlines, und Notfall-Suchen für die häufigsten Szenarien.

## Umsetzung

### 1. Neue Komponente `src/components/EmergencyButton.tsx`

- **Floating Action Button**: fixed unten rechts (`bottom-4 right-4`), `z-50`, über allen Inhalten. Auf Mobile etwas größer Touch-Target (56 px).
- Roter Pulsierungs-Akzent (`bg-destructive`, dezenter `animate-pulse`-Ring), Icon: Lucide `Siren` + Label „Notfall".
- Öffnet einen **Dialog/Drawer** (shadcn `Dialog`, auf Mobile via `Drawer` aus dem bestehenden UI-Kit) mit folgenden Sektionen:

  **a) Sofort anrufen**
  - Großer Button „112 anrufen" → `<a href="tel:112">`
  - Hinweis: „Sag ehrlich, was konsumiert wurde — Rettungsdienst verfolgt nicht."
  - Sekundäre Nummern: Giftnotruf-Liste DE/AT/CH als Klapp-Liste (Berlin 030 19240, München 089 19240, Wien +43 1 406 43 43, Zürich 145 …)

  **b) Stabile Seitenlage — 4 Schritte**
  - Kompakte nummerierte Liste mit Icon-Strichzeichnung pro Schritt (Arm anwinkeln → Hand an Wange → Bein anwinkeln → zur Seite drehen, Kopf überstrecken)
  - Darunter: „Atmung kontrollieren — wenn weg → Herzdruckmassage 100–120/min"

  **c) Szenario-Schnellzugriff**
  - 4–6 Buttons, die direkt die passenden In-App-Routen öffnen bzw. eine vorbereitete Suche triggern:
    - Überdosis Opioid → `/substances?focus=naloxon`
    - Serotonin-Syndrom → `/risks?topic=serotonin`
    - GHB/Alkohol-Mischung → `/mix?preset=ghb-alcohol`
    - Bad Trip (Psychedelika) → `/substances?focus=bad-trip`
    - Stimulanzien-Überhitzung → `/risks?topic=hyperthermie`
  - Plus ein Freitext-„Suchen in der App"-Feld, das auf eine globale Suche / `/substances?q=…` mappt

  **d) Hotlines & Hilfe (Footer im Dialog)**
  - Sucht- und Drogen-Hotline DE: 01806 313031
  - Telefonseelsorge: 0800 111 0 111
  - Drogennotruf AT: 01 406 95 95
  - Link auf `/knigge` und `/about`

### 2. Einbau in `src/routes/__root.tsx`

- `<EmergencyButton />` einmalig innerhalb der `RootComponent` direkt neben `<Footer />` rendern → erscheint dadurch automatisch auf jeder Route, inkl. 404/Error-Boundary.
- Kein Re-Render-Overhead pro Route, kein Duplikat-Risiko.

### 3. UX-Details

- **Tastatur**: `Esc` schließt, Fokus-Trap im Dialog (kommt durch shadcn `Dialog` schon mit).
- **Reduced motion**: `animate-pulse` über `motion-reduce:animate-none` ausblenden.
- **Print**: Button per `print:hidden` ausblenden.
- **A11y**: `aria-label="Notfall-Hilfe öffnen"`, `role="dialog"`, `aria-describedby` für die 112-Sektion.
- **Persistenz**: keine — bewusst stateless, damit auch im Inkognito sofort verfügbar.

### 4. Was nicht gemacht wird

- Keine neuen Suchroutinen serverseitig — die „Suchbegriffe" sind kuratierte Deep-Links auf bestehende Seiten plus ein Input, das `/substances?q=` ansteuert (Filter dort existiert bereits bzw. ist trivial nachrüstbar — separat).
- Kein Tracking, kein Backend-Call.

## Geänderte / neue Dateien

- **neu**: `src/components/EmergencyButton.tsx`
- **editiert**: `src/routes/__root.tsx` (eine Zeile Render + Import)
