import { useTranslation } from 'react-i18next';
import { LinkButton } from '@/components/ui/link-button';
import { Tag } from '@/components/ui/tag';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { PERSON_EMAIL, SOCIAL_LINKS } from '@/seo/site';
import { cx } from '@/utils/class-names';
import styles from './full-time-panel.module.scss';

export interface FullTimePanelProps {
  isActive: boolean;
  isInert: boolean;
  className?: string;
}

/** Closing call to action with the contact details. */
export const FullTimePanel = ({
  isActive,
  isInert,
  className,
}: FullTimePanelProps) => {
  const { t } = useTranslation('home');

  return (
    <section
      id="contact"
      aria-labelledby="full-time-title"
      className={cx(styles.panel, className)}
      data-active={isActive || undefined}
      inert={isInert}
    >
      <Tag>{t('fullTime.kicker')}</Tag>
      <h2 id="full-time-title" className={styles.title}>
        {t('fullTime.title')}{' '}
        <span className={styles.accent}>{t('fullTime.titleAccent')}</span>
      </h2>
      <div className={styles.actions}>
        <LinkButton href={`mailto:${PERSON_EMAIL}`}>
          {t('fullTime.email')}
        </LinkButton>
        {SOCIAL_LINKS.map((link) => (
          <LinkButton
            key={link.id}
            href={link.href}
            variant="outline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.label}
            <VisuallyHidden> ({t('common:nav.opensInNewTab')})</VisuallyHidden>
          </LinkButton>
        ))}
      </div>
      <p className={styles.email}>{PERSON_EMAIL}</p>
    </section>
  );
};
