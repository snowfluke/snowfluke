import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTsv, toHtmlTable, toTsv } from "../js/sheet.js";

test("tsv round trip keeps tabs, quotes and newlines inside a cell", () => {
  const rows = [
    ["Role", "Backend Engineer"],
    ['say "hi"', "two\nlines"],
    ["tab\there", ""],
  ];
  const text = toTsv(rows);
  assert.equal(text.split("\n")[0], "Role\tBackend Engineer");
  assert.deepEqual(parseTsv(text), rows);
});

test("parseTsv reads what Excel and Sheets put on the clipboard", () => {
  assert.deepEqual(parseTsv("a\tb\r\n1\t2\r\n"), [
    ["a", "b"],
    ["1", "2"],
  ]);
  assert.deepEqual(parseTsv("single"), [["single"]]);
  assert.deepEqual(parseTsv("a\t\tc"), [["a", "", "c"]]);
});

test("html table escapes text and keeps safe links only", () => {
  const html = toHtmlTable([
    [
      { text: "<b>x</b> & y", style: { bold: true } },
      { text: "mail", style: { link: "mailto:a@b.co" } },
      { text: "bad", style: { link: "javascript:alert(1)" } },
    ],
  ]);
  assert.equal(
    html,
    '<table><tr><td style="font-weight:bold">&lt;b&gt;x&lt;/b&gt; &amp; y</td><td><a href="mailto:a@b.co">mail</a></td><td>bad</td></tr></table>',
  );
});
