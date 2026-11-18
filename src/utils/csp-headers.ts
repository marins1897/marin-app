/**
 * Security headers shared by the Vite dev/preview servers and `vercel.json`.
 * `vercel.json` is static, so a unit test asserts it stays identical to this
 * file. Keep this module free of imports so tests and configs can load it.
 */
const cspDirectives: Record<string, readonly string[]> = {
  'default-src': ["'self'"],
  // 'unsafe-inline' is required by the SSG's hydration bootstrap script and
  // the pre-paint script in root.tsx. No 'unsafe-eval'.
  'script-src': ["'self'", "'unsafe-inline'"],
  // Critical CSS is inlined by beasties; design-system components set style attributes.
  'style-src': ["'self'", "'unsafe-inline'"],
  // blob: lets the 3D scene upload its canvas-drawn textures.
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

export const cspHeader = Object.entries(cspDirectives)
  .map(([directive, sources]) => [directive, ...sources].join(' '))
  .join('; ');

export const securityHeaders: Record<string, string> = {
  'Content-Security-Policy': cspHeader,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};
