// Writes two generated blocks into index.html. Run it after you change an import or a
// stylesheet: npm run head
//
// 1. <link rel="modulepreload"> for every module that js/main.js imports statically, at any
//    depth. Without them the browser finds modules level by level, one round trip per level.
// 2. The screen stylesheets, inlined in a <style> tag. Five render-blocking requests had to
//    share a slow link with the module preloads, so the first paint waited. Inlined, the
//    first paint needs the HTML alone. The files in css/ stay the source of truth.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const ENTRY = "js/main.js";
// Cascade order. print.css stays a <link media="print">, which does not block rendering.
const STYLES = [
  "css/tokens.css",
  "css/layout.css",
  "css/menu.css",
  "css/grid.css",
  "css/article.css",
];

const BLOCKS = {
  preload: ["    <!-- modulepreload:start (npm run head) -->", "    <!-- modulepreload:end -->"],
  style: ["    <!-- inline-css:start (npm run head) -->", "    <!-- inline-css:end -->"],
};

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

// ponytail: a comment and whitespace stripper, not a CSS minifier. It assumes no "/*" inside
// a string and no significant whitespace run. Swap in a real minifier if a stylesheet needs one.
export function squeeze(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

// fetchpriority="low": the modules must not take bandwidth from the first paint.
async function preloadBlock() {
  const links = (await modulesFrom()).map(
    (file) => `    <link rel="modulepreload" href="${file}" fetchpriority="low" />`,
  );
  return [BLOCKS.preload[0], ...links, BLOCKS.preload[1]].join("\n");
}

async function styleBlock() {
  const sources = await Promise.all(STYLES.map((file) => readFile(join(ROOT, file), "utf8")));
  const css = sources.map(squeeze).join("");
  return [BLOCKS.style[0], `    <style>${css}</style>`, BLOCKS.style[1]].join("\n");
}

function currentBlock(html, [start, end]) {
  const from = html.indexOf(start);
  const to = html.indexOf(end);
  return from === -1 || to === -1 ? null : html.slice(from, to + end.length);
}

// Returns index.html with both blocks rebuilt, or throws when a marker pair is missing.
export async function buildHead(html) {
  const fresh = { preload: await preloadBlock(), style: await styleBlock() };
  let out = html;
  for (const [name, markers] of Object.entries(BLOCKS)) {
    const old = currentBlock(out, markers);
    if (old === null) throw new Error(`index.html needs the markers:\n${markers.join("\n")}`);
    // A function replacement: "$" in the CSS must not act as a replace pattern.
    out = out.replace(old, () => fresh[name]);
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const path = join(ROOT, "index.html");
  const html = await readFile(path, "utf8");
  const next = await buildHead(html);
  await writeFile(path, next);
  console.log(
    `index.html: ${(await modulesFrom()).length} modules preloaded, ${STYLES.length} stylesheets inlined`,
  );
}
