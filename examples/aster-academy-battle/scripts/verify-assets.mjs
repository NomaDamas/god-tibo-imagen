import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const opaqueAssets = [
  "public/assets/reference/battle-direction-01.png",
  "public/assets/backgrounds/campus-plaza.png",
];

const alphaAssets = [
  "public/assets/heroes/seoha.png",
  "public/assets/heroes/rumi.png",
  "public/assets/heroes/iden.png",
  "public/assets/heroes/nari.png",
  "public/assets/enemies/orb-drone.png",
  "public/assets/enemies/scout-drone.png",
  "public/assets/enemies/training-robot.png",
  "public/assets/portraits/seoha.png",
  "public/assets/portraits/rumi.png",
  "public/assets/portraits/iden.png",
  "public/assets/portraits/nari.png",
  "public/assets/effects/cyan-projectile.png",
  "public/assets/effects/orange-hit-burst.png",
  "public/assets/effects/team-skill-flare.png",
];

function parsePng(buffer, relativePath) {
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error(`${relativePath}: not a PNG`);
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType: buffer.readUInt8(25),
  };
}

for (const relativePath of [...opaqueAssets, ...alphaAssets]) {
  const absolutePath = path.join(root, relativePath);
  await access(absolutePath);
  const metadata = parsePng(await readFile(absolutePath), relativePath);
  if (metadata.width < 256 || metadata.height < 256) {
    throw new Error(`${relativePath}: unexpectedly small ${metadata.width}x${metadata.height}`);
  }
  if (alphaAssets.includes(relativePath) && ![4, 6].includes(metadata.colorType)) {
    throw new Error(`${relativePath}: missing PNG alpha channel`);
  }
  console.log(`PASS ${relativePath} ${metadata.width}x${metadata.height}`);
}

console.log(`Verified ${opaqueAssets.length + alphaAssets.length} raster assets.`);
