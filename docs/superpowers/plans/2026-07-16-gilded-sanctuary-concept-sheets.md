# Gilded Sanctuary Monster Concept Sheets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate and verify five square concept sheets covering the first 20 monsters of the Gilded Sanctuary dungeon.

**Architecture:** Each sheet depicts one monster archetype in four left-to-right evolution stages: common, elite, corrupted, and lord. `assets/saint-tibo.png` is a style reference, not an edit target. The five generated images are independent review assets; animation atlases are out of scope until these concepts are approved.

**Tech Stack:** Built-in OpenAI image generation, local image inspection, macOS `sips`, Git.

## Global Constraints

- Follow `docs/superpowers/specs/2026-07-16-dungeon-monster-image-set-design.md`.
- Use medieval illuminated-manuscript pigments, cracked gold leaf, dark-brown outlines, and readable game silhouettes.
- Use a consistent 3/4 quarter view with all subjects facing screen-right.
- Show exactly four full-body variants in one row, ordered common, elite, corrupted, lord.
- Do not render labels, letters, numbers, logos, watermarks, frames, or unrelated props.
- Keep all body parts visible with generous spacing and no overlap between variants.
- Save final project assets under `assets/monsters/01-gilded-sanctuary/concepts/`.
- Do not generate animation atlases during this plan.

---

### Task 1: Wax Devourer Concept Sheet

**Files:**
- Reference: `assets/saint-tibo.png`
- Create: `assets/monsters/01-gilded-sanctuary/concepts/wax-devourer-concept-4-tiers.png`

**Interfaces:**
- Consumes: the shared style and tier rules in the design spec.
- Produces: the visual anchor for all four Wax Devourer animation atlases.

- [ ] **Step 1: Generate the sheet from the exact prompt**

```text
Use case: stylized-concept
Asset type: game monster evolution concept sheet
Input images: Image 1 is a style and worldbuilding reference only; do not reproduce its human subject, text, cards, button, frame, or composition.
Primary request: create one square character design sheet showing exactly four evolutionary stages of the Wax Devourer from left to right: common, elite, corrupted, lord.
Subject: one coherent quadrupedal monster species made of sagging candle wax, with four short sturdy legs, two burnt-wick horns, an ember glowing inside its chest, and a broad predatory mouth. Common is compact and simple. Elite gains a gilded reliquary collar and longer wick horns. Corrupted becomes asymmetrical with split wax plates, extra ember vents, and violet-black fissures. Lord is larger and regal with a broken circular gold-leaf halo, cathedral-like wax armor, and a crown of blazing wicks. Each stage must add at least two structural changes, not merely change color.
Style/medium: hand-painted medieval illuminated manuscript fused with polished dark-fantasy game character concept art; aged mineral pigments, cracked gold leaf accents, warm parchment-era palette, dark-brown contour lines, readable silhouette. Match Image 1's aged sacred-art atmosphere and pigment texture without copying its layout.
Composition/framing: exactly four separate full-body variants in one horizontal row, equal ground baseline, 3/4 quarter view, all facing screen-right, generous space between figures, lord may be up to 140 percent of common height.
Scene/backdrop: plain warm neutral studio parchment wash used only for concept review, no scenery and no floor plane.
Constraints: coherent anatomy across all four stages; every limb, horn, and tail fully visible; no overlap; no cast shadows; no labels; no text; no letters; no numbers; no decorative frame; no UI; no human figures; no extra creatures; no watermark.
```

- [ ] **Step 2: Save the generated image at the exact output path**

Move or copy the built-in result into `assets/monsters/01-gilded-sanctuary/concepts/wax-devourer-concept-4-tiers.png` without overwriting an unrelated file.

- [ ] **Step 3: Verify the output**

Run:

```bash
sips -g pixelWidth -g pixelHeight -g format assets/monsters/01-gilded-sanctuary/concepts/wax-devourer-concept-4-tiers.png
```

Expected: square PNG. Inspect visually and require exactly four non-overlapping right-facing variants with clear structural progression.

### Task 2: Parchment Hound Concept Sheet

**Files:**
- Reference: `assets/saint-tibo.png`
- Create: `assets/monsters/01-gilded-sanctuary/concepts/parchment-hound-concept-4-tiers.png`

**Interfaces:**
- Consumes: the approved Wax Devourer sheet as a style consistency reference when available.
- Produces: the visual anchor for all four Parchment Hound animation atlases.

- [ ] **Step 1: Generate the sheet from the exact prompt**

