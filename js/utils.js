export function columnLetter(col) {
  let letter = "";
  for (let n = col; n > 0; n = Math.floor((n - 1) / 26)) {
    letter = String.fromCharCode(65 + ((n - 1) % 26)) + letter;
  }
  return letter;
}

export function columnIndex(letters) {
  let col = 0;
  for (const ch of letters) col = col * 26 + (ch.charCodeAt(0) - 64);
  return col;
}

export function cellKey(row, col) {
  return columnLetter(col) + row;
}

export function parseKey(key) {
  const match = /^([A-Z]+)([0-9]+)$/.exec(key);
  if (!match) return null;
  return { row: Number(match[2]), col: columnIndex(match[1]) };
}

export function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Blocks javascript:, data: and other schemes that run code when clicked.
export function safeUrl(url) {
  // Browsers drop tabs and newlines inside a URL, so "java\tscript:" would pass the scheme test.
  const trimmed = String(url)
    .replace(/[\t\n\r]/g, "")
    .trim();
  if (/^(https?:|mailto:|#|\/|\.\/|\.\.\/)/i.test(trimmed)) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return "#";
  return trimmed;
}

export function isExternalUrl(url) {
  return /^(https?:|mailto:)/i.test(url);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// el("button", { class: "x", onclick: fn }, "text", childNode)
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (name.startsWith("on")) node.addEventListener(name.slice(2), value);
    else if (name === "class") node.className = value;
    else if (name === "dataset") Object.assign(node.dataset, value);
    else if (name === "style") Object.assign(node.style, value);
    else node.setAttribute(name, value === true ? "" : value);
  }
  node.append(...children.filter((child) => child !== null && child !== undefined));
  return node;
}
