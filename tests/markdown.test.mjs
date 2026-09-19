import assert from "node:assert/strict";
import { test } from "node:test";
import { parseFrontmatter, renderMarkdown } from "../js/markdown.js";

test("frontmatter", () => {
  const { meta, body } = parseFrontmatter(
    '---\ntitle: "Hello: world"\ndate: 2026-09-19\n---\n# Hi\n',
  );
  assert.deepEqual(meta, { title: "Hello: world", date: "2026-09-19" });
  assert.equal(body, "# Hi\n");
  assert.deepEqual(parseFrontmatter("no meta").meta, {});
});

test("headings and paragraphs", () => {
  assert.equal(renderMarkdown("# Hello World"), '<h1 id="hello-world">Hello World</h1>');
  assert.equal(renderMarkdown("one\ntwo\n\nthree"), "<p>one\ntwo</p>\n<p>three</p>");
  assert.equal(renderMarkdown("text\n# Head"), '<p>text</p>\n<h1 id="head">Head</h1>');
});

test("inline", () => {
  assert.equal(
    renderMarkdown("**b** *i* _i_ ~~s~~"),
    "<p><strong>b</strong> <em>i</em> <em>i</em> <del>s</del></p>",
  );
  assert.equal(renderMarkdown("snake_case_name and 2*3*4"), "<p>snake_case_name and 2*3*4</p>");
  assert.equal(
    renderMarkdown("`a < b` and `**raw**`"),
    "<p><code>a &lt; b</code> and <code>**raw**</code></p>",
  );
  assert.equal(renderMarkdown("\\*not em\\*"), "<p>*not em*</p>");
  assert.equal(
    renderMarkdown("[site](https://example.com) [here](#top)"),
    '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">site</a> <a href="#top">here</a></p>',
  );
  assert.equal(
    renderMarkdown("![alt](img/a.png)"),
    '<p><img src="img/a.png" alt="alt" loading="lazy"></p>',
  );
  assert.equal(
    renderMarkdown("<https://example.com>"),
    '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">https://example.com</a></p>',
  );
});

test("html and script urls are neutralised", () => {
  assert.equal(
    renderMarkdown("<script>alert(1)</script>"),
    "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>",
  );
  assert.equal(renderMarkdown("[x](javascript:alert(1))"), '<p><a href="#">x</a>)</p>');
  assert.equal(
    renderMarkdown('![a" onerror="x](y.png)'),
    '<p><img src="y.png" alt="a&quot; onerror=&quot;x" loading="lazy"></p>',
  );
});

test("code fences keep content verbatim", () => {
  assert.equal(
    renderMarkdown("```js\nconst a = 1 < 2;\n# not a heading\n```"),
    '<pre><code class="language-js">const a = 1 &lt; 2;\n# not a heading</code></pre>',
  );
});

test("lists", () => {
  assert.equal(renderMarkdown("- a\n- b"), "<ul>\n<li>a</li>\n<li>b</li>\n</ul>");
  assert.equal(renderMarkdown("1. a\n2. b"), "<ol>\n<li>a</li>\n<li>b</li>\n</ol>");
  assert.equal(
    renderMarkdown("- a\n  - nested\n- b"),
    "<ul>\n<li>a\n<ul>\n<li>nested</li>\n</ul></li>\n<li>b</li>\n</ul>",
  );
});

test("blockquote, rule, table", () => {
  assert.equal(renderMarkdown("> quote\n> more"), "<blockquote><p>quote\nmore</p></blockquote>");
  assert.equal(renderMarkdown("---"), "<hr>");
  const table = renderMarkdown("| a | b |\n|---|--:|\n| 1 | 2 |");
  assert.match(table, /<th>a<\/th><th style="text-align:right">b<\/th>/);
  assert.match(table, /<td>1<\/td><td style="text-align:right">2<\/td>/);
});

test("safeUrl strips control characters before the scheme check", async () => {
  const { safeUrl } = await import("../js/utils.js");
  assert.equal(safeUrl("java\tscript:alert(1)"), "#");
  assert.equal(safeUrl(" JAVASCRIPT:alert(1)"), "#");
  assert.equal(safeUrl("https://example.com/a?b=1"), "https://example.com/a?b=1");
  assert.equal(safeUrl("#/blog/hello-grid"), "#/blog/hello-grid");
  assert.equal(safeUrl("img/a.png"), "img/a.png");
});

test("the reference fixture renders every supported block", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(
    new URL("./fixtures/markdown-reference.md", import.meta.url),
    "utf8",
  );
  const html = renderMarkdown(parseFrontmatter(source).body);
  for (const tag of [
    "<h2",
    "<ul>",
    "<ol>",
    "<blockquote>",
    "<pre><code",
    "<table>",
    "<hr>",
    "<del>",
    "<em>",
  ]) {
    assert.ok(html.includes(tag), `missing ${tag}`);
  }
  assert.ok(!html.includes("<script>"));
});
