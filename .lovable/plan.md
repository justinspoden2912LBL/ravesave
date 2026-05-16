## Ziel

Ein **risk-flag- und rezeptor-basiertes Visualisierungssystem** in die App einbauen, das Mischkonsum-Risiken und Wirkmechanismen kompakt-grafisch zeigt — statt Fließtext. Plus konsistente kleine Visual-Komponenten, die überall in `/risks`, `/mix`, `/substances` wiederverwendet werden.

---

## 1. Datenmodell erweitern (`src/lib/substances.ts`)

Zwei neue, **optionale** Felder pro `Substance` — bestehende Inhalte bleiben unverändert.

```ts
export type RiskFlag =
  | "serotonergic"      // Serotonerges Syndrom
  | "qtProlongation"    // QT-Verlängerung
  | "seizure"           // Krampfschwelle ↓
  | "respiratoryDepression"
  | "psychosis"         // Psychose-Trigger
  | "vasoconstriction"
  | "hyperthermia"
  | "hepatotoxic"
  | "cardiotoxic";

export type CypInteraction = {
  enzyme: "CYP2D6" | "CYP3A4" | "CYP1A2" | "CYP2C9" | "CYP2C19" | "CYP2B6";
  role: "substrate" | "inhibitor" | "inducer";
};

export type ReceptorTarget = {
  target:
    | "5HT2A" | "5HT1A" | "5HT2C" | "SERT"
    | "DAT" | "NET" | "VMAT2"
    | "MOR" | "KOR" | "DOR"
    | "NMDA" | "Sigma1"
    | "GABA-A" | "GABA-B"
    | "CB1" | "CB2"
    | "α4β2" | "α7" | "M1" | "H1" | "D2";
  action: "agonist" | "partialAgonist" | "antagonist"
    | "inhibitor" | "releaser" | "substrate"
    | "positiveModulator" | "negativeModulator";
  strength?: 1 | 2 | 3; // 1=schwach, 3=stark — bestimmt Punktgröße
};

// neu in Substance:
riskFlags?: RiskFlag[];
cyp?: CypInteraction[];
targets?: ReceptorTarget[];
```

Initialbefüllung: Die ~20 wichtigsten Substanzen (MDMA, Amphetamin, Kokain, Methamphetamin, LSD, Psilocybin, Ketamin, MXE, GHB, Alkohol, Tramadol, Heroin, U-47700, Etonitazen, Nitrazepine, Cannabis, 2C-B, DMT, DOx, Tilidin) bekommen vollständige `targets` + `riskFlags` + `cyp`. Restliche per Default leer — UI fällt sauber zurück.

Eine kleine Helper-Datei `src/lib/pharmacology.ts`:
- `RISK_FLAG_META`: Label, Icon (lucide), Farb-Token, 1-Satz-Erklärung
- `TARGET_META`: Label, Farbe, Familie (Monoamin / Opioid / GABA / Glutamat / Cholinerg / Cannabinoid)
- `combineRiskFlags(subs[])` → aggregierte Flags + Substanzen die beitragen
- `additiveLoad(subs[], flag)` → Score 0-3 (für Balken)

---

## 2. Neue Visual-Komponenten (`src/components/viz/`)

Alle als kleine, wiederverwendbare Atome — semantische Tokens aus `styles.css`, keine festen Farben.

1. **`RiskFlagChips.tsx`** — Reihe runder Chips mit Icon + Tooltip. Props: `flags`, optional `intensity` (1-3 → Glow-Stärke).
2. **`ReceptorMap.tsx`** — kompakte „Receptor-Galaxie": ein SVG mit fixen Slots pro Familie (Monoamin links, Opioid oben, GABA/Glutamat rechts, andere unten). Punkte erscheinen nur für aktive Targets; Größe = `strength`, Symbol = action (▲ Agonist, ▽ Antagonist, ◆ Releaser, ○ Inhibitor). Legende einklappbar. ~120×120 px → passt in Card-Header und Mix-Detail.
3. **`ReceptorOverlap.tsx`** — Mehr-Substanz-Variante: zeigt mehrere Substanzen als farbige Layer auf derselben Map → instant sichtbar, wo sich Wirkungen überlagern (z. B. zwei SERT-Releaser = rote Doppelung).
4. **`CypBadges.tsx`** — winzige Pillen `2D6 ⇩` (Inhibitor), `3A4 →` (Substrat), `1A2 ⇧` (Inducer).
5. **`RiskLoadBars.tsx`** — horizontale Mini-Balken pro Flag mit additivem Score über alle gewählten Substanzen. Zeigt nur Flags mit Score > 0.

Alle Komponenten haben einen `compact` und einen `detailed` Mode.

---

## 3. Integration in bestehende Routen

**`/substances` (`src/routes/substances.tsx`)**
- Pro Karte oben rechts: `ReceptorMap compact` + `RiskFlagChips compact`.
- Im Expand-Detail: volle `ReceptorMap` + `CypBadges` neben dem bestehenden `mechanism`-Text.

**`/risks` (`src/routes/risks.tsx`)**
- Im Substanz-Header (neben Detail-Toggle): `ReceptorMap compact` + `RiskFlagChips`.
- In jeder `PairingCard` Detail-Section: `ReceptorOverlap` der zwei Substanzen + aggregierte `RiskLoadBars`. Ersetzt damit ~30 % Text durch grafische Aussagen.
- In `SubstanceBrief`: `CypBadges` ergänzen.

**`/mix` (`src/routes/mix.tsx`)**
- Über der Risiko-Matrix neu: **„Pharmakologisches Profil deines Mix"** Block mit
  - `RiskLoadBars` (additiv über alle gewählten Substanzen)
  - `ReceptorOverlap` aller Substanzen
  - `CypBadges` mit Konflikt-Highlight (z. B. CYP2D6-Inhibitor + CYP2D6-Substrat → roter Rand)

---

## 4. Visual-Konsistenz

- Neue semantische Tokens in `src/styles.css`:
  - `--target-monoamine`, `--target-opioid`, `--target-gaba`, `--target-glutamate`, `--target-cannabinoid`, `--target-cholinergic`
  - `--flag-serotonergic`, `--flag-qt`, `--flag-respiratory`, `--flag-seizure`, `--flag-hyperthermia`, `--flag-vaso`, `--flag-psychosis`
- Werte in `oklch` passend zur bestehenden Aurora-Palette.
- Icons aus `lucide-react` (bereits genutzt): `Flame`, `HeartPulse`, `Wind`, `Zap`, `Brain`, `Activity`, `Thermometer`.

---

## 5. Technische Details

- Alle neuen Komponenten sind reines SVG/Tailwind — keine neuen Dependencies.
- Tooltips: bestehende `@/components/ui/tooltip`.
- Type-safe: TS strict bleibt grün; neue Felder optional, keine bestehenden Daten brechen.
- CI-Workflow läuft automatisch — Typecheck + Build absichern den Roll-out.

---

## Out of Scope (bewusst)

- Keine Backend-Integration / Cloud — alles client-side wie heute.
- Kein Eingriff in Notfall-Flow (`EmergencyButton`, `EmergencyIllustrations`).
- Keine vollständige Datenbefüllung aller 80+ Substanzen in dieser Runde — Top ~20 zuerst, Rest in Folge-Pass.
