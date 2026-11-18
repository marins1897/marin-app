import { POSITION_LABEL, findPlayer } from '@/content/squad';
import { i18n } from '@/i18n/i18n';
import { buildPageLinks, buildPageMeta } from '@/seo/page-meta';
import type { Locale } from '@/seo/site';
import type { MetaDescriptor } from 'react-router';

const pathOf = (slug: string) => `/projects/${slug}`;

const HOME_LABEL: Record<Locale, string> = { en: 'Home', hr: 'Početna' };

/**
 * Head for one scout report in one language. `links` gets no route params, so
 * the canonical and hreflang links of this dynamic route travel with the meta
 * descriptors.
 */
export const projectMeta = (
  slug: string | undefined,
  locale: Locale,
): MetaDescriptor[] => {
  const player = findPlayer(slug);
  if (!player) return [];
  const t = i18n.getFixedT(locale, 'squad');
  const title = t(`players.${player.slug}.title`);
  const pathname = pathOf(player.slug);
  return [
    ...buildPageMeta({
      pathname,
      locale,
      title: `${title} · #${player.number} ${POSITION_LABEL[player.slot]}`,
      description: i18n.getFixedT(
        locale,
        'scout',
      )(`players.${player.slug}.summary`),
      breadcrumbs: [
        { name: HOME_LABEL[locale], pathname: '/' },
        { name: title, pathname },
      ],
    }),
    ...buildPageLinks(pathname, { locale }).map((link) => ({
      tagName: 'link' as const,
      ...link,
    })),
  ];
};
