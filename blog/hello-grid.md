---
title: My portfolio is a spreadsheet
date: 2026-09-19
category: Meta
excerpt: No framework, no bundler. A grid, a formula engine, and a markdown parser.
---

I spend my days turning documents into rows and columns. My portfolio may as well be a spreadsheet.

## The rules I set

I wrote the site with HTML, CSS, and JavaScript modules. The browser runs the source files as they are. No framework and no bundler sit between the code and the page.

Two small parsers carry the load:

- A formula engine. It reads `=SUM(A1:A5)` and catches a cell that points at itself.
- A markdown parser. It turns the file behind this post into the page you read now.

## Try it

1. Press `+` at the bottom left. You get a sheet of your own.
2. Type numbers into `A1` to `A5`.
3. Type `=AVERAGE(A1:A5)` into `A6`.

Your browser keeps the sheet in localStorage. **File > Clear storage** deletes it. The portfolio sheets stay locked, and **File > Duplicate sheet** gives you a copy to edit.

## How I publish a post

I add one markdown file to the `blog` folder:

```md
---
title: My portfolio is a spreadsheet
date: 2026-09-19
category: Meta
excerpt: One line for the Blog sheet.
---

The post starts here.
```

Then I run `npm run blog`. The script reads the frontmatter of each file and writes `blog/index.json`. The Blog sheet shows one row for each entry.
