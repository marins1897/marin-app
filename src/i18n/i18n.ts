import i18n, { type i18n as I18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '../seo/site';

/**
 * Idempotent. `root.tsx` calls it at module scope so it runs before any
 * render, at build time (prerender) and in the browser. This instance is the
 * default locale; other locales get a clone from `i18nFor`.
 */
export const initI18n = (): typeof i18n => {
  if (i18n.isInitialized) return i18n;

  void i18n.use(initReactI18next).init({
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...LOCALES],
    nonExplicitSupportedLngs: false,
    load: 'languageOnly',
    defaultNS: 'common',
    ns: [],
    resources: {},
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    initAsync: false,
  });

  return i18n;
};

const instances = new Map<Locale, I18n>();

/**
 * The i18n instance for one locale. The locale comes from the URL (`/hr/…`),
 * never from the browser, so prerender and hydration always agree and client
 * navigation between languages switches instantly. Clones share one resource
 * store, so a namespace registered once serves every instance.
 */
export const i18nFor = (locale: Locale): I18n => {
  const root = initI18n();
  if (locale === DEFAULT_LOCALE) return root;
  let instance = instances.get(locale);
  if (!instance) {
    instance = root.cloneInstance({ lng: locale, initAsync: false });
    instances.set(locale, instance);
  }
  return instance;
};

/**
 * Registers one namespace for one locale. Route modules call this at module
 * scope with a statically imported JSON file, so each namespace travels in its
 * route's chunk (loaded on demand by React Router) instead of the entry.
 */
export const registerNamespace = (
  namespace: string,
  resources: Record<string, unknown>,
  locale: Locale = DEFAULT_LOCALE,
): void => {
  initI18n();
  if (!i18n.hasResourceBundle(locale, namespace)) {
    i18n.addResourceBundle(locale, namespace, resources, true, true);
  }
};

export { i18n };
