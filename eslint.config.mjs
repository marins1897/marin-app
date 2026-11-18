import { defineConfig } from 'eslint/config';
import eslintReact from '@eslint-react/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import checkFile from 'eslint-plugin-check-file';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * `components/ui/**` is the future component library: React + its own SCSS
 * only. No app modules, no design system, no router, no i18n, no network.
 * See CLAUDE.md § Component architecture.
 */
const UI_LAYER_FORBIDDEN_IMPORTS = [
  {
    name: 'react-router',
    message: 'ui/ receives href/render props, it does not route.',
  },
  {
    name: 'react-i18next',
    message: 'ui/ receives rendered text, it does not translate.',
  },
  {
    name: 'i18next',
    message: 'ui/ receives rendered text, it does not translate.',
  },
];
const UI_LAYER_FORBIDDEN_PATTERNS = [
  {
    group: ['@/*', '!@/components/ui/**'],
    message:
      'ui/ must stay extractable as a library: import only sibling ui modules.',
  },
  {
    group: ['../../domain/**', '../../../**'],
    message: 'ui/ must not reach into the app.',
  },
];

export default defineConfig(
  {
    ignores: [
      'build/**',
      '.react-router/**',
      'coverage/**',
      'reports/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  { plugins: { 'import-x': importX } },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommended,
      eslintReact.configs['recommended-typescript'],
      jsxA11y.flatConfigs.strict,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    settings: {
      'import-x/resolver': {
        typescript: true,
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'check-file': checkFile },
    rules: {
      'no-duplicate-imports': 'error',
      'no-console': ['error', { allow: ['warn', 'info', 'error'] }],
      // Named exports only; React Router route modules are the exception below.
      'import-x/no-default-export': 'error',
      'import-x/extensions': [
        'error',
        'never',
        { json: 'always', scss: 'always', css: 'always' },
      ],
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'unknown',
            'type',
          ],
          pathGroups: [
            { pattern: '@/**', group: 'internal' },
            // Generated route types live next to the module; keep them last.
            { pattern: './+types/**', group: 'type', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
      // Layering: api/ depends only on fetch; hooks/ on api/; components on hooks/.
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/api',
              from: './src',
              except: ['./api', './utils', './seo', './content'],
              message:
                'api/ is the bottom layer: it may only use utils/, seo/ and content/.',
            },
            {
              target: './src/hooks',
              from: './src',
              except: [
                './hooks',
                './api',
                './utils',
                './context',
                './seo',
                './content',
                './i18n',
              ],
              message: 'hooks/ may not import components, routes or root.',
            },
            {
              target: './src/utils',
              from: './src',
              except: ['./utils'],
              message: 'utils/ are pure helpers with no app imports.',
            },
          ],
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        { 'src/**/': 'KEBAB_CASE' },
      ],
      'check-file/filename-naming-convention': [
        'error',
        { 'src/**/*.{ts,tsx}': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // React Router route modules export data/meta functions next to the component.
      'react-refresh/only-export-components': [
        'error',
        {
          allowConstantExport: true,
          allowExportNames: [
            'meta',
            'links',
            'loader',
            'clientLoader',
            'action',
            'clientAction',
            'headers',
            'handle',
            'shouldRevalidate',
            'Layout',
            'ErrorBoundary',
            'HydrateFallback',
          ],
        },
      ],
    },
  },
  // components/ui is a library-in-waiting: React and sibling ui modules only.
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: UI_LAYER_FORBIDDEN_IMPORTS,
          patterns: UI_LAYER_FORBIDDEN_PATTERNS,
        },
      ],
    },
  },
  // React Router route modules and config export defaults by convention.
  {
    files: ['src/root.tsx', 'src/routes.ts', 'src/routes/**/*.tsx'],
    rules: { 'import-x/no-default-export': 'off' },
  },
  // Context modules export a provider and its hook together by convention.
  {
    files: ['src/context/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  // Tests: vitest globals, spreading allowed for prop fixtures.
  {
    files: [
      'src/**/*.test.{ts,tsx}',
      'src/test/**/*.{ts,tsx}',
      'tests/**/*.ts',
      'e2e/**/*.ts',
    ],
    languageOptions: { globals: { ...globals.vitest, ...globals.node } },
    rules: {
      'react-refresh/only-export-components': 'off',
      'no-restricted-imports': 'off',
      'import-x/no-restricted-paths': 'off',
    },
  },
  // Config and scripts: default exports are the convention, node globals.
  {
    files: ['*.config.{ts,mjs,cjs}', 'scripts/**/*.ts', 'src/vite-env.d.ts'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'import-x/no-default-export': 'off',
      'import-x/extensions': ['error', 'ignorePackages', { ts: 'always' }],
      'check-file/filename-naming-convention': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['vitest.config.ts', 'playwright.config.ts'],
    rules: { 'import-x/extensions': 'off' },
  },
  eslintConfigPrettier,
);
