import { cellKey, columnIndex } from "./utils.js";

export class FormulaError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

const NUMERIC = /^-?(\d+\.?\d*|\.\d+)$/;
const TOKEN =
  /\s*(?:(\d+\.?\d*|\.\d+)|(\$?[A-Za-z]{1,3}\$?\d+)|([A-Za-z_]+)|"((?:[^"]|"")*)"|(\S))/y;

const FUNCTIONS = {
  SUM: (nums) => nums.reduce((total, n) => total + n, 0),
  AVERAGE: (nums) => {
    if (nums.length === 0) throw new FormulaError("#DIV/0!");
    return FUNCTIONS.SUM(nums) / nums.length;
  },
  MIN: (nums) => (nums.length ? Math.min(...nums) : 0),
  MAX: (nums) => (nums.length ? Math.max(...nums) : 0),
  COUNT: (nums) => nums.length,
};

export function isFormula(raw) {
  return typeof raw === "string" && raw.length > 1 && raw.startsWith("=");
}

export function parseLiteral(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  const text = String(raw).trim();
  return NUMERIC.test(text) ? Number(text) : String(raw);
}

function tokenize(source) {
  const tokens = [];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < source.length) {
    const match = TOKEN.exec(source);
    if (!match) break;
    const [, num, ref, name, str, op] = match;
    if (num !== undefined) tokens.push({ type: "num", value: Number(num) });
    else if (ref !== undefined)
      tokens.push({ type: "ref", value: ref.replaceAll("$", "").toUpperCase() });
    else if (name !== undefined) tokens.push({ type: "name", value: name.toUpperCase() });
    else if (str !== undefined) tokens.push({ type: "str", value: str.replaceAll('""', '"') });
    else if (op !== undefined) tokens.push({ type: "op", value: op });
  }
  return tokens;
}

function toNumber(value) {
  if (value === null) return 0;
  if (typeof value === "number") return value;
  if (NUMERIC.test(value.trim())) return Number(value);
  throw new FormulaError("#VALUE!");
}

// Recursive descent. Grammar:
//   expr    = term (("+" | "-") term)*
//   term    = unary (("*" | "/") unary)*
//   unary   = ("+" | "-") unary | power
//   power   = primary ("^" unary)?
//   primary = number | string | ref | NAME "(" args ")" | "(" expr ")"
function parse(tokens, resolve) {
  let pos = 0;
  const peek = () => tokens[pos];
  const isOp = (value) => peek()?.type === "op" && peek().value === value;
  const expect = (value) => {
    if (!isOp(value)) throw new FormulaError("#ERROR!");
    pos++;
  };

  function expr() {
    let left = term();
    while (isOp("+") || isOp("-")) {
      const op = tokens[pos++].value;
      const right = toNumber(term());
      left = op === "+" ? toNumber(left) + right : toNumber(left) - right;
    }
    return left;
  }

  function term() {
    let left = unary();
    while (isOp("*") || isOp("/")) {
      const op = tokens[pos++].value;
      const right = toNumber(unary());
      if (op === "/" && right === 0) throw new FormulaError("#DIV/0!");
      left = op === "*" ? toNumber(left) * right : toNumber(left) / right;
    }
    return left;
  }

  function unary() {
    if (isOp("-") || isOp("+")) {
      const sign = tokens[pos++].value === "-" ? -1 : 1;
      return sign * toNumber(unary());
    }
    const base = primary();
    if (!isOp("^")) return base;
    pos++;
    return toNumber(base) ** toNumber(unary());
  }

  function primary() {
    const token = tokens[pos++];
    if (!token) throw new FormulaError("#ERROR!");
    if (token.type === "num" || token.type === "str") return token.value;
    if (token.type === "ref") return resolve.cell(token.value);
    if (token.type === "name") return call(token.value);
    if (token.type === "op" && token.value === "(") {
      const value = expr();
      expect(")");
      return value;
    }
    throw new FormulaError("#ERROR!");
  }

  function call(name) {
    const fn = FUNCTIONS[name];
    if (!fn || !isOp("(")) throw new FormulaError("#NAME?");
    pos++;
    const values = [];
    while (!isOp(")")) {
      values.push(...argument());
      if (!isOp(")")) expect(",");
    }
    pos++;
    return fn(values.filter((value) => typeof value === "number"));
  }

  function argument() {
    const isRange =
      peek()?.type === "ref" && tokens[pos + 1]?.type === "op" && tokens[pos + 1].value === ":";
    if (!isRange) return [expr()];
    const from = tokens[pos].value;
    const to = tokens[pos + 2];
    if (to?.type !== "ref") throw new FormulaError("#ERROR!");
    pos += 3;
    return resolve.range(from, to.value);
  }

  const result = expr();
  if (pos < tokens.length) throw new FormulaError("#ERROR!");
  return result;
}

function splitRef(ref) {
  const match = /^([A-Z]+)(\d+)$/.exec(ref);
  return { row: Number(match[2]), col: columnIndex(match[1]) };
}

// getRaw(key) returns the stored string of a cell. One evaluator serves one render pass.
export function createEvaluator({ getRaw, rowCount, colCount }) {
  const cache = new Map();
  const visiting = new Set();

  function inBounds({ row, col }) {
    return row >= 1 && col >= 1 && row <= rowCount && col <= colCount;
  }

  const resolve = {
    cell(ref) {
      if (!inBounds(splitRef(ref))) throw new FormulaError("#REF!");
      return valueOf(ref);
    },
    range(from, to) {
      const a = splitRef(from);
      const b = splitRef(to);
      if (!inBounds(a) || !inBounds(b)) throw new FormulaError("#REF!");
      const values = [];
      for (let row = Math.min(a.row, b.row); row <= Math.max(a.row, b.row); row++) {
        for (let col = Math.min(a.col, b.col); col <= Math.max(a.col, b.col); col++) {
          values.push(valueOf(cellKey(row, col)));
        }
      }
      return values;
    },
  };

  function compute(key) {
    const raw = getRaw(key);
    if (!isFormula(raw)) return parseLiteral(raw);
    if (visiting.has(key)) throw new FormulaError("#CIRC!");
    visiting.add(key);
    try {
      return parse(tokenize(raw.slice(1)), resolve);
    } finally {
      visiting.delete(key);
    }
  }

  function valueOf(key) {
    if (!cache.has(key)) {
      try {
        cache.set(key, compute(key));
      } catch (error) {
        if (!(error instanceof FormulaError)) throw error;
        cache.set(key, error);
      }
    }
    const value = cache.get(key);
    if (value instanceof FormulaError) throw value;
    return value;
  }

  function display(key) {
    try {
      const value = valueOf(key);
      if (value === null) return "";
      // toPrecision(12) hides float noise such as 0.1 + 0.2 = 0.30000000000000004.
      return typeof value === "number" ? String(Number(value.toPrecision(12))) : value;
    } catch (error) {
      if (error instanceof FormulaError) return error.code;
      throw error;
    }
  }

  return { valueOf, display };
}
