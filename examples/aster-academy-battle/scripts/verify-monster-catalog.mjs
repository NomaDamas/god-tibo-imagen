import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { expandCatalog, tierDefinitions } from "./lib/monster-catalog.mjs";

const sourceUrl = new URL("../src/data/monster-archetypes.json", import.meta.url);
const catalogUrl = new URL("../src/data/monster-catalog.json", import.meta.url);
const validRoles = new Set(["mascot", "quadruped", "flying", "humanoid", "heavy"]);
const validProfiles = new Set(["bob", "runner", "hover", "caster", "heavy"]);
const validTiers = new Set(tierDefinitions.map((tier) => tier.tier));

const source = JSON.parse(await readFile(sourceUrl, "utf8"));
const catalog = JSON.parse(await readFile(catalogUrl, "utf8"));
const archetypes = source.archetypes;
const tiersByArchetype = Map.groupBy(catalog, (monster) => monster.archetypeId);
const archetypesByZone = Map.groupBy(archetypes, (archetype) => archetype.zoneId);
const requiredFields = ["zoneId", "zoneSlug", "zoneName", "archetypeId", "slug", "name", "role", "identity", "palette", "motionProfile"];
const expectedRoles = [...validRoles].sort().join(",");

function uniqueCount(values) {
  return new Set(values).size;
}

const checks = [
  [archetypesByZone.size === 20, `expected 20 zones, received ${archetypesByZone.size}`],
  [archetypes.length === 100, `expected 100 archetypes, received ${archetypes.length}`],
  [catalog.length === 400, `expected 400 monsters, received ${catalog.length}`],
  [uniqueCount(archetypes.map((item) => item.archetypeId)) === 100, "archetype ids must be unique"],
  [uniqueCount(archetypes.map((item) => item.slug)) === 100, "archetype slugs must be unique"],
  [uniqueCount(catalog.map((monster) => monster.id)) === 400, "monster ids must be unique"],
  [uniqueCount(catalog.map((monster) => monster.asset)) === 400, "monster assets must be unique"],
  [archetypes.every((item) => requiredFields.every((field) => item[field] !== undefined)), "archetype required field missing"],
  [[...archetypesByZone.values()].every((items) => items.length === 5), "every zone must have five archetypes"],
  [[...archetypesByZone.values()].every((items) => items.map((item) => item.role).sort().join(",") === expectedRoles), "every zone must contain all five roles"],
  [archetypes.every((item) => validRoles.has(item.role)), "invalid archetype role"],
  [archetypes.every((item) => validProfiles.has(item.motionProfile)), "invalid motion profile"],
  [catalog.every((item) => validTiers.has(item.tier)), "invalid tier"],
  [[...tiersByArchetype.values()].every((items) => items.length === 4 && uniqueCount(items.map((item) => item.tier)) === 4), "every archetype must have four unique tiers"],
  [catalog.every((item) => item.structuralChanges.length >= 2), "every tier needs two structural changes"],
];

const failure = checks.find(([passed]) => !passed);
if (failure) throw new Error(failure[1]);
assert.deepEqual(catalog, expandCatalog(source), "generated catalog must exactly match archetype source");

console.log("PASS 20 zones");
console.log("PASS 100 archetypes");
console.log("PASS 400 unique monsters");
