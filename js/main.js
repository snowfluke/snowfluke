import { downloadXlsx } from "./actions.js";
import { mountArticle } from "./article.js";
import { blogSheet, loadPosts } from "./blog.js";
import { portfolioSheets } from "./data/portfolio.js";
import { mountFormulaBar } from "./formulabar.js";
import { mountGrid } from "./grid.js";
import { mountMenubar } from "./menubar.js";
import { menus } from "./menus.js";
import { startRouter } from "./router.js";
import { init, isEditable, replaceSheet, subscribe } from "./state.js";
import { mountStatus, syncStatus } from "./status.js";
import { mountTabs } from "./tabs.js";
import { mountToolbar } from "./toolbar.js";

const byId = (id) => document.getElementById(id);

init([...portfolioSheets, blogSheet([], "Loading posts...")]);

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
startRouter();

loadPosts()
  .then((posts) => replaceSheet(blogSheet(posts, posts.length ? null : "No posts yet.")))
  .catch(() =>
    replaceSheet(
      blogSheet([], "Posts did not load. Serve this folder over HTTP and run: npm run blog"),
    ),
  );
