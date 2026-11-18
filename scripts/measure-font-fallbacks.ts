/**
 * Derives the `@font-face` override values that make a local fallback font
 * mimic a self-hosted web font (see src/styles/fonts.scss):
 *   size-adjust      = rendered width of a pangram in Chromium: web ÷ fallback
 *   ascent-override  = web font hhea.ascender  ÷ unitsPerEm ÷ size-adjust
 *   descent-override = |web font hhea.descender| ÷ unitsPerEm ÷ size-adjust
 *   line-gap-override= web font hhea.lineGap   ÷ unitsPerEm ÷ size-adjust
 * Run: pnpm exec tsx scripts/measure-font-fallbacks.ts
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { brotliDecompressSync } from 'node:zlib';
import { chromium } from '@playwright/test';

interface Metrics {
  upm: number;
  ascender: number;
  descender: number;
  lineGap: number;
}

const readTtfMetrics = (file: string): Metrics => {
  const b = readFileSync(file);
  const numTables = b.readUInt16BE(4);
  const tables: Record<string, number> = {};
  for (let i = 0; i < numTables; i += 1) {
    const o = 12 + i * 16;
    tables[b.toString('ascii', o, o + 4)] = b.readUInt32BE(o + 8);
  }
  const head = tables.head ?? 0;
  const hhea = tables.hhea ?? 0;
  return {
    upm: b.readUInt16BE(head + 18),
    ascender: b.readInt16BE(hhea + 4),
    descender: b.readInt16BE(hhea + 6),
    lineGap: b.readInt16BE(hhea + 8),
  };
};

// WOFF2: table directory + one brotli stream. hhea/head are never transformed.
const KNOWN_TAGS =
  'cmap head hhea hmtx maxp name OS/2 post cvt  fpgm glyf loca prep CFF  VORG EBDT EBLC gasp hdmx kern LTSH PCLT VDMX vhea vmtx BASE GDEF GPOS GSUB EBSC JSTF MATH CBDT CBLC COLR CPAL SVG  sbix acnt avar bdat bloc bsln cvar fdsc feat fmtx fvar gvar hsty just lcar mort morx opbd prop trak Zapf Silf Glat Gloc Feat Sill'
    .match(/.{4}\s?/g)!
    .map((t) => t.trimEnd().padEnd(4));
const readWoff2Metrics = (file: string): Metrics => {
  const b = readFileSync(file);
  let p = 0;
  const u8 = () => b[p++] ?? 0;
  const base128 = () => {
    let acc = 0;
    for (let i = 0; i < 5; i += 1) {
      const byte = u8();
      acc = acc * 128 + (byte & 0x7f);
      if (!(byte & 0x80)) return acc;
    }
    throw new Error('bad base128');
  };
  const numTables = b.readUInt16BE(12);
  const totalCompressedSize = b.readUInt32BE(20);
  p = 48;
  const entries: { tag: string; length: number }[] = [];
  for (let i = 0; i < numTables; i += 1) {
    const flags = u8();
    const idx = flags & 0x3f;
    const tag =
      idx === 63
        ? b.toString('ascii', p, (p += 4))
        : (KNOWN_TAGS[idx] ?? '????');
    const origLength = base128();
    const transform = (flags >> 6) & 3;
    const transformed =
      tag === 'glyf' || tag === 'loca' ? transform === 0 : transform !== 0;
    entries.push({ tag, length: transformed ? base128() : origLength });
  }
  const data = brotliDecompressSync(b.subarray(p, p + totalCompressedSize));
  let off = 0;
  const tables: Record<string, Buffer> = {};
  for (const entry of entries) {
    tables[entry.tag] = data.subarray(off, off + entry.length);
    off += entry.length;
  }
  const head = tables.head!;
  const hhea = tables.hhea!;
  return {
    upm: head.readUInt16BE(18),
    ascender: hhea.readInt16BE(4),
    descender: hhea.readInt16BE(6),
    lineGap: hhea.readInt16BE(8),
  };
};

interface Pair {
  label: string;
  webFile: string;
  webFamily: string;
  weight: number;
  fallback: string;
}

const PAIRS: Pair[] = [
  {
    label: 'Inter 400 → Arial',
    webFile: 'public/fonts/inter/inter-latin-wght-normal.woff2',
    webFamily: 'Inter',
    weight: 400,
    fallback: 'Arial',
  },
];

const PANGRAM =
  'Sphinx of black quartz, judge my vow. Pack my box with five dozen liquor jugs 0123456789';
const root = process.cwd();
const htmlFile = path.join(root, 'reports', 'font-fallbacks.html');

const faces = PAIRS.map(
  (pair) =>
    `@font-face { font-family: '${pair.webFamily}'; font-weight: ${pair.weight}; src: url('file://${path.join(root, pair.webFile)}'); }`,
).join('\n');
const spans = PAIRS.flatMap((pair, i) => [
  `<span id="web-${i}" style="font-family: '${pair.webFamily}'; font-weight: ${pair.weight}">${PANGRAM}</span>`,
  `<span id="fb-${i}" style="font-family: '${pair.fallback}'; font-weight: ${pair.weight}">${PANGRAM}</span>`,
]).join('\n');
writeFileSync(
  htmlFile,
  `<!doctype html><html><head><style>${faces}\nspan{font-size:100px;white-space:nowrap;position:absolute}</style></head><body>${spans}</body></html>`,
);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file://${htmlFile}`);
await page.evaluate(
  async (loads) => {
    await Promise.all(loads.map((l) => document.fonts.load(l)));
    await document.fonts.ready;
  },
  PAIRS.map((pair) => `${pair.weight} 100px '${pair.webFamily}'`),
);
const widths = await page.evaluate(() =>
  Object.fromEntries(
    [...document.querySelectorAll('span')].map((s) => [
      s.id,
      s.getBoundingClientRect().width,
    ]),
  ),
);
await browser.close();
rmSync(htmlFile);

const pct = (v: number) => `${(v * 100).toFixed(2)}%`;
PAIRS.forEach((pair, i) => {
  const sizeAdjust = (widths[`web-${i}`] ?? 0) / (widths[`fb-${i}`] ?? 1);
  const m = pair.webFile.endsWith('.woff2')
    ? readWoff2Metrics(pair.webFile)
    : readTtfMetrics(pair.webFile);
  console.log(`\n${pair.label}`);
  console.log(`  size-adjust: ${pct(sizeAdjust)};`);
  console.log(`  ascent-override: ${pct(m.ascender / m.upm / sizeAdjust)};`);
  console.log(
    `  descent-override: ${pct(Math.abs(m.descender) / m.upm / sizeAdjust)};`,
  );
  console.log(`  line-gap-override: ${pct(m.lineGap / m.upm / sizeAdjust)};`);
});
