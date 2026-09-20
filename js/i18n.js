// Interface language. English is the base. A missing key in another locale falls back to it.
// The language is fixed for the life of the page. A switch saves the choice and reloads,
// because menus, toolbar and sheets build their text once.
import en from "./locales/en.js";
import { loadSaved } from "./storage.js";

export const LANGUAGES = ["en", "id"];

// Order: ?lang= in the URL (a link someone shared), then the saved choice, then the browser.
function detect() {
  const param = new URLSearchParams(globalThis.location?.search ?? "").get("lang");
  if (LANGUAGES.includes(param)) return param;
  const saved = loadSaved()?.view?.lang;
  if (LANGUAGES.includes(saved)) return saved;
  return globalThis.navigator?.language?.toLowerCase().startsWith("id") ? "id" : "en";
}

export const lang = detect();

// English is always here, as the fallback. Another language loads only when it is active,
// so an English visitor does not download Indonesian text.
const active = lang === "en" ? en : (await import(`./locales/${lang}.js`)).default;
export const otherLang = lang === "en" ? "id" : "en";

// t("copied.many", { count: 3 }) fills "{count}" in the text.
export function t(key, params = {}) {
  const text = active[key] ?? en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? "");
}

// English has a plural form. Indonesian does not, so its ".many" text serves both.
export function plural(key, count) {
  return t(count === 1 ? `${key}.one` : `${key}.many`, { count });
}

// Fills static markup: <span data-i18n="key">, and data-i18n-title / data-i18n-aria for attributes.
export function translateDocument(root = document) {
  for (const node of root.querySelectorAll("[data-i18n]")) node.textContent = t(node.dataset.i18n);
  for (const node of root.querySelectorAll("[data-i18n-title]"))
    node.title = t(node.dataset.i18nTitle);
  for (const node of root.querySelectorAll("[data-i18n-aria]")) {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  }
  document.documentElement.lang = lang;
}
