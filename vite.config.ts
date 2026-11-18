import path from 'node:path';
import { reactRouter } from '@react-router/dev/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import {
  defineConfig,
  type ConfigEnv,
  type Plugin,
  type PluginOption,
} from 'vite';
import { imagetools } from 'vite-imagetools';
import { securityHeaders } from './src/utils/csp-headers.ts';

const isAnalyze = process.env.ANALYZE === 'true';

/** Client bundle only: the SSR build would otherwise overwrite the report. */
const analyzerPlugin = (): PluginOption => {
  const plugin = visualizer({
    filename: 'reports/bundle-stats.html',
    gzipSize: true,
    template:
      (process.env.ANALYZE_TEMPLATE as 'treemap' | 'raw-data' | undefined) ??
      'treemap',
  }) as Plugin;
  return { ...plugin, apply: (_config, env: ConfigEnv) => !env.isSsrBuild };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    reactRouter(),
    imagetools({
      // `import img from './x.png?picture'` → responsive AVIF/WebP/PNG picture.
      defaultDirectives: (url) => {
        if (url.searchParams.has('picture')) {
          return new URLSearchParams({
            w: '320;640;960;1280',
            format: 'avif;webp;png',
            as: 'picture',
          });
        }
        // `import url from './x.png?screen'` → one 1280px JPEG URL, for
        // painting onto the 3D stadium's big screens.
        if (url.searchParams.has('screen')) {
          return new URLSearchParams({
            w: '1280',
            format: 'jpg',
            quality: '82',
          });
        }
        return new URLSearchParams();
      },
    }),
    isAnalyze && analyzerPlugin(),
  ],
  // Production headers live in vercel.json; a unit test keeps both in sync.
  server: { headers: securityHeaders },
  preview: { headers: securityHeaders },
  css: {
    preprocessorOptions: {
      scss: {
        // Breakpoint mixins and spacing() available in every stylesheet.
        additionalData: `@use '${path.resolve(import.meta.dirname, 'src/styles/helpers').replaceAll('\\', '/')}' as *;`,
      },
    },
    modules: { localsConvention: 'camelCaseOnly' },
  },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  // Every client dependency (three's addons included: they sit behind a dynamic
  // import) is listed so the dev server optimises them all at startup. One
  // discovered mid-session re-bundles and 504s ("Outdated Optimize Dep").
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-router',
      'react-aria-components',
      'i18next',
      'react-i18next',
      'three',
      'three/addons/postprocessing/EffectComposer.js',
      'three/addons/postprocessing/OutputPass.js',
      'three/addons/postprocessing/RenderPass.js',
      'three/addons/postprocessing/UnrealBloomPass.js',
      'three/addons/postprocessing/ShaderPass.js',
      'three/addons/utils/BufferGeometryUtils.js',
    ],
  },
  build: {
    sourcemap: false,
    reportCompressedSize: true,
  },
});
