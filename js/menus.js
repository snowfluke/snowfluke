// Menu definitions. Each item: { label, run, shortcut?, enabled?, checked? } or { divider: true }.
import * as actions from "./actions.js";
import * as store from "./state.js";

const { state } = store;
const divider = { divider: true };
const editable = () => store.isEditable();
const ownSheet = () => !store.activeSheet().locked;
const styleOn =
  (name, value = true) =>
  () =>
    store.activeCellData()?.style?.[name] === value;

const zoomItems = store.ZOOM_LEVELS.map((zoom) => ({
  label: `Zoom ${zoom}%`,
  run: () => store.setView({ zoom }),
  checked: () => state.view.zoom === zoom,
}));

export const menus = [
  {
    label: "File",
    items: [
      { label: "New sheet", run: actions.newSheet },
      { label: "Duplicate sheet", run: actions.duplicateActiveSheet },
      { label: "Rename sheet", run: () => actions.renameSheet(), enabled: ownSheet },
      { label: "Delete sheet", run: () => actions.deleteSheet(), enabled: ownSheet },
      divider,
      { label: "Download workbook (XLSX)", run: actions.downloadXlsx },
      { label: "Download resume (PDF)", run: actions.downloadResume },
      { label: "Export this sheet (CSV)", run: actions.exportCsv },
      { label: "Print", shortcut: "Ctrl+P", run: () => window.print() },
      divider,
      { label: "Clear storage", run: actions.clearStorage },
    ],
  },
  {
    label: "Edit",
    items: [
      { label: "Undo", shortcut: "Ctrl+Z", run: store.undo, enabled: store.canUndo },
      { label: "Redo", shortcut: "Ctrl+Y", run: store.redo, enabled: store.canRedo },
      divider,
      { label: "Cut", shortcut: "Ctrl+X", run: actions.cut, enabled: editable },
      { label: "Copy", shortcut: "Ctrl+C", run: actions.copy, enabled: () => !state.article },
      {
        label: "Paste",
        shortcut: "Ctrl+V",
        run: actions.paste,
        enabled: () => editable() && store.hasClipboard(),
      },
      divider,
      { label: "Clear cell", shortcut: "Del", run: actions.clearCell, enabled: editable },
    ],
  },
  {
    label: "View",
    items: [
      {
        label: "Formula bar",
        run: () => store.setView({ formulaBar: !state.view.formulaBar }),
        checked: () => state.view.formulaBar,
      },
      {
        label: "Gridlines",
        run: () => store.setView({ gridlines: !state.view.gridlines }),
        checked: () => state.view.gridlines,
      },
      divider,
      ...zoomItems,
    ],
  },
  {
    label: "Insert",
    items: [
      { label: "10 rows at the bottom", run: () => actions.growSheet(10, 0), enabled: editable },
      { label: "5 columns at the right", run: () => actions.growSheet(0, 5), enabled: editable },
      divider,
      { label: "Link", shortcut: "Ctrl+K", run: actions.editLink, enabled: editable },
    ],
  },
  {
    label: "Format",
    items: [
      {
        label: "Bold",
        shortcut: "Ctrl+B",
        run: () => actions.toggleFormat("bold"),
        enabled: editable,
        checked: styleOn("bold"),
      },
      {
        label: "Italic",
        shortcut: "Ctrl+I",
        run: () => actions.toggleFormat("italic"),
        enabled: editable,
        checked: styleOn("italic"),
      },
      {
        label: "Underline",
        shortcut: "Ctrl+U",
        run: () => actions.toggleFormat("underline"),
        enabled: editable,
        checked: styleOn("underline"),
      },
      {
        label: "Strikethrough",
        run: () => actions.toggleFormat("strike"),
        enabled: editable,
        checked: styleOn("strike"),
      },
      divider,
      {
        label: "Align left",
        run: () => actions.setFormat("align", "left"),
        enabled: editable,
        checked: styleOn("align", "left"),
      },
      {
        label: "Align center",
        run: () => actions.setFormat("align", "center"),
        enabled: editable,
        checked: styleOn("align", "center"),
      },
      {
        label: "Align right",
        run: () => actions.setFormat("align", "right"),
        enabled: editable,
        checked: styleOn("align", "right"),
      },
      {
        label: "Wrap text",
        run: () => actions.toggleFormat("wrap"),
        enabled: editable,
        checked: styleOn("wrap"),
      },
      divider,
      { label: "Clear formatting", run: actions.clearFormatting, enabled: editable },
    ],
  },
  {
    label: "Help",
    items: [
      { label: "Keyboard shortcuts", run: actions.showShortcuts },
      { label: "Formulas", run: actions.showFormulaHelp },
      { label: "About this site", run: actions.showAbout },
    ],
  },
];
