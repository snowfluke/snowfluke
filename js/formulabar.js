import * as store from "./state.js";
import { el, parseKey } from "./utils.js";

const { state } = store;

export function mountFormulaBar(root) {
  const nameBox = el("input", {
    class: "name-box",
    type: "text",
    "aria-label": "Cell reference",
    autocomplete: "off",
    spellcheck: "false",
  });
  const input = el("input", {
    class: "formula-input",
    type: "text",
    "aria-label": "Cell content",
    autocomplete: "off",
    spellcheck: "false",
  });
  root.append(nameBox, el("span", { class: "fx", "aria-hidden": "true" }, "fx"), input);

  function sync() {
    root.hidden = !state.view.formulaBar;
    nameBox.disabled = Boolean(state.article);
    input.readOnly = !store.isEditable();
    if (state.article) {
      nameBox.value = "";
      input.value = `=ARTICLE("${state.article}")`;
      return;
    }
    nameBox.value = store.activeKey();
    input.value = store.activeCellData()?.value ?? "";
    input.placeholder = store.isEditable() ? "Value or formula, for example =SUM(A1:A5)" : "";
  }

  // Typing "C5" and Enter in the name box jumps to that cell.
  nameBox.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const target = parseKey(nameBox.value.trim().toUpperCase());
    if (target) store.selectCell(target.row, target.col);
    sync();
    nameBox.blur();
  });
  nameBox.addEventListener("blur", sync);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      input.blur();
      store.moveSelection(1, 0);
    } else if (event.key === "Escape") {
      sync();
      input.blur();
    }
  });
  input.addEventListener("blur", () => {
    if (store.isEditable()) store.setCellValue(input.value);
  });

  store.subscribe(sync);
  sync();
}
