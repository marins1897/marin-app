/**
 * The prerendered pages are the single source of truth for everything that
 * runs after the build (sitemap, Lighthouse, e2e, SEO contract): React Router
 * writes one HTML file per prerendered path into build/client.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

export const CLIENT_BUILD_DIR = 'build/client';

export interface PrerenderedPage {
  /** Site path, e.g. `/` or `/404`. */
  pathname: string;
  /** Absolute path to the HTML file. */
  file: string;
  /** True unless the page carries `<meta name="robots" content="noindex…">`. */
  indexable: boolean;
}

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name);
    return statSync(file).isDirectory() ? walk(file) : [file];
  });

const toPathname = (relativeFile: string): string => {
  const noExt = relativeFile.replace(/\.html$/, '');
  if (noExt === 'index') return '/';
  return `/${noExt.replace(/\/index$/, '')}`;
};

export const listPrerenderedPages = (
  clientDir = path.resolve(process.cwd(), CLIENT_BUILD_DIR),
): PrerenderedPage[] =>
  walk(clientDir)
    .filter(
      (file) =>
        file.endsWith('.html') &&
        !file.endsWith('__spa-fallback.html') &&
        // root-level 404.html is a copy of 404/index.html for Vercel
        path.relative(clientDir, file) !== '404.html',
    )
    .map((file) => {
      const html = readFileSync(file, 'utf8');
      const robots =
        html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i)?.[1] ?? '';
      return {
        pathname: toPathname(path.relative(clientDir, file)),
        file,
        indexable: !/noindex/i.test(robots),
      };
    })
    .sort((a, b) => a.pathname.localeCompare(b.pathname));
