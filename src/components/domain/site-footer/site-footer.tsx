import { useTranslation } from 'react-i18next';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { SOCIAL_LINKS } from '@/seo/site';
import styles from './site-footer.module.scss';

// Evaluated once per bundle load (build time for the prerender); the <p> has
// suppressHydrationWarning for the new-year edge case.
const YEAR = new Date().getFullYear();

/** Site footer: social links and copyright. */
export const SiteFooter = () => {
  const { t } = useTranslation('common');

  return (
    <footer className={styles.footer}>
      <p className={styles.copyright} suppressHydrationWarning>
        {t('footer.copyright', { year: YEAR })}
      </p>
      <nav aria-label={t('footer.social')}>
        <ul className={styles.list}>
          {SOCIAL_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
                <VisuallyHidden> ({t('nav.opensInNewTab')})</VisuallyHidden>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
};
