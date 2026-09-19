// Menu definitions. Each item: { label, run, shortcut?, enabled?, checked? } or { divider: true }.
import * as actions from "./actions.js";
import { lang, t } from "./i18n.js";
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
  label: t("menu.zoom", { zoom }),
  run: () => store.setView({ zoom }),
  checked: () => state.view.zoom === zoom,
}));

export const menus = [
  {
    label: t("menu.file"),
    items: [
      { label: t("menu.newSheet"), run: actions.newSheet },
      { label: t("menu.duplicateSheet"), run: actions.duplicateActiveSheet },
      { label: t("menu.renameSheet"), run: () => actions.renameSheet(), enabled: ownSheet },
      { label: t("menu.deleteSheet"), run: () => actions.deleteSheet(), enabled: ownSheet },
      divider,
      { label: t("menu.downloadXlsx"), run: actions.downloadXlsx },
      { label: t("menu.downloadResume"), run: actions.downloadResume },
      { label: t("menu.exportCsv"), run: actions.exportCsv },
      { label: t("menu.print"), shortcut: "Ctrl+P", run: () => window.print() },
      divider,
      { label: t("menu.clearStorage"), run: actions.clearStorage },
    ],
  },
  {
    label: t("menu.edit"),
    items: [
      { label: t("menu.undo"), shortcut: "Ctrl+Z", run: store.undo, enabled: store.canUndo },
      { label: t("menu.redo"), shortcut: "Ctrl+Y", run: store.redo, enabled: store.canRedo },
      divider,
      { label: t("menu.cut"), shortcut: "Ctrl+X", run: actions.cut, enabled: editable },
      {
        label: t("menu.copy"),
        shortcut: "Ctrl+C",
        run: actions.copy,
        enabled: () => !state.article,
      },
      {
        label: t("menu.paste"),
        shortcut: "Ctrl+V",
        run: actions.paste,
        enabled: editable,
      },
      divider,
      {
        label: t("menu.selectAll"),
        shortcut: "Ctrl+A",
        run: actions.selectAll,
        enabled: () => !state.article,
      },
      { label: t("menu.clearCells"), shortcut: "Del", run: actions.clearCells, enabled: editable },
    ],
  },
  {
    label: t("menu.view"),
    items: [
      {
        label: t("menu.formulaBar"),
        run: () => store.setView({ formulaBar: !state.view.formulaBar }),
        checked: () => state.view.formulaBar,
      },
      {
        label: t("menu.gridlines"),
        run: () => store.setView({ gridlines: !state.view.gridlines }),
        checked: () => state.view.gridlines,
      },
      divider,
      ...zoomItems,
      divider,
      ...["system", "light", "dark"].map((theme) => ({
        label: t(`menu.theme${theme[0].toUpperCase()}${theme.slice(1)}`),
        run: () => actions.setTheme(theme),
        checked: () => (state.view.theme ?? "system") === theme,
      })),
      divider,
      {
        label: t("menu.langEn"),
        run: () => actions.setLanguage("en"),
        checked: () => lang === "en",
      },
      {
        label: t("menu.langId"),
        run: () => actions.setLanguage("id"),
        checked: () => lang === "id",
      },
    ],
  },
  {
    label: t("menu.insert"),
    items: [
      { label: t("menu.addRows"), run: () => actions.growSheet(10, 0), enabled: editable },
      { label: t("menu.addCols"), run: () => actions.growSheet(0, 5), enabled: editable },
      divider,
      { label: t("menu.link"), shortcut: "Ctrl+K", run: actions.editLink, enabled: editable },
    ],
  },
  {
    label: t("menu.format"),
    items: [
      {
        label: t("menu.bold"),
        shortcut: "Ctrl+B",
        run: () => actions.toggleFormat("bold"),
        enabled: editable,
        checked: styleOn("bold"),
      },
      {
        label: t("menu.italic"),
        shortcut: "Ctrl+I",
        run: () => actions.toggleFormat("italic"),
        enabled: editable,
        checked: styleOn("italic"),
      },
      {
        label: t("menu.underline"),
        shortcut: "Ctrl+U",
        run: () => actions.toggleFormat("underline"),
        enabled: editable,
        checked: styleOn("underline"),
      },
      {
        label: t("menu.strike"),
        run: () => actions.toggleFormat("strike"),
        enabled: editable,
        checked: styleOn("strike"),
      },
      divider,
      {
        label: t("menu.alignLeft"),
        run: () => actions.setFormat("align", "left"),
        enabled: editable,
        checked: styleOn("align", "left"),
      },
      {
        label: t("menu.alignCenter"),
        run: () => actions.setFormat("align", "center"),
        enabled: editable,
        checked: styleOn("align", "center"),
      },
      {
        label: t("menu.alignRight"),
        run: () => actions.setFormat("align", "right"),
        enabled: editable,
        checked: styleOn("align", "right"),
      },
      {
        label: t("menu.wrap"),
        run: () => actions.toggleFormat("wrap"),
        enabled: editable,
        checked: styleOn("wrap"),
      },
      divider,
      { label: t("menu.clearFormatting"), run: actions.clearFormatting, enabled: editable },
    ],
  },
  {
    label: t("menu.help"),
    items: [
      { label: t("menu.shortcuts"), run: actions.showShortcuts },
      { label: t("menu.formulas"), run: actions.showFormulaHelp },
      { label: t("menu.about"), run: actions.showAbout },
    ],
  },
];
