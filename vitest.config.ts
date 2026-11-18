import { defineConfig, mergeConfig, type ViteUserConfig } from 'vitest/config';
import viteConfig from './vite.config';

/** The React Router plugin drives the app build; tests use plain Vite. */
const isReactRouterPlugin = (plugin: unknown) =>
  Boolean(
    plugin &&
    typeof plugin === 'object' &&
    'name' in plugin &&
    String((plugin as { name: unknown }).name).startsWith('react-router'),
  );
const baseConfig = {
  ...viteConfig,
  plugins: (viteConfig.plugins as unknown[])
    .flat(3)
    .filter((plugin) => !isReactRouterPlugin(plugin)),
} as unknown as ViteUserConfig;

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            environment: 'jsdom',
            // axe scans of whole sections (squad, hero) take a few seconds
            // under coverage; 5 s made them flaky on a busy machine.
            testTimeout: 15_000,
            globals: true,
            include: ['src/**/*.test.{ts,tsx}'],
            setupFiles: ['src/test/setup.ts'],
            css: { modules: { classNameStrategy: 'non-scoped' } },
            restoreMocks: true,
          },
        },
        {
          extends: true,
          test: {
            name: 'seo',
            environment: 'node',
            globals: true,
            include: ['tests/seo/**/*.test.ts'],
          },
        },
      ],
      coverage: {
        provider: 'v8',
        reporter: ['text-summary', 'lcov'],
        reportsDirectory: 'coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/test/**',
          'src/**/*.d.ts',
          'src/root.tsx',
          'src/routes.ts',
        ],
      },
    },
  }),
);
