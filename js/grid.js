import * as actions from "./actions.js";
import { isDialogOpen } from "./dialog.js";
import { DEFAULT_COL_WIDTH, MIN_COL_WIDTH } from "./sheet.js";
import * as store from "./state.js";
import { LOCKED_MESSAGE, flashStatus } from "./status.js";
import { cellKey, clamp, columnLetter, el, isExternalUrl, safeUrl } from "./utils.js";

const { state } = store;

// Phone layout. A locked sheet keeps its story in columns A and B, so those two fill the
// screen exactly. Other columns, and all columns of a user sheet, shrink by PHONE_SCALE.
const phone = window.matchMedia("(max-width: 40rem)");
const touch = window.matchMedia("(pointer: coarse)");
const PHONE_SCALE = 0.6;
const PHONE_MIN_COL = 84;
const PHONE_MAX_COL = 224;
const PHONE_FIRST_COL_SHARE = 0.32;
const PHONE_FRAME = 18; // workbench margin and border, both sides
const rowHeadWidth = () => (phone.matches ? 36 : 48);

const storedWidth = (sheet, col) => sheet.colWidths[col] ?? DEFAULT_COL_WIDTH;

function widthOf(sheet, col) {
  if (!phone.matches) return storedWidth(sheet, col);
  const space = window.innerWidth - PHONE_FRAME - rowHeadWidth();
  const first = Math.round(space * PHONE_FIRST_COL_SHARE);
  if (sheet.locked && col === 1) return first;
  if (sheet.locked && col === 2) return space - first;
  return clamp(Math.round(storedWidth(sheet, col) * PHONE_SCALE), PHONE_MIN_COL, PHONE_MAX_COL);
}

function renderCell(sheet, display, row, col) {
  const key = cellKey(row, col);
  const style = sheet.cells[key]?.style ?? {};
  const text = display(key);
  const td = el("td", { dataset: { row, col } });

  const numeric = text !== "" && !Number.isNaN(Number(text));
  td.className = [
    style.header && "header",
    style.size === "large" && "large",
    style.bold && "bold",
    style.italic && "italic",
    style.underline && "underline",
    style.strike && "strike",
    style.wrap && "wrap",
    `align-${style.align ?? (numeric ? "right" : "left")}`,
  ]
    .filter(Boolean)
    .join(" ");
  if (style.color) td.style.color = style.color;
  if (style.fill) td.style.backgroundColor = style.fill;

  if (style.link && text) {
    const href = safeUrl(style.link);
    const external = isExternalUrl(href);
    td.append(
      el(
        "a",
        {
          href,
          target: external && "_blank",
          rel: external && "noopener noreferrer",
          draggable: "false",
        },
        text,
      ),
    );
  } else {
    td.textContent = text;
  }
  return td;
}

