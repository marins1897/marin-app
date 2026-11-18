/**
 * Enforces the bundle budgets from docs/PERFORMANCE.md against build/client:
 *   - initial JS on `/` (entry + modulepreloaded chunks) ≤ 150 kB gzip
 *   - the lazy 3D stadium chunk (three.js + scene)        ≤ 150 kB gzip
 *   - every other JS chunk                                ≤ 60 kB gzip
 *   - total CSS                                           ≤ 40 kB gzip
 * Exits 1 on any violation. Run after `react-router build`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { CLIENT_BUILD_DIR } from './lib/prerendered-pages.ts';

const BUDGETS = {
  // React DOM 19 + React Router 8 + i18next weigh ~120 kB gzip before any app
  // code; 150 leaves headroom for the shell. See docs/DECISIONS.md § 8.
  initialJsKb: 150,
  routeChunkKb: 60,
  // three.js + the stadium scene, loaded after the page is idle and never on
  // the critical path. See docs/DECISIONS.md § 14.
  sceneChunkKb: 150,
  totalCssKb: 40,
};

/** The dynamically imported 3D scene: `stadium-scene/lib/create-stadium.ts`. */
const SCENE_CHUNK = /^create-stadium-[\w-]+\.js$/;

const dist = path.resolve(process.cwd(), CLIENT_BUILD_DIR);
const assetsDir = path.join(dist, 'assets');
const gzipKb = (file: string) => gzipSync(readFileSync(file)).byteLength / 1024;
const fmt = (kb: number) => `${kb.toFixed(1)} kB`;

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name);
    return statSync(file).isDirectory() ? walk(file) : [file];
  });

const assets = walk(assetsDir);
const jsFiles = assets.filter((f) => f.endsWith('.js'));
const cssFiles = assets.filter((f) => f.endsWith('.css'));

const indexHtml = readFileSync(path.join(dist, 'index.html'), 'utf8');
const initialRefs = new Set(
  [
    ...indexHtml.matchAll(/<script[^>]+src="([^"]+\.js)"/g),
    ...indexHtml.matchAll(
      /<link[^>]+rel="modulepreload"[^>]+href="([^"]+\.js)"/g,
    ),
  ].map((m) => path.join(dist, m[1] ?? '')),
);

const rows: { label: string; kb: number; budget: number }[] = [];
let failed = false;

const initialKb = [...initialRefs].reduce((sum, f) => sum + gzipKb(f), 0);
rows.push({
  label: `initial JS on / (${initialRefs.size} files)`,
  kb: initialKb,
  budget: BUDGETS.initialJsKb,
});

for (const file of jsFiles) {
  if (initialRefs.has(file)) continue;
  rows.push({
    label: `chunk ${path.relative(dist, file)}`,
    kb: gzipKb(file),
    budget: SCENE_CHUNK.test(path.basename(file))
      ? BUDGETS.sceneChunkKb
      : BUDGETS.routeChunkKb,
  });
}

const cssKb = cssFiles.reduce((sum, f) => sum + gzipKb(f), 0);
rows.push({
  label: `total CSS (${cssFiles.length} files)`,
  kb: cssKb,
  budget: BUDGETS.totalCssKb,
});

console.log('\nBundle budgets (gzip):');
for (const row of rows) {
  const ok = row.kb <= row.budget;
  if (!ok) failed = true;
  console.log(
    `  ${ok ? 'OK  ' : 'FAIL'} ${row.label.padEnd(52)} ${fmt(row.kb).padStart(9)} / ${fmt(row.budget)}`,
  );
}
console.log('');

if (failed) {
  console.error(
    'Bundle budget exceeded. See docs/PERFORMANCE.md for how to trim.',
  );
  process.exit(1);
}
