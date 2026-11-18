import { useTranslation } from 'react-i18next';
import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/link-button';
import { Tag } from '@/components/ui/tag';
import { notFoundContent } from '@/content/not-found';
import { useLocalizedPath } from '@/hooks/use-locale';
import { registerNamespace } from '@/i18n/i18n';
import notFound from '@/i18n/locales/en/not-found.json';
import { buildPageLinks, buildPageMeta } from '@/seo/page-meta';
import styles from './not-found.module.scss';
import type { Route } from './+types/not-found';

const PATHNAME = '/404';

registerNamespace('not-found', notFound);

export const meta: Route.MetaFunction = () =>
  buildPageMeta({ pathname: PATHNAME, ...notFoundContent.seo });

export const links: Route.LinksFunction = () =>
  buildPageLinks(PATHNAME, { hasAlternates: false });

/** Offside: shared by the prerendered /404 page and root.tsx's ErrorBoundary. */
export const NotFoundContent = () => {
  const { t } = useTranslation('not-found');
  const localize = useLocalizedPath();

  return (
    <Container as="article" className={styles.page}>
      <span className={styles.number} aria-hidden="true">
        404
      </span>
      <svg
        className={styles.flag}
        viewBox="0 0 64 96"
        aria-hidden="true"
        focusable="false"
      >
        <rect
          className={styles.pole}
          x="6"
          y="4"
          width="5"
          height="92"
          rx="2"
        />
        <rect className={styles.lime} x="11" y="6" width="22" height="15" />
        <rect className={styles.red} x="33" y="6" width="22" height="15" />
        <rect className={styles.red} x="11" y="21" width="22" height="15" />
        <rect className={styles.lime} x="33" y="21" width="22" height="15" />
      </svg>
      <div className={styles.copy}>
        <Tag>{t('kicker')}</Tag>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.lead}>{t('message')}</p>
        <div className={styles.actions}>
          <LinkButton href={localize('/')}>{t('backHome')}</LinkButton>
          <LinkButton href={localize('/#profile')} variant="outline">
            {t('profile')}
          </LinkButton>
        </div>
      </div>
    </Container>
  );
};

/** 404 page; prerendered to `build/client/404.html` for Vercel. */
export default function NotFoundPage() {
  return <NotFoundContent />;
}
