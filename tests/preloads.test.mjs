import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { currentBlock, modulesFrom, preloadBlock } from "../scripts/build-preloads.mjs";

test("index.html preloads exactly the modules that main.js imports", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.equal(currentBlock(html), await preloadBlock(), "stale list: run npm run preloads");
});

test("on-demand modules stay out of the preload list", async () => {
  const modules = await modulesFrom();
  for (const lazy of [
    "js/xlsx.js",
    "js/markdown.js",
    "js/locales/id.js",
    "js/data/content.id.js",
  ]) {
    assert.ok(!modules.includes(lazy), `${lazy} must load on demand`);
  }
  assert.ok(modules.includes("js/state.js") && modules.includes("js/locales/en.js"));
});
