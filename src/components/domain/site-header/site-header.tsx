import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { LinkButton } from '@/components/ui/link-button';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { useLocale, useLocalizedPath } from '@/hooks/use-locale';
import { localizedPath, unlocalizedPath } from '@/seo/hreflang';
import { CV_PATH, LOCALE_NAMES, LOCALES } from '@/seo/site';
import styles from './site-header.module.scss';

/** Matchday bar over the stadium: name, matchday line, profile link, language switch and the CV download. */
export const SiteHeader = () => {
  const { t } = useTranslation('common');
  const { pathname } = useLocation();
  const locale = useLocale();
  const localize = useLocalizedPath();
  const other = LOCALES.find((candidate) => candidate !== locale) ?? locale;

  return (
    <header className={styles.header}>
      <Link
        to={localize('/')}
        className={styles.logo}
        aria-label={t('header.home')}
      >
        <span className={styles.name}>
          <span>{t('header.firstName')}</span>{' '}
          <span>{t('header.lastName')}</span>
        </span>
      </Link>
      <p className={styles.matchday}>
        <span className={styles.live} aria-hidden="true" />
        <strong>{t('header.matchday')}</strong> · {t('header.location')}
      </p>
      <nav aria-label={t('nav.label')} className={styles.nav}>
        <a href={localize('/#profile')} className={styles.link}>
          {t('header.profile')}
        </a>
        <Link
          to={localizedPath(unlocalizedPath(pathname), other)}
          className={styles.link}
          hrefLang={other}
          lang={other}
        >
          {other.toUpperCase()}
          <VisuallyHidden> · {LOCALE_NAMES[other]}</VisuallyHidden>
        </Link>
        <LinkButton href={CV_PATH} size="sm" download>
          <span className={styles.long}>{t('header.download')}</span>{' '}
          {t('header.cv')}
        </LinkButton>
      </nav>
    </header>
  );
};
