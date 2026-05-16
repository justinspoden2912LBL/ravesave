## Ziel
Alte Build-Artefakte und TS-Caches entfernen, dann frischen Typecheck + Build laufen lassen, um sicherzustellen, dass der gemeldete `PairPharmaVisual`-Fehler nicht von veralteten Caches stammt.

## Schritte (in Build-Mode auszuführen)

1. **Caches löschen** (parallel):
   - `rm -rf node_modules/.vite` (Vite-Cache)
   - `rm -rf .tanstack` (TanStack Router-Generator-Cache, inkl. evtl. veralteter `routeTree.gen.ts`-Snapshots)
   - `rm -rf dist .output .nitro` (Build-Output)
   - `rm -rf node_modules/.cache` (allgemeiner Tooling-Cache)
   - `find . -name "*.tsbuildinfo" -not -path "./node_modules/*" -delete` (TS incremental cache)

2. **Frischer Typecheck**: `bunx tsc --noEmit`
   - Erwartung: keine Fehler (bei letzter Prüfung war es bereits clean).

3. **Frischer Production-Build**: wird automatisch durch das Harness getriggert — manuell `bun run build` nicht nötig.

4. **Verifikation**: Falls der `PairPharmaVisual`-Fehler erneut auftritt, gezielt nach Definition + Verwendung in `src/routes/risks.tsx` greppen und ggf. die Funktion neu platzieren.

## Hinweis
Hinweis: Dies ist ein TanStack-Start-Projekt (kein Next.js), daher gibt es keinen `.next`-Cache.
