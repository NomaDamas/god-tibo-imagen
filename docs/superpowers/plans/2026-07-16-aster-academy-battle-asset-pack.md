# Aster Academy Battle Asset Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce an independently replaceable raster asset pack and an interactive 844 × 390 battle composition matching the selected Aster Academy direction.

**Architecture:** Generated raster art lives under the prototype's `public/assets` tree and is addressed through one manifest. React components render the battlefield, units, and HUD independently; CSS animations provide cutout motion while keeping a later sprite-atlas upgrade possible.

**Tech Stack:** React, Vite, CSS, `@tabler/icons-react`, `@fontsource/noto-sans-kr`, built-in Image Gen, chroma-key background removal.

## Global Constraints

- Follow `docs/superpowers/specs/2026-07-16-aster-academy-battle-asset-pack-design.md`.
- Build at exactly 844 × 390.
- Use original Aster Academy characters and enemies.
- Do not copy protected Blue Archive characters, uniforms, logos, school names, weapons, icons, copy, or exact layouts.
- Do not bake UI labels or dynamic values into images.
- Use raster files for custom art and Tabler Icons for standard UI icons.
- All character, enemy, portrait, and effect cutouts must have alpha transparency.

---

### Task 1: Bootstrap and reference

**Files:**
- Create: `examples/aster-academy-battle/`
- Create: `examples/aster-academy-battle/public/assets/reference/battle-direction-01.png`

- [ ] Bootstrap the Product Design React prototype using `bootstrap-prototype.mjs`.
- [ ] Copy the selected Image Gen result to the exact reference path.
- [ ] Install `@tabler/icons-react` and `@fontsource/noto-sans-kr`.
- [ ] Verify `npm run build` exits 0.

### Task 2: Generate raster assets

**Files:**
- Create: `examples/aster-academy-battle/public/assets/backgrounds/campus-plaza.png`
- Create: `examples/aster-academy-battle/public/assets/heroes/*.png`
- Create: `examples/aster-academy-battle/public/assets/enemies/*.png`
- Create: `examples/aster-academy-battle/public/assets/portraits/*.png`
- Create: `examples/aster-academy-battle/public/assets/effects/*.png`

- [ ] Generate the clean academy-plaza battlefield without units or HUD.
- [ ] Generate four hero cutouts on a uniform chroma background and remove the background locally.
- [ ] Generate three enemy cutouts on a uniform chroma background and remove the background locally.
- [ ] Generate four bust portraits with consistent framing.
- [ ] Generate three transparent combat effects.
- [ ] Verify every required path exists and all cutouts have alpha channels and transparent corners.

### Task 3: Manifest and component contracts

**Files:**
- Create: `examples/aster-academy-battle/src/data/asset-manifest.json`
- Create: `examples/aster-academy-battle/src/components/CharacterUnit.jsx`
- Create: `examples/aster-academy-battle/src/components/BattleScene.jsx`

- [ ] Define each unit's `id`, `kind`, `asset`, `portrait`, `x`, `y`, `width`, `facing`, and `motion` values in the manifest.
- [ ] Render all seven units from manifest data without asset-specific JSX branches.
- [ ] Add accessible labels and data attributes for verification.

### Task 4: Interactive HUD

**Files:**
- Create: `examples/aster-academy-battle/src/components/BattleHud.jsx`
- Create: `examples/aster-academy-battle/src/components/SkillDeck.jsx`
- Create: `examples/aster-academy-battle/src/styles/tokens.css`
- Create: `examples/aster-academy-battle/src/styles/battle.css`
- Modify: `examples/aster-academy-battle/src/App.jsx`

- [ ] Implement mission, timer, pause, speed, cost, skill, reward, and AUTO controls.
- [ ] Keep the battle as the dominant region and preserve the reference hierarchy.
- [ ] Add idle, lunge, recoil, projectile, and skill-flare animations.
- [ ] Verify every primary control changes visible state.

### Task 5: Build and design QA

**Files:**
- Create: `examples/aster-academy-battle/design-qa.md`

- [ ] Run `npm run build` and record the exit code.
- [ ] Start the local preview and capture the 844 × 390 state when browser control is available.
- [ ] Compare the source and implementation at the same viewport.
- [ ] Fix actionable P0, P1, and P2 findings.
- [ ] Write `final result: passed` only with browser-rendered evidence; otherwise write `final result: blocked` and name the browser-capture blocker.
- [ ] Commit the prototype, generated assets, spec, and plan.
