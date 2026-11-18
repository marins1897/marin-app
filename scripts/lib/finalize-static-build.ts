/**
 * React Router `buildEnd` hook: emits sitemap.xml and robots.txt from the
 * prerendered pages (indexable = no `noindex` robots meta). Runs after every
 * `react-router build`.
 */
import { copyFileSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { absoluteUrl, SITE_URL } from '../../src/seo/site.ts';
import { listPrerenderedPages } from './prerendered-pages.ts';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const buildSitemapXml = (
  pathnames: readonly string[],
  lastmod: string,
): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...pathnames.map(
      (pathname) =>
        `<url><loc>${escapeXml(absoluteUrl(pathname))}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${pathname === '/' ? '1.0' : '0.7'}</priority></url>`,
    ),
    '</urlset>',
    '',
  ].join('\n');

export const buildRobotsTxt = (): string =>
  [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');

export const finalizeStaticBuild = async (clientDir: string): Promise<void> => {
  const dir = path.resolve(process.cwd(), clientDir);

  // React Router writes nested `404/index.html`; Vercel's automatic
  // not-found page must be a root-level `404.html`.
  const nested404 = path.join(dir, '404', 'index.html');
  if (existsSync(nested404))
    copyFileSync(nested404, path.join(dir, '404.html'));
  // Every route is prerendered and unknown URLs get 404.html, so the SPA
  // fallback document is dead weight.
  rmSync(path.join(dir, '__spa-fallback.html'), { force: true });

  const pages = listPrerenderedPages(dir);
  const indexable = pages
    .filter((page) => page.indexable)
    .map((page) => page.pathname);
  writeFileSync(
    path.join(dir, 'sitemap.xml'),
    buildSitemapXml(indexable, new Date().toISOString()),
  );
  writeFileSync(path.join(dir, 'robots.txt'), buildRobotsTxt());
  console.log(
    `[static-build] ${pages.length} page(s) prerendered, ${indexable.length} in sitemap.xml: ${indexable.join(', ')}`,
  );
};
