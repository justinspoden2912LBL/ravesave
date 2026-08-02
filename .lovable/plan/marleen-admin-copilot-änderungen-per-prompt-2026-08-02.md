# Marleen Admin-Copilot: Änderungen per Prompt

Ziel: Du als Admin änderst RaveSave selbst — per einfachem Prompt, mit einem kostenfreien KI-Modell (Groq, Fallback Lovable AI), ohne dass ich eingreifen muss.

## Was du bekommst

Ein neuer Tab „Copilot" im Admin-Panel: ein Chatfeld, in das du schreibst, z. B.
- „Mach die Akzentfarbe wärmer, mehr orange"
- „Blende die Seite Tolerance aus"
- „Ändere die Überschrift auf der Startseite zu ‚Sicher feiern beginnt hier'"
- „Schreib den Infotext zu Ketamin kürzer und ruhiger"

Der Copilot schlägt konkrete Änderungen vor, zeigt sie als Liste („Vorher → Nachher"), und du bestätigst mit einem Klick. Erst dann wird gespeichert. Jede Änderung ist einzeln rückgängig machbar.

## Was der Copilot ändern darf

| Bereich | Beispiel |
| --- | --- |
| Design/Theme | Farben, Rundungen, Schriftgröße, Abstände, Glas-Effekt-Stärke |
| Seiten an/aus | einzelne Seiten oder Funktionen sperren/freigeben |
| Texte | jede Überschrift/Beschriftung der Oberfläche |
| Redaktionelle Inhalte | Info-/Wissenstexte |
| Substanz-Angaben | bestehende Overrides anpassen |
| Marleens KI-Regeln | Persona, Antwortstil, gesperrte Themen |

Nicht erlaubt: Löschen von Nutzerdaten, Statistiken oder Einsendungen, und keine Änderung am Quellcode (Sicherheitsgrenze — Code-Änderungen bleiben beim Deploy-Weg im Dev-Tab).

## Design-Steuerung (neu)

Bisher sind Farben fest im Stylesheet. Neu: eine Tabelle mit Theme-Tokens (Primärfarbe, Hintergrund, Radius, Schrift-Skalierung, Effektstärke). Diese werden beim Laden der Seite als CSS-Variablen gesetzt und überschreiben die Standardwerte. Dadurch kann der Copilot — und du auch manuell über Regler/Farbwähler im selben Tab — das Aussehen live ändern, ohne Deploy.

Es gibt „Vorschau" (nur für dich sichtbar), „Veröffentlichen" und „Auf Standard zurücksetzen".

## Kosten & Verfügbarkeit

Der Copilot nutzt dieselbe Provider-Kette wie Marleen: zuerst Groq (kostenfreies Kontingent), bei Ausfall automatisch Lovable AI. Modell und Temperatur wählst du im KI-Tab. Fällt beides aus, bleiben alle manuellen Regler und Editoren im Tab voll nutzbar — du bist nie blockiert.

## Technische Umsetzung

1. **Migration**: `public.site_theme` (Token-Key/Wert, published/draft) und `public.admin_change_log` (Zeitpunkt, Tool, alter Wert, neuer Wert, für Undo). GRANTs + RLS: öffentlicher SELECT nur auf veröffentlichte Theme-Tokens, Schreiben ausschließlich über Service-Role in Server-Funktionen.
2. **`src/lib/adminCopilot.functions.ts`**: `copilotPlan` (Prompt → Tool-Calls des Modells → Vorschlagsliste, nichts wird geschrieben) und `copilotApply` (führt bestätigte Änderungen aus, schreibt ins Change-Log). Beide hinter der bestehenden Admin-Session-Prüfung; identisches `isAdmin()`-Muster wie in `adminAi.functions.ts` (kein harter Throw beim Laden).
3. **Tool-Layer** (`src/lib/copilotTools.server.ts`): definierte, eng validierte Zod-Tools — `set_theme_token`, `set_feature_flag`, `set_ui_text`, `set_site_content`, `set_substance_override`, `update_ai_rules`. Keine Freitext-SQL, keine Dateizugriffe.
4. **Modellaufruf**: über die bestehende Groq/Lovable-Kette aus `aiSettings.server.ts` mit Tool-Calling; unbekannte Tools und Werte außerhalb der Schemas werden verworfen.
5. **Theme-Runtime** (`src/lib/theme.ts`): lädt veröffentlichte Tokens (localStorage-Cache wie `featureFlags.ts`) und setzt sie als CSS-Variablen auf `:root` in `__root.tsx`.
6. **UI** (`src/components/admin/AdminCopilotTab.tsx`): Chat + Diff-Bestätigung + manuelle Regler/Farbwähler + Verlauf mit Undo. Als neuer Tab in `src/routes/admin.tsx`.
