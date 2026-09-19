import { createEvaluator } from "./formula.js";
import { lang, t } from "./i18n.js";
import { MAX_COL_WIDTH, MIN_COL_WIDTH, canGrow, createSheet, parseTsv, toTsv } from "./sheet.js";
import * as storage from "./storage.js";
import { cellKey, clamp, parseKey } from "./utils.js";

const HISTORY_LIMIT = 100;
const THEMES = ["system", "light", "dark"];
const DEFAULT_VIEW = { zoom: 100, gridlines: true, formulaBar: true, theme: "system", lang };
export const ZOOM_LEVELS = [50, 75, 90, 100, 125, 150, 200];

export const state = {
  sheets: [],
  activeId: "",
  activeCell: { row: 1, col: 1 },
  // The selection is the rectangle between anchor and activeCell. One cell when they match.
  anchor: { row: 1, col: 1 },
  article: null,
  view: { ...DEFAULT_VIEW },
  saved: true,
};

const listeners = new Set();
const undoStack = [];
const redoStack = [];
let clipboard = null;

// change is "selection", "cells", "sheets" or "view".
export function subscribe(listener) {
  listeners.add(listener);
}

function emit(change) {
  for (const listener of listeners) listener(change);
}

export function init(portfolioSheets) {
  const saved = storage.loadSaved();
  state.sheets = [...portfolioSheets, ...(saved?.userSheets ?? [])];
  state.activeId = state.sheets[0].id;
  state.view = {
    zoom: ZOOM_LEVELS.includes(saved?.view?.zoom) ? saved.view.zoom : DEFAULT_VIEW.zoom,
    gridlines: saved?.view?.gridlines !== false,
    formulaBar: saved?.view?.formulaBar !== false,
    theme: THEMES.includes(saved?.view?.theme) ? saved.view.theme : DEFAULT_VIEW.theme,
    // js/i18n.js already chose the language, from the URL, this saved view, or the browser.
    lang,
  };
}

export const findSheet = (id) => state.sheets.find((sheet) => sheet.id === id);
export const activeSheet = () => findSheet(state.activeId);
export const userSheets = () => state.sheets.filter((sheet) => !sheet.locked);
export const isEditable = () => !state.article && !activeSheet().locked;
export const activeKey = () => cellKey(state.activeCell.row, state.activeCell.col);
// No cell is active while an article shows.
export const activeCellData = () => (state.article ? undefined : activeSheet().cells[activeKey()]);
export const canUndo = () => undoStack.length > 0;
export const canRedo = () => redoStack.length > 0;

export function evaluator(sheet = activeSheet()) {
  return createEvaluator({
    getRaw: (key) => sheet.cells[key]?.value,
    rowCount: sheet.rowCount,
    colCount: sheet.colCount,
  });
}

function persist() {
  state.saved = storage.save({ userSheets: userSheets(), view: state.view });
}

function snapshot() {
  return JSON.stringify({ sheets: userSheets(), activeId: state.activeId });
}

function record() {
  undoStack.push(snapshot());
  if (undoStack.length > HISTORY_LIMIT) undoStack.shift();
  redoStack.length = 0;
}

function restore(saved) {
  const { sheets, activeId } = JSON.parse(saved);
  state.sheets = [...state.sheets.filter((sheet) => sheet.locked), ...sheets];
  state.activeId = findSheet(activeId) ? activeId : state.sheets[0].id;
  clampActiveCell();
}

function clampActiveCell() {
  const sheet = activeSheet();
  const inSheet = ({ row, col }) => ({
    row: clamp(row, 1, sheet.rowCount),
    col: clamp(col, 1, sheet.colCount),
  });
  state.activeCell = inSheet(state.activeCell);
  state.anchor = inSheet(state.anchor);
}

export function selectionRange() {
  const { activeCell: a, anchor: b } = state;
  return {
    top: Math.min(a.row, b.row),
    bottom: Math.max(a.row, b.row),
    left: Math.min(a.col, b.col),
    right: Math.max(a.col, b.col),
  };
}

export function selectionSize() {
  const { top, bottom, left, right } = selectionRange();
  return (bottom - top + 1) * (right - left + 1);
}

function selectionKeys() {
  const { top, bottom, left, right } = selectionRange();
  const keys = [];
  for (let row = top; row <= bottom; row++) {
    for (let col = left; col <= right; col++) keys.push(cellKey(row, col));
  }
  return keys;
}

function step(from, to) {
  if (from.length === 0) return;
  to.push(snapshot());
  restore(from.pop());
  persist();
  emit("sheets");
}

