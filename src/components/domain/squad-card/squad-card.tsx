import { useTranslation } from 'react-i18next';
import { ChipList } from '@/components/ui/chip-list';
import { LinkButton } from '@/components/ui/link-button';
import { Panel } from '@/components/ui/panel';
import { Picture } from '@/components/ui/picture';
import { StatTiles } from '@/components/ui/stat-tiles';
import { Tag } from '@/components/ui/tag';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { POSITION_LABEL, type SquadPlayer } from '@/content/squad';
import { playerPath } from '@/content/squad-slugs';
import { useLocalizedPath } from '@/hooks/use-locale';
import { cx } from '@/utils/class-names';
import styles from './squad-card.module.scss';

export interface SquadCardProps {
  player: SquadPlayer;
  className?: string;
}

/**
 * One project as a player: screenshot as the photo, shirt number, position,
 * what the project is, three stats, the stack and a link to the scout report.
 */
export const SquadCard = ({ player, className }: SquadCardProps) => {
  const { t } = useTranslation('squad');
  const localize = useLocalizedPath();
  // `fallback` covers stat values that only some languages translate.
  const copy = (key: string, fallback?: string) =>
    t(`players.${player.slug}.${key}`, { defaultValue: fallback });
  const position = POSITION_LABEL[player.slot];

  return (
    <Panel
      as="article"
      edge="left"
      className={cx(styles.card, player.isCaptain && styles.captain, className)}
    >
      <div className={styles.photo}>
        {player.shot ? (
          <Picture
            picture={player.shot.picture}
            alt={copy('imageAlt')}
            sizes="(max-width: 768px) 90vw, 30rem"
            pictureClassName={styles.picture}
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true" />
        )}
        <span className={styles.number} aria-hidden="true">
          {player.number}
        </span>
        <p className={styles.badges}>
          <Tag tone="brand">{position}</Tag>
          {player.isCaptain && <Tag>{t('team.captain')}</Tag>}
        </p>
      </div>
      <div className={styles.body}>
        <p className={styles.club}>
          {copy('club')} · {copy('period')}
        </p>
        <h2 className={styles.title}>
          <VisuallyHidden>#{player.number} </VisuallyHidden>
          {copy('title')}
        </h2>
        <p className={styles.about}>{copy('about')}</p>
        <StatTiles
          className={styles.stats}
          items={player.stats.map((stat) => ({
            value: copy(`values.${stat.labelKey}`, stat.value),
            label: copy(`stats.${stat.labelKey}`),
          }))}
        />
        <ChipList
          className={styles.stack}
          label={t('team.stack')}
          items={player.stack}
        />
        <LinkButton
          className={styles.link}
          href={localize(playerPath(player.slug))}
          size="sm"
        >
          {t('team.scoutReport')} →
        </LinkButton>
      </div>
    </Panel>
  );
};
