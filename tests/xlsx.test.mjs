import assert from "node:assert/strict";
import { test } from "node:test";
import { sheetFromRows } from "../js/sheet.js";
import { buildXlsx, crc32, zip } from "../js/xlsx.js";

const text = (bytes) => new TextDecoder().decode(bytes);

test("crc32 matches the standard check value", () => {
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
});

test("zip stores every entry and counts them", () => {
  const bytes = zip([
    { name: "a.txt", text: "hello" },
    { name: "dir/b.txt", text: "world" },
  ]);
  const view = new DataView(bytes.buffer);
  assert.equal(view.getUint32(0, true), 0x04034b50);
  assert.equal(view.getUint32(bytes.length - 22, true), 0x06054b50);
  assert.equal(view.getUint16(bytes.length - 12, true), 2);
  assert.match(text(bytes), /a\.txt.*hello.*dir\/b\.txt.*world/s);
});

test("workbook holds strings, numbers, formulas, links and escapes", () => {
  const sheet = sheetFromRows({
    id: "t",
    name: "A/B: test",
    rows: [
      [{ value: "Tom & <Jerry>", bold: true }, "42"],
      [{ value: "site", link: "#/blog/post" }, "=sum(b1:b1)"],
    ],
  });
  const xml = text(buildXlsx([sheet], (url) => `https://example.com/${url}`));
  assert.match(xml, /<sheet name="A B  test"/);
  assert.match(
    xml,
    /<c r="A1" s="1" t="inlineStr"><is><t xml:space="preserve">Tom &amp; &lt;Jerry&gt;<\/t>/,
  );
  assert.match(xml, /<c r="B1" s="0"><v>42<\/v><\/c>/);
  assert.match(xml, /<c r="B2" s="0"><f>SUM\(B1:B1\)<\/f><\/c>/);
  assert.match(xml, /<hyperlink ref="A2" r:id="rId1"\/>/);
  assert.match(xml, /Target="https:\/\/example.com\/#\/blog\/post" TargetMode="External"/);
});
