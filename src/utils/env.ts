/**
 * Typed access to public build-time configuration. Works under Vite (browser,
 * SSG) and plain Node (scripts, Playwright) where `import.meta.env` is absent.
 */
type EnvKey = 'VITE_SITE_URL';

const viteEnv: Record<string, string | undefined> =
  (import.meta as unknown as { env?: Record<string, string | undefined> })
    .env ?? {};
const nodeEnv: Record<string, string | undefined> =
  typeof process === 'undefined' ? {} : process.env;

const read = (key: EnvKey): string | undefined => {
  const value = viteEnv[key] ?? nodeEnv[key];
  return value === '' ? undefined : value;
};

export const env = {
  siteUrl: read('VITE_SITE_URL'),
} as const;
