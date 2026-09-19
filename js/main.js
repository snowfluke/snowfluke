import { downloadXlsx, setLanguage, toggleTheme } from "./actions.js";
import { mountArticle } from "./article.js";
import { blogSheet, loadPosts } from "./blog.js";
import { RESUME_PDF, portfolioSheets } from "./data/portfolio.js";
import { mountFormulaBar } from "./formulabar.js";
import { mountGrid } from "./grid.js";
import { otherLang, t, translateDocument } from "./i18n.js";
import { mountMenubar } from "./menubar.js";
import { menus } from "./menus.js";
import { startRouter } from "./router.js";
import { init, isEditable, replaceSheet, state, subscribe } from "./state.js";
import { mountStatus, syncStatus } from "./status.js";
import { mountTabs } from "./tabs.js";
import { applyTheme, effectiveTheme } from "./theme.js";
import { mountToolbar } from "./toolbar.js";

const byId = (id) => document.getElementById(id);

init([...portfolioSheets, blogSheet([], t("blog.loading"))]);

translateDocument();
document.title = t("page.title");
document.querySelector('meta[name="description"]').content = t("page.description");
byId("download-pdf").href = RESUME_PDF;

mountMenubar(byId("menus"), menus);
mountStatus(byId("status"));
mountToolbar(byId("toolbar"));
mountFormulaBar(byId("formulabar"));
mountGrid(byId("grid"));
mountArticle(byId("article"));
mountTabs(byId("tabs"));
subscribe(syncStatus);
// CSS hides the all-disabled toolbar on a phone while the sheet is locked.
const app = byId("app");
const markEditable = () => (app.dataset.editable = String(isEditable()));
subscribe(markEditable);
byId("download-xlsx").addEventListener("click", downloadXlsx);

// The language button names the language it switches to. The theme button names the theme
// it switches to.
const langButton = byId("switch-lang");
langButton.textContent = otherLang;
langButton.addEventListener("click", () => setLanguage(otherLang));

const themeButton = byId("switch-theme");
themeButton.addEventListener("click", toggleTheme);
const syncTheme = () => {
  applyTheme(state.view.theme);
  themeButton.textContent = t(
    effectiveTheme() === "dark" ? "header.theme.light" : "header.theme.dark",
  );
};
subscribe(syncTheme);
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", syncTheme);
syncTheme();
startRouter();

loadPosts()
  .then((posts) => replaceSheet(blogSheet(posts, posts.length ? null : t("blog.empty"))))
  .catch(() => replaceSheet(blogSheet([], t("blog.failed"))));
