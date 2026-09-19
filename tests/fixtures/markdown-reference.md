---
title: Markdown this blog supports
date: 2026-09-18
category: Reference
draft: true
excerpt: One sample of each markdown feature that the parser of this site renders.
---

I keep this post as a test page. If a sample below looks wrong, the parser has a bug.

## Text

Plain text, **bold**, _italic_, ~~strikethrough~~, and `inline code`. A backslash keeps a symbol as it is: \*not italic\*.

A [link to GitHub](https://github.com/snowfluke), a bare link <https://www.awala.my.id/>, and a [jump to the table](#table).

## Lists

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

1. Step one
2. Step two
3. Step three

## Quote

> A quote can hold **bold** text.
> It can run over two lines.

## Code

```js
const cells = { A1: "2", A2: "=A1*21" };
console.log(cells.A2 < 100); // <b>tags</b> stay text
```

## Table

| Function | Example          | Result |
| -------- | ---------------- | -----: |
| SUM      | `=SUM(1, 2, 3)`  |      6 |
| AVERAGE  | `=AVERAGE(2, 4)` |      3 |
| MAX      | `=MAX(4, 9)`     |      9 |

---

Raw HTML does not run: <script>alert("no")</script>
