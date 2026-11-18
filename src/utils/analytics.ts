type AnalyticsWindow = Window & {
  va?: (...args: unknown[]) => void;
  vaq?: unknown[][];
};

/**
 * Vercel Web Analytics: cookieless, first-party page views (DECISIONS § 20).
 * Loads only on the production host, so local runs, previews and tests make
 * no requests to a script that exists only on Vercel. Idempotent.
 */
export const loadAnalytics = (
  siteUrl: string,
  hostname: string = window.location.hostname,
): void => {
  if (hostname !== new URL(siteUrl).hostname) return;
  if (document.querySelector('script[data-analytics]')) return;
  const target = window as AnalyticsWindow;
  target.va ??= (...args: unknown[]) => {
    (target.vaq ??= []).push(args);
  };
  const script = document.createElement('script');
  script.src = '/_vercel/insights/script.js';
  script.defer = true;
  script.dataset.analytics = '';
  document.head.append(script);
};
