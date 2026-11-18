import { useTranslation } from 'react-i18next';
import { Panel } from '@/components/ui/panel';
import { Tag } from '@/components/ui/tag';
import { POSITION_LABEL, startingXi } from '@/content/squad';
import styles from './lineup-board.module.scss';

export interface LineupBoardProps {
  isActive: boolean;
  isInert: boolean;
  className?: string;
}

/** Broadcast team sheet: the starting XI in shirt order with positions. */
export const LineupBoard = ({
  isActive,
  isInert,
  className,
}: LineupBoardProps) => {
  const { t } = useTranslation('squad');

  return (
    <Panel
      as="section"
      isTextured
      aria-labelledby="lineup-title"
      className={className}
      data-active={isActive || undefined}
      inert={isInert}
    >
      <Tag>{t('team.startingXi')}</Tag>
      <h2 id="lineup-title" className={styles.team}>
        {t('team.name')}
      </h2>
      <p className={styles.formation}>
        {t('team.formation')} · {t('team.matchday')}
      </p>
      <ol className={styles.sheet}>
        {startingXi.map((player) => (
          <li key={player.slug} className={styles.row}>
            <span className={styles.number}>{player.number}</span>
            <span className={styles.name}>
              {t(`players.${player.slug}.title`)}
              {player.isCaptain && (
                <abbr className={styles.captain} title={t('team.captain')}>
                  {t('team.captainShort')}
                </abbr>
              )}
            </span>
            <span className={styles.position}>
              {POSITION_LABEL[player.slot]}
            </span>
          </li>
        ))}
      </ol>
      <p className={styles.coach}>
        <span>{t('team.coach')}</span> {t('team.coachName')}
      </p>
    </Panel>
  );
};
