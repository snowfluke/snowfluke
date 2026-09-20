// User commands. Menus, toolbar and keyboard shortcuts all call these.
import { ask, confirmAction, inform } from "./dialog.js";
import { lang, plural, t } from "./i18n.js";
import { go } from "./router.js";
import { RESUME_PDF } from "./data/portfolio.js";
import { toCsv } from "./sheet.js";
import { writeClipboard } from "./clipboard.js";
import * as store from "./state.js";
import { flashStatus } from "./status.js";
import { effectiveTheme } from "./theme.js";
import { el, safeUrl } from "./utils.js";

const { state } = store;

function requireEditable() {
  if (store.isEditable()) return true;
  flashStatus(t(state.article ? "status.openSheet" : "status.locked"));
  return false;
}

// ---- sheets ----

export const newSheet = () => go(store.addSheet());
export const duplicateActiveSheet = () => go(store.duplicateSheet(state.activeId));

export async function renameSheet(id = state.activeId) {
  const sheet = store.findSheet(id);
  if (sheet.locked) return flashStatus(t("status.keepNames"));
  const name = await ask({
    title: t("rename.title"),
    label: t("rename.label"),
    value: sheet.name,
    confirmLabel: t("rename.confirm"),
  });
  if (name !== null) store.renameSheet(id, name);
}

export async function deleteSheet(id = state.activeId) {
  const sheet = store.findSheet(id);
  if (sheet.locked) return flashStatus(t("status.keepSheets"));
  const confirmed = await confirmAction({
    title: t("delete.title"),
    message: t("delete.message", { name: sheet.name }),
    confirmLabel: t("delete.confirm"),
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
// The writer loads on the first click. Most visitors never download the workbook.
export async function downloadXlsx() {
  const { buildXlsx } = await import("./xlsx.js");
  const bytes = buildXlsx(state.sheets, absoluteUrl);
  download(
    "awal-ariansyah-portfolio.xlsx",
    new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
}

export const downloadResume = () => el("a", { href: RESUME_PDF, download: "" }).click();

// ---- display ----

// theme is "system", "light" or "dark". js/main.js applies state.view.theme on every change.
export const setTheme = (theme) => store.setView({ theme });
export const toggleTheme = () => setTheme(effectiveTheme() === "dark" ? "light" : "dark");

// Text is built once at start, so a new language needs a reload. The ?lang= parameter must
// go, or it would win over the saved choice on the next load.
export function setLanguage(next) {
  if (next === lang) return;
  store.setView({ lang: next });
  const url = new URL(location.href);
  url.searchParams.delete("lang");
  if (url.href === location.href) location.reload();
  else location.replace(url.href);
}

export async function clearStorage() {
  const count = store.userSheets().length;
  const confirmed = await confirmAction({
    title: t("clear.title"),
    message: plural("clear.message", count),
    confirmLabel: t("clear.confirm"),
  });
  if (!confirmed) return;
  store.clearStorage();
  flashStatus(t("status.cleared"));
}

// ---- cells ----

export const toggleFormat = (name) => requireEditable() && store.toggleStyle(name);
export const setFormat = (name, value) => requireEditable() && store.setStyle(name, value);
export const clearFormatting = () => requireEditable() && store.clearFormatting();
export const clearCells = () => requireEditable() && store.clearSelection();
export const growSheet = (rows, cols) =>
  requireEditable() && (store.growSheet(rows, cols) || flashStatus(t("status.sizeLimit")));

export async function editLink() {
  if (!requireEditable()) return;
  const current = store.activeCellData()?.style?.link ?? "";
  const url = await ask({
    title: t("link.title"),
    label: t("link.label"),
    value: current,
    placeholder: "https://",
    confirmLabel: t("link.confirm"),
  });
  if (url === null) return;
  store.setStyle("link", url.trim() ? safeUrl(url) : undefined);
}

export async function copy() {
  if (state.article) return;
  const copied = store.copySelection();
  const done = await writeClipboard(copied);
  flashStatus(done ? plural("copied", copied.count) : t("status.clipboardBlocked"));
}

export async function cut() {
  if (!requireEditable()) return;
  const copied = store.cutSelection();
  await writeClipboard(copied);
  flashStatus(plural("cut", copied.count));
}

// The menu item reads the system clipboard when the browser allows it. Ctrl+V does not come
// here. It arrives as a native paste event in js/grid.js and needs no permission.
export async function paste() {
  if (!requireEditable()) return;
  let text;
  try {
    text = await navigator.clipboard.readText();
  } catch {
    text = undefined;
  }
  store.pasteText(text);
}

export const selectAll = () => state.article || store.selectAll();

// ---- help ----

// [keys, description]. A key list with words in it has its own translation key.
const shortcuts = () => [
  [t("help.keys.move"), t("help.move")],
  [t("help.keys.range"), t("help.range")],
  [t("help.keys.header"), t("help.header")],
  ["Ctrl+A", t("help.all")],
  [t("help.keys.editCell"), t("help.editCell")],
  ["Esc", t("help.cancel")],
  ["Delete", t("help.clear")],
  ["Ctrl+Z, Ctrl+Y", t("help.undo")],
  ["Ctrl+B, Ctrl+I, Ctrl+U", t("help.format")],
  ["Ctrl+K", t("help.link")],
  ["Ctrl+C, Ctrl+X, Ctrl+V", t("help.clipboard")],
];

export function showShortcuts() {
  const rows = shortcuts().map(([keys, what]) =>
    el("tr", {}, el("th", { scope: "row" }, keys), el("td", {}, what)),
  );
  inform({
    title: t("help.shortcuts.title"),
    body: [
      el("table", { class: "shortcuts" }, el("tbody", {}, ...rows)),
      el("p", {}, t("help.shortcuts.mac")),
    ],
  });
}

export function showFormulaHelp() {
  inform({
    title: t("help.formulas.title"),
    body: [
      el("p", {}, t("help.formulas.intro")),
      el(
        "pre",
        {},
        "=A1+B2*2\n=(A1-A2)/A3\n=2^10\n=SUM(A1:A10)\n=AVERAGE(A1:B5)\n=MIN(A1:A5) + MAX(A1:A5)\n=COUNT(A1:C9)",
      ),
      el("p", {}, t("help.formulas.errors")),
    ],
  });
}

export function showAbout() {
  inform({
    title: t("help.about.title"),
    body: [el("p", {}, t("help.about.what")), el("p", {}, t("help.about.privacy"))],
  });
}
