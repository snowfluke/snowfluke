import { BLOG_ID, loadArticle, readingMinutes } from "./blog.js";
import * as store from "./state.js";
import { el } from "./utils.js";

const { state } = store;
const SITE_TITLE = document.title;

const backLink = () =>
  el("a", { class: "article-back", href: `#/${BLOG_ID}` }, "[ back to the Blog sheet ]");

export function mountArticle(root) {
  let shown = null;

  function renderArticle({ meta, html, words }) {
    const details = [meta.date, meta.category, `${readingMinutes(words)} min read`]
      .filter(Boolean)
      .join(" / ");
    const body = el("div", { class: "article-body" });
    // html comes from renderMarkdown, which escapes all source text.
    body.innerHTML = html;
    // Posts reference images relative to the blog folder. The page lives one level up.
    for (const img of body.querySelectorAll("img")) {
      const src = img.getAttribute("src");
      if (!/^([a-z]+:|\/)/i.test(src)) img.setAttribute("src", `blog/${src}`);
    }
    document.title = `${meta.title ?? shown} - ${SITE_TITLE}`;
    root.replaceChildren(
      el(
        "div",
        { class: "article-page" },
        backLink(),
        el(
          "header",
          {},
          el("h1", {}, meta.title ?? shown),
          el("p", { class: "article-meta" }, details),
        ),
        body,
        backLink(),
      ),
    );
  }

  function renderProblem(slug) {
    root.replaceChildren(
      el(
        "div",
        { class: "article-page" },
        backLink(),
        el("h1", {}, "Post not found"),
        el(
          "p",
          {},
          `No post loads from blog/${slug}.md. Check the link, or run "npm run blog" after you add a post.`,
        ),
      ),
    );
  }

  async function show(slug) {
    shown = slug;
    root.replaceChildren(
      el("div", { class: "article-page" }, el("p", { class: "article-meta" }, "Loading...")),
    );
    root.scrollTop = 0;
    try {
      const article = await loadArticle(slug);
      // The visitor may have moved on while the post loaded.
      if (shown === slug) renderArticle(article);
    } catch {
      if (shown === slug) renderProblem(slug);
    }
  }

  // The router owns the hash, so an in-page anchor scrolls by hand.
  root.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.getAttribute("href").startsWith("#/")) return;
    event.preventDefault();
    // Search inside the article only. A heading id may match an app element id.
    const id = CSS.escape(decodeURIComponent(link.getAttribute("href").slice(1)));
    root.querySelector(`.article-body #${id}`)?.scrollIntoView({ behavior: "smooth" });
  });

  store.subscribe((change) => {
    if (change !== "sheets") return;
    root.hidden = !state.article;
    if (!state.article) {
      shown = null;
      document.title = SITE_TITLE;
    } else if (state.article !== shown) {
      show(state.article);
    }
  });
}
