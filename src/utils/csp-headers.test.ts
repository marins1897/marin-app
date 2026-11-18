import { readFileSync } from 'node:fs';
import path from 'node:path';
import { cspHeader, securityHeaders } from './csp-headers';

interface VercelHeader {
  key: string;
  value: string;
}
interface VercelConfig {
  headers: { source: string; headers: VercelHeader[] }[];
}

describe('securityHeaders', () => {
  describe('given the production vercel.json', () => {
    it('when compared with the dev-server headers, then every header matches exactly', () => {
      // Given
      const vercel = JSON.parse(
        readFileSync(path.resolve(process.cwd(), 'vercel.json'), 'utf8'),
      ) as VercelConfig;

      // When
      const production = Object.fromEntries(
        (vercel.headers.find((h) => h.source === '/(.*)')?.headers ?? []).map(
          (h) => [h.key, h.value],
        ),
      );

      // Then
      expect(production).toEqual(securityHeaders);
    });
  });

  describe('given the content security policy', () => {
    it('when inspected, then it never allows eval or third-party frames', () => {
      // Given / When
      const directives = cspHeader.split('; ');

      // Then
      expect(cspHeader).not.toContain("'unsafe-eval'");
      expect(directives).toContain("frame-ancestors 'none'");
      expect(directives).toContain("object-src 'none'");
    });
  });
});
