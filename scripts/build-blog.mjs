// Scans blog/*.md and writes blog/index.json, the post list that the Blog sheet shows.
// Run it after you add, rename or edit a post: npm run blog
import { readFile, readdir, writeFile } from "node:fs/promises";
import { parseFrontmatter } from "../js/markdown.js";

const BLOG_DIR = new URL("../blog/", import.meta.url);
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const posts = [];
const problems = [];

for (const file of (await readdir(BLOG_DIR)).filter((name) => name.endsWith(".md")).toSorted()) {
  const slug = file.slice(0, -3);
  const { meta, body } = parseFrontmatter(await readFile(new URL(file, BLOG_DIR), "utf8"));

  if (meta.draft === "true") continue;
  if (!SLUG.test(slug))
    problems.push(`${file}: name the file with lowercase letters, digits and hyphens`);
  if (!meta.title) problems.push(`${file}: frontmatter needs a title`);
  if (!DATE.test(meta.date ?? "")) problems.push(`${file}: frontmatter needs a date as YYYY-MM-DD`);

  posts.push({
    slug,
    title: meta.title,
    date: meta.date,
    category: meta.category ?? "",
    excerpt: meta.excerpt ?? "",
    words: body.split(/\s+/).filter(Boolean).length,
  });
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

const sorted = posts.toSorted(
  (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
);
await writeFile(new URL("index.json", BLOG_DIR), `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`blog/index.json: ${posts.length} post${posts.length === 1 ? "" : "s"}`);
