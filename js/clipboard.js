// Writes to the system clipboard without the browser's "copy" event. That event does not fire
// when no text is selected (Safari), and grid cells are not selectable text.
import { toHtmlTable } from "./sheet.js";

// Works on plain http and in old browsers, where navigator.clipboard does not exist.
function legacyCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;opacity:0";
  document.body.append(area);
  const focused = document.activeElement;
  area.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  area.remove();
  focused?.focus();
  return copied;
}

// cells is rows of { text, style }. An in-app link such as "#/blog/post" becomes a full URL,
// so it still works after a paste into a mail or a document.
function htmlFor(cells) {
  const absolute = cells.map((row) =>
    row.map(({ text, style }) => ({
      text,
      style: style.link ? { ...style, link: new URL(style.link, location.href).href } : style,
    })),
  );
  return toHtmlTable(absolute);
}

// Call this inside a key or click handler. Browsers allow clipboard writes only then.
export async function writeClipboard({ text, cells }) {
  try {
    if (navigator.clipboard?.write && window.ClipboardItem) {
      const item = new ClipboardItem({
        "text/plain": new Blob([text], { type: "text/plain" }),
        "text/html": new Blob([htmlFor(cells)], { type: "text/html" }),
      });
      await navigator.clipboard.write([item]);
      return true;
    }
  } catch {
    // Fall through to the plain-text paths.
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return legacyCopy(text);
  }
}

// For the native copy and cut events (browser menu, context menu).
export function fillClipboardEvent(event, { text, cells }) {
  event.clipboardData.setData("text/plain", text);
  event.clipboardData.setData("text/html", htmlFor(cells));
  event.preventDefault();
}
