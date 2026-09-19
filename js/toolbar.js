import * as actions from "./actions.js";
import { t } from "./i18n.js";
import * as store from "./state.js";
import { cssColor } from "./theme.js";
import { el } from "./utils.js";

const { state } = store;

const needsEditable = (node) => (node.disabled = !store.isEditable());
const divider = () => el("span", { class: "tool-divider", role: "separator" });

export function mountToolbar(root) {
  const synced = [];

  // sync(node) runs on every state change and sets disabled and pressed.
  function button(label, title, run, sync, className = "") {
    const node = el(
      "button",
      { type: "button", class: `tool ${className}`, title, "aria-label": title, onclick: run },
      label,
    );
    if (sync) synced.push(() => sync(node));
    return node;
  }

  function formatToggle(label, title, name, className) {
    return button(
      label,
      title,
      () => actions.toggleFormat(name),
      (node) => {
        needsEditable(node);
        node.setAttribute("aria-pressed", String(Boolean(store.activeCellData()?.style?.[name])));
      },
      className,
    );
  }

  function alignButton(label, title, value) {
    return button(
      label,
      title,
      () => actions.setFormat("align", value),
      (node) => {
        needsEditable(node);
        node.setAttribute("aria-pressed", String(store.activeCellData()?.style?.align === value));
      },
    );
  }

  function colorPicker(label, title, name, token) {
    // "change" fires once when the picker closes. "input" would flood the undo history.
    const input = el("input", {
      type: "color",
      "aria-label": title,
      onchange: () => actions.setFormat(name, input.value),
    });
    synced.push(() => {
      input.disabled = !store.isEditable();
      input.value = store.activeCellData()?.style?.[name] ?? cssColor(token);
    });
    return el("label", { class: "tool swatch", title }, label, input);
  }

  const zoom = el(
    "select",
    {
      class: "tool",
      "aria-label": t("tool.zoom"),
      title: t("tool.zoom"),
      onchange: () => store.setView({ zoom: Number(zoom.value) }),
    },
    ...store.ZOOM_LEVELS.map((level) => el("option", { value: level }, `${level}%`)),
  );
  synced.push(() => (zoom.value = state.view.zoom));

  root.append(
    button(
      t("tool.undo"),
      t("menu.undo"),
      store.undo,
      (node) => (node.disabled = !store.canUndo()),
    ),
    button(
      t("tool.redo"),
      t("menu.redo"),
      store.redo,
      (node) => (node.disabled = !store.canRedo()),
    ),
    button(t("tool.print"), t("menu.print"), () => window.print()),
    divider(),
    zoom,
    divider(),
    formatToggle("B", t("menu.bold"), "bold", "tool-bold"),
    formatToggle("I", t("menu.italic"), "italic", "tool-italic"),
    formatToggle("U", t("menu.underline"), "underline", "tool-underline"),
    formatToggle("S", t("menu.strike"), "strike", "tool-strike"),
    divider(),
    alignButton(t("tool.left"), t("menu.alignLeft"), "left"),
    alignButton(t("tool.center"), t("menu.alignCenter"), "center"),
    alignButton(t("tool.right"), t("menu.alignRight"), "right"),
    formatToggle(t("tool.wrap"), t("menu.wrap"), "wrap"),
    divider(),
    colorPicker(t("tool.text"), t("tool.textColor"), "color", "--ink"),
    colorPicker(t("tool.fill"), t("tool.fillColor"), "fill", "--paper"),
    divider(),
    button(t("tool.link"), t("menu.link"), actions.editLink, needsEditable),
    button(t("tool.clear"), t("menu.clearFormatting"), actions.clearFormatting, needsEditable),
  );

  // A mouse click on a tool must not take focus from the grid, or the arrow keys stop working.
  root.addEventListener("mousedown", (event) => {
    if (event.target.closest("button")) event.preventDefault();
  });

  const sync = () => synced.forEach((run) => run());
  store.subscribe(sync);
  sync();
}
