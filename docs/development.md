# Development

How to run, write, and deploy the site. HTML, CSS, and JavaScript modules. No framework and no bundler. The browser runs the source files as they are.

## Run

```sh
bun install     # oxlint and oxfmt only
npm run dev     # builds blog/index.json, then serves http://localhost:3000
```

The site needs an HTTP server. `fetch` does not work from `file://`.

## Write a post

1. Add `blog/my-post.md`. Name the file with lowercase letters, digits, and hyphens.
2. Start the file with frontmatter:

   ```md
   ---
   title: My post
   date: 2026-09-19
   category: Notes
   excerpt: One line for the Blog sheet.
   ---
   ```

3. Run `npm run blog`. The script writes `blog/index.json`.
4. Commit the post and `blog/index.json`.

`draft: true` in the frontmatter keeps a post out of the list and blocks its URL. Put images in `blog/` and link them relative to the post: `![alt](img/shot.png)`.

The parser supports headings, lists, fenced code, quotes, tables, rules, links, images, bold, italic, and strikethrough. It escapes raw HTML. `tests/fixtures/markdown-reference.md` shows one sample of each. It lives outside `blog/`, so the site never serves it.

## Change the portfolio

Edit `js/data/portfolio.js`. Each sheet is a list of rows. These sheets are locked in the UI.

- Keep the story of a sheet in columns A and B. A phone fits those two columns to the screen and wraps every cell.
- The GitHub numbers are a snapshot. Refresh them with `gh`, then update `STATS_DATE`.
- Claim a skill only from a repo that has your commits. Org membership is not proof.
- Do not name private repos or clients.

## Resume and downloads

The header has two downloads.

- `[ xlsx ]` builds the workbook in the browser with `js/xlsx.js`. It holds every sheet, with formulas, links, bold, wrap, and column widths.
- `[ pdf ]` serves `downloads/awal-ariansyah-resume.pdf`.

The resume source is `resume.html` with `css/resume.css`. After an edit, run `npm run resume`. The script prints the page with a headless Chrome and fails if the result is not one A4 page. Commit the PDF.

The resume repeats facts from `js/data/portfolio.js`. When you change one, change the other.

## How the data moves

```
js/data/portfolio.js --+
blog/index.json -------+--> state.js --> grid, toolbar, formula bar, tabs, article
localStorage ----------+        |
                                +--> localStorage (user sheets and view settings only)
```

Portfolio sheets never go to localStorage. A returning visitor gets your new content.

## Layout

| Path                                      | Job                                                            |
| ----------------------------------------- | -------------------------------------------------------------- |
| `index.html`                              | Page shell                                                     |
| `css/tokens.css`                          | Colors, type, spacing                                          |
| `css/*.css`                               | One file for each UI area                                      |
| `js/state.js`                             | Store: sheets, selection, undo, save                           |
| `js/formula.js`                           | Formula parser and evaluator                                   |
| `js/markdown.js`                          | Markdown parser                                                |
| `js/xlsx.js`                              | XLSX and zip writer                                            |
| `js/clipboard.js`                         | System clipboard writes: tab-separated text plus an HTML table |
| `resume.html`, `scripts/build-resume.mjs` | Resume page and its PDF build                                  |
| `js/actions.js`, `js/menus.js`            | Commands and the menu definitions                              |
| `js/grid.js` and the other UI files       | One file for each UI area                                      |
| `scripts/build-blog.mjs`                  | Writes `blog/index.json`                                       |
| `tests/`                                  | `node:test` checks for the parsers and the XLSX writer         |

## Checks

```sh
npm run check   # oxlint, oxfmt --check, tests
npm run fmt     # format
```

## Deploy

Any static host works. Run `npm run blog` before you deploy, or set it as the build command. There is no output folder. The repo root is the site.