export const undo = () => step(undoStack, redoStack);
export const redo = () => step(redoStack, undoStack);

// Every edit of the active sheet goes through here: lock check, history, save, notify.
function edit(change, mutator) {
  if (!isEditable()) return false;
  record();
  mutator(activeSheet());
  persist();
  emit(change);
  return true;
}

function writeCell(sheet, key, value, style) {
  if (value === "" && Object.keys(style).length === 0) delete sheet.cells[key];
  else sheet.cells[key] = { value, style };
}

// ---- navigation ----

export function replaceSheet(sheet) {
  const index = state.sheets.findIndex((existing) => existing.id === sheet.id);
  if (index === -1) return;
  state.sheets[index] = sheet;
  if (state.activeId === sheet.id) emit("sheets");
}

export function showSheet(id) {
  if (!findSheet(id)) return false;
  const changed = state.activeId !== id;
  state.activeId = id;
  state.article = null;
  if (changed) {
    state.activeCell = { row: 1, col: 1 };
    state.anchor = { row: 1, col: 1 };
  }
  emit("sheets");
  return true;
}

export function showArticle(sheetId, slug) {
  state.activeId = sheetId;
  state.article = slug;
  emit("sheets");
}

// extend keeps the anchor, so the selection grows from it (Shift+click, Shift+arrow, drag).
export function selectCell(row, col, extend = false) {
  state.activeCell = { row, col };
  if (!extend) state.anchor = { row, col };
  clampActiveCell();
  emit("selection");
}

export function moveSelection(rowDelta, colDelta, extend = false) {
  selectCell(state.activeCell.row + rowDelta, state.activeCell.col + colDelta, extend);
}

// The active cell stays at "from", so the view does not jump to the far end of the range.
export function selectRange(from, to) {
  state.activeCell = from;
  state.anchor = to;
  clampActiveCell();
  emit("selection");
}

// Ctrl+A selects the used part of the sheet, as far as the last cell with content.
export function selectAll() {
  const sheet = activeSheet();
  let bottom = 1;
  let right = 1;
  for (const key of Object.keys(sheet.cells)) {
    const { row, col } = parseKey(key);
    bottom = Math.max(bottom, row);
    right = Math.max(right, col);
  }
  selectRange({ row: 1, col: 1 }, { row: bottom, col: right });
}

// ---- cell edits ----

export function setCellValue(value, key = activeKey()) {
  const current = activeSheet().cells[key];
  if ((current?.value ?? "") === value) return false;
  return edit("cells", (sheet) => writeCell(sheet, key, value, current?.style ?? {}));
}

// Delete clears the content of every selected cell and keeps the formatting, as Excel does.
export function clearSelection() {
  const filled = selectionKeys().filter((key) => activeSheet().cells[key]?.value);
  if (filled.length === 0) return false;
  return edit("cells", (sheet) => {
    for (const key of filled) writeCell(sheet, key, "", sheet.cells[key].style);
  });
}

// Applies to every selected cell. value undefined or false removes the style property.
export function setStyle(name, value) {
  const keys = selectionKeys();
  return edit("cells", (sheet) => {
    for (const key of keys) {
      const cell = sheet.cells[key] ?? { value: "", style: {} };
      const style = { ...cell.style, [name]: value };
      if (value === undefined || value === false) delete style[name];
      writeCell(sheet, key, cell.value, style);
    }
  });
}

// The active cell decides the direction, so a mixed selection ends up uniform.
export function toggleStyle(name) {
  return setStyle(name, !activeCellData()?.style?.[name]);
}

export function clearFormatting() {
  const keys = selectionKeys();
  return edit("cells", (sheet) => {
    for (const key of keys) writeCell(sheet, key, sheet.cells[key]?.value ?? "", {});
  });
}

// ---- clipboard ----

// Reads work on locked sheets too, so a visitor can copy portfolio text.
// Returns { text, cells, count }: text is tab-separated, cells is rows of { text, style }.
export function copySelection() {
  const sheet = activeSheet();
  const { display } = evaluator(sheet);
  const { top, bottom, left, right } = selectionRange();
  const cells = [];
  const raw = [];
  for (let row = top; row <= bottom; row++) {
    const shown = [];
    const stored = [];
    for (let col = left; col <= right; col++) {
      const key = cellKey(row, col);
      const cell = sheet.cells[key];
      shown.push({ text: display(key), style: cell?.style ?? {} });
      stored.push(cell ? structuredClone(cell) : null);
    }
    cells.push(shown);
    raw.push(stored);
  }
  const text = toTsv(cells.map((row) => row.map((cell) => cell.text)));
  clipboard = { text, raw };
  return { text, cells, count: selectionSize() };
}

