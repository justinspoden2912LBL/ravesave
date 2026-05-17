# Premium Redesign + Neurochem Viz + Interaction Checker

The request is large (full visual overhaul + new viz system + redesigned substance pages + iOS feel + advanced interaction checker). I'll deliver it in 4 sequential phases so each one is reviewable in the preview before the next is layered on top. All work stays in the frontend / presentation layer and the existing pharmacology + substances data files.

---

## Phase 1 — Design system + iOS-feeling shell

Goal: app looks and feels premium before touching feature screens.

Updates to `src/styles.css`:
- Refined dark palette in oklch: deeper near-black background (`oklch(0.10 0.02 270)`), cooler surfaces, single restrained accent gradient (cyan → violet) instead of full aurora rainbow.
- New tokens: `--surface-1/2/3` (layered glass), `--stroke-soft`, `--accent`, `--accent-glow`, `--danger`, `--warn`, `--ok`, `--info`, plus `--shadow-card`, `--shadow-pop`, `--blur-glass`.
- Typography: keep Space Grotesk for display, add `Inter` for body via Google Fonts `<link>` in `__root.tsx`; define `--font-display` / `--font-body` / tabular-nums utility.
- Utilities: `.glass-card` (backdrop-blur + 1px hairline + inner highlight), `.glow-ring`, `.pressable` (active:scale-95 transition), `.hairline`, `.section-pad`, `.safe-bottom` (env(safe-area-inset-bottom)).
- Motion keyframes: `shimmer`, `pulse-soft`, `rise-in`, `slide-up-modal`, `radar-sweep`.

New shell:
- `src/components/shell/AppShell.tsx` — replaces top `Nav` with a translucent top bar (back chevron + page title + right action slot) and a **bottom tab bar** (Home / Protokoll / Mix / Substanzen / Mehr). Tab bar uses `safe-bottom`, glass blur, animated indicator pill.
- `src/components/shell/TopBar.tsx` — large-title style: collapses from "Large title" to compact on scroll (IntersectionObserver, no extra deps).
- `src/components/shell/PageTransition.tsx` — wraps `<Outlet />` with a subtle fade+slide on route change (uses `useLocation().pathname` as key; CSS-only animation, no framer-motion needed).
- `src/components/shell/Sheet.tsx` — iOS-style modal sheet (slide-up, rounded-3xl, drag handle, blur backdrop) built on existing Radix Dialog.
- "Mehr" tab opens a Sheet listing Risiken / Knigge / Chat / Statistik / Über / Einstellungen so the bottom bar stays at 5 items.
- Keep current routes; only navigation chrome changes. Old `Nav.tsx` removed.

Microinteractions:
- All cards/buttons get `pressable` (scale 0.97 on press, 150ms cubic-bezier).
- Skeleton + shimmer loaders (`src/components/ui/skeleton-shimmer.tsx`) used while async data resolves.
- Page-level `<Suspense>`-style fade-in via `animate-rise-in`.

---

## Phase 2 — Neurochemistry visualization system

New folder `src/components/neuro/`:

- `NeuroRadar.tsx` — animated SVG radar/spider chart. Axes: DAT, NET, SERT, VMAT2, 5-HT2A, σ1, NMDA, MOR, α4β2 (configurable subset per substance). Values 0–3. Animated draw-in (path stroke-dashoffset), glow filter, hover tooltips per axis.
- `TransmitterBars.tsx` — horizontal "glowing" bars for DAT / NET / SERT / VMAT2 release vs reuptake-inhibition (signed scale, color-coded by family token already in CSS).
- `EffectMeters.tsx` — vertical compact meters for: subjective warmth, stimulation, compulsiveness, psychosis risk, neurotoxicity. Color ramp `ok → warn → danger`, animated fill, tabular numbers.
- `ReceptorMap.tsx` (already exists) — restyled to match new glass tokens; keep slot logic.
- `NeuroProfile.tsx` — composition component: radar + bars + meters in a responsive 2-col grid (1-col on mobile).

Data:
- Extend `src/lib/pharmacology.ts` with `transmitterProfile` (DAT/NET/SERT/VMAT2 numbers, signed) and `effectProfile` (warmth/stim/compulsiveness/psychosis/neurotox 0–3) per substance, alongside existing receptor/flag data. Sensible defaults derived from existing receptor data where not explicitly set; UI degrades gracefully when missing.

