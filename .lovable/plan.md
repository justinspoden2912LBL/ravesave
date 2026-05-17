## Ziel
Mehr Schritte im Notfall-Dialog visuell unterstützen, indem die `IllusKey`-Bibliothek um häufige Erste-Hilfe-Symbole erweitert wird und die noch unbebilderten Schritte in den Guides ein passendes `illus` bekommen.

## Neue Illustrationen in `src/components/EmergencyIllustrations.tsx`
Im bestehenden Stil (2px Stroke, `currentColor`, viewBox 120×80). `IllusKey`-Union, `MAP` und `ILLUSTRATION_LABEL` werden je um folgende Einträge erweitert:

| Key | Symbol | Label (de) |
|---|---|---|
| `shake` | Hand an Schulter, Bewegungslinien | „Ansprechen & rütteln" |
| `coolRoom` | Tür/Pfeil aus heißem in kühlen Raum, Sonne→Schnee | „Kühler Ort" |
| `hydrate` | Glas mit Wasser + Tropfen | „Schluckweise Wasser" |
| `noSubstance` | Pillen/Glas durchgestrichen | „Nichts nachlegen" |
| `stopwatch` | Stoppuhr mit Zeigern | „Zeit messen" |
| `blanket` | Person sitzend mit Decke | „Wärmen & erden" |
| `quietRoom` | Person + Notenzeichen durchgestrichen | „Ruhige Umgebung" |
| `clearMouth` | Kopf seitlich, Finger zum Mund (Auswischen) | „Mund ausräumen" |
| `dontHold` | Hände um Körper, durchgestrichen | „Nicht festhalten" |
| `dontStop` | CPR-Hand + Endlos-Pfeil | „Nicht aufhören" |

## Zuweisung in `GUIDES` (`src/components/EmergencyButton.tsx`)
Bislang ohne `illus` — Vorschlag:

- **no_breathing**: „Nicht aufhören…" → `dontStop`
- **unconscious**:
  - „Ansprechen, Schulter rütteln…" → `shake`
  - „Bleib daneben, beobachte Atmung…" → `clearMouth`
- **seizure**:
  - „Person nicht festhalten" → `dontHold`
  - „Zeit messen" → `stopwatch`
- **overheating**:
  - „Sofort raus aus der Hitze" → `coolRoom`
  - „Schluckweise Wasser…" → `hydrate`
  - „Nicht weiter tanzen…" → `noSubstance`
- **chest_pain**: „Keine weitere Substanz…" → `noSubstance`
- **panic**:
  - „Ruhigen, vertrauten Ort…" → `quietRoom`
  - „Wasser, evtl. Süßes, warme Decke" → `blanket`

## Out of scope
Keine Änderung an Dialog-Layout, Karten, Datenmodell oder Routing.