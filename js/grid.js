import * as actions from "./actions.js";
import { fillClipboardEvent } from "./clipboard.js";
import { isDialogOpen } from "./dialog.js";
import { t } from "./i18n.js";
import { DEFAULT_COL_WIDTH, MIN_COL_WIDTH } from "./sheet.js";
import * as store from "./state.js";
import { flashStatus, lockedMessage } from "./status.js";
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
  let rendered = false;

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
          el("th", { class: "row-head", scope: "row", dataset: { row } }, String(row)),
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
    // The first render shows cell A1, which is in view already. scrollIntoView would force a
    // full layout of the new table during page load for nothing.
    markSelection(rendered);
    rendered = true;
  }

  function applyView() {
    if (!table) return;
    table.style.zoom = String(state.view.zoom / 100);
    table.classList.toggle("no-gridlines", !state.view.gridlines);
  }

  // scroll is false when a header or a drag made the selection. The view must not jump then.
  function markSelection(scroll = true) {
    if (!table) return;
    for (const node of table.querySelectorAll(".active, .in-range, .active-head")) {
      node.classList.remove("active", "in-range", "active-head");
    }
    const { top, bottom, left, right } = store.selectionRange();
    const single = top === bottom && left === right;
    const bodyRows = table.tBodies[0].rows;
    for (let row = top; row <= bottom; row++) {
      bodyRows[row - 1].cells[0].classList.add("active-head");
      if (single) continue;
      for (let col = left; col <= right; col++)
        bodyRows[row - 1].cells[col].classList.add("in-range");
    }
    for (let col = left; col <= right; col++)
      table.tHead.rows[0].cells[col].classList.add("active-head");

    const td = cellNode(state.activeCell.row, state.activeCell.col);
    if (!td) return;
    td.classList.add("active");
    if (scroll) td.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  // ---- editing ----

  function startEdit(initialText) {
    if (editor) return;
    if (!store.isEditable()) return flashStatus(lockedMessage());
    const td = cellNode(state.activeCell.row, state.activeCell.col);
    const input = el("input", {
      class: "cell-editor",
      type: "text",
      "aria-label": t("grid.edit", { cell: store.activeKey() }),
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

  const cellOf = (event) => {
    const td = event.target.closest?.("td");
    return td && root.contains(td)
      ? { row: Number(td.dataset.row), col: Number(td.dataset.col) }
      : null;
  };

  // A mouse selects on press and extends while it drags, like a desktop spreadsheet.
  // Touch keeps the press free for scrolling and selects on tap, in the click handler.
  let dragging = false;
  let pressed = false;
  let quiet = false;

  root.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || event.target === editor) return;
    const sheet = store.activeSheet();
    const head = event.target.closest("th");
    if (head && !event.target.closest(".resizer")) {
      quiet = true;
      if (head.dataset.col) {
        const col = Number(head.dataset.col);
        store.selectRange({ row: 1, col }, { row: sheet.rowCount, col });
      } else if (head.dataset.row) {
        const row = Number(head.dataset.row);
        store.selectRange({ row, col: 1 }, { row, col: sheet.colCount });
      } else {
        store.selectRange({ row: 1, col: 1 }, { row: sheet.rowCount, col: sheet.colCount });
      }
      quiet = false;
      root.focus();
      event.preventDefault();
      return;
    }
    const cell = cellOf(event);
    if (!cell) return;
    pressed = true;
    dragging = true;
    store.selectCell(cell.row, cell.col, event.shiftKey);
  });

  root.addEventListener("pointerover", (event) => {
    if (!dragging) return;
    const cell = cellOf(event);
    if (!cell || (cell.row === state.activeCell.row && cell.col === state.activeCell.col)) return;
    quiet = true;
    store.selectCell(cell.row, cell.col, true);
    quiet = false;
  });

  window.addEventListener("pointerup", () => {
    dragging = false;
    // The click, if any, fires right after this event. A release outside a cell has no click,
    // so clear the flag afterwards or the next tap would be ignored.
    setTimeout(() => (pressed = false), 0);
  });

  root.addEventListener("click", (event) => {
    const cell = cellOf(event);
    if (!cell || event.target === editor) return;
    // The mouse press already made this selection. A second select would collapse a drag.
    if (pressed) {
      pressed = false;
      root.focus();
      return;
    }
    // Touch has no reliable double-tap. A second tap on the active cell starts the edit.
    const { row, col } = cell;
    const tapAgain = touch.matches && row === state.activeCell.row && col === state.activeCell.col;
    store.selectCell(row, col, event.shiftKey);
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
  // Copy and cut run from the key press, not from the browser's copy event. That event
  // does not fire when no text is selected, and grid cells are not selectable text.
  const COMMANDS = {
    z: (event) => (event.shiftKey ? store.redo() : store.undo()),
    y: () => store.redo(),
    b: () => actions.toggleFormat("bold"),
    i: () => actions.toggleFormat("italic"),
    u: () => actions.toggleFormat("underline"),
    k: () => actions.editLink(),
    a: () => actions.selectAll(),
    c: () => actions.copy(),
    x: () => actions.cut(),
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

    if (MOVES[event.key]) store.moveSelection(...MOVES[event.key], event.shiftKey);
    else if (event.key === "Tab" && canTab(event)) store.moveSelection(0, event.shiftKey ? -1 : 1);
    else if (event.key === "Enter" || event.key === "F2") startEdit();
    else if (event.key === "Escape") store.selectCell(state.activeCell.row, state.activeCell.col);
    else if (event.key === "Delete" || event.key === "Backspace") actions.clearCells();
    else if (event.key.length === 1) startEdit(event.key);
    else return;
    event.preventDefault();
  });

  // The native events still arrive from the browser's Edit menu and the context menu.
  document.addEventListener("copy", (event) => {
    if (gridHasKeys(event)) fillClipboardEvent(event, store.copySelection());
  });

  document.addEventListener("cut", (event) => {
    if (!gridHasKeys(event)) return;
    const copied = store.cutSelection();
    if (copied === null) return flashStatus(lockedMessage());
    fillClipboardEvent(event, copied);
  });

  document.addEventListener("paste", (event) => {
    if (!gridHasKeys(event)) return;
    event.preventDefault();
    if (!store.isEditable()) return flashStatus(lockedMessage());
    store.pasteText(event.clipboardData.getData("text/plain"));
  });

  // ---- state ----

  // Phone widths depend on the viewport, so a rotation needs a new render. A height-only
  // resize (the URL bar sliding away) does not.
  // No read at mount: window.innerWidth forces a layout, and page load cannot spare one.
  let lastWidth = null;
  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    if (width === lastWidth) return;
    const first = lastWidth === null;
    lastWidth = width;
    if (first && !phone.matches) return;
    if (phone.matches && !state.article && !editor) render();
  });
  phone.addEventListener("change", () => state.article || render());

  store.subscribe((change) => {
    root.hidden = Boolean(state.article);
    if (state.article) return;
    if (change === "selection") markSelection(!quiet);
    else if (change === "view") applyView();
    else render();
  });
}