All animations CSS/SVG-only — no new runtime deps.

---

## Phase 3 — Substance detail page

Currently `src/routes/substances.tsx` is a single list+detail page (298 lines). Split into:

- `src/routes/substances.tsx` — premium list (glass cards, search, filter chips, category headers).
- `src/routes/substances.$slug.tsx` — new detail route with iOS large-title + sticky segmented quick-nav.

Detail sections (collapsible glass cards with animated chevrons; sticky segmented control jumps to each):
1. **Overview** — class, RoA chips, short blurb, emergency banner if high-risk flags present.
2. **Pharmacology** — `NeuroProfile` (radar + bars + meters from Phase 2) + CYP badges.
3. **Duration** — animated horizontal timeline (onset → come-up → peak → comedown → after-effects) with current-time marker if substance is in user log.
4. **Subjective effects** — tag grid (cognitive / physical / visual), color-coded.
5. **Interaction warnings** — top combos pulled from existing risk matrix.
6. **Neurotoxicity profile** — meter + explanation card.
7. **Psychosis risk** — meter + triggers list.
8. **Cardiovascular stress** — HR/BP/QT mini-indicators.
9. **Receptor / transporter profile** — `ReceptorMap` + legend.
10. **Community reports** — clearly separated panel with "Erfahrungsberichte – keine Faktenbasis" warning chip; pulled from existing data if present, otherwise placeholder.

Extras:
- Emergency banner component (red glass) auto-shown if `respiratoryDepression`, `qtProlongation`, or `cardiotoxic` flags present.
- Smooth scroll + scroll-spy on segmented control.
- Share/back/favorite action slot in TopBar.

---

## Phase 4 — Advanced interaction checker

Refactor `src/routes/mix.tsx` into a multi-substance checker (currently mostly pairwise).

- Multi-select substance picker (chips in glass bar, tap to add/remove, search sheet).
- For 2+ selected substances, compute per-risk aggregate scores using existing `pharmacology` flags + new transmitter data:
  - serotoninSyndrome (sum of serotonergic + releaser/SERT overlap)
  - respiratoryDepression (sum of respiratory flags)
  - seizure
  - qtProlongation
  - psychosis
  - cardiovascularStrain (vaso + qt + stim load)
  - neurotoxicityAmplification (neurotox meters + hyperthermia + serotonergic overlap)
- New components:
  - `RiskMatrix.tsx` — N×N grid of selected substances, cell color = max pair risk, tap cell → detail sheet.
  - `RiskDial.tsx` — circular animated dial per risk category, 0–100 with `ok/warn/danger` ramp.
  - `AlertCard.tsx` — animated pulsing alert for any `danger`-level risk (pulse-soft + glow).
  - `ExplainCard.tsx` — scientific explanation per triggered risk (mechanism + which substances contribute).
- Empty state and "single substance" state both styled.

---

## Technical notes (for the technically inclined)

- No new dependencies. All animation is CSS keyframes + SVG; modal/sheet uses existing Radix Dialog already in `components/ui`.
- Bottom tab bar requires `pb-[calc(env(safe-area-inset-bottom)+64px)]` on `<main>` to avoid content under the bar.
- Page transitions: keyed wrapper around `<Outlet />` with `animate-rise-in` on each pathname change. No framer-motion to keep bundle lean.
- Scroll-spy: `IntersectionObserver` with `rootMargin: "-40% 0px -55% 0px"`.
- New route `substances.$slug.tsx` requires regenerating routeTree (TanStack Vite plugin handles automatically). Existing `/substances?slug=...` query handling stays as fallback for old links via a `loader` redirect.
- All tokens defined once in `styles.css` — components consume `var(--accent)` etc., never raw colors.
- Typecheck after each phase; preview reviewed before continuing.

---

## Out of scope (will not change)

- Backend / data shape of `src/lib/substances.ts` (read-only).
- Auth, persistence, AI gateway behavior.
- Existing SEO metadata (already shipped last turn).

If you approve, I'll start with **Phase 1** (design system + iOS shell) so you see the new look immediately, then move through Phases 2–4. If you'd rather I batch multiple phases into one implementation pass, say "do all phases" and I'll ship them sequentially without pausing.
