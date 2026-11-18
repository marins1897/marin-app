/**
 * SEO contract: runs against build/client after `pnpm build` (`pnpm test:seo`).
 * Every prerendered page must carry the full head contract from docs/SEO.md,
 * and sitemap.xml / robots.txt must agree with the pages' robots meta.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';
import {
  listPrerenderedPages,
  CLIENT_BUILD_DIR,
} from '../../scripts/lib/prerendered-pages';
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
} from '../../src/seo/page-meta';
import {
  localeOf,
  localizedPath,
  unlocalizedPath,
} from '../../src/seo/hreflang';
import { absoluteUrl, LOCALES, SITE_URL } from '../../src/seo/site';

const dist = path.resolve(process.cwd(), CLIENT_BUILD_DIR);
if (!existsSync(dist))
  throw new Error(`Missing ${CLIENT_BUILD_DIR}. Run pnpm build first.`);
const pages = listPrerenderedPages(dist);
const pagePaths = new Set(pages.map((p) => p.pathname));

const meta = (doc: HTMLElement, selector: string) =>
  doc.querySelector(`meta[${selector}]`)?.getAttribute('content');

const REQUIRED_META = [
  'name="description"',
  'name="robots"',
  'name="theme-color"',
  'property="og:type"',
  'property="og:site_name"',
  'property="og:title"',
  'property="og:description"',
  'property="og:url"',
  'property="og:image"',
  'property="og:image:alt"',
  'name="twitter:card"',
  'name="twitter:title"',
  'name="twitter:description"',
  'name="twitter:image"',
];

describe('SEO contract', () => {
  it('given the build, when listed, then at least the home page was prerendered', () => {
    expect(pages.map((p) => p.pathname)).toContain('/');
  });

  describe.each(pages.map((page) => [page.pathname, page] as const))(
    'given the prerendered page for %s',
    (_pathname, page) => {
      const doc = parse(readFileSync(page.file, 'utf8'));
      const isHome = unlocalizedPath(page.pathname) === '/';

      it('when parsed, then it has one h1, a main landmark, a lang attribute and a charset first', () => {
        expect(doc.querySelectorAll('h1')).toHaveLength(1);
        expect(doc.querySelector('main')).not.toBeNull();
        expect(doc.querySelector('html')?.getAttribute('lang')).toBe(
          localeOf(page.pathname),
        );
        expect(readFileSync(page.file, 'utf8').slice(0, 1024)).toMatch(
          /<meta charSet="utf-8"|<meta charset="utf-8"/i,
        );
      });

      it('when parsed, then title and description are present and within limits', () => {
        const title = doc.querySelector('title')?.textContent ?? '';
        expect(title.length).toBeGreaterThan(0);
        expect(title.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
        if (!isHome) expect(title).toMatch(/ \| Marin Samardžić$/);
        const description = meta(doc, 'name="description"') ?? '';
        expect(description.length).toBeGreaterThan(0);
        expect(description.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
      });

      it('when parsed, then the canonical is absolute and follows the trailing-slash policy', () => {
        const canonicals = doc.querySelectorAll('link[rel="canonical"]');
        expect(canonicals).toHaveLength(1);
        expect(canonicals[0]?.getAttribute('href')).toBe(
          absoluteUrl(page.pathname),
        );
        expect(meta(doc, 'property="og:url"')).toBe(absoluteUrl(page.pathname));
      });

      it('when parsed, then every required Open Graph and Twitter tag exists with an absolute image', () => {
        for (const selector of REQUIRED_META)
          expect(meta(doc, selector), selector).toBeTruthy();
        expect(meta(doc, 'property="og:image"')).toMatch(
          new RegExp(`^${SITE_URL}/`),
        );
        expect(meta(doc, 'name="twitter:card"')).toBe('summary_large_image');
        expect(meta(doc, 'property="og:title"')).toBe(
          doc.querySelector('title')?.textContent,
        );
      });

      it('when parsed, then JSON-LD parses and carries the expected @type values', () => {
        const scripts = doc.querySelectorAll(
          'script[type="application/ld+json"]',
        );
        const types = scripts.map(
          (script) =>
            (JSON.parse(script.textContent) as { '@type': string })['@type'],
        );
        expect(types).toContain('WebPage');
        if (isHome)
          expect(types).toEqual(expect.arrayContaining(['Person', 'WebSite']));
      });

      it('when parsed, then an indexable page lists every language version, and each one exists', () => {
        if (!page.indexable) return;
        const base = unlocalizedPath(page.pathname);
        const alternates = Object.fromEntries(
          doc
            .querySelectorAll('link[rel="alternate"][hreflang]')
            .map((link) => [
              link.getAttribute('hreflang'),
              link.getAttribute('href'),
            ]),
        );
        expect(alternates['x-default']).toBe(absoluteUrl(base));
        for (const locale of LOCALES) {
          const target = localizedPath(base, locale);
          expect(alternates[locale]).toBe(absoluteUrl(target));
          expect(pagePaths.has(target), target).toBe(true);
        }
      });

      it('when parsed, then robots is explicit', () => {
        expect(['index, follow', 'noindex, nofollow']).toContain(
          meta(doc, 'name="robots"'),
        );
      });
    },
  );

  describe('given the build outputs', () => {
    it('when sitemap.xml is read, then it lists exactly the indexable pages', () => {
      const sitemap = readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
      const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
        .map((m) => m[1]?.trim())
        .sort();
      const expected = pages
        .filter((p) => p.indexable)
        .map((p) => absoluteUrl(p.pathname))
        .sort();
      expect(locs).toEqual(expected);
      expect(sitemap).toMatch(/<lastmod>/);
    });

    it('when robots.txt is read, then it allows crawling and points to the sitemap', () => {
      const robots = readFileSync(path.join(dist, 'robots.txt'), 'utf8');
      expect(robots).toMatch(/User-agent: \*/);
      expect(robots).toMatch(/Allow: \//);
      expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
    });

    it('when the client build is listed, then 404.html and site.webmanifest exist', () => {
      expect(existsSync(path.join(dist, '404.html'))).toBe(true);
      expect(existsSync(path.join(dist, 'site.webmanifest'))).toBe(true);
    });
  });
});
