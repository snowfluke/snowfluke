// ponytail: a CommonMark subset, not a full parser. Covers headings, paragraphs, fenced code,
// blockquotes, lists (nested by indent), tables, rules, images, links and emphasis. Raw HTML is
// escaped, never passed through. Swap for a real parser if posts need more.
import { escapeHtml, isExternalUrl, safeUrl } from "./utils.js";

const FENCE = /^(```|~~~)\s*([\w+-]*)\s*$/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const RULE = /^ {0,3}(\*{3,}|-{3,}|_{3,})\s*$/;
const QUOTE = /^ {0,3}>\s?/;
const LIST_ITEM = /^( {0,3})([-*+]|\d+[.)])\s+(.*)$/;
const TABLE_DIVIDER = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Reads a leading "---" block of "key: value" lines.
export function parseFrontmatter(source) {
  const text = source.replace(/\r\n?/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!match) return { meta: {}, body: text };
  const meta = {};
  for (const line of match[1].split("\n")) {
    const pair = /^([\w-]+):\s*(.*)$/.exec(line);
    if (pair) meta[pair[1]] = pair[2].trim().replace(/^(["'])(.*)\1$/, "$2");
  }
  return { meta, body: text.slice(match[0].length) };
}

export function renderMarkdown(source) {
  return renderBlocks(source.replace(/\r\n?/g, "\n").split("\n"));
}

function startsBlock(line) {
  return (
    FENCE.test(line) ||
    HEADING.test(line) ||
    RULE.test(line) ||
    QUOTE.test(line) ||
    LIST_ITEM.test(line)
  );
}

function renderBlocks(lines) {
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(fence[1])) code.push(lines[i++]);
      i++;
      const lang = fence[2] ? ` class="language-${escapeHtml(fence[2])}"` : "";
      out.push(`<pre><code${lang}>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level} id="${slugify(heading[2])}">${renderInline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    if (RULE.test(line)) {
      out.push("<hr>");
      i++;
      continue;
    }

    if (QUOTE.test(line)) {
      const quoted = [];
      while (i < lines.length && QUOTE.test(lines[i])) quoted.push(lines[i++].replace(QUOTE, ""));
      out.push(`<blockquote>${renderBlocks(quoted)}</blockquote>`);
      continue;
    }

    if (LIST_ITEM.test(line)) {
      const [html, next] = renderList(lines, i);
      out.push(html);
      i = next;
      continue;
    }

    if (line.includes("|") && TABLE_DIVIDER.test(lines[i + 1] ?? "")) {
      const rows = [];
      while (i < lines.length && lines[i].includes("|")) rows.push(lines[i++]);
      out.push(renderTable(rows));
      continue;
    }

    const paragraph = [];
    while (i < lines.length && lines[i].trim() && !(paragraph.length && startsBlock(lines[i]))) {
      paragraph.push(lines[i++]);
    }
    out.push(`<p>${renderInline(paragraph.join("\n"))}</p>`);
  }

  return out.join("\n");
}

function renderList(lines, start) {
  const ordered = /\d/.test(LIST_ITEM.exec(lines[start])[2]);
  const items = [];
  let i = start;

  while (i < lines.length) {
    const match = LIST_ITEM.exec(lines[i]);
    if (!match || /\d/.test(match[2]) !== ordered) break;
    const indent = match[1].length + match[2].length + 1;
    const rest = [];
    i++;
    // Indented lines, and blank lines followed by an indented line, belong to this item.
    while (i < lines.length) {
      const blank = !lines[i].trim();
      const nextIndented = /^\s{2,}\S/.test(lines[i + 1] ?? "");
      if (blank ? !nextIndented : !/^\s{2,}/.test(lines[i])) break;
      rest.push(lines[i].slice(Math.min(indent, lines[i].search(/\S|$/))));
      i++;
    }
    const nested = rest.length ? `\n${renderBlocks(rest)}` : "";
    items.push(`<li>${renderInline(match[3])}${nested}</li>`);
    while (i < lines.length && !lines[i].trim() && LIST_ITEM.test(lines[i + 1] ?? "")) i++;
  }

  const tag = ordered ? "ol" : "ul";
  return [`<${tag}>\n${items.join("\n")}\n</${tag}>`, i];
}

function splitRow(row) {
  return row
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTable(rows) {
  const aligns = splitRow(rows[1]).map((cell) => {
    if (cell.startsWith(":") && cell.endsWith(":")) return "center";
    if (cell.endsWith(":")) return "right";
    return cell.startsWith(":") ? "left" : "";
  });
  const renderCells = (row, tag) =>
    splitRow(row)
      .map((cell, n) => {
        const align = aligns[n] ? ` style="text-align:${aligns[n]}"` : "";
        return `<${tag}${align}>${renderInline(cell)}</${tag}>`;
      })
      .join("");
  const body = rows
    .slice(2)
    .map((row) => `<tr>${renderCells(row, "td")}</tr>`)
    .join("\n");
  return `<div class="table-scroll"><table>\n<thead><tr>${renderCells(rows[0], "th")}</tr></thead>\n<tbody>\n${body}\n</tbody>\n</table></div>`;
}

function anchor(url) {
  const href = safeUrl(url);
  const external = isExternalUrl(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `<a href="${href}"${external}>`;
}

function renderInline(text) {
  // Finished HTML goes into the stash so later passes cannot touch it. The text is escaped
  // first, so a raw "<" can only come from a "<n>" stash marker.
  const stash = [];
  const keep = (html) => `<${stash.push(html) - 1}>`;

  return escapeHtml(text)
    .replace(/(`+)\s?([\s\S]*?[^`])\s?\1(?!`)/g, (_, _ticks, code) => keep(`<code>${code}</code>`))
    .replace(/\\([\\`*_{}[\]()#+\-.!~|])/g, (_, char) => keep(char))
    .replace(/&lt;((?:https?:\/\/|mailto:)[^\s&]+)&gt;/g, (_, url) =>
      keep(`${anchor(url)}${url}</a>`),
    )
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) =>
      keep(`<img src="${safeUrl(src)}" alt="${alt}" loading="lazy">`),
    )
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      (_, label, url) => `${keep(anchor(url))}${label}${keep("</a>")}`,
    )
    .replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, "<strong>$2</strong>")
    .replace(/(^|[^\w*])([*_])(?=\S)([^*_]*?\S)\2(?!\w)/g, "$1<em>$3</em>")
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, "<del>$1</del>")
    .replace(/ {2,}\n/g, "<br>\n")
    .replace(/<(\d+)>/g, (_, n) => stash[Number(n)]);
}
