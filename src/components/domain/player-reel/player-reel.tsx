import { useTranslation } from 'react-i18next';
import { SquadCard } from '@/components/domain/squad-card';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { introOrder } from '@/content/squad';
import { cx } from '@/utils/class-names';
import styles from './player-reel.module.scss';

export interface PlayerReelProps {
  /** Player being introduced; -1 outside the introductions. */
  activeIndex: number;
  isInert: boolean;
  className?: string;
}

/**
 * The starting XI as cards, prerendered as a list. During the introductions
 * they share one spot and the current player's card is shown, the way a
 * broadcast brings up each player's graphic before kick-off.
 */
export const PlayerReel = ({
  activeIndex,
  isInert,
  className,
}: PlayerReelProps) => {
  const { t } = useTranslation('squad');

  return (
    <section
      id="players"
      aria-label={t('team.startingXi')}
      className={cx(styles.reel, className)}
      data-active={activeIndex >= 0 || undefined}
      inert={isInert}
    >
      <ol className={styles.list}>
        {introOrder.map((player, index) => (
          <li
            key={player.slug}
            className={styles.item}
            data-current={index === activeIndex || undefined}
          >
            <SquadCard player={player} />
            <p className={styles.progress}>
              <VisuallyHidden>
                {t('team.progress', {
                  current: index + 1,
                  total: introOrder.length,
                })}
              </VisuallyHidden>
              {introOrder.map((other, tick) => (
                <span
                  key={other.slug}
                  className={styles.tick}
                  data-on={tick <= index || undefined}
                  aria-hidden="true"
                />
              ))}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
};
