import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(await readFile(path.join(root, "src/data/monster-catalog.json"), "utf8"));
const production = JSON.parse(await readFile(path.join(root, "src/data/monster-production.json"), "utf8"));
const productionKeys = new Set(
  production.archetypes.map(({ zoneId, slug }) => `${zoneId}:${slug}`),
);
if (productionKeys.size !== production.archetypes.length) {
  throw new Error("production manifest contains duplicate archetypes");
}
const produced = catalog.filter((monster) => productionKeys.has(`${monster.zoneId}:${monster.slug}`));
const expectedCount = production.archetypes.length * 4;

if (produced.length !== expectedCount) {
  throw new Error(`expected ${expectedCount} produced monsters, received ${produced.length}`);
}

const monsterRoot = path.join(root, "public/assets/monsters");
const actualMonsterFiles = (await readdir(monsterRoot, { recursive: true }))
  .filter((file) => file.endsWith(".png"))
  .map((file) => file.split(path.sep).join("/"))
  .sort();
const expectedMonsterFiles = produced
  .map((monster) => monster.asset.replace("/assets/monsters/", ""))
  .sort();
if (actualMonsterFiles.join(",") !== expectedMonsterFiles.join(",")) {
  throw new Error(`monster asset tree must contain exactly the ${expectedCount} produced PNG paths`);
}

function alphaAt(image, x, y) {
  return image.data[(image.width * y + x) * 4 + 3];
}

function alphaBounds(image) {
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (alphaAt(image, x, y) <= 16) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < 0) throw new Error("image has no visible pixels");
  return {
    widthRatio: (maxX - minX + 1) / image.width,
    heightRatio: (maxY - minY + 1) / image.height,
    bottomRatio: (maxY + 1) / image.height,
  };
}

for (const { zoneId, slug } of production.archetypes) {
  const sample = catalog.find((monster) => monster.zoneId === zoneId && monster.slug === slug);
  if (!sample) throw new Error(`${zoneId}:${slug}: missing from monster catalog`);
  const directory = path.join(monsterRoot, `${zoneId}-${sample.zoneSlug}`, slug);
  const files = (await readdir(directory)).filter((file) => file.endsWith(".png")).sort();
  const expected = ["advanced.png", "basic.png", "glitched.png", "overdrive.png"];
  if (files.join(",") !== expected.join(",")) throw new Error(`${slug}: expected exactly four tier PNGs`);
}

for (const monster of produced) {
  const absolutePath = path.join(root, "public", monster.asset);
  const buffer = await readFile(absolutePath);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`${monster.asset}: not a PNG`);
  }
  if (buffer.readUInt8(25) !== 6) throw new Error(`${monster.asset}: expected RGBA PNG color type 6`);

  const image = PNG.sync.read(buffer);
  if (image.width < 768 || image.height < 768) {
    throw new Error(`${monster.asset}: minimum size is 768x768, received ${image.width}x${image.height}`);
  }
  if (image.width !== image.height) throw new Error(`${monster.asset}: canvas must be square`);

  const corners = [
    alphaAt(image, 0, 0),
    alphaAt(image, image.width - 1, 0),
    alphaAt(image, 0, image.height - 1),
    alphaAt(image, image.width - 1, image.height - 1),
  ];
  if (corners.some((alpha) => alpha !== 0)) throw new Error(`${monster.asset}: corners must be transparent`);

  const bounds = alphaBounds(image);
  for (const [axis, ratio] of Object.entries(bounds)) {
    if (axis === "bottomRatio") continue;
    if (ratio < 0.45 || ratio > 0.82) {
      throw new Error(`${monster.asset}: ${axis} ${(ratio * 100).toFixed(1)}% outside 45-82%`);
    }
  }
  if (bounds.bottomRatio < 0.85 || bounds.bottomRatio > 0.91) {
    throw new Error(`${monster.asset}: baseline ${(bounds.bottomRatio * 100).toFixed(1)}% outside 85-91%`);
  }

  console.log(
    `PASS ${monster.id} ${image.width}x${image.height} bounds ${(bounds.widthRatio * 100).toFixed(1)}%x${(bounds.heightRatio * 100).toFixed(1)}%`,
  );
}

console.log(`Verified ${expectedCount} transparent monster cutouts.`);
