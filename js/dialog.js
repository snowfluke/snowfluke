import { t } from "./i18n.js";
import { el } from "./utils.js";

const dialog = document.getElementById("dialog");

// Opens the shared <dialog>. Resolves with the form's return value: "ok", or "" when dismissed.
function open(title, body, buttons) {
  const form = el(
    "form",
    { method: "dialog", class: "dialog-form" },
    el("h2", {}, title),
    ...body,
    el("div", { class: "dialog-actions" }, ...buttons),
  );
  dialog.replaceChildren(form);
  dialog.returnValue = "";
  dialog.showModal();
  return new Promise((resolve) => {
    dialog.addEventListener("close", () => resolve(dialog.returnValue), { once: true });
  });
}

// Not a submit button. Enter in a text input fires the first submit button, which must be OK.
const cancelButton = () =>
  el("button", { type: "button", onclick: () => dialog.close("") }, t("dialog.cancel"));
const okButton = (label, danger) =>
  el(
    "button",
    { type: "submit", value: "ok", class: danger ? "primary danger" : "primary" },
    label,
  );

export const isDialogOpen = () => dialog.open;

// Resolves with the typed text, or null when cancelled.
export async function ask({
  title,
  label,
  value = "",
  placeholder = "",
  confirmLabel = t("dialog.ok"),
}) {
  const input = el("input", {
    type: "text",
    name: "answer",
    value,
    placeholder,
    autocomplete: "off",
  });
  const result = open(
    title,
    [el("label", {}, label, input)],
    [cancelButton(), okButton(confirmLabel)],
  );
  input.select();
  return (await result) === "ok" ? input.value : null;
}

export async function confirmAction({ title, message, confirmLabel }) {
  return (
    (await open(title, [el("p", {}, message)], [cancelButton(), okButton(confirmLabel, true)])) ===
    "ok"
  );
}

export function inform({ title, body }) {
  return open(title, body, [okButton(t("dialog.close"))]);
}
