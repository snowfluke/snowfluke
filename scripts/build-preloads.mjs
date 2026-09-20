// Writes <link rel="modulepreload"> tags into index.html for every module that js/main.js
// imports statically, at any depth. Without them the browser finds the modules level by
// level, and each level costs one network round trip before the first sheet can render.
// Run it after you add, remove or rename an import: npm run preloads
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const ENTRY = "js/main.js";
const START = "    <!-- modulepreload:start (npm run preloads) -->";
const END = "    <!-- modulepreload:end -->";

// Static imports only. A dynamic import("./x.js") loads on demand and must not preload.
const STATIC_IMPORT =
  /^\s*(?:import|export)\s[^;]*?\sfrom\s+"(\.[^"]+)"|^\s*import\s+"(\.[^"]+)"/gm;

export async function modulesFrom(entry = ENTRY) {
  const seen = new Set();
  const queue = [entry];
  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    const source = await readFile(join(ROOT, file), "utf8");
    for (const match of source.matchAll(STATIC_IMPORT)) {
      queue.push(relative(ROOT, join(ROOT, dirname(file), match[1] ?? match[2])));
    }
  }
  seen.delete(entry);
  return [...seen].toSorted();
}

export async function preloadBlock() {
  const links = (await modulesFrom()).map(
    (file) => `    <link rel="modulepreload" href="${file}" />`,
  );
  return [START, ...links, END].join("\n");
}

export function currentBlock(html) {
  const from = html.indexOf(START);
  const to = html.indexOf(END);
  return from === -1 || to === -1 ? null : html.slice(from, to + END.length);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const path = join(ROOT, "index.html");
  const html = await readFile(path, "utf8");
  const old = currentBlock(html);
  if (old === null) {
    console.error(`index.html needs the two marker comments:\n${START}\n${END}`);
    process.exit(1);
  }
  const block = await preloadBlock();
  await writeFile(path, html.replace(old, block));
  console.log(`index.html: ${block.split("\n").length - 2} modules preloaded`);
}
