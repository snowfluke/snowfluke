// Teks Bahasa Indonesia untuk sheet portofolio. Kunci dan panjang daftar harus sama dengan
// content.en.js. Istilah teknis tetap dalam bahasa Inggris, seperti kebiasaan di industri.
export default {
  sheets: { about: "Tentang", experience: "Pengalaman", openSource: "Open Source" },

  about: {
    headline:
      "Backend engineer untuk sistem OCR dan computer vision. Team lead 3 engineer di PT. Perkasa Pilar Utama, Jakarta. Pembuat SDK OCR dengan 75.000+ unduhan npm per bulan.",
    email: "Email",
    availability: "Ketersediaan",
    availabilityText:
      "Terbuka untuk kerja remote. Berbasis di Jakarta (UTC+7). Notice period: 1 bulan.",
    resume: "Resume",
    resumeLink: "Unduh PDF, satu halaman",
    summary: "Ringkasan",
    summaryLines: [
      "Software engineer sejak 2022. Saya membangun library OCR dan computer vision dengan TypeScript, serta sistem backend dengan Go dan TypeScript.",
      "SDK OCR open-source saya, ppu-paddle-ocr, diunduh 75.000+ kali per bulan di npm. Dihitung {date}.",
      "Saya memimpin tim 3 engineer di divisi custom software PT. Perkasa Pilar Utama (PPU) dan memelihara library open-source perusahaan.",
    ],
    skills: "Keahlian",
    skillRows: [
      ["Bahasa pemrograman", "TypeScript, JavaScript, Go, Python, Kotlin, SQL"],
      [
        "Backend",
        "Bun, Node.js, Hono, Elysia, Fiber, Express. REST dan OpenAPI, WebSocket, microservices.",
      ],
      ["Data", "PostgreSQL, MongoDB, SQLite, Redis, RabbitMQ, Drizzle ORM, S3"],
      [
        "Vision dan AI",
        "ONNX Runtime, PaddleOCR, YOLO, OpenCV.js, face recognition, WASM SIMD, bot LLM, server MCP",
      ],
      [
        "Frontend, mobile",
        "React, Next.js, SolidJS, Tailwind CSS, React Native, Android dengan Kotlin, Figma",
      ],
      ["Operasional", "Linux, Docker, GitHub Actions, Nginx, Prometheus, Grafana, Loki"],
      ["Bahasa", "Indonesia (penutur asli), Inggris (fasih)"],
    ],
    education: "Pendidikan",
    educationPeriod: "Jan 2019 - Des 2023",
    educationText: "Sarjana Teknik Informatika. STMIK Komputama Majenang.",
    awards: "Penghargaan",
    awardRows: [
      [
        "Juara 2",
        "2023",
        "PIKMI 2023 BSI Software Development. Universitas Bina Sarana Informatika.",
      ],
      ["10 Besar", "2023", "Google Hackfest 2023. Google Developer Student Club Indonesia."],
      [
        "Juara 1",
        "2022",
        "Techcomfest 2022 Software Development Competition. Politeknik Negeri Semarang.",
      ],
      ["Juara 3", "2022", "Cyber 2022 Website Design. Universitas Gorontalo."],
      ["10 Besar", "2021", "CODE AMCC 2021. AMIKOM Yogyakarta."],
      ["10 Besar", "2019", "Techcomfest Network Competition 2019. Politeknik Negeri Semarang."],
      ["Juara 3", "2018", "LKS Web Design. MKKS SMK Kabupaten Cilacap."],
      ["10 Besar", "2018", "GEMASTE Web Design Competition 2018. Universitas Negeri Semarang."],
      ["Juara 2", "2017", "LKS Web Design. MKKS SMK Kabupaten Cilacap."],
    ],
    tip: "Situs ini spreadsheet sungguhan. Tekan + di kiri bawah untuk menambah sheet Anda sendiri. Formula berfungsi: =SUM(A1:A5)",
  },

  experience: {
    headers: ["Perusahaan, jabatan, periode", "Pencapaian"],
    present: "Sekarang",
    jobs: [
      {
        company: "PT. Perkasa Pilar Utama",
        role: "Backend Engineer dan Team Lead",
        period: "Okt 2023 - {present}",
        location: "Jakarta Utara, Indonesia",
        highlights: [
          "Memimpin tim 3 engineer di divisi custom software, melatih engineer baru, dan mengarahkan tim eksperimen AI di bidang LLM dan computer vision.",
          "Merancang dan membangun Oksara, produk OCR perusahaan, dari awal sampai akhir dengan TypeScript, Bun, dan ONNX Runtime. Oksara berjalan di production pada 2 perusahaan klien dan mengekstrak data dari 5 jenis dokumen: KTP, BPKB, struk, CV, dan rekening koran.",
          "Merilis inti OCR dan image processing Oksara sebagai open source: ppu-paddle-ocr dan ppu-ocv. Masing-masing kini diunduh 75.000+ kali per bulan di npm.",
          "Membangun platform rekonsiliasi pembayaran, kini di production, dengan Go dan 3 service (API gateway, scheduler, data collector) di atas PostgreSQL, RabbitMQ, dan Redis, dipantau dengan Prometheus dan Grafana.",
          "Membuat prototipe R&D (Mar - Sep 2024): aplikasi Android dengan Kotlin yang mengirim pesan terenkripsi dan terkompresi lewat radio jarak jauh LoRa tanpa internet.",
        ],
      },
      {
        company: "PT. BPR Bank Cirebon Jabar (Perseroda)",
        role: "Mobile Frontend Developer (kontrak 3 bulan)",
        period: "Des 2022 - Feb 2023",
        location: "Cirebon, Indonesia",
        highlights: [
          "Mendesain dan membuat prototipe aplikasi mobile banking dengan 40+ layar di Figma.",
          "Mengimplementasikan aplikasi untuk Android dan iOS dengan React Native, mengintegrasikannya dengan backend bank, dan merilisnya ke nasabah bank.",
        ],
      },
      {
        company: "PT. Langitpay Digital Indonesia",
        role: "Backend Developer Intern",
        period: "2022",
        location: "Cilacap, Indonesia",
        highlights: [
          "Memigrasikan aplikasi web monolitik berbasis SQL ke aplikasi web berbasis NoSQL.",
        ],
      },
    ],
  },

  openSource: {
    headers: ["Proyek", "Fungsinya", "npm per bulan", "Stars", "Stack"],
    total: "Total",
    totalNote: "Formula aktif. Dihitung {date}.",
    what: {
      "ppu-paddle-ocr":
        "SDK PaddleOCR untuk Node.js, Bun, Deno, browser, dan React Native. 75.000+ unduhan npm per bulan, 185.000+ secara total. Sekitar 140 ms untuk satu struk dengan akurasi karakter 99,5% pada benchmark yang dipublikasikan.",
      "ppu-ocv":
        "Image processing yang chainable dan type-safe di atas OpenCV.js. 76.000+ unduhan npm per bulan.",
      "ppu-yolo-onnx-inference": "Deteksi objek YOLOv11 di Bun dan browser. Tanpa Python.",
      "ppu-pdf":
        "Ekstraksi teks dari PDF digital. Mengubah PDF hasil scan menjadi canvas. 380+ unduhan npm per bulan.",
      "ppu-doclayout":
        "Analisis layout dokumen PP-DocLayout V2 dan V3 untuk Bun dan Node.js. 260+ unduhan npm per bulan.",
      testate:
        "Alat snapshot dan restore untuk database testing. Rusak datanya, kembalikan dalam hitungan detik.",
      "indo-g2p":
        "Konverter grapheme-to-phoneme Bahasa Indonesia untuk text-to-speech. Tanpa dependency. 700+ unduhan npm per bulan.",
      "ppu-uniface": "Deteksi dan pengenalan wajah. Port dari library Python uniface.",
      "tiny6-paddleocr":
        "PP-OCRv6 tiny di atas kernel WASM SIMD. Tanpa runtime dependency, tanpa onnxruntime.",
    },
  },
};
