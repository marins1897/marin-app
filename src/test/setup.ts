import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import 'vi-axe/extend-expect';
import { initI18n, registerNamespace } from '@/i18n/i18n';
import common from '@/i18n/locales/en/common.json';
import home from '@/i18n/locales/en/home.json';
import notFound from '@/i18n/locales/en/not-found.json';
import profile from '@/i18n/locales/en/profile.json';
import scout from '@/i18n/locales/en/scout.json';
import squad from '@/i18n/locales/en/squad.json';
import { installIntersectionObserverMock } from './intersection-observer';
import { server } from './msw/server';

// Real English resources: tests assert on the copy users actually see.
initI18n();
registerNamespace('common', common);
registerNamespace('home', home);
registerNamespace('not-found', notFound);
registerNamespace('squad', squad);
registerNamespace('scout', scout);
registerNamespace('profile', profile);

// jsdom lacks matchMedia and IntersectionObserver.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList,
});
installIntersectionObserverMock();

// Network is mocked at the boundary only. Unknown requests fail the test.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  window.localStorage.clear();
});
afterAll(() => server.close());
