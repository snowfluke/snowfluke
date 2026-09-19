// Portfolio content. Every sheet here is locked in the UI. Edit this file to change the site.
// GitHub numbers are a snapshot. Update STATS_DATE when you refresh them.
import { header, linked, sheetFromRows, wrapped } from "../sheet.js";

const EMAIL = "awalariansyah7@gmail.com";
const STATS_DATE = "2026-09";
export const RESUME_PDF = "downloads/awal-ariansyah-resume.pdf";
const github = (path) => linked(path, `https://github.com/${path}`);
const bold = (value) => ({ value, bold: true });

// About also holds skills and awards. Each is a short A/B list, so one sheet reads better
// than three tabs.
const about = sheetFromRows({
  id: "about",
  name: "About",
  colWidths: [180, 680],
  rows: [
    [{ value: "Awal Ariansyah", header: true, size: "large" }],
    [
      null,
      wrapped(
        "Backend engineer for OCR and computer vision systems. Team lead of 3 engineers at PT. Perkasa Pilar Utama, Jakarta. Author of an OCR SDK with 75,000+ npm downloads a month.",
      ),
    ],
    [],
    ["Email", linked(EMAIL, `mailto:${EMAIL}`)],
    [
      "Availability",
      wrapped("Open to remote roles. Based in Jakarta (UTC+7). Notice period: 1 month."),
    ],
    ["Resume", linked("Download PDF, one page", RESUME_PDF)],
    ["GitHub", github("snowfluke")],
    [
      "LinkedIn",
      linked("linkedin.com/in/awalariansyah", "https://www.linkedin.com/in/awalariansyah/"),
    ],
    [],
    [header("Summary")],
    [
      null,
      wrapped(
        "Software engineer since 2022. I build OCR and computer vision libraries in TypeScript, and backend systems in Go and TypeScript.",
      ),
    ],
    [
      null,
      wrapped(
        `My open-source OCR SDK, ppu-paddle-ocr, has 75,000+ npm downloads a month. Counted ${STATS_DATE}.`,
      ),
    ],
    [
      null,
      wrapped(
        "I lead a team of 3 engineers in the custom software division at PT. Perkasa Pilar Utama (PPU) and maintain its open-source libraries.",
      ),
    ],
    [],
    [header("Skills")],
    ["Languages", wrapped("TypeScript, JavaScript, Go, Python, Kotlin, SQL")],
    [
      "Backend",
      wrapped(
        "Bun, Node.js, Hono, Elysia, Fiber, Express. REST and OpenAPI, WebSocket, microservices.",
      ),
    ],
    ["Data", wrapped("PostgreSQL, MongoDB, SQLite, Redis, RabbitMQ, Drizzle ORM, S3")],
    [
      "Vision and AI",
      wrapped(
        "ONNX Runtime, PaddleOCR, YOLO, OpenCV.js, face recognition, WASM SIMD, LLM bots, MCP servers",
      ),
    ],
    [
      "Frontend, mobile",
      wrapped("React, Next.js, SolidJS, Tailwind CSS, React Native, Android with Kotlin, Figma"),
    ],
    ["Operations", wrapped("Linux, Docker, GitHub Actions, Nginx, Prometheus, Grafana, Loki")],
    ["Spoken", wrapped("Indonesian (native), English (fluent)")],
    [],
    [header("Education")],
    [
      "Jan 2019 - Dec 2023",
      wrapped("Bachelor's Degree in Informatics Engineering. STMIK Komputama Majenang."),
    ],
    [],
    [header("Awards")],
    [
      "1st place",
      wrapped("Techcomfest 2022 Software Development Competition. Politeknik Negeri Semarang."),
    ],
    [
      "2nd place",
      wrapped("PIKMI 2023 BSI Software Development. Universitas Bina Sarana Informatika."),
    ],
    ["3rd place", wrapped("Cyber 2022 Website Design. Universitas Gorontalo.")],
    ["Top 10 finalist", wrapped("Google Hackfest 2023. Google Developer Student Club Indonesia.")],
    [],
    [
      null,
      wrapped(
        "This site is a working spreadsheet. Press + at the bottom left to add your own sheet. Formulas work: =SUM(A1:A5)",
      ),
    ],
  ],
});

