import { t } from "./i18n.js";
import { isEditable, state } from "./state.js";

const FLASH_MS = 2600;
let node = null;
let timer = 0;

function steadyText() {
  if (state.article) return t("status.reading");
  if (!isEditable()) return t("status.readOnly");
  return t(state.saved ? "status.saved" : "status.blocked");
}

export function mountStatus(element) {
  node = element;
  syncStatus();
}

// A flash holds the text until its timer ends. A sheet change ends it early.
export function syncStatus(change) {
  if (change === "sheets") {
    clearTimeout(timer);
    timer = 0;
  }
  if (timer) return;
  node.textContent = steadyText();
  node.classList.remove("flash");
}

// Shows a short message, then returns to the steady text.
export function flashStatus(message) {
  clearTimeout(timer);
  node.textContent = message;
  node.classList.add("flash");
  timer = setTimeout(() => {
    timer = 0;
    syncStatus();
  }, FLASH_MS);
}

export const lockedMessage = () => t("status.locked");
