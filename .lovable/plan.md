# Plan: Admin-Schlüssel-Login + Globaler KI-Button & Onboarding

Zwei getrennte, große Änderungen. Ich empfehle, sie nacheinander zu mergen — zuerst Admin-Auth (kleiner, sicherheitskritisch), dann KI-Onboarding/Button.

---

## Teil A — Admin-Login per Sicherheitsschlüssel

### Architektur-Entscheidung (wichtig)

Der Admin-Bereich schreibt in die `posts`-Tabelle. Die bestehenden RLS-Policies prüfen `has_role(auth.uid(), 'admin')`. Wenn ich Supabase-Auth komplett entferne und nur einen lokalen Hash-Vergleich im Browser mache, sind **alle Schreibrechte weg** (kein `auth.uid()` → RLS blockt alles), oder ich müsste RLS aufweichen, was die ganze Sicherheit kippt.

**Lösungsansatz:** Supabase-Auth bleibt unter der Haube bestehen, ist im UI aber unsichtbar. Der „Sicherheitsschlüssel" ist faktisch das Admin-Passwort, die E-Mail wird einmalig im Setup hinterlegt und nur noch für Recovery gebraucht.

- Erst-Setup: Admin gibt **E-Mail + Schlüssel** ein → wird intern als Supabase-Signup gemacht (Schlüssel = Passwort).
- Login danach: nur noch **Schlüssel**-Feld. Die E-Mail wird lokal in `localStorage` (`admin_email`) gemerkt und transparent für `signInWithPassword` verwendet. Hash wird nicht extra gespeichert — Supabase macht das schon korrekt serverseitig.
- Recovery: Klick auf „Schlüssel vergessen?" → optionales E-Mail-Feld → `resetPasswordForEmail` (echte Mails laufen schon über Supabase, kein Platzhalter nötig).

Damit:
- Kein Klartext-Schlüssel im Browser/DB.
- RLS bleibt komplett intakt.
- E-Mail-Login im UI verschwunden, E-Mail nur im Recovery.
- 24-h-Session: Supabase-Tokens haben eingebaute Expiry; zusätzlich speichern wir `admin_session_started_at` und erzwingen Logout nach 24 h.
- Rate-Limit: nach 5 falschen Versuchen 15 min lokale Sperre (Counter in `localStorage` + Timestamp).
- Fehlertext immer neutral: „Admin-Schlüssel ungültig."

### Dateien
- `src/routes/admin.tsx` — `LoginCard` umbauen: drei States `setup | login | recovery`. Setup nur sichtbar, wenn noch keine `admin_email` lokal hinterlegt. Login nur Schlüssel-Feld.
- `src/routes/reset-password.tsx` — bleibt, kleinere Texte: „Neuen Admin-Schlüssel setzen".
- Keine DB-Migration nötig.

### Sicherheits-Hinweise im UI
- Beim Setup: „Bewahre deinen Admin-Schlüssel sicher auf. Er ermöglicht Zugriff auf den Admin-Bereich." + Hinweis, dass die E-Mail nur für Recovery dient.
- Beim Login: Link „Admin-Schlüssel vergessen?"

---

## Teil B — Globaler KI-Fragebutton + KI-Onboarding

### B1. Globaler „KI fragen"-Button (Prio 1)
- Neue Komponente `src/components/AiAskButton.tsx` (FAB unten **links**, damit Notfall-Button unten rechts unangetastet bleibt und visuell dominanter wirkt).
- Auf allen Seiten via `__root.tsx` eingebunden, ausgeblendet auf `/admin*` und `/reset-password`.
- Öffnet Bottom-Sheet (`Sheet` aus shadcn) mit:
  - Header: „KI fragen" + Disclaimer-Zeile „KI kann Fehler machen. Keine medizinische Beratung. Bei akuten Symptomen 112 rufen."
  - 5 Vorschlagschips: „Erklär mir diese Substanz einfacher", „Was bedeutet diese Risikostufe?", „Wie nutze ich den Mix-Check?", „Was soll ich im Notfall sagen?", „Wo finde ich mein Protokoll?"
  - Opt-in-Toggle „Meine lokalen Profil-/Protokolldaten für diese Antwort berücksichtigen" (default: aus).
  - Streamt gegen bestehende `/api/chat`-Route (kein Backend-Umbau).
  - Bei Erkennung von Notfall-Keywords (bewusstlos, krampf, atemnot, brustschmerz, überhitzung, …) sofort 112-Hinweis vor jedem KI-Stream-Output.

