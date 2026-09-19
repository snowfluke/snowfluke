// Minimal XLSX writer. An .xlsx file is a zip of XML parts.
// ponytail: zip entries are stored, not compressed, and styles cover bold, italic, link and
// wrap only. Swap in a library if the export ever needs fills, fonts or large sheets.
import { isFormula, parseLiteral } from "./formula.js";
import { cellKey } from "./utils.js";

const PX_PER_CHAR = 7;
const DEFAULT_COL_PX = 120;
const encoder = new TextEncoder();

// ---- zip ----

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function record(size, write) {
  const bytes = new Uint8Array(size);
  write(new DataView(bytes.buffer));
  return bytes;
}

// files: [{ name, text }]. Returns the bytes of a zip with stored entries.
export function zip(files) {
  const UTF8_NAMES = 0x0800;
  const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;
  const chunks = [];
  const central = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = encoder.encode(file.text);
    const crc = crc32(data);

    const local = record(30, (view) => {
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, UTF8_NAMES, true);
      view.setUint16(12, DOS_DATE, true);
      view.setUint32(14, crc, true);
      view.setUint32(18, data.length, true);
      view.setUint32(22, data.length, true);
      view.setUint16(26, name.length, true);
    });
    const localOffset = offset;
    central.push(
      record(46, (view) => {
        view.setUint32(0, 0x02014b50, true);
        view.setUint16(4, 20, true);
        view.setUint16(6, 20, true);
        view.setUint16(8, UTF8_NAMES, true);
        view.setUint16(14, DOS_DATE, true);
        view.setUint32(16, crc, true);
        view.setUint32(20, data.length, true);
        view.setUint32(24, data.length, true);
        view.setUint16(28, name.length, true);
        view.setUint32(42, localOffset, true);
      }),
      name,
    );
    chunks.push(local, name, data);
    offset += local.length + name.length + data.length;
  }

  const centralSize = central.reduce((sum, chunk) => sum + chunk.length, 0);
  const end = record(22, (view) => {
    view.setUint32(0, 0x06054b50, true);
    view.setUint16(8, files.length, true);
    view.setUint16(10, files.length, true);
    view.setUint32(12, centralSize, true);
    view.setUint32(16, offset, true);
  });

  const all = [...chunks, ...central, end];
  const out = new Uint8Array(all.reduce((sum, chunk) => sum + chunk.length, 0));
  let at = 0;
  for (const chunk of all) {
    out.set(chunk, at);
    at += chunk.length;
  }
  return out;
}

// ---- xml parts ----

const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const NS_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const NS_PKG_REL = "http://schemas.openxmlformats.org/package/2006/relationships";
const TYPE_PREFIX = "application/vnd.openxmlformats-officedocument.spreadsheetml";

// XML 1.0 forbids control characters other than tab, newline and carriage return.
const isXmlChar = (char) => char >= " " || char === "\t" || char === "\n" || char === "\r";

const xmlEscape = (text) =>
  Array.from(String(text))
    .filter(isXmlChar)
    .join("")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// Style ids. Fonts: 0 plain, 1 bold, 2 italic, 3 link. Add WRAP_OFFSET for the wrapped twin.
const WRAP_OFFSET = 4;
const FONTS = [
  '<font><sz val="11"/><name val="Calibri"/></font>',
  '<font><b/><sz val="11"/><name val="Calibri"/></font>',
  '<font><i/><sz val="11"/><name val="Calibri"/></font>',
  '<font><u/><sz val="11"/><color rgb="FF006FE6"/><name val="Calibri"/></font>',
];

const xf = (font, wrap) =>
  `<xf numFmtId="0" fontId="${font}" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top"${wrap ? ' wrapText="1"' : ""}/></xf>`;

