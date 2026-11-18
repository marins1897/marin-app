/**
 * Lighthouse (current major, direct Node API) against the prerendered site.
 * Every prerendered page, 3 runs each, median per metric, asserted against
 * docs/PERFORMANCE.md § Targets. Reports land in reports/lighthouse/.
 *   pnpm lighthouse            # mobile (Lighthouse default preset)
 *   pnpm lighthouse --desktop  # desktop preset
 * Replaces @lhci/cli, which is pinned to Lighthouse 12 with no release since
 * mid-2025 (docs/DECISIONS.md § 10).
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { launch } from 'chrome-launcher';
import lighthouse, {
  desktopConfig,
  type Flags,
  type RunnerResult,
} from 'lighthouse';
import {
  CLIENT_BUILD_DIR,
  listPrerenderedPages,
} from './lib/prerendered-pages.ts';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;
const RUNS = 3;
const isDesktop = process.argv.includes('--desktop');

/** Targets: mobile preset unless noted. */
const TARGETS = {
  performance: isDesktop ? 0.95 : 0.9,
  accessibility: 1,
  'best-practices': 1,
  seo: 1,
  'largest-contentful-paint': 2500,
  'cumulative-layout-shift': 0.1,
  'total-blocking-time': 200,
} as const;

interface RunSummary {
  categories: Record<string, number>;
  metrics: Record<string, number>;
}

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
};

const summarize = (result: RunnerResult): RunSummary => {
  const { lhr } = result;
  return {
    categories: Object.fromEntries(
      Object.entries(lhr.categories).map(([id, category]) => [
        id,
        category.score ?? 0,
      ]),
    ),
    metrics: Object.fromEntries(
      [
        'largest-contentful-paint',
        'cumulative-layout-shift',
        'total-blocking-time',
        'first-contentful-paint',
      ].map((id) => [id, lhr.audits[id]?.numericValue ?? 0]),
    ),
  };
};

const waitForServer = async (url: string) => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // not up yet
    }
    await sleep(200);
  }
  throw new Error(`Preview server did not start at ${url}`);
};

const main = async () => {
  const pages = listPrerenderedPages();
  if (pages.length === 0)
    throw new Error(
      `No prerendered pages in ${CLIENT_BUILD_DIR}. Run pnpm build first.`,
    );

  const server = spawn('pnpm', ['preview'], {
    stdio: 'ignore',
    env: { ...process.env, PORT: String(PORT) },
  });
  const chrome = await launch({ chromeFlags: ['--headless=new'] });
  const reportsDir = path.resolve(process.cwd(), 'reports/lighthouse');
  mkdirSync(reportsDir, { recursive: true });

  const flags: Flags = { port: chrome.port, output: 'json', logLevel: 'error' };
  const config = isDesktop ? desktopConfig : undefined;
  const failures: string[] = [];
  const rows: string[] = [];

  try {
    await waitForServer(`${BASE_URL}/`);
    for (const page of pages) {
      const url = `${BASE_URL}${page.pathname}`;
      const runs: RunSummary[] = [];
      for (let i = 0; i < RUNS; i += 1) {
        const result = await lighthouse(url, flags, config);
        if (!result)
          throw new Error(`Lighthouse returned no result for ${url}`);
        runs.push(summarize(result));
        if (i === 0) {
          writeFileSync(
            path.join(
              reportsDir,
              `${page.pathname === '/' ? 'index' : page.pathname.slice(1).replace(/\//g, '_')}.${isDesktop ? 'desktop' : 'mobile'}.json`,
            ),
            typeof result.report === 'string'
              ? result.report
              : result.report.join(''),
          );
        }
      }
      const cat = (id: string) =>
        median(runs.map((r) => r.categories[id] ?? 0));
      const met = (id: string) => median(runs.map((r) => r.metrics[id] ?? 0));
      const pct = (v: number) => Math.round(v * 100);
      rows.push(
        `| ${page.pathname} | ${pct(cat('performance'))} | ${pct(cat('accessibility'))} | ${pct(cat('best-practices'))} | ${page.indexable ? pct(cat('seo')) : `${pct(cat('seo'))} (noindex)`} | ${Math.round(met('largest-contentful-paint'))} ms | ${Math.round(met('total-blocking-time'))} ms | ${met('cumulative-layout-shift').toFixed(3)} |`,
      );
      for (const [id, target] of Object.entries(TARGETS)) {
        const isCategory = !id.includes('-') || id === 'best-practices';
        if (id === 'seo' && !page.indexable) continue; // noindex pages fail "is-crawlable" by design
        const value = isCategory ? cat(id) : met(id);
        const ok = isCategory ? value >= target : value <= target;
        if (!ok)
          failures.push(
            `${page.pathname}: ${id} = ${isCategory ? pct(value) : Math.round(value)} (target ${isCategory ? `≥ ${pct(target)}` : `≤ ${target}`})`,
          );
      }
    }
  } finally {
    await chrome.kill();
    server.kill();
  }

  console.log(
    `\nLighthouse ${isDesktop ? 'desktop' : 'mobile'} (median of ${RUNS} runs)\n`,
  );
  console.log('| Route | Perf | A11y | BP | SEO | LCP | TBT | CLS |');
  console.log('|---|---|---|---|---|---|---|---|');
  rows.forEach((row) => console.log(row));
  console.log(`\nReports: ${path.relative(process.cwd(), reportsDir)}/`);
  if (failures.length > 0) {
    console.error('\nTargets not met:\n  ' + failures.join('\n  '));
    process.exit(1);
  }
  console.log('\nAll targets met.');
};

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
