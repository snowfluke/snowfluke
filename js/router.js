import { BLOG_ID } from "./blog.js";
import { showArticle, showSheet, state, subscribe } from "./state.js";

// Routes: #/<sheetId> shows a sheet, #/blog/<slug> shows an article.
const currentHash = () =>
  state.article ? `#/${state.activeId}/${state.article}` : `#/${state.activeId}`;

function apply() {
  const [sheetId, slug] = location.hash.replace(/^#\/?/, "").split("/");
  if (sheetId === BLOG_ID && slug) showArticle(BLOG_ID, slug);
  else if (!showSheet(sheetId)) showSheet(state.sheets[0].id);
}

export function go(sheetId, slug) {
  const target = slug ? `#/${sheetId}/${slug}` : `#/${sheetId}`;
  if (location.hash === target) apply();
  else location.hash = target;
}

export function startRouter() {
  window.addEventListener("hashchange", apply);
  // Undo, redo and a bad URL change the active sheet without a hash change. Fix the URL then.
  subscribe((change) => {
    if (change === "sheets" && location.hash !== currentHash()) {
      history.replaceState(null, "", currentHash());
    }
  });
  apply();
}