function stylesXml() {
  const xfs = [...FONTS.map((_, n) => xf(n, false)), ...FONTS.map((_, n) => xf(n, true))];
  return `${XML}<styleSheet xmlns="${NS_MAIN}"><fonts count="${FONTS.length}">${FONTS.join("")}</fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfs.length}">${xfs.join("")}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
}

function styleId(style) {
  let font = 0;
  if (style.link) font = 3;
  else if (style.bold || style.header) font = 1;
  else if (style.italic) font = 2;
  return font + (style.wrap ? WRAP_OFFSET : 0);
}

function cellXml(key, cell) {
  const style = ` s="${styleId(cell.style ?? {})}"`;
  if (isFormula(cell.value)) {
    // Excel wants upper-case function names. A formula with a string literal stays as typed.
    const body = cell.value.slice(1);
    const formula = body.includes('"') ? body : body.toUpperCase();
    return `<c r="${key}"${style}><f>${xmlEscape(formula)}</f></c>`;
  }
  const literal = parseLiteral(cell.value);
  if (literal === null) return "";
  if (typeof literal === "number") return `<c r="${key}"${style}><v>${literal}</v></c>`;
  return `<c r="${key}"${style} t="inlineStr"><is><t xml:space="preserve">${xmlEscape(literal)}</t></is></c>`;
}

// Returns { xml, rels }. rels is null when the sheet has no links.
function sheetXml(sheet, absoluteUrl) {
  const links = [];
  const rows = [];
  let lastCol = 1;

  for (let row = 1; row <= sheet.rowCount; row++) {
    const cells = [];
    for (let col = 1; col <= sheet.colCount; col++) {
      const key = cellKey(row, col);
      const cell = sheet.cells[key];
      if (!cell) continue;
      const xml = cellXml(key, cell);
      if (!xml) continue;
      cells.push(xml);
      lastCol = Math.max(lastCol, col);
      if (cell.style?.link) links.push({ key, url: absoluteUrl(cell.style.link) });
    }
    if (cells.length) rows.push(`<row r="${row}">${cells.join("")}</row>`);
  }

  const cols = Array.from({ length: lastCol }, (_, index) => {
    const width = ((sheet.colWidths[index + 1] ?? DEFAULT_COL_PX) / PX_PER_CHAR).toFixed(2);
    return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`;
  });
  const hyperlinks = links.length
    ? `<hyperlinks>${links.map((link, n) => `<hyperlink ref="${link.key}" r:id="rId${n + 1}"/>`).join("")}</hyperlinks>`
    : "";
  const rels = links.length
    ? `${XML}<Relationships xmlns="${NS_PKG_REL}">${links.map((link, n) => `<Relationship Id="rId${n + 1}" Type="${NS_REL}/hyperlink" Target="${xmlEscape(link.url)}" TargetMode="External"/>`).join("")}</Relationships>`
    : null;

  return {
    xml: `${XML}<worksheet xmlns="${NS_MAIN}" xmlns:r="${NS_REL}"><cols>${cols.join("")}</cols><sheetData>${rows.join("")}</sheetData>${hyperlinks}</worksheet>`,
    rels,
  };
}

// Excel allows 31 characters in a sheet name and forbids [ ] : * ? / \
function sheetNames(sheets) {
  const used = new Set();
  return sheets.map((sheet, index) => {
    let name =
      sheet.name
        .replace(/[[\]:*?/\\]/g, " ")
        .slice(0, 31)
        .trim() || `Sheet${index + 1}`;
    while (used.has(name.toLowerCase())) name = `${name.slice(0, 27)} (${index + 1})`;
    used.add(name.toLowerCase());
    return name;
  });
}

// absoluteUrl turns an in-app link such as "#/blog/post" into a full URL.
export function buildXlsx(sheets, absoluteUrl = (url) => url) {
  const names = sheetNames(sheets);
  const parts = sheets.map((sheet) => sheetXml(sheet, absoluteUrl));
  const files = [
    {
      name: "[Content_Types].xml",
      text: `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${TYPE_PREFIX}.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="${TYPE_PREFIX}.styles+xml"/>${sheets.map((_, n) => `<Override PartName="/xl/worksheets/sheet${n + 1}.xml" ContentType="${TYPE_PREFIX}.worksheet+xml"/>`).join("")}</Types>`,
    },
    {
      name: "_rels/.rels",
      text: `${XML}<Relationships xmlns="${NS_PKG_REL}"><Relationship Id="rId1" Type="${NS_REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      text: `${XML}<workbook xmlns="${NS_MAIN}" xmlns:r="${NS_REL}"><sheets>${names.map((name, n) => `<sheet name="${xmlEscape(name)}" sheetId="${n + 1}" r:id="rId${n + 1}"/>`).join("")}</sheets></workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      text: `${XML}<Relationships xmlns="${NS_PKG_REL}">${sheets.map((_, n) => `<Relationship Id="rId${n + 1}" Type="${NS_REL}/worksheet" Target="worksheets/sheet${n + 1}.xml"/>`).join("")}<Relationship Id="rId${sheets.length + 1}" Type="${NS_REL}/styles" Target="styles.xml"/></Relationships>`,
    },
    { name: "xl/styles.xml", text: stylesXml() },
  ];
  parts.forEach((part, n) => {
    files.push({ name: `xl/worksheets/sheet${n + 1}.xml`, text: part.xml });
    if (part.rels)
      files.push({ name: `xl/worksheets/_rels/sheet${n + 1}.xml.rels`, text: part.rels });
  });
  return zip(files);
}
