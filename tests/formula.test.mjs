import assert from "node:assert/strict";
import { test } from "node:test";
import { createEvaluator } from "../js/formula.js";

function sheet(cells, rowCount = 20, colCount = 10) {
  return createEvaluator({ getRaw: (key) => cells[key], rowCount, colCount });
}

test("literals", () => {
  const s = sheet({ A1: "42", A2: "hello", A3: " 3.5 ", A4: "=", A5: "Jan 2022" });
  assert.equal(s.valueOf("A1"), 42);
  assert.equal(s.valueOf("A2"), "hello");
  assert.equal(s.valueOf("A3"), 3.5);
  assert.equal(s.display("A4"), "=");
  assert.equal(s.display("A5"), "Jan 2022");
  assert.equal(s.display("B9"), "");
});

test("arithmetic and precedence", () => {
  const s = sheet({
    A1: "=1+2*3",
    A2: "=(1+2)*3",
    A3: "=-2^2",
    A4: "=10/4",
    A5: "=0.1+0.2",
    A6: "= 2 * -3",
  });
  assert.equal(s.display("A1"), "7");
  assert.equal(s.display("A2"), "9");
  assert.equal(s.display("A3"), "-4");
  assert.equal(s.display("A4"), "2.5");
  assert.equal(s.display("A5"), "0.3");
  assert.equal(s.display("A6"), "-6");
});

test("references, ranges and functions", () => {
  const s = sheet({
    A1: "10",
    A2: "20",
    A3: "text",
    B1: "=A1+A2",
    B2: "=sum(a1:a3)",
    B3: "=AVERAGE(A1:A2)",
    B4: "=MIN(A1:A2)+MAX(A1:A2)",
    B5: "=COUNT(A1:A9)",
    B6: "=SUM(A1, 5, $B$1)",
    B7: "=C9+1",
  });
  assert.equal(s.display("B1"), "30");
  assert.equal(s.display("B2"), "30");
  assert.equal(s.display("B3"), "15");
  assert.equal(s.display("B4"), "30");
  assert.equal(s.display("B5"), "2");
  assert.equal(s.display("B6"), "45");
  assert.equal(s.display("B7"), "1");
});

test("errors", () => {
  const s = sheet({
    A1: "=1/0",
    A2: "=NOPE(1)",
    A3: "=Z99",
    A4: "=1+",
    A5: '="a"+1',
    A6: "=AVERAGE(C1:C3)",
    A7: "=A1+1",
    A8: "=(1",
    A9: "=1 2",
  });
  assert.equal(s.display("A1"), "#DIV/0!");
  assert.equal(s.display("A2"), "#NAME?");
  assert.equal(s.display("A3"), "#REF!");
  assert.equal(s.display("A4"), "#ERROR!");
  assert.equal(s.display("A5"), "#VALUE!");
  assert.equal(s.display("A6"), "#DIV/0!");
  assert.equal(s.display("A7"), "#DIV/0!");
  assert.equal(s.display("A8"), "#ERROR!");
  assert.equal(s.display("A9"), "#ERROR!");
});

test("circular references stop", () => {
  const s = sheet({ A1: "=A1", B1: "=B2", B2: "=B1+1", C1: "=SUM(C1:C3)" });
  assert.equal(s.display("A1"), "#CIRC!");
  assert.equal(s.display("B1"), "#CIRC!");
  assert.equal(s.display("B2"), "#CIRC!");
  assert.equal(s.display("C1"), "#CIRC!");
});
