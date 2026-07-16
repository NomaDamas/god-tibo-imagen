import { readFile, writeFile } from "node:fs/promises";
import { expandCatalog } from "./lib/monster-catalog.mjs";

const sourceUrl = new URL("../src/data/monster-archetypes.json", import.meta.url);
const outputUrl = new URL("../src/data/monster-catalog.json", import.meta.url);

const source = JSON.parse(await readFile(sourceUrl, "utf8"));
const catalog = expandCatalog(source);
await writeFile(outputUrl, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Generated ${catalog.length} monsters at ${outputUrl.pathname}`);
