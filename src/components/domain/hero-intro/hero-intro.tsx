import { useTranslation } from 'react-i18next';
import { Tag } from '@/components/ui/tag';
import { cx } from '@/utils/class-names';
import styles from './hero-intro.module.scss';

export interface HeroIntroProps {
  /** Shown on stage; inactive panels are hidden by the hero and made inert. */
  isActive: boolean;
  isInert: boolean;
  /** Jumps past the walk-out; without JavaScript the link's `#squad` anchor does it. */
  onSkip?: () => void;
  className?: string;
}

/** Opening title over the tunnel: the page's one h1. */
export const HeroIntro = ({
  isActive,
  isInert,
  onSkip,
  className,
}: HeroIntroProps) => {
  const { t } = useTranslation('home');

  return (
    <div
      className={cx(styles.intro, className)}
      data-active={isActive || undefined}
      inert={isInert}
    >
      <Tag>{t('intro.kicker')}</Tag>
      <h1 className={styles.title}>
        <span className={styles.first}>{t('intro.firstName')}</span>{' '}
        <span className={styles.last}>{t('intro.lastName')}</span>
      </h1>
      <p className={styles.lead}>{t('intro.lead')}</p>
      <div className={styles.actions}>
        <p className={styles.scroll} aria-hidden="true">
          <span className={styles.wheel} />
          {t('intro.scroll')}
        </p>
        <a
          href="#squad"
          className={styles.skip}
          onClick={(event) => {
            if (!onSkip) return;
            event.preventDefault();
            onSkip();
          }}
        >
          {t('intro.skip')} →
        </a>
      </div>
      <p className={styles.keys}>{t('intro.keys')}</p>
    </div>
  );
};
