import { createEvaluator } from "./formula.js";
import { MAX_COL_WIDTH, MIN_COL_WIDTH, canGrow, createSheet } from "./sheet.js";
import * as storage from "./storage.js";
import { cellKey, clamp } from "./utils.js";

const HISTORY_LIMIT = 100;
const DEFAULT_VIEW = { zoom: 100, gridlines: true, formulaBar: true };
export const ZOOM_LEVELS = [50, 75, 90, 100, 125, 150, 200];

export const state = {
  sheets: [],
  activeId: "",
  activeCell: { row: 1, col: 1 },
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
export const hasClipboard = () => clipboard !== null;

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
  state.activeCell = {
    row: clamp(state.activeCell.row, 1, sheet.rowCount),
    col: clamp(state.activeCell.col, 1, sheet.colCount),
  };
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
  if (changed) state.activeCell = { row: 1, col: 1 };
  emit("sheets");
  return true;
}

export function showArticle(sheetId, slug) {
  state.activeId = sheetId;
  state.article = slug;
  emit("sheets");
}

export function selectCell(row, col) {
  state.activeCell = { row, col };
  clampActiveCell();
  emit("selection");
}

export function moveSelection(rowDelta, colDelta) {
  selectCell(state.activeCell.row + rowDelta, state.activeCell.col + colDelta);
}

// ---- cell edits ----

export function setCellValue(value, key = activeKey()) {
  const current = activeSheet().cells[key];
  if ((current?.value ?? "") === value) return false;
  return edit("cells", (sheet) => writeCell(sheet, key, value, current?.style ?? {}));
}

// value undefined removes the style property.
export function setStyle(name, value) {
  const key = activeKey();
  return edit("cells", (sheet) => {
    const cell = sheet.cells[key] ?? { value: "", style: {} };
    const style = { ...cell.style, [name]: value };
    if (value === undefined || value === false) delete style[name];
    writeCell(sheet, key, cell.value, style);
  });
}

export function toggleStyle(name) {
  return setStyle(name, !activeCellData()?.style?.[name]);
}

export function clearFormatting() {
  const key = activeKey();
  return edit("cells", (sheet) => writeCell(sheet, key, sheet.cells[key]?.value ?? "", {}));
}

// Reads work on locked sheets too, so a visitor can copy portfolio text.
export function copyCell() {
  const cell = activeCellData();
  clipboard = cell ? structuredClone(cell) : { value: "", style: {} };
  return evaluator().display(activeKey());
}

export function cutCell() {
  if (!isEditable()) return null;
  const text = copyCell();
  const key = activeKey();
  edit("cells", (sheet) => delete sheet.cells[key]);
  return text;
}

// ponytail: a pasted formula keeps its references as typed. Shift them by the paste offset if
// range copy ever lands.
export function pasteCell(systemText) {
  const key = activeKey();
  const internal = clipboard && (systemText === undefined || systemText === copyTextOf(clipboard));
  if (internal) {
    const { value, style } = structuredClone(clipboard);
    return edit("cells", (sheet) => writeCell(sheet, key, value, style));
  }
  if (systemText === undefined) return false;
  return setCellValue(systemText.replace(/\r?\n$/, ""));
}

function copyTextOf(cell) {
  return createEvaluator({ getRaw: () => cell.value, rowCount: 1, colCount: 1 }).display("A1");
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
  while (names.has(`Sheet${n}`)) n++;
  return `Sheet${n}`;
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
    name: uniqueName(`Copy of ${source.name}`),
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
