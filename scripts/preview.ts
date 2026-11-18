/**
 * Static preview of build/client that behaves like Vercel: clean URLs,
 * `404.html` with a 404 status for unknown paths, the security headers from
 * vercel.json, immutable caching for hashed assets, and gzip. Used by
 * `pnpm preview`, Playwright and Lighthouse so measurements match production.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { createGzip } from 'node:zlib';
import { securityHeaders } from '../src/utils/csp-headers.ts';
import { CLIENT_BUILD_DIR } from './lib/prerendered-pages.ts';

const PORT = Number(process.env.PORT ?? 4173);
const root = path.resolve(process.cwd(), CLIENT_BUILD_DIR);

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.data': 'text/x-script; charset=utf-8',
};
const COMPRESSIBLE = new Set([
  '.html',
  '.js',
  '.css',
  '.json',
  '.xml',
  '.txt',
  '.svg',
  '.webmanifest',
  '.data',
]);

/** Clean URLs: `/foo` → `foo.html` or `foo/index.html`. */
const resolveFile = (pathname: string): string | null => {
  const safe = path
    .normalize(decodeURIComponent(pathname))
    .replace(/^(\.\.[/\\])+/, '');
  const candidates = [
    path.join(root, safe),
    path.join(root, `${safe}.html`),
    path.join(root, safe, 'index.html'),
  ];
  for (const file of candidates) {
    if (file.startsWith(root) && existsSync(file) && statSync(file).isFile())
      return file;
  }
  return null;
};

const server = createServer((req, res) => {
  const url = new URL(
    req.url ?? '/',
    `http://${req.headers.host ?? 'localhost'}`,
  );
  const found = resolveFile(
    url.pathname === '/' ? '/index.html' : url.pathname,
  );
  const file = found ?? path.join(root, '404.html');
  const status = found ? 200 : 404;
  const ext = path.extname(file);

  for (const [key, value] of Object.entries(securityHeaders))
    res.setHeader(key, value);
  res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream');
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/fonts/')
  ) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }

  const acceptsGzip = /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');
  if (acceptsGzip && COMPRESSIBLE.has(ext)) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    res.writeHead(status);
    createReadStream(file).pipe(createGzip()).pipe(res);
    return;
  }
  res.setHeader('Content-Length', statSync(file).size);
  res.writeHead(status);
  createReadStream(file).pipe(res);
});

server.listen(PORT, 'localhost', () => {
  console.log(`Preview of ${CLIENT_BUILD_DIR} on http://localhost:${PORT}`);
});
