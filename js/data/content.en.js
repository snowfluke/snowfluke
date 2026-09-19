// English text of the portfolio sheets. js/data/portfolio.js holds the structure, the links and
// the numbers. content.id.js must have the same keys and the same list lengths.
export default {
  sheets: { about: "About", experience: "Experience", openSource: "Open Source" },

  about: {
    headline:
      "Backend engineer for OCR and computer vision systems. Team lead of 3 engineers at PT. Perkasa Pilar Utama, Jakarta. Author of an OCR SDK with 75,000+ npm downloads a month.",
    email: "Email",
    availability: "Availability",
    availabilityText: "Open to remote roles. Based in Jakarta (UTC+7). Notice period: 1 month.",
    resume: "Resume",
    resumeLink: "Download PDF, one page",
    summary: "Summary",
    summaryLines: [
      "Software engineer since 2022. I build OCR and computer vision libraries in TypeScript, and backend systems in Go and TypeScript.",
      "My open-source OCR SDK, ppu-paddle-ocr, has 75,000+ npm downloads a month. Counted {date}.",
      "I lead a team of 3 engineers in the custom software division at PT. Perkasa Pilar Utama (PPU) and maintain its open-source libraries.",
    ],
    skills: "Skills",
    skillRows: [
      ["Languages", "TypeScript, JavaScript, Go, Python, Kotlin, SQL"],
      [
        "Backend",
        "Bun, Node.js, Hono, Elysia, Fiber, Express. REST and OpenAPI, WebSocket, microservices.",
      ],
      ["Data", "PostgreSQL, MongoDB, SQLite, Redis, RabbitMQ, Drizzle ORM, S3"],
      [
        "Vision and AI",
        "ONNX Runtime, PaddleOCR, YOLO, OpenCV.js, face recognition, WASM SIMD, LLM bots, MCP servers",
      ],
      [
        "Frontend, mobile",
        "React, Next.js, SolidJS, Tailwind CSS, React Native, Android with Kotlin, Figma",
      ],
      ["Operations", "Linux, Docker, GitHub Actions, Nginx, Prometheus, Grafana, Loki"],
      ["Spoken", "Indonesian (native), English (fluent)"],
    ],
    education: "Education",
    educationPeriod: "Jan 2019 - Dec 2023",
    educationText: "Bachelor's Degree in Informatics Engineering. STMIK Komputama Majenang.",
    awards: "Awards",
    // [result, year, event and organizer]. Newest first.
    awardRows: [
      [
        "2nd place",
        "2023",
        "PIKMI 2023 BSI Software Development. Universitas Bina Sarana Informatika.",
      ],
      ["Top 10", "2023", "Google Hackfest 2023. Google Developer Student Club Indonesia."],
      [
        "1st place",
        "2022",
        "Techcomfest 2022 Software Development Competition. Politeknik Negeri Semarang.",
      ],
      ["3rd place", "2022", "Cyber 2022 Website Design. Universitas Gorontalo."],
      ["Top 10", "2021", "CODE AMCC 2021. AMIKOM Yogyakarta."],
      ["Top 10", "2019", "Techcomfest Network Competition 2019. Politeknik Negeri Semarang."],
      ["3rd place", "2018", "LKS Web Design Competition. MKKS SMK Kabupaten Cilacap."],
      ["Top 10", "2018", "GEMASTE Web Design Competition 2018. Universitas Negeri Semarang."],
      ["2nd place", "2017", "LKS Web Design Competition. MKKS SMK Kabupaten Cilacap."],
    ],
    tip: "This site is a working spreadsheet. Press + at the bottom left to add your own sheet. Formulas work: =SUM(A1:A5)",
  },

  experience: {
    headers: ["Company, role, period", "Highlights"],
    present: "Present",
    // [company, role, period, location, highlights]. {present} is filled from "present" above.
    jobs: [
      {
        company: "PT. Perkasa Pilar Utama",
        role: "Backend Engineer and Team Lead",
        period: "Oct 2023 - {present}",
        location: "Jakarta Utara, Indonesia",
        highlights: [
          "Lead a team of 3 engineers in the custom software division, train new engineers, and direct the AI experiment team in LLM and computer vision work.",
          "Architected and developed Oksara, the company OCR product, end to end in TypeScript, Bun, and ONNX Runtime. It runs in production at 2 client companies and extracts data from 5 document types: national ID cards, vehicle ownership books, receipts, resumes, and bank statements.",
          "Open-sourced the OCR and image processing core of Oksara as ppu-paddle-ocr and ppu-ocv. Each package now has 75,000+ npm downloads a month.",
          "Engineered a payment reconciliation platform, now in production, in Go with 3 services (API gateway, scheduler, data collector) on PostgreSQL, RabbitMQ, and Redis, monitored with Prometheus and Grafana.",
          "Built an R&D prototype (Mar - Sep 2024): an Android app in Kotlin that sends encrypted, compressed messages over LoRa long-range radio without internet.",
        ],
      },
      {
        company: "PT. BPR Bank Cirebon Jabar (Perseroda)",
        role: "Mobile Frontend Developer (3-month contract)",
        period: "Dec 2022 - Feb 2023",
        location: "Cirebon, Indonesia",
        highlights: [
          "Designed and prototyped a mobile banking app with 40+ screens in Figma.",
          "Implemented the app for Android and iOS in React Native, integrated it with the bank backend, and shipped it to the bank's customers.",
        ],
      },
      {
        company: "PT. Langitpay Digital Indonesia",
        role: "Backend Developer Intern",
        period: "2022",
        location: "Cilacap, Indonesia",
        highlights: ["Migrated a SQL-based monolithic web app to a NoSQL-based web app."],
      },
    ],
  },

  openSource: {
    headers: ["Project", "What it does", "npm per month", "Stars", "Stack"],
    total: "Total",
    totalNote: "Live formulas. Counted {date}.",
    // Keyed by repository name.
    what: {
      "ppu-paddle-ocr":
        "PaddleOCR SDK for Node.js, Bun, Deno, browsers, and React Native. 75,000+ npm downloads a month, 185,000+ in total. About 140 ms for a receipt at 99.5% character accuracy on the published benchmark.",
      "ppu-ocv":
        "Chainable, type-safe image processing on top of OpenCV.js. 76,000+ npm downloads a month.",
      "ppu-yolo-onnx-inference": "YOLOv11 object detection in Bun and the browser. No Python.",
      "ppu-pdf":
        "Text extraction from digital PDFs. Converts scanned PDFs to canvas. 380+ npm downloads a month.",
      "ppu-doclayout":
        "PP-DocLayout V2 and V3 document layout analysis for Bun and Node.js. 260+ npm downloads a month.",
      testate:
        "Snapshot and restore tool for test databases. Break the data, put it back in seconds.",
      "indo-g2p":
        "Indonesian grapheme-to-phoneme converter for text-to-speech. Zero dependencies. 700+ npm downloads a month.",
      "ppu-uniface": "Face detection and recognition. A port of the Python uniface library.",
      "tiny6-paddleocr":
        "PP-OCRv6 tiny on WASM SIMD kernels. Zero runtime dependencies, no onnxruntime.",
    },
  },
};
