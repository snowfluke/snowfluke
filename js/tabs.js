import * as actions from "./actions.js";
import { go } from "./router.js";
import * as store from "./state.js";
import { el } from "./utils.js";

const { state } = store;

export function mountTabs(root) {
  const list = el("div", { class: "tab-list", role: "tablist", "aria-label": "Sheets" });
  root.append(
    el(
      "button",
      {
        type: "button",
        class: "tab-add",
        title: "New sheet",
        "aria-label": "New sheet",
        onclick: actions.newSheet,
      },
      "+",
    ),
    list,
  );

  function renderTab(sheet) {
    const active = sheet.id === state.activeId;
    const tab = el(
      "button",
      {
        type: "button",
        class: "tab",
        role: "tab",
        "aria-selected": String(active),
        title: sheet.locked ? `${sheet.name} (locked)` : `${sheet.name}. Double-click to rename.`,
        onclick: () => (!active || state.article) && go(sheet.id),
        ondblclick: () => actions.renameSheet(sheet.id),
      },
      sheet.name,
    );
    if (sheet.locked) return tab;
    const remove = el(
      "button",
      {
        type: "button",
        class: "tab-remove",
        title: `Delete ${sheet.name}`,
        "aria-label": `Delete ${sheet.name}`,
        onclick: () => actions.deleteSheet(sheet.id),
      },
      "x",
    );
    return el("span", { class: "tab-group" }, tab, remove);
  }

  function render() {
    list.replaceChildren(...state.sheets.map(renderTab));
    list
      .querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  // A mouse click on a tab must not take focus from the grid, or the arrow keys stop working.
  root.addEventListener("mousedown", (event) => {
    if (event.target.closest("button")) event.preventDefault();
  });

  store.subscribe((change) => change === "sheets" && render());
  render();
}
