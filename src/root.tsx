import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useHref,
  useLocation,
  useNavigate,
} from 'react-router';
import { useEffect, useRef, type ReactNode } from 'react';
import { RouterProvider } from 'react-aria-components';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { SiteFooter } from '@/components/domain/site-footer';
import { SiteHeader } from '@/components/domain/site-header';
import { SkipLink } from '@/components/ui/skip-link';
import { useLocale } from '@/hooks/use-locale';
import { i18nFor, initI18n, registerNamespace } from '@/i18n/i18n';
import common from '@/i18n/locales/en/common.json';
import { notFoundContent } from '@/content/not-found';
import { buildPageMeta } from '@/seo/page-meta';
import { NotFoundContent } from './routes/not-found/not-found';
import styles from './root.module.scss';

import './styles/globals.scss';
import type { Route } from './+types/root';

initI18n();
registerNamespace('common', common);

const MAIN_ID = 'main';

// Survives ErrorBoundary remounts, so a client-side 404 also moves focus.
let lastPathname: string | null = null;

/**
 * Runs before first paint (inline in <head>): marks that scripts run, so the
 * scroll-driven stadium layout only applies when JavaScript can drive it.
 * Without JavaScript the hero panels render as one readable column.
 */
const PRE_PAINT_SCRIPT = `document.documentElement.setAttribute('data-js','')`;

/** Head for error states: client-side 404s get the not-found page's meta. */
export const meta: Route.MetaFunction = ({ error }) =>
  isRouteErrorResponse(error) && error.status === 404
    ? buildPageMeta({ pathname: '/404', ...notFoundContent.seo })
    : [];

export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: '/favicon/favicon.ico', sizes: '32x32' },
  { rel: 'icon', href: '/favicon/favicon.svg', type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: '/favicon/apple-touch-icon.png' },
  { rel: 'manifest', href: '/site.webmanifest' },
  // Only the above-the-fold faces are preloaded (docs/PERFORMANCE.md § Fonts).
  {
    rel: 'preload',
    href: '/fonts/inter/inter-latin-wght-normal.woff2',
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'preload',
    href: '/fonts/russo-one/russo-one-latin-400.woff2',
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  },
];

/** Document shell. Rendered once at build time per page; not re-rendered on navigation. */
export const Layout = ({ children }: { children: ReactNode }) => (
  // The inline head script adds `data-js` before hydration (no-JS fallback).
  <html lang={useLocale()} suppressHydrationWarning>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- static, build-time string */}
      <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_SCRIPT }} />
      <Meta />
      <Links />
    </head>
    <body>
      {children}
      <ScrollRestoration />
      <Scripts />
    </body>
  </html>
);

/** Every page renders in the language its URL names (`/hr/…` → Croatian). */
const AppShell = ({ children }: { children: ReactNode }) => {
  const locale = useLocale();

  // Layout is not re-rendered on client navigation, so keep <html lang> current here.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <I18nextProvider i18n={i18nFor(locale)}>
      <Chrome>{children}</Chrome>
    </I18nextProvider>
  );
};

const Chrome = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('common');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);

  // Client-side navigation: move focus to the new page content.
  useEffect(() => {
    if (lastPathname !== null && lastPathname !== pathname) {
      mainRef.current?.focus({ preventScroll: true });
    }
    lastPathname = pathname;
  }, [pathname]);

  return (
    // Lets react-aria-components Links navigate client-side.
    <RouterProvider navigate={navigate} useHref={useHref}>
      <SkipLink href={`#${MAIN_ID}`}>{t('skipToContent')}</SkipLink>
      <SiteHeader />
      <main id={MAIN_ID} ref={mainRef} tabIndex={-1} className={styles.main}>
        {children}
      </main>
      <SiteFooter />
    </RouterProvider>
  );
};

export default function App() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

/** Unknown client-side URLs (404) and render errors keep the site chrome. */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <AppShell>
      {isNotFound ? (
        <NotFoundContent />
      ) : (
        <div className={styles.error}>
          <h1>Something went wrong</h1>
          <p>{error instanceof Error ? error.message : 'Unexpected error'}</p>
        </div>
      )}
    </AppShell>
  );
}