### B2. KI-geführtes Erst-Onboarding (Prio 2)
- Neue Route `src/routes/welcome.tsx` (oder Modal im `__root.tsx`, ich nehme Modal — kein Redirect-Geflecht).
- Trigger: `localStorage.welcome_seen` fehlt → Modal beim ersten Mount.
- Optionen: „KI-Onboarding starten" / „Später" / „Ohne KI fortfahren".
- KI-Pfad: simulierter Chat-Schritt-Dialog (kein echter LLM-Roundtrip pro Frage nötig — vordefinierte Schritte als Chat-Bubbles, KI-Stil), Antworten als Chip-Auswahl, schreibt direkt ins bestehende lokale Profil-Schema (`src/lib/profile.ts`).
- 4 Schritte: Substanzgruppen → Erfahrung gesamt → Häufigkeit → optionale Details (Akkordeon, überspringbar).
- Danach 4–5 Erklär-Bubbles zu Protokoll / Mix / Wiki / Notfall / KI-Chat.

### B3. Datenschutz-Hinweis
- Vor erster KI-Nutzung Hinweis-Banner: „Eingaben werden an einen externen KI-Anbieter gesendet. Gib keine Informationen ein, die du nicht teilen möchtest." → einmal mit „Verstanden" bestätigen, in `localStorage` merken.

### B4. KI-Sicherheitsregeln
Bestehender System-Prompt in `src/routes/api/chat.ts` ist bereits sehr restriktiv (kein „sicher", keine Dosen, 112-Direktive). Ich ergänze nur: explizite Anweisung, App-Navigation zu erklären und Wiki-Inhalte zusammenzufassen.

### Dateien (Teil B)
- neu: `src/components/AiAskButton.tsx`
- neu: `src/components/WelcomeOnboarding.tsx`
- edit: `src/routes/__root.tsx` (beide Komponenten einbinden, ausgenommen `/admin*`)
- edit: `src/routes/api/chat.ts` (kleine Prompt-Ergänzung)
- edit: `src/lib/profile.ts` falls Schema-Felder fehlen (vermutlich nicht, vorhandenes Schema reicht)

---

## Reihenfolge der Umsetzung
1. **Teil A** (Admin-Schlüssel-Login) — abgeschlossen & getestet
2. **B1** (Globaler KI-Button) — größter UX-Gewinn, kleinster Code-Footprint
3. **B2** (KI-Onboarding-Modal)
4. **B3 + B4** (Datenschutz-Banner, Prompt-Feinschliff)

## Was ich **nicht** baue
- Kein eigener Krypto-Stack für den Schlüssel — Supabase übernimmt Hashing.
- Kein eigenes Mail-System — `resetPasswordForEmail` läuft bereits.
- Keine neue Account-Architektur, keine zusätzlichen Tabellen.
- Keine automatische KI-Aktualisierung von Profildaten — KI darf vorschlagen, Nutzer bestätigt manuell.

Wenn das so passt, fang ich mit Teil A an. Falls du den Admin-Schlüssel lieber **ohne** Supabase-Auth-Unterbau willst (z. B. weil dich die unsichtbare E-Mail stört), sag Bescheid — dann müssten wir aber RLS lockern oder einen Server-Function-Layer dazwischenschalten, und das wird größer.
