import { cellKey } from "./utils.js";

export const DEFAULT_COL_WIDTH = 120;
export const MIN_COL_WIDTH = 40;
export const MAX_COL_WIDTH = 800;
const MAX_ROWS = 500;
const MAX_COLS = 78;

export function createSheet({ id, name, locked = false, rowCount = 50, colCount = 26 }) {
  return { id, name, locked, rowCount, colCount, colWidths: {}, cells: {} };
}

// rows is a list of rows. A cell is a string, null for empty, or { value, ...style }.
export function sheetFromRows({ id, name, colWidths = [], rows, rowCount, colCount }) {
  const widest = Math.max(...rows.map((row) => row.length));
  const sheet = createSheet({
    id,
    name,
    locked: true,
    rowCount: rowCount ?? rows.length + 15,
    colCount: colCount ?? Math.max(widest + 4, 10),
  });
  colWidths.forEach((width, index) => (sheet.colWidths[index + 1] = width));
  rows.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === null || cell === "") return;
      const { value, ...style } = typeof cell === "string" ? { value: cell } : cell;
      sheet.cells[cellKey(r + 1, c + 1)] = { value: String(value), style };
    });
  });
  return sheet;
}

export const header = (value) => ({ value, header: true });
export const wrapped = (value) => ({ value, wrap: true });
export const linked = (value, link) => ({ value, link });

const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const intInRange = (value, min, max, fallback) =>
  Number.isInteger(value) && value >= min && value <= max ? value : fallback;

// localStorage is user-editable. Rebuild each saved sheet field by field; drop what does not fit.
export function normalizeSheet(raw) {
  if (!isRecord(raw) || typeof raw.name !== "string") return null;
  // The "u-" prefix keeps a stored sheet from shadowing a portfolio sheet id.
  if (typeof raw.id !== "string" || !/^u-[a-z0-9]+$/.test(raw.id)) return null;
  const sheet = createSheet({
    id: raw.id,
    name: raw.name.slice(0, 40) || "Sheet",
    rowCount: intInRange(raw.rowCount, 1, MAX_ROWS, 50),
    colCount: intInRange(raw.colCount, 1, MAX_COLS, 26),
  });
  if (isRecord(raw.colWidths)) {
    for (const [col, width] of Object.entries(raw.colWidths)) {
      if (Number.isFinite(width)) sheet.colWidths[col] = width;
    }
  }
  if (isRecord(raw.cells)) {
    for (const [key, cell] of Object.entries(raw.cells)) {
      if (!/^[A-Z]{1,2}\d{1,3}$/.test(key) || !isRecord(cell)) continue;
      sheet.cells[key] = {
        value: typeof cell.value === "string" ? cell.value : "",
        style: isRecord(cell.style) ? cell.style : {},
      };
    }
  }
  return sheet;
}

export function canGrow(sheet, rows, cols) {
  return sheet.rowCount + rows <= MAX_ROWS && sheet.colCount + cols <= MAX_COLS;
}

function csvField(text) {
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// display(key) returns the shown text of a cell. Trailing empty rows and columns are trimmed.
export function toCsv(sheet, display) {
  let lastRow = 0;
  let lastCol = 0;
  for (let row = 1; row <= sheet.rowCount; row++) {
    for (let col = 1; col <= sheet.colCount; col++) {
      if (sheet.cells[cellKey(row, col)]?.value) {
        lastRow = Math.max(lastRow, row);
        lastCol = Math.max(lastCol, col);
      }
    }
  }
  const lines = [];
  for (let row = 1; row <= lastRow; row++) {
    const fields = [];
    for (let col = 1; col <= lastCol; col++) fields.push(csvField(display(cellKey(row, col))));
    lines.push(fields.join(","));
  }
  return lines.join("\r\n");
}

// ---- clipboard formats ----
// Spreadsheets trade ranges as tab-separated text, with an HTML table beside it for rich paste.

function tsvField(text) {
  return /["\t\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// rows is a list of rows of strings.
export function toTsv(rows) {
  return rows.map((row) => row.map(tsvField).join("\t")).join("\n");
}

// Reads tab-separated text. A quoted field may hold tabs, newlines and doubled quotes.
export function parseTsv(text) {
  const rows = [[]];
  let field = "";
  let quoted = false;
  const source = text.replace(/\r\n?/g, "\n").replace(/\n$/, "");

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char !== '"') field += char;
      else if (source[i + 1] === '"') field += source[++i];
      else quoted = false;
    } else if (char === '"' && field === "") quoted = true;
    else if (char === "\t" || char === "\n") {
      rows.at(-1).push(field);
      field = "";
      if (char === "\n") rows.push([]);
    } else field += char;
  }
  rows.at(-1).push(field);
  return rows;
}

const htmlEscape = (text) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

// cells is a list of rows of { text, style }. Word, Docs and mail clients paste this as a table.
export function toHtmlTable(cells) {
  const td = ({ text, style }) => {
    const css = [
      (style.bold || style.header) && "font-weight:bold",
      style.italic && "font-style:italic",
    ].filter(Boolean);
    const attr = css.length ? ` style="${css.join(";")}"` : "";
    const body = htmlEscape(text).replaceAll("\n", "<br>");
    const link = style.link && /^(https?:|mailto:)/i.test(style.link) ? style.link : null;
    const inner = link
      ? `<a href="${htmlEscape(link).replaceAll('"', "&quot;")}">${body}</a>`
      : body;
    return `<td${attr}>${inner}</td>`;
  };
  return `<table>${cells.map((row) => `<tr>${row.map(td).join("")}</tr>`).join("")}</table>`;
}