```text
Use case: stylized-concept
Asset type: game monster evolution concept sheet
Input images: Image 1 is the sacred illuminated-manuscript style reference; Image 2, if provided, establishes the already approved monster-sheet layout and rendering consistency. Do not copy any pictured subject.
Primary request: create one square character design sheet showing exactly four evolutionary stages of the Parchment Hound from left to right: common, elite, corrupted, lord.
Subject: a lean hunting hound folded from torn scripture parchment, with layered-paper muscles, metal clasp joints, ink-stroke eyes, and a ribbon-like torn-page tail. Common is agile and lightly folded. Elite gains reinforced gold corner plates, seal-wax joints, and a sharper layered mane. Corrupted has contradictory handwritten lines crawling over its body, torn asymmetric jaws, and black ink leaking through splits. Lord becomes a large cathedral-manuscript beast with an arched-book spine, gilded page-blade mane, multiple sealed scroll tails, and a broken halo-shaped bookmark. Each stage adds at least two structural changes.
Style/medium: hand-painted medieval illuminated manuscript fused with polished dark-fantasy game character concept art; aged mineral pigments, cracked gold leaf accents, warm parchment palette, dark-brown contour lines, readable silhouette.
Composition/framing: exactly four separate full-body variants in one horizontal row, equal ground baseline, 3/4 quarter view, all facing screen-right, generous space between figures, lord up to 140 percent of common height.
Scene/backdrop: plain warm neutral studio parchment wash, no scenery and no floor plane.
Constraints: coherent canine anatomy; every limb, ear, tail, and page edge visible; no overlap; no cast shadows; no labels; no text; no readable writing; no letters; no numbers; no frame; no UI; no humans; no extra creatures; no watermark.
```

- [ ] **Step 2: Save and verify**

Save to the exact output path. Verify square PNG dimensions with `sips` and visually require exactly four non-overlapping stages, coherent canine anatomy, and no readable text.

### Task 3: Reliquary Scarab Concept Sheet

**Files:**
- Reference: `assets/saint-tibo.png`
- Create: `assets/monsters/01-gilded-sanctuary/concepts/reliquary-scarab-concept-4-tiers.png`

**Interfaces:**
- Consumes: the shared sheet layout and sacred-material palette.
- Produces: the visual anchor for all four Reliquary Scarab animation atlases.

- [ ] **Step 1: Generate the sheet from the exact prompt**

```text
Use case: stylized-concept
Asset type: game monster evolution concept sheet
Input images: Image 1 is a sacred illuminated-manuscript style reference only; do not reproduce its human subject or composition.
Primary request: create one square character design sheet showing exactly four evolutionary stages of the Reliquary Scarab from left to right: common, elite, corrupted, lord.
Subject: a six-legged beetle carrying a miniature saintly reliquary shrine as its carapace, with tarnished brass legs, amber joints, and a tiny warm light behind the shrine grille. Common carries a modest box shrine. Elite gains engraved leg armor, incense vents, and a taller gold-capped shrine. Corrupted has an off-center split reliquary, grasping relic fragments, extra mismatched legs, and violet light escaping through cracks. Lord becomes a massive ceremonial scarab with a rose-window shell, processional spires, censer mandibles, and a radiant broken gold-leaf halo. Each stage adds at least two structural changes.
Style/medium: hand-painted medieval illuminated manuscript fused with polished dark-fantasy game character concept art; aged mineral pigments, cracked gold leaf, tarnished brass, dark-brown contours, readable silhouette.
Composition/framing: exactly four separate full-body variants in one horizontal row, equal ground baseline, 3/4 quarter view, all facing screen-right, generous spacing, lord up to 140 percent of common height.
Scene/backdrop: plain warm neutral studio parchment wash, no scenery and no floor plane.
Constraints: maintain six-leg insect logic except the intentionally corrupted stage; all legs, antennae, and shell edges visible; no overlap; no cast shadows; no labels; no text; no letters; no numbers; no frame; no UI; no humans; no extra creatures; no watermark.
```

- [ ] **Step 2: Save and verify**

Save to the exact output path. Verify square PNG dimensions with `sips` and visually require exactly four non-overlapping stages and readable shell silhouettes at thumbnail size.

### Task 4: Bell Acolyte Concept Sheet

**Files:**
- Reference: `assets/saint-tibo.png`
- Create: `assets/monsters/01-gilded-sanctuary/concepts/bell-acolyte-concept-4-tiers.png`

**Interfaces:**
- Consumes: the shared sheet layout and sacred-material palette.
- Produces: the visual anchor for all four Bell Acolyte animation atlases.

- [ ] **Step 1: Generate the sheet from the exact prompt**

