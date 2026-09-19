import assert from "node:assert/strict";
import { test } from "node:test";
import contentEn from "../js/data/content.en.js";
import contentId from "../js/data/content.id.js";
import en from "../js/locales/en.js";
import id from "../js/locales/id.js";

// Same keys, same list lengths, same {placeholders}. Strings may differ.
function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.keys(value)
        .toSorted()
        .map((key) => [key, shape(value[key])]),
    );
  }
  return (String(value).match(/\{\w+\}/g) ?? []).toSorted().join(",");
}

test("interface text: Indonesian has every English key and placeholder", () => {
  assert.deepEqual(shape(id), shape(en));
});

test("portfolio content: Indonesian matches the English structure", () => {
  assert.deepEqual(shape(contentId), shape(contentEn));
});

// "75,000" and "75.000" are the same number, written the English and the Indonesian way.
const numbers = (value) =>
  JSON.stringify(value)
    .replace(/(\d)[.,](\d)/g, "$1$2")
    .match(/\d+/g);

test("facts are the same in both languages", () => {
  assert.deepEqual(numbers(contentId), numbers(contentEn));
});
