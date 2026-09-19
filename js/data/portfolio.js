// Portfolio sheets. Every sheet here is locked in the UI.
// This file holds the structure, the links and the numbers. The words live in content.en.js
// and content.id.js. GitHub and npm numbers are a snapshot: update STATS_DATE with them.
import { lang } from "../i18n.js";
import { header, linked, sheetFromRows, wrapped } from "../sheet.js";
import en from "./content.en.js";
import id from "./content.id.js";

const c = { en, id }[lang];

const EMAIL = "awalariansyah7@gmail.com";
const STATS_DATE = "2026-09";
const RESUME_FILES = {
  en: "downloads/awal-ariansyah-resume.pdf",
  id: "downloads/awal-ariansyah-resume-id.pdf",
};
export const RESUME_PDF = RESUME_FILES[lang];

const bold = (value) => ({ value, bold: true });
const dated = (text) => text.replace("{date}", STATS_DATE);

// About also holds skills and awards. Each is a short A/B list, so one sheet reads better
// than three tabs. A phone shows columns A and B, so every sheet keeps its story there.
const about = sheetFromRows({
  id: "about",
  name: c.sheets.about,
  colWidths: [180, 680],
  rows: [
    [{ value: "Awal Ariansyah", header: true, size: "large" }],
    [null, wrapped(c.about.headline)],
    [],
    [c.about.email, linked(EMAIL, `mailto:${EMAIL}`)],
    [c.about.availability, wrapped(c.about.availabilityText)],
    [c.about.resume, linked(c.about.resumeLink, RESUME_PDF)],
    ["GitHub", linked("snowfluke", "https://github.com/snowfluke")],
    [
      "LinkedIn",
      linked("linkedin.com/in/awalariansyah", "https://www.linkedin.com/in/awalariansyah/"),
    ],
    [],
    [header(c.about.summary)],
    ...c.about.summaryLines.map((line) => [null, wrapped(dated(line))]),
    [],
    [header(c.about.skills)],
    ...c.about.skillRows.map(([area, items]) => [wrapped(area), wrapped(items)]),
    [],
    [header(c.about.education)],
    [c.about.educationPeriod, wrapped(c.about.educationText)],
    [],
    [header(c.about.awards)],
    ...c.about.awardRows.map(([result, year, event]) => [`${result}, ${year}`, wrapped(event)]),
    [],
    [null, wrapped(c.about.tip)],
  ],
});

// Column A holds company, role, period and location on four rows. Column B holds the highlights.
function jobRows(job) {
  const meta = [
    { value: job.company, bold: true, wrap: true },
    wrapped(job.role),
    job.period.replace("{present}", c.experience.present),
    job.location,
  ];
  const length = Math.max(meta.length, job.highlights.length);
  return Array.from({ length }, (_, n) => [
    meta[n] ?? null,
    job.highlights[n] ? wrapped(job.highlights[n]) : null,
  ]);
}

const experience = sheetFromRows({
  id: "experience",
  name: c.sheets.experience,
  colWidths: [260, 680],
  rows: [
    c.experience.headers.map(header),
    ...c.experience.jobs.flatMap((job, n) => (n === 0 ? jobRows(job) : [[], ...jobRows(job)])),
  ],
});

// [repository, npm downloads last month, GitHub stars, stack]. Column C holds exact counts.
// The prose in content.*.js rounds the same numbers down.
const PPU = "PT-Perkasa-Pilar-Utama";
const PROJECTS = [
  [`${PPU}/ppu-paddle-ocr`, "75771", "136", "TypeScript, ONNX Runtime"],
  [`${PPU}/ppu-ocv`, "76438", "30", "TypeScript, OpenCV.js"],
  [`${PPU}/ppu-yolo-onnx-inference`, "65", "41", "TypeScript, ONNX Runtime"],
  [`${PPU}/ppu-pdf`, "385", "17", "TypeScript"],
  [`${PPU}/ppu-doclayout`, "262", "14", "TypeScript, ONNX Runtime"],
  [`${PPU}/testate`, null, "12", "TypeScript, Hono, SolidJS"],
  ["snowfluke/indo-g2p", "720", "8", "TypeScript"],
  [`${PPU}/ppu-uniface`, "49", "5", "TypeScript, ONNX Runtime"],
  ["snowfluke/tiny6-paddleocr", null, "1", "TypeScript, WASM SIMD"],
];
const lastProjectRow = PROJECTS.length + 1;

// The project name is the link, so a phone shows it.
const openSource = sheetFromRows({
  id: "open-source",
  name: c.sheets.openSource,
  colWidths: [250, 560, 150, 90, 250],
  rows: [
    c.openSource.headers.map(header),
    ...PROJECTS.map(([repo, downloads, stars, stack]) => {
      const name = repo.split("/")[1];
      return [
        { value: name, bold: true, link: `https://github.com/${repo}` },
        wrapped(c.openSource.what[name]),
        downloads,
        stars,
        stack,
      ];
    }),
    [],
    [
      bold(c.openSource.total),
      { value: dated(c.openSource.totalNote), italic: true },
      { value: `=SUM(C2:C${lastProjectRow})`, bold: true },
      { value: `=SUM(D2:D${lastProjectRow})`, bold: true },
    ],
  ],
});

export const portfolioSheets = [about, experience, openSource];
