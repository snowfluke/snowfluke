// Prints resume.html and resume-id.html to PDF files in downloads/ with a headless Chrome.
// Run it after you edit a resume page or css/resume.css: npm run resume
// Set CHROME to the browser binary if it is not in one of the default places.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CANDIDATES = [
  process.env.CHROME,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

const chrome = CANDIDATES.find((path) => path && existsSync(path));
if (!chrome) {
  console.error("No Chrome found. Set CHROME=/path/to/chrome and run again.");
  process.exit(1);
}

const RESUMES = [
  ["resume.html", "awal-ariansyah-resume.pdf"],
  ["resume-id.html", "awal-ariansyah-resume-id.pdf"],
];
mkdirSync(new URL("../downloads/", import.meta.url), { recursive: true });

let failed = false;
for (const [page, file] of RESUMES) {
  const source = new URL(`../${page}`, import.meta.url);
  const target = fileURLToPath(new URL(`../downloads/${file}`, import.meta.url));
  execFileSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      `--print-to-pdf=${target}`,
      source.href,
    ],
    { stdio: "ignore" },
  );
  // The resume must stay on one page. "/Type /Page" marks a page object, "/Pages" the page tree.
  const pages = readFileSync(target, "latin1").match(/\/Type\s*\/Page\b(?!s)/g)?.length ?? 0;
  console.log(`downloads/${file}: ${pages} page${pages === 1 ? "" : "s"}`);
  if (pages !== 1) failed = true;
}

if (failed) {
  console.error("Each resume must fit one A4 page. Cut text or tighten css/resume.css.");
  process.exit(1);
}