```text
Use case: stylized-concept
Asset type: game monster evolution concept sheet
Input images: Image 1 is a sacred illuminated-manuscript style reference only; do not reproduce its human subject or composition.
Primary request: create one square character design sheet showing exactly four evolutionary stages of the Bell Acolyte from left to right: common, elite, corrupted, lord.
Subject: a small nonhuman dungeon attendant whose body lives inside a cracked bronze handbell, with two thin robed legs, small gloved arms, a rope-clapper tail, and only a warm pair of eyes visible under the bell rim. Common is humble and compact. Elite gains shoulder chimes, engraved bronze bands, and a censer flail. Corrupted has an asymmetrically split bell, too many clapper tendrils, bent legs, and violet resonance leaking from the crack. Lord becomes a tall ceremonial bell entity with layered cathedral bells, a crown-like yoke, four controlled clapper arms, and a broken circular halo of sound-rings. Each stage adds at least two structural changes.
Style/medium: hand-painted medieval illuminated manuscript fused with polished dark-fantasy game character concept art; aged mineral pigments, cracked gold leaf accents, oxidized bronze, dark-brown contours, readable silhouette.
Composition/framing: exactly four separate full-body variants in one horizontal row, equal ground baseline, 3/4 quarter view, all facing screen-right, generous spacing, lord up to 140 percent of common height.
Scene/backdrop: plain warm neutral studio parchment wash, no scenery and no floor plane.
Constraints: clearly nonhuman; every limb and clapper visible; no overlap; no cast shadows; no labels; no text; no letters; no numbers; no frame; no UI; no human faces; no extra creatures; no watermark.
```

- [ ] **Step 2: Save and verify**

Save to the exact output path. Verify square PNG dimensions with `sips` and visually require exactly four non-overlapping stages and a consistent bell-body identity.

### Task 5: Wax Warden Concept Sheet and Batch Review

**Files:**
- Reference: `assets/saint-tibo.png`
- Create: `assets/monsters/01-gilded-sanctuary/concepts/wax-warden-concept-4-tiers.png`

**Interfaces:**
- Consumes: the shared sheet layout and the four previously generated sheets.
- Produces: the final concept anchor and a complete five-sheet review batch.

- [ ] **Step 1: Generate the sheet from the exact prompt**

```text
Use case: stylized-concept
Asset type: game monster evolution concept sheet
Input images: Image 1 is a sacred illuminated-manuscript style reference only; do not reproduce its human subject or composition.
Primary request: create one square character design sheet showing exactly four evolutionary stages of the Wax Warden from left to right: common, elite, corrupted, lord.
Subject: a broad humanoid guardian formed from layers of hardened candle wax around an empty suit of sanctuary armor, with heavy arms, a squat helmet, wax drips, and a furnace-like chest flame. Common carries a blunt wax-covered shield arm. Elite gains gold reliquary plate, two shoulder candles, and a heavier shield silhouette. Corrupted becomes hunched and asymmetrical with a split helmet, one enlarged molten arm, black-violet fissures, and several uncontrolled wick growths. Lord becomes a towering sanctuary sentinel with cathedral-buttress armor, a massive seal-shaped shield, a crown of seven flames, and a broken circular gold-leaf halo. Each stage adds at least two structural changes.
Style/medium: hand-painted medieval illuminated manuscript fused with polished dark-fantasy game character concept art; aged mineral pigments, cracked gold leaf accents, layered wax and tarnished metal, dark-brown contours, readable silhouette.
Composition/framing: exactly four separate full-body variants in one horizontal row, equal ground baseline, 3/4 quarter view, all facing screen-right, generous spacing, lord up to 140 percent of common height.
Scene/backdrop: plain warm neutral studio parchment wash, no scenery and no floor plane.
Constraints: coherent heavy-guardian anatomy; all limbs, flames, and shield edges visible; no overlap; no cast shadows; no labels; no text; no letters; no numbers; no frame; no UI; no human faces; no extra creatures; no watermark.
```

- [ ] **Step 2: Save the generated image and run batch metadata checks**

```bash
for image in assets/monsters/01-gilded-sanctuary/concepts/*.png; do
  sips -g pixelWidth -g pixelHeight -g format "$image"
done
```

Expected: five square PNG images.

- [ ] **Step 3: Review the five sheets together**

Require all five sheets to use the same camera, baseline, rendering density, background treatment, and four-stage left-to-right progression. Reject any sheet with duplicated subjects, extra creatures, text, cropped anatomy, or stages differentiated by color alone.

- [ ] **Step 4: Commit the approved concept batch**

```bash
git add assets/monsters/01-gilded-sanctuary/concepts
git commit -m "art: add gilded sanctuary monster concepts"
```
