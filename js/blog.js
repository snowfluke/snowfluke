import { t } from "./i18n.js";
import { header, linked, sheetFromRows, wrapped } from "./sheet.js";

export const BLOG_ID = "blog";
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const WORDS_PER_MINUTE = 200;

export const articleHash = (slug) => `#/${BLOG_ID}/${slug}`;
export const readingMinutes = (words) => Math.max(1, Math.round(words / WORDS_PER_MINUTE));

// note replaces the post rows while posts load, or when loading fails.
export function blogSheet(posts, note) {
  const rows = posts.map((post) => [
    post.date,
    { ...linked(post.title, articleHash(post.slug)), bold: true },
    post.category,
    t("blog.minutes", { minutes: readingMinutes(post.words) }),
    wrapped(post.excerpt),
  ]);
  return sheetFromRows({
    id: BLOG_ID,
    name: t("blog.sheet"),
    colWidths: [130, 420, 160, 90, 620],
    rows: [
      [
        header(t("blog.date")),
        header(t("blog.title")),
        header(t("blog.category")),
        header(t("blog.read")),
        header(t("blog.excerpt")),
      ],
      ...(note ? [[null, { value: note, italic: true }]] : rows),
    ],
    rowCount: Math.max(rows.length + 15, 30),
  });
}

async function fetchOk(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
}

export async function loadPosts() {
  const posts = await (await fetchOk("blog/index.json")).json();
  return posts.filter((post) => SLUG.test(post.slug));
}

export async function loadArticle(slug) {
  if (!SLUG.test(slug)) throw new Error(`Bad slug: ${slug}`);
  // The parser loads with the first article, in parallel with the post itself.
  const [{ parseFrontmatter, renderMarkdown }, response] = await Promise.all([
    import("./markdown.js"),
    fetchOk(`blog/${slug}.md`),
  ]);
  const source = await response.text();
  const { meta, body } = parseFrontmatter(source);
  // A draft stays out of index.json. It must also not open by a typed URL.
  if (meta.draft === "true") throw new Error(`Draft: ${slug}`);
  return { meta, html: renderMarkdown(body), words: body.split(/\s+/).filter(Boolean).length };
}
