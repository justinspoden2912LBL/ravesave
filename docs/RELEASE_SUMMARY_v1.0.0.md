# Release Summary v1.0.0 — Ravesave New

**Release Date:** 2026-08-22  
**Version:** 1.0.0  
**Status:** ✅ LIVE

---

## Was ist neu?

### Datenbank-Schema
- ✅ `substances` — Substanzen-Profile mit Dosis, Wirkdauer, Risiken, Harm-Reduction-Tipps
- ✅ `mix_risks` — Mischkonsum-Ampel mit Risikobewertungen (low, medium, high, very_high)
- ✅ `sessions` — Konsum-Protokolle mit User-Zuordnung
- ✅ `checklist_entries` — Checklisten für Set & Setting, Wasser, Kontakte
- ✅ `safety_plans` — NotfallplÃ¤ne mit Kontakten und Strategien

### Seed-Daten
- 6 Substanzen: Alkohol, MDMA, Ketamin, Kokain, GHB/GBL, Benzodiazepine
- 5 Mischkonsum-Kombinationen mit Risikobewertungen

### Features
- ✅ Supabase-Integration mit Row-Level Security
- ✅ Vercel-Deployment mit automatischen Builds
- ✅ Domains: ravesave.de, www.ravesave.de, ravesave.vercel.app
- ✅ Admin-Bereich mit Groq-Key-Integration
- ✅ Vercel Web Analytics

---

## Technische Details

### Stack
- **Frontend:** TanStack Start (React/Vite)
- **Backend:** Supabase (Postgres)
- **Hosting:** Vercel
- **Domain:** Cloudflare DNS

### Migrationen
- Latest Migration: `20260822120000_release_schema_consolidated.sql`
- Alle Migrationen liegen unter `supabase/migrations/`

### Commits
- `3a6d011e` — feat(release): consolidated schema
- `dd1f3e74` — docs: add release notes
- `d23b3174` — chore: trigger deployment

---

## Live-Status

| Komponente | Status | URL/ID |
|------------|--------|---------|
| **Production** | ✅ READY | https://ravesave.de |
| **Vercel Deployment** | ✅ READY | `dpl_7gVKrwPJf8tnYhMxR5gwwJZ7ZFU9` |
| **Supabase** | ✅ LIVE | `lzdxfosharqononhzlvk` |
| **GitHub** | ✅ Alle Commits | `justinspoden2912LBL/ravesave` |

---

## Nächste Schritte

1. Frontend-Komponenten an Supabase-Schema anbinden
2. Weitere Substanzen und Mischkonsum-Kombinationen ergänzen
3. Auth-Flow für Sessions verfeinern
4. Drug-Checking-Stellen als eigene Tabelle

---

## Bekannte Issues

- Vercel cancelt Deployments bei schnellen Pushes (Workaround: Wartezeit zwischen Commits)
- Framework-Erkennung in Vercel zeigt "ember" statt "TanStack Start" (kosmetisch)

---

**Release abgeschlossen.** 🎉
