import { useTranslation } from 'react-i18next';
import { Panel } from '@/components/ui/panel';
import { Tag } from '@/components/ui/tag';
import { homeContent } from '@/content/home';
import styles from './coach-card.module.scss';

export interface CoachCardProps {
  isActive: boolean;
  isInert: boolean;
  className?: string;
}

/** Marin as Inter Faces' head coach: formation, style of play and trophy cabinet. */
export const CoachCard = ({ isActive, isInert, className }: CoachCardProps) => {
  const { t } = useTranslation('home');

  return (
    <Panel
      as="section"
      isTextured
      aria-label={t('coach.label')}
      className={className}
      data-active={isActive || undefined}
      inert={isInert}
    >
      <Tag>{t('coach.role')}</Tag>
      <p className={styles.name}>{t('coach.name')}</p>
      <p className={styles.team}>{t('coach.team')}</p>
      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>{t('coach.formationLabel')}</dt>
          <dd className={styles.formation}>{t('coach.formation')}</dd>
        </div>
        <div className={styles.fact}>
          <dt>{t('coach.styleLabel')}</dt>
          <dd className={styles.style}>{t('coach.style')}</dd>
        </div>
      </dl>
      <p className={styles.heading}>{t('coach.trophiesTitle')}</p>
      <ul className={styles.trophies}>
        {homeContent.trophies.map((id) => (
          <li key={id} className={styles.trophy}>
            <svg
              className={styles.cup}
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V17h3v4H8v-4h3v-2.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3V3Zm0 4H6v1a2 2 0 0 0 1 1.7V7Zm10 0v2.7A2 2 0 0 0 18 8V7h-1Z" />
            </svg>
            <span className={styles.trophyTitle}>
              {t(`coach.trophies.${id}.title`)}
            </span>
            <span className={styles.trophyMeta}>
              {t(`coach.trophies.${id}.meta`)}
            </span>
          </li>
        ))}
      </ul>
      <p className={styles.footer}>
        <span>{t('coach.experience')}</span>
        <span>{t('coach.stack')}</span>
      </p>
    </Panel>
  );
};
