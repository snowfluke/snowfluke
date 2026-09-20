import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { buildHead, modulesFrom, squeeze } from "../scripts/build-head.mjs";

test("index.html is up to date with the imports and the stylesheets", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.equal(await buildHead(html), html, "stale generated blocks: run npm run head");
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

test("squeeze strips comments and spare whitespace, and keeps values intact", () => {
  assert.equal(
    squeeze("/* note */\n.a > .b {\n  margin: 0 auto;\n  color: rgb(0 111 230 / 12%);\n}\n"),
    ".a>.b{margin:0 auto;color:rgb(0 111 230 / 12%)}",
  );
  assert.equal(squeeze('.x::before { content: "[ "; }'), '.x::before{content:"[ "}');
  assert.equal(
    squeeze("@media (max-width: 40rem) { .a { top: calc(1em + 2px); } }"),
    "@media (max-width:40rem){.a{top:calc(1em + 2px)}}",
  );
});