// Column A holds company, role and period on three rows. Column B holds the highlights.
// A phone shows columns A and B, so the story must live there.
const experience = sheetFromRows({
  id: "experience",
  name: "Experience",
  colWidths: [260, 680],
  rows: [
    [header("Company, role, period"), header("Highlights")],
    [
      { value: "PT. Perkasa Pilar Utama", bold: true, wrap: true },
      wrapped(
        "Lead a team of 3 engineers in the custom software division, train new engineers, and direct the AI experiment team in LLM and computer vision work.",
      ),
    ],
    [
      wrapped("Backend Engineer and Team Lead"),
      wrapped(
        "Architected and developed Oksara, the company OCR product, end to end in TypeScript, Bun, and ONNX Runtime. It runs in production at 2 client companies and extracts data from 5 document types: national ID cards, vehicle ownership books, receipts, resumes, and bank statements.",
      ),
    ],
    [
      "Oct 2023 - Present",
      wrapped(
        "Open-sourced the OCR and image processing core of Oksara as ppu-paddle-ocr and ppu-ocv. Each package now has 75,000+ npm downloads a month.",
      ),
    ],
    [
      "Jakarta Utara, Indonesia",
      wrapped(
        "Engineered a payment reconciliation platform, now in production, in Go with 3 services (API gateway, scheduler, data collector) on PostgreSQL, RabbitMQ, and Redis, monitored with Prometheus and Grafana.",
      ),
    ],
    [
      null,
      wrapped(
        "Built an R&D prototype (Mar - Sep 2024): an Android app in Kotlin that sends encrypted, compressed messages over LoRa long-range radio without internet.",
      ),
    ],
    [],
    [
      { value: "PT. BPR Bank Cirebon Jabar (Perseroda)", bold: true, wrap: true },
      wrapped("Designed and prototyped a mobile banking app with 40+ screens in Figma."),
    ],
    [
      wrapped("Mobile Frontend Developer (3-month contract)"),
      wrapped(
        "Implemented the app for Android and iOS in React Native, integrated it with the bank backend, and shipped it to the bank's customers.",
      ),
    ],
    ["Dec 2022 - Feb 2023"],
    ["Cirebon, Indonesia"],
    [],
    [
      { value: "PT. Langitpay Digital Indonesia", bold: true, wrap: true },
      wrapped("Migrated a SQL-based monolithic web app to a NoSQL-based web app."),
    ],
    [wrapped("Backend Developer Intern")],
    ["2022"],
    ["Cilacap, Indonesia"],
  ],
});

// The project name is the link, so a phone (columns A and B) shows it.
// Column C holds exact npm downloads for the last month. Prose rounds the same numbers down.
const openSource = sheetFromRows({
  id: "open-source",
  name: "Open Source",
  colWidths: [250, 560, 150, 90, 250],
  rows: [
    [
      header("Project"),
      header("What it does"),
      header("npm per month"),
      header("Stars"),
      header("Stack"),
    ],
    [
      { ...github("PT-Perkasa-Pilar-Utama/ppu-paddle-ocr"), value: "ppu-paddle-ocr", bold: true },
      wrapped(
        "PaddleOCR SDK for Node.js, Bun, Deno, browsers, and React Native. 75,000+ npm downloads a month, 185,000+ in total. About 140 ms for a receipt at 99.5% character accuracy on the published benchmark.",
      ),
      "75771",
      "136",
      "TypeScript, ONNX Runtime",
    ],
    [
      { ...github("PT-Perkasa-Pilar-Utama/ppu-ocv"), value: "ppu-ocv", bold: true },
      wrapped(
        "Chainable, type-safe image processing on top of OpenCV.js. 76,000+ npm downloads a month.",
      ),
      "76438",
      "30",
      "TypeScript, OpenCV.js",
    ],
    [
      {
        ...github("PT-Perkasa-Pilar-Utama/ppu-yolo-onnx-inference"),
        value: "ppu-yolo-onnx-inference",
        bold: true,
      },
      wrapped("YOLOv11 object detection in Bun and the browser. No Python."),
      "65",
      "41",
      "TypeScript, ONNX Runtime",
    ],
    [
      { ...github("PT-Perkasa-Pilar-Utama/ppu-pdf"), value: "ppu-pdf", bold: true },
      wrapped(
        "Text extraction from digital PDFs. Converts scanned PDFs to canvas. 380+ npm downloads a month.",
      ),
      "385",
      "17",
      "TypeScript",
    ],
    [
      { ...github("PT-Perkasa-Pilar-Utama/ppu-doclayout"), value: "ppu-doclayout", bold: true },
      wrapped(
        "PP-DocLayout V2 and V3 document layout analysis for Bun and Node.js. 260+ npm downloads a month.",
      ),
      "262",
      "14",
      "TypeScript, ONNX Runtime",
    ],
    [
      { ...github("PT-Perkasa-Pilar-Utama/testate"), value: "testate", bold: true },
      wrapped(
        "Snapshot and restore tool for test databases. Break the data, put it back in seconds.",
      ),
      null,
      "12",
      "TypeScript, Hono, SolidJS",
    ],
    [
      { ...github("snowfluke/indo-g2p"), value: "indo-g2p", bold: true },
      wrapped(
        "Indonesian grapheme-to-phoneme converter for text-to-speech. Zero dependencies. 700+ npm downloads a month.",
      ),
      "720",
      "8",
      "TypeScript",
    ],
    [
      { ...github("PT-Perkasa-Pilar-Utama/ppu-uniface"), value: "ppu-uniface", bold: true },
      wrapped("Face detection and recognition. A port of the Python uniface library."),
      "49",
      "5",
      "TypeScript, ONNX Runtime",
    ],
    [
      { ...github("snowfluke/tiny6-paddleocr"), value: "tiny6-paddleocr", bold: true },
      wrapped("PP-OCRv6 tiny on WASM SIMD kernels. Zero runtime dependencies, no onnxruntime."),
      null,
      "1",
      "TypeScript, WASM SIMD",
    ],
    [],
    [
      bold("Total"),
      { value: `Live formulas. Counted ${STATS_DATE}.`, italic: true },
      { value: "=SUM(C2:C10)", bold: true },
      { value: "=SUM(D2:D10)", bold: true },
    ],
  ],
});

export const portfolioSheets = [about, experience, openSource];
