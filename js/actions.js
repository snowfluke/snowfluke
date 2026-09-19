// User commands. Menus, toolbar and keyboard shortcuts all call these.
import { ask, confirmAction, inform } from "./dialog.js";
import { go } from "./router.js";
import { RESUME_PDF } from "./data/portfolio.js";
import { toCsv } from "./sheet.js";
import * as store from "./state.js";
import { LOCKED_MESSAGE, flashStatus } from "./status.js";
import { el, safeUrl } from "./utils.js";
import { buildXlsx } from "./xlsx.js";

const { state } = store;

function requireEditable() {
  if (store.isEditable()) return true;
  flashStatus(state.article ? "Open a sheet to edit cells." : LOCKED_MESSAGE);
  return false;
}

// ---- sheets ----

export const newSheet = () => go(store.addSheet());
export const duplicateActiveSheet = () => go(store.duplicateSheet(state.activeId));

export async function renameSheet(id = state.activeId) {
  const sheet = store.findSheet(id);
  if (sheet.locked) return flashStatus("Portfolio sheets keep their names.");
  const name = await ask({
    title: "Rename sheet",
    label: "Name",
    value: sheet.name,
    confirmLabel: "Rename",
  });
  if (name !== null) store.renameSheet(id, name);
}

export async function deleteSheet(id = state.activeId) {
  const sheet = store.findSheet(id);
  if (sheet.locked) return flashStatus("Portfolio sheets stay. You can delete your own sheets.");
  const confirmed = await confirmAction({
    title: "Delete sheet",
    message: `Delete "${sheet.name}"? Edit > Undo brings it back until you close the tab.`,
    confirmLabel: "Delete",
  });
  if (!confirmed) return;
  const index = state.sheets.indexOf(sheet);
  store.deleteSheet(id);
  go(id === state.activeId ? state.sheets[Math.max(0, index - 1)].id : state.activeId);
}

function download(filename, blob) {
  const link = el("a", { href: URL.createObjectURL(blob), download: filename });
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportCsv() {
  const sheet = store.activeSheet();
  const csv = toCsv(sheet, store.evaluator(sheet).display);
  download(`${sheet.name.replace(/[^\w-]+/g, "_")}.csv`, new Blob([csv], { type: "text/csv" }));
}

// Excel needs full URLs. An in-app link such as "#/blog/post" resolves against this page.
const absoluteUrl = (url) => new URL(url, location.href).href;

// The whole workbook: portfolio sheets plus the sheets the visitor made.
export function downloadXlsx() {
  const bytes = buildXlsx(state.sheets, absoluteUrl);
  download(
    "awal-ariansyah-portfolio.xlsx",
    new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
}

export const downloadResume = () => el("a", { href: RESUME_PDF, download: "" }).click();

export async function clearStorage() {
  const count = store.userSheets().length;
  const confirmed = await confirmAction({
    title: "Clear storage",
    message: `This deletes ${count} sheet${count === 1 ? "" : "s"} you made and your view settings from this browser. You cannot undo it.`,
    confirmLabel: "Clear storage",
  });
  if (!confirmed) return;
  store.clearStorage();
  flashStatus("Storage cleared.");
}

// ---- cells ----

export const toggleFormat = (name) => requireEditable() && store.toggleStyle(name);
export const setFormat = (name, value) => requireEditable() && store.setStyle(name, value);
export const clearFormatting = () => requireEditable() && store.clearFormatting();
export const clearCell = () => requireEditable() && store.setCellValue("");
export const growSheet = (rows, cols) =>
  requireEditable() &&
  (store.growSheet(rows, cols) || flashStatus("This sheet is at its size limit."));

export async function editLink() {
  if (!requireEditable()) return;
  const current = store.activeCellData()?.style?.link ?? "";
  const url = await ask({
    title: "Link",
    label: "URL. Leave empty to remove the link.",
    value: current,
    placeholder: "https://",
    confirmLabel: "Apply",
  });
  if (url === null) return;
  store.setStyle("link", url.trim() ? safeUrl(url) : undefined);
}

function writeClipboard(text) {
  // Browsers can refuse clipboard access. The internal clipboard still holds the cell.
  navigator.clipboard?.writeText(text).catch(() => {});
}

export const copy = () => writeClipboard(store.copyCell());
export const paste = () => requireEditable() && store.pasteCell();
export function cut() {
  if (requireEditable()) writeClipboard(store.cutCell());
}

// ---- help ----

const SHORTCUTS = [
  ["Arrow keys, Tab", "Move the selection"],
  ["Enter, F2, or type", "Edit the cell"],
  ["Esc", "Cancel the edit"],
  ["Delete", "Clear the cell"],
  ["Ctrl+Z, Ctrl+Y", "Undo, redo"],
  ["Ctrl+B, Ctrl+I, Ctrl+U", "Bold, italic, underline"],
  ["Ctrl+K", "Add a link"],
  ["Ctrl+C, Ctrl+X, Ctrl+V", "Copy, cut, paste"],
];

export function showShortcuts() {
  const rows = SHORTCUTS.map(([keys, what]) =>
    el("tr", {}, el("th", { scope: "row" }, keys), el("td", {}, what)),
  );
  inform({
    title: "Keyboard shortcuts",
    body: [
      el("table", { class: "shortcuts" }, el("tbody", {}, ...rows)),
      el("p", {}, "On a Mac, use Cmd in place of Ctrl."),
    ],
  });
}

export function showFormulaHelp() {
  inform({
    title: "Formulas",
    body: [
      el("p", {}, "Start a cell with = to compute a value."),
      el(
        "pre",
        {},
        "=A1+B2*2\n=(A1-A2)/A3\n=2^10\n=SUM(A1:A10)\n=AVERAGE(A1:B5)\n=MIN(A1:A5) + MAX(A1:A5)\n=COUNT(A1:C9)",
      ),
      el("p", {}, "Errors: #DIV/0! #REF! #NAME? #VALUE! #CIRC! #ERROR!"),
    ],
  });
}

export function showAbout() {
  inform({
    title: "About this site",
    body: [
      el(
        "p",
        {},
        "Portfolio and blog of Awal Ariansyah. Plain HTML, CSS and JavaScript modules. No framework, no bundler.",
      ),
      el(
        "p",
        {},
        "Sheets you add stay in your browser's localStorage. Nothing leaves your device.",
      ),
    ],
  });
}