export function cutSelection() {
  if (!isEditable()) return null;
  const copied = copySelection();
  const keys = selectionKeys();
  edit("cells", (sheet) => {
    for (const key of keys) delete sheet.cells[key];
  });
  return copied;
}

const sameText = (a, b) => a.replace(/\r\n?/g, "\n").replace(/\n$/, "") === b;

// Pastes at the top left of the selection. A block copied from this app keeps its raw values
// and styles. Text from another app arrives as values. One copied cell fills a larger selection.
// ponytail: a pasted formula keeps its references as typed. Shift them by the paste offset if
// relative references are ever needed.
export function pasteText(systemText) {
  const internal = clipboard && (systemText === undefined || sameText(systemText, clipboard.text));
  if (!internal && !systemText) return false;
  let block = internal
    ? clipboard.raw
    : parseTsv(systemText).map((row) => row.map((value) => ({ value, style: null })));

  const { top, bottom, left, right } = selectionRange();
  if (block.length === 1 && block[0].length === 1) {
    const rows = bottom - top + 1;
    block = Array.from({ length: rows }, () => Array(right - left + 1).fill(block[0][0]));
  }

  return edit("cells", (sheet) => {
    block.forEach((cells, r) => {
      cells.forEach((cell, c) => {
        const row = top + r;
        const col = left + c;
        if (row > sheet.rowCount || col > sheet.colCount) return;
        const key = cellKey(row, col);
        if (!cell) delete sheet.cells[key];
        // Text from outside keeps the formatting that the target cell already has.
        else
          writeCell(
            sheet,
            key,
            cell.value,
            structuredClone(cell.style ?? sheet.cells[key]?.style ?? {}),
          );
      });
    });
  });
}

// ---- sheet layout ----

export function setColWidth(col, width) {
  const next = clamp(Math.round(width), MIN_COL_WIDTH, MAX_COL_WIDTH);
  // A locked sheet keeps the new width for this visit only.
  if (!edit("sheets", (sheet) => (sheet.colWidths[col] = next))) {
    activeSheet().colWidths[col] = next;
    emit("sheets");
  }
}

export function growSheet(rows, cols) {
  if (!canGrow(activeSheet(), rows, cols)) return false;
  return edit("sheets", (sheet) => {
    sheet.rowCount += rows;
    sheet.colCount += cols;
  });
}

// ---- sheet list ----

function newId() {
  return `u-${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
}

function uniqueName(base) {
  const names = new Set(state.sheets.map((sheet) => sheet.name));
  if (!names.has(base)) return base;
  let n = 2;
  while (names.has(`${base} (${n})`)) n++;
  return `${base} (${n})`;
}

function nextSheetName() {
  const names = new Set(state.sheets.map((sheet) => sheet.name));
  let n = 1;
  while (names.has(t("sheet.default", { n }))) n++;
  return t("sheet.default", { n });
}

function insertSheet(sheet) {
  record();
  state.sheets.push(sheet);
  persist();
  return sheet.id;
}

export function addSheet() {
  return insertSheet(createSheet({ id: newId(), name: nextSheetName() }));
}

// A copy of a locked sheet is editable. This is how a visitor plays with portfolio data.
export function duplicateSheet(id) {
  const source = findSheet(id);
  const copy = structuredClone(source);
  return insertSheet({
    ...copy,
    id: newId(),
    name: uniqueName(t("sheet.copyOf", { name: source.name })),
    locked: false,
  });
}

export function renameSheet(id, name) {
  const sheet = findSheet(id);
  const next = name.trim().slice(0, 40);
  if (!sheet || sheet.locked || !next || next === sheet.name) return false;
  record();
  sheet.name = uniqueName(next);
  persist();
  emit("sheets");
  return true;
}

export function deleteSheet(id) {
  const sheet = findSheet(id);
  if (!sheet || sheet.locked) return false;
  record();
  state.sheets = state.sheets.filter((other) => other !== sheet);
  persist();
  return true;
}

// ---- view and storage ----

export function setView(patch) {
  Object.assign(state.view, patch);
  persist();
  emit("view");
}

export function clearStorage() {
  storage.clearSaved();
  state.sheets = state.sheets.filter((sheet) => sheet.locked);
  state.view = { ...DEFAULT_VIEW };
  state.saved = true;
  undoStack.length = 0;
  redoStack.length = 0;
  clipboard = null;
  // The active sheet may be one of the deleted ones.
  if (!activeSheet()) state.activeId = state.sheets[0].id;
  clampActiveCell();
  emit("sheets");
}
