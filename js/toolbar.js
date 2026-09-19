import * as actions from "./actions.js";
import * as store from "./state.js";
import { el } from "./utils.js";

const { state } = store;
const DEFAULT_TEXT_COLOR = "#32332f";
const DEFAULT_FILL_COLOR = "#faf9f5";

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

  function alignButton(label, value) {
    return button(
      label,
      `Align ${value}`,
      () => actions.setFormat("align", value),
      (node) => {
        needsEditable(node);
        node.setAttribute("aria-pressed", String(store.activeCellData()?.style?.align === value));
      },
    );
  }

  function colorPicker(label, title, name, fallback) {
    // "change" fires once when the picker closes. "input" would flood the undo history.
    const input = el("input", {
      type: "color",
      "aria-label": title,
      onchange: () => actions.setFormat(name, input.value),
    });
    synced.push(() => {
      input.disabled = !store.isEditable();
      input.value = store.activeCellData()?.style?.[name] ?? fallback;
    });
    return el("label", { class: "tool swatch", title }, label, input);
  }

  const zoom = el(
    "select",
    {
      class: "tool",
      "aria-label": "Zoom",
      title: "Zoom",
      onchange: () => store.setView({ zoom: Number(zoom.value) }),
    },
    ...store.ZOOM_LEVELS.map((level) => el("option", { value: level }, `${level}%`)),
  );
  synced.push(() => (zoom.value = state.view.zoom));

  root.append(
    button("undo", "Undo", store.undo, (node) => (node.disabled = !store.canUndo())),
    button("redo", "Redo", store.redo, (node) => (node.disabled = !store.canRedo())),
    button("print", "Print", () => window.print()),
    divider(),
    zoom,
    divider(),
    formatToggle("B", "Bold", "bold", "tool-bold"),
    formatToggle("I", "Italic", "italic", "tool-italic"),
    formatToggle("U", "Underline", "underline", "tool-underline"),
    formatToggle("S", "Strikethrough", "strike", "tool-strike"),
    divider(),
    alignButton("left", "left"),
    alignButton("center", "center"),
    alignButton("right", "right"),
    formatToggle("wrap", "Wrap text", "wrap"),
    divider(),
    colorPicker("text", "Text color", "color", DEFAULT_TEXT_COLOR),
    colorPicker("fill", "Fill color", "fill", DEFAULT_FILL_COLOR),
    divider(),
    button("link", "Link", actions.editLink, needsEditable),
    button("clear", "Clear formatting", actions.clearFormatting, needsEditable),
  );

  // A mouse click on a tool must not take focus from the grid, or the arrow keys stop working.
  root.addEventListener("mousedown", (event) => {
    if (event.target.closest("button")) event.preventDefault();
  });

  const sync = () => synced.forEach((run) => run());
  store.subscribe(sync);
  sync();
}
