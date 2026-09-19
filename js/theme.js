// Theme is "system", "light" or "dark". The inline script in index.html applies a saved theme
// before the first paint. This module handles every change after that.
const root = document.documentElement;
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

export const effectiveTheme = () => root.dataset.theme ?? (systemDark.matches ? "dark" : "light");

export function applyTheme(theme) {
  if (theme === "light" || theme === "dark") root.dataset.theme = theme;
  else delete root.dataset.theme;
  // The browser chrome on phones takes its color from this tag.
  const paper = getComputedStyle(root).getPropertyValue("--paper").trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", paper);
}

// cssColor("--ink") reads a token as "#rrggbb", which <input type="color"> needs.
export const cssColor = (token) => getComputedStyle(root).getPropertyValue(token).trim();
