import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  actorClassNames,
  getProducedMonsters,
} from "../src/lib/monster-system.js";

test("production manifest selects completed archetypes and all four tiers", () => {
  const catalog = [
    ...["basic", "advanced", "glitched", "overdrive"].map((tier) => ({ zoneId: "01", slug: "guide-orb", tier })),
    ...["basic", "advanced", "glitched", "overdrive"].map((tier) => ({ zoneId: "01", slug: "banner-hound", tier })),
    ...["basic", "advanced", "glitched", "overdrive"].map((tier) => ({ zoneId: "01", slug: "patrol-kite", tier })),
    { zoneId: "01", slug: "sign-caretaker", tier: "basic" },
    { zoneId: "02", slug: "index-mite", tier: "basic" },
  ];
  const production = {
    archetypes: [
      { zoneId: "01", slug: "guide-orb" },
      { zoneId: "01", slug: "banner-hound" },
      { zoneId: "01", slug: "patrol-kite" },
      { zoneId: "01", slug: "sign-caretaker" },
    ],
  };

  const batch = getProducedMonsters(catalog, production);
  assert.equal(batch.length, 13);
  assert.deepEqual(
    new Set(batch.map((monster) => monster.slug)),
    new Set(["guide-orb", "banner-hound", "patrol-kite", "sign-caretaker"]),
  );
});

test("production manifest contains seven complete five-family zones", async () => {
  const production = JSON.parse(
    await readFile(new URL("../src/data/monster-production.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(production.archetypes, [
    { zoneId: "01", slug: "guide-orb" },
    { zoneId: "01", slug: "banner-hound" },
    { zoneId: "01", slug: "patrol-kite" },
    { zoneId: "01", slug: "sign-caretaker" },
    { zoneId: "01", slug: "plaza-warden" },
    { zoneId: "02", slug: "index-mite" },
    { zoneId: "02", slug: "shelf-hound" },
    { zoneId: "02", slug: "bookmark-owl" },
    { zoneId: "02", slug: "archive-clerk" },
    { zoneId: "02", slug: "stack-guardian" },
    { zoneId: "03", slug: "ball-sprite" },
    { zoneId: "03", slug: "hurdle-hound" },
    { zoneId: "03", slug: "whistle-drone" },
    { zoneId: "03", slug: "drill-coach" },
    { zoneId: "03", slug: "scoreboard-golem" },
    { zoneId: "04", slug: "flask-bud" },
    { zoneId: "04", slug: "cable-ferret" },
    { zoneId: "04", slug: "sensor-wasp" },
    { zoneId: "04", slug: "lab-assistant" },
    { zoneId: "04", slug: "reactor-frame" },
    { zoneId: "05", slug: "seedling-pod" },
    { zoneId: "05", slug: "sprinkler-gecko" },
    { zoneId: "05", slug: "pollen-bee" },
    { zoneId: "05", slug: "greenhouse-keeper" },
    { zoneId: "05", slug: "canopy-titan" },
    { zoneId: "06", slug: "battery-spark" },
    { zoneId: "06", slug: "panel-ram" },
    { zoneId: "06", slug: "turbine-kite" },
    { zoneId: "06", slug: "grid-technician" },
    { zoneId: "06", slug: "rooftop-transformer" },
    { zoneId: "07", slug: "ticket-mouse" },
    { zoneId: "07", slug: "rail-hound" },
    { zoneId: "07", slug: "route-drone" },
    { zoneId: "07", slug: "gate-attendant" },
    { zoneId: "07", slug: "transit-loader" },
  ]);

  const catalog = JSON.parse(
    await readFile(new URL("../src/data/monster-catalog.json", import.meta.url), "utf8"),
  );
  const produced = getProducedMonsters(catalog, production);
  assert.equal(produced.length, 140);
  for (const { zoneId, slug } of production.archetypes) {
    assert.equal(
      produced.filter((monster) => monster.zoneId === zoneId && monster.slug === slug).length,
      4,
      `${zoneId}:${slug} must have four tiers`,
    );
  }
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
