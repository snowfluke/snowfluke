import { normalizeSheet } from "./sheet.js";

const KEY = "snowfluke.sheets.v1";

// Only user sheets and view settings are stored. Portfolio sheets always come from source,
// so a returning visitor sees new content.
export function loadSaved() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    if (typeof parsed !== "object" || parsed === null) return null;
    const userSheets = Array.isArray(parsed.userSheets)
      ? parsed.userSheets.map(normalizeSheet).filter(Boolean)
      : [];
    const view = typeof parsed.view === "object" && parsed.view !== null ? parsed.view : {};
    return { userSheets, view };
  } catch {
    return null;
  }
}

// Returns false when the browser blocks storage or the quota is full.
export function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearSaved() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Storage is blocked, so there is nothing to clear.
  }
}
