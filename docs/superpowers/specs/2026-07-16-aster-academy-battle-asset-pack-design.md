# Aster Academy Battle Asset Pack Design

## Goal

Build an original, landscape mobile idle-RPG battle screen from the selected visual direction. The result must not be a flattened mockup. Backgrounds, characters, enemies, portraits, effects, icons, and UI text must remain independently replaceable.

## Product Surface

- Viewport: 844 × 390 landscape mobile
- Primary loop: watch automatic combat, spend skill cost, change speed, pause, and inspect idle rewards
- Visual direction: bright academy city, white and cyan geometric HUD, navy typography, yellow action accents, generous open battlefield
- IP rule: borrow only high-level genre and design-language cues; do not reproduce Blue Archive characters, uniforms, logos, school names, iconography, copy, exact layouts, or weapons

## Asset Boundary

### Raster assets

- One clean campus-plaza battlefield background without units or HUD
- Four original hero transparent cutouts
- Three original enemy transparent cutouts
- Four original hero bust portraits
- Three transparent combat effects: cyan projectile, orange hit burst, cyan team-skill flare
- Selected concept image preserved as a reference

### Code-native UI

- Mission banner
- Timer, pause, and speed controls
- Health bars and status pips
- Skill cards and cost gauge
- Idle-reward chip
- AUTO toggle
- Floating damage values

UI text and changing numbers must never be baked into raster images. Standard controls use Tabler Icons. Custom character and game art uses generated raster assets.

## Character Direction

The first squad contains four original students from Aster Academy.

1. Seoha — black-haired close-range captain, short navy jacket, cyan scarf, compact magic-tech blade
2. Rumi — pink-haired support striker, white field jacket, coral accents, compact pulse caster
3. Iden — silver-haired tactical analyst, pale-gray bob, cyan visor tablet, support drone controller
4. Nari — orange-haired defender, navy vest, yellow accents, rectangular deployable barrier case

All characters use a compact 3D-like chibi rendering with large heads, short limbs, simple fabric blocks, and no tiny costume engraving. They have no halos and must not resemble existing game characters.

## Enemy Direction

1. orb-drone — round white maintenance drone, cyan face display
2. scout-drone — slightly elongated white scanner drone, twin side fins
3. training-robot — blocky white academy training robot, dark display face, thick limbs

Enemies use two main shapes, two surface colors, and one cyan emissive accent. Their silhouettes must remain readable at 48–72 CSS pixels.

## Runtime Motion

This first asset pack uses transparent cutout animation, not frame-by-frame sprite atlases.

- heroes: idle bob, run sway, attack lunge, hit recoil
- drones: hover, drift, hit recoil, defeat fall
- robot: idle weight shift, attack punch, hit recoil, defeat collapse
- projectiles and hit effects: short CSS-timed travel and scale/fade animations

The manifest stores pivot, display width, battlefield position, facing direction, motion profile, and portrait path. Frame atlases can replace cutout motion later without changing the consuming component interface.

## Prototype Behavior

- AUTO toggle switches selected state
- speed cycles between ×1 and ×2
- pause freezes battle motion
- skill cards consume cost and show a short activation effect
- cost recharges automatically
- reward chip opens a compact reward summary
- all controls remain inside 844 × 390 with no clipping

## File Layout

```text
examples/aster-academy-battle/
  src/
    components/
      BattleScene.jsx
      BattleHud.jsx
      CharacterUnit.jsx
      SkillDeck.jsx
    data/
      asset-manifest.json
    styles/
      tokens.css
      battle.css
    App.jsx
    main.jsx
  public/assets/
    reference/battle-direction-01.png
    backgrounds/campus-plaza.png
    heroes/seoha.png
    heroes/rumi.png
    heroes/iden.png
    heroes/nari.png
    enemies/orb-drone.png
    enemies/scout-drone.png
    enemies/training-robot.png
    portraits/seoha.png
    portraits/rumi.png
    portraits/iden.png
    portraits/nari.png
    effects/cyan-projectile.png
    effects/orange-hit-burst.png
    effects/team-skill-flare.png
  design-qa.md
```

## Acceptance Criteria

- Every raster asset listed above exists as an independent file
- All cutout assets have alpha transparency and transparent corners
- The preview uses the independent files rather than the flattened reference
- The primary composition remains recognizably faithful to the selected option
- The result uses original characters and enemy designs
- The 844 × 390 frame has no overflow or obscured controls
- Core interactions work
- Design QA compares the selected reference and the rendered implementation; if browser capture is unavailable, the report must say `final result: blocked`