export function mountGrid(root) {
  let table = null;
  let editor = null;

  const cellNode = (row, col) => table?.tBodies[0].rows[row - 1]?.cells[col];

  // ---- render ----

  function render() {
    const sheet = store.activeSheet();
    const { display } = store.evaluator(sheet);
    const cols = Array.from({ length: sheet.colCount }, (_, index) => index + 1);
    const totalWidth = cols.reduce((sum, col) => sum + widthOf(sheet, col), rowHeadWidth());

    const colgroup = el(
      "colgroup",
      {},
      el("col", { style: { width: `${rowHeadWidth()}px` } }),
      ...cols.map((col) => el("col", { style: { width: `${widthOf(sheet, col)}px` } })),
    );
    const head = el(
      "tr",
      {},
      el("th", { class: "corner" }),
      ...cols.map((col) =>
        el(
          "th",
          { class: "col-head", scope: "col", dataset: { col } },
          columnLetter(col),
          el("span", { class: "resizer", dataset: { col } }),
        ),
      ),
    );
    const body = el("tbody");
    for (let row = 1; row <= sheet.rowCount; row++) {
      body.append(
        el(
          "tr",
          {},
          el("th", { class: "row-head", scope: "row" }, String(row)),
          ...cols.map((col) => renderCell(sheet, display, row, col)),
        ),
      );
    }

    editor = null;
    table = el(
      "table",
      {
        class: "grid",
        role: "grid",
        "aria-label": sheet.name,
        style: { width: `${totalWidth}px` },
      },
      colgroup,
      el("thead", {}, head),
      body,
    );
    root.replaceChildren(table);
    applyView();
    markSelection();
  }

  function applyView() {
    if (!table) return;
    table.style.zoom = String(state.view.zoom / 100);
    table.classList.toggle("no-gridlines", !state.view.gridlines);
  }

  function markSelection() {
    if (!table) return;
    for (const node of table.querySelectorAll(".active, .active-head"))
      node.classList.remove("active", "active-head");
    const { row, col } = state.activeCell;
    const td = cellNode(row, col);
    if (!td) return;
    td.classList.add("active");
    table.tHead.rows[0].cells[col].classList.add("active-head");
    table.tBodies[0].rows[row - 1].cells[0].classList.add("active-head");
    td.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  // ---- editing ----

  function startEdit(initialText) {
    if (editor) return;
    if (!store.isEditable()) return flashStatus(LOCKED_MESSAGE);
    const td = cellNode(state.activeCell.row, state.activeCell.col);
    const input = el("input", {
      class: "cell-editor",
      type: "text",
      "aria-label": `Edit ${store.activeKey()}`,
      autocomplete: "off",
      spellcheck: "false",
    });
    input.value = initialText ?? store.activeCellData()?.value ?? "";
    editor = input;

    // finish runs once. Removing the input fires blur, which would commit a second time.
    const finish = (commit, rowDelta = 0, colDelta = 0) => {
      if (editor !== input) return;
      editor = null;
      const value = input.value;
      input.remove();
      if (commit) store.setCellValue(value);
      if (rowDelta || colDelta) store.moveSelection(rowDelta, colDelta);
      root.focus();
    };

    input.addEventListener("keydown", (event) => {
      event.stopPropagation();
      if (event.key === "Enter") finish(true, event.shiftKey ? -1 : 1, 0);
      else if (event.key === "Tab") finish(true, 0, event.shiftKey ? -1 : 1);
      else if (event.key === "Escape") finish(false);
      else return;
      event.preventDefault();
    });
    input.addEventListener("blur", () => finish(true));

    td.append(input);
    input.focus();
  }

  // ---- pointer ----

  root.addEventListener("click", (event) => {
    const td = event.target.closest("td");
    if (!td || event.target === editor) return;
    const row = Number(td.dataset.row);
    const col = Number(td.dataset.col);
    // Touch has no reliable double-tap. A second tap on the active cell starts the edit.
    const tapAgain = touch.matches && row === state.activeCell.row && col === state.activeCell.col;
    store.selectCell(row, col);
    if (tapAgain && store.isEditable() && !event.target.closest("a")) return startEdit();
    // A clicked link would keep focus and swallow the arrow keys.
    root.focus();
  });

  root.addEventListener("dblclick", (event) => {
    if (event.target.closest("td") && !event.target.closest("a")) startEdit();
  });

  root.addEventListener("pointerdown", (event) => {
    const handle = event.target.closest(".resizer");
    // Phone widths are scaled copies. A drag there would store a scaled value.
    if (!handle || phone.matches) return;
    event.preventDefault();
    const col = Number(handle.dataset.col);
    const sheet = store.activeSheet();
    const colNode = table.querySelector("colgroup").children[col];
    const zoom = state.view.zoom / 100;
    const startX = event.clientX;
    const startWidth = widthOf(sheet, col);
    const startTable = table.offsetWidth;
    let width = startWidth;

    // Drag moves the DOM only. The state gets one write on release, so undo gets one step.
    const onMove = (move) => {
      width = Math.max(MIN_COL_WIDTH, startWidth + (move.clientX - startX) / zoom);
      colNode.style.width = `${width}px`;
      table.style.width = `${startTable + width - startWidth}px`;
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (width !== startWidth) store.setColWidth(col, width);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  });

  // ---- keyboard and clipboard ----

  const gridHasKeys = (event) =>
    !state.article &&
    !isDialogOpen() &&
    !event.target.closest("input, select, textarea, button, a");

  // At the first or last column, Tab leaves the grid, so keyboard users are not trapped.
  const canTab = (event) =>
    event.target === root &&
    (event.shiftKey
      ? state.activeCell.col > 1
      : state.activeCell.col < store.activeSheet().colCount);

  const MOVES = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
  const COMMANDS = {
    z: (event) => (event.shiftKey ? store.redo() : store.undo()),
    y: () => store.redo(),
    b: () => actions.toggleFormat("bold"),
    i: () => actions.toggleFormat("italic"),
    u: () => actions.toggleFormat("underline"),
    k: () => actions.editLink(),
  };

  document.addEventListener("keydown", (event) => {
    if (!gridHasKeys(event)) return;

    if (event.ctrlKey || event.metaKey) {
      const command = COMMANDS[event.key.toLowerCase()];
      if (!command) return;
      event.preventDefault();
      command(event);
      return;
    }
    if (event.altKey) return;

    if (MOVES[event.key]) store.moveSelection(...MOVES[event.key]);
    else if (event.key === "Tab" && canTab(event)) store.moveSelection(0, event.shiftKey ? -1 : 1);
    else if (event.key === "Enter" || event.key === "F2") startEdit();
    else if (event.key === "Delete" || event.key === "Backspace") actions.clearCell();
    else if (event.key.length === 1) startEdit(event.key);
    else return;
    event.preventDefault();
  });

  document.addEventListener("copy", (event) => {
    if (!gridHasKeys(event)) return;
    event.clipboardData.setData("text/plain", store.copyCell());
    event.preventDefault();
  });

  document.addEventListener("cut", (event) => {
    if (!gridHasKeys(event)) return;
    const text = store.cutCell();
    if (text === null) return flashStatus(LOCKED_MESSAGE);
    event.clipboardData.setData("text/plain", text);
    event.preventDefault();
  });

  document.addEventListener("paste", (event) => {
    if (!gridHasKeys(event)) return;
    event.preventDefault();
    if (!store.isEditable()) return flashStatus(LOCKED_MESSAGE);
    store.pasteCell(event.clipboardData.getData("text/plain"));
  });

  // ---- state ----

  // Phone widths depend on the viewport, so a rotation needs a new render. A height-only
  // resize (the URL bar sliding away) does not.
  let lastWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    if (phone.matches && !state.article && !editor) render();
  });
  phone.addEventListener("change", () => state.article || render());

  store.subscribe((change) => {
    root.hidden = Boolean(state.article);
    if (state.article) return;
    if (change === "selection") markSelection();
    else if (change === "view") applyView();
    else render();
  });
}
