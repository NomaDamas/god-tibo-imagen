# Aster Academy 400-Monster Cutout System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 400-entry monster catalog, generate the first 12 transparent cutouts, and prove the cutout animation approach in an interactive monster lab.

**Architecture:** One 100-entry archetype source expands deterministically into a 400-entry generated catalog. Each produced monster owns one transparent PNG and one shared motion-profile key; React renders the cutout while CSS supplies idle, move, attack, hit, and death states.

**Tech Stack:** Node.js scripts, JSON, React 19, Vite 6, CSS animations, built-in image generation plus local chroma-key removal.

## Global Constraints

- Follow `docs/superpowers/specs/2026-07-16-aster-academy-400-monster-cutout-system-design.md`.
- Do not copy protected characters, logos, schools, uniforms, weapons, or exact UI layouts from commercial games.
- First image batch is exactly 12 PNGs: three Central Plaza archetypes times four tiers.
- Every project-bound generated image must be copied into the repository and validated as RGBA.
- Use kebab-case for public IDs, directories, and filenames.

---

### Task 1: Catalog source and deterministic expansion

**Files:**
- Create: `examples/aster-academy-battle/src/data/monster-archetypes.json`
- Create: `examples/aster-academy-battle/scripts/build-monster-catalog.mjs`
- Create: `examples/aster-academy-battle/scripts/verify-monster-catalog.mjs`
- Generate: `examples/aster-academy-battle/src/data/monster-catalog.json`
- Modify: `examples/aster-academy-battle/package.json`

**Interfaces:**
- Consumes: 20 zones, five roles per zone, four fixed tier definitions.
- Produces: an array of 400 objects with unique `id` and `asset` values.

- [ ] Write the verifier first so it fails when source or generated catalog is missing.
- [ ] Add the 100 archetype records with exact zone, role, identity, palette, and motion profile.
- [ ] Implement expansion with tier codes `basic`, `advanced`, `glitched`, `overdrive` and scales `1`, `1.1`, `1.18`, `1.3`.
- [ ] Generate the catalog and run `npm run verify:monster-catalog`; expect 20 zones, 100 archetypes, 400 monsters, and zero duplicate IDs or paths.

### Task 2: First 12 cutout assets

**Files:**
- Create: `examples/aster-academy-battle/public/assets/monsters/01-central-plaza/{guide-orb,banner-hound,patrol-kite}/{basic,advanced,glitched,overdrive}.png`

**Interfaces:**
- Consumes: the selected battle reference and current original enemy materials as style-only references.
- Produces: 12 RGBA PNGs addressed by the generated catalog.

- [ ] Generate each archetype's four tiers in sequence on a flat removable chroma background.
- [ ] Remove chroma using the installed imagegen helper with soft matte and despill.
- [ ] Verify alpha, transparent corners, 45–82% subject bounds, left-facing silhouette, and no text/logo/background.
- [ ] Visually inspect the 12 cutouts as three four-tier families; retry only the failed image, at most twice.

### Task 3: Motion profiles and reusable monster actor

**Files:**
- Create: `examples/aster-academy-battle/src/data/motion-profiles.json`
- Create: `examples/aster-academy-battle/src/components/MonsterActor.jsx`
- Create: `examples/aster-academy-battle/src/styles/monster-motion.css`
- Modify: `examples/aster-academy-battle/src/App.jsx`

**Interfaces:**
- Consumes: one catalog item, `state`, `speed`, and `paused`.
- Produces: a reusable cutout actor with `idle`, `move`, `attack`, `hit`, and `death` animation classes.

- [ ] Add five profiles: `bob`, `runner`, `hover`, `caster`, and `heavy`.
- [ ] Render the PNG from `monster.asset`, apply profile/state classes, and expose an accessible label.
- [ ] Add shared hit flash and death fade; disable repeated motion under `prefers-reduced-motion`.

### Task 4: Interactive monster lab

**Files:**
- Create: `examples/aster-academy-battle/src/components/MonsterLab.jsx`
- Create: `examples/aster-academy-battle/src/styles/monster-lab.css`
- Modify: `examples/aster-academy-battle/src/App.jsx`
- Modify: `examples/aster-academy-battle/src/styles/tokens.css`

**Interfaces:**
- Consumes: the first 12 catalog entries whose assets exist.
- Produces: a gallery, selected-monster preview, tier labels, state controls, pause, and x1/x2 speed.

- [ ] Add `BATTLE` and `MONSTER LAB` view controls without changing the 844×390 shell.
- [ ] Show 12 selectable thumbnails grouped by archetype.
- [ ] Add five state buttons and re-trigger non-looping animations using a keyed actor instance.
- [ ] Keep controls inside the viewport at 844×390 and at narrower responsive widths.

### Task 5: Asset verifier, documentation, and integration checks

**Files:**
- Create: `examples/aster-academy-battle/scripts/verify-monster-assets.mjs`
- Modify: `examples/aster-academy-battle/package.json`
- Modify: `examples/aster-academy-battle/README.md`
- Modify: `examples/aster-academy-battle/design-qa.md`

**Interfaces:**
- Consumes: the first-batch catalog entries and PNG files.
- Produces: `npm run verify:monsters` as the complete functional gate.

- [ ] Validate PNG signature, dimensions, RGBA color type, transparent corners, non-empty alpha bounds, and 45–82% occupancy.
- [ ] Run `npm run verify:monsters`, `npm run verify:assets`, `npm run build`, and `git diff --check`.
- [ ] Smoke-check the running page and representative monster asset over HTTP.
- [ ] Record browser screenshot comparison as pass or blocked with the exact tool error; do not infer visual success.
- [ ] Commit the verified batch with message `feat: add first aster monster production batch`.
