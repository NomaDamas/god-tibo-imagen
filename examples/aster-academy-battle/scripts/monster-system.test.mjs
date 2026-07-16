import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  actorClassNames,
  getFirstBatchMonsters,
} from "../src/lib/monster-system.js";

test("first production batch contains three archetypes and four tiers", () => {
  const catalog = [
    ...["basic", "advanced", "glitched", "overdrive"].map((tier) => ({ zoneId: "01", slug: "guide-orb", tier })),
    ...["basic", "advanced", "glitched", "overdrive"].map((tier) => ({ zoneId: "01", slug: "banner-hound", tier })),
    ...["basic", "advanced", "glitched", "overdrive"].map((tier) => ({ zoneId: "01", slug: "patrol-kite", tier })),
    { zoneId: "01", slug: "sign-caretaker", tier: "basic" },
    { zoneId: "02", slug: "index-mite", tier: "basic" },
  ];

  const batch = getFirstBatchMonsters(catalog);
  assert.equal(batch.length, 12);
  assert.deepEqual(new Set(batch.map((monster) => monster.slug)), new Set(["guide-orb", "banner-hound", "patrol-kite"]));
});

test("archetype source is a flat 100-entry contract with zone fields", async () => {
  const source = JSON.parse(await readFile(new URL("../src/data/monster-archetypes.json", import.meta.url), "utf8"));
  assert.equal(source.archetypes.length, 100);
  for (const archetype of source.archetypes) {
    for (const field of ["zoneId", "zoneSlug", "zoneName", "palette", "slug", "motionProfile"]) {
      assert.ok(archetype[field], `${archetype.archetypeId} missing ${field}`);
    }
  }
});

test("every motion profile uses the shared hit and death timing", async () => {
  const profiles = JSON.parse(await readFile(new URL("../src/data/motion-profiles.json", import.meta.url), "utf8"));
  assert.deepEqual(Object.keys(profiles).sort(), ["bob", "caster", "heavy", "hover", "runner"]);
  for (const profile of Object.values(profiles)) {
    assert.equal(profile.hit, 90);
    assert.equal(profile.death, 420);
  }
});

test("motion CSS distinguishes all attack profiles and preserves non-looping reduced motion feedback", async () => {
  const css = await readFile(new URL("../src/styles/monster-motion.css", import.meta.url), "utf8");
  for (const profile of ["bob", "runner", "hover", "caster", "heavy"]) {
    assert.match(css, new RegExp(`profile--${profile}\\.state--attack`));
  }
  assert.match(css, /prefers-reduced-motion[\s\S]*state--idle img,[\s\S]*state--move img/);
});

test("actor classes encode profile, state, pause and replay key", () => {
  const value = actorClassNames({ profile: "hover", state: "attack", paused: true, replayKey: 3 });
  assert.equal(value, "monster-actor profile--hover state--attack is-paused replay--3");
});
