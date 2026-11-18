import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Tag } from '@/components/ui/tag';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { POSITION_LABEL, bench, startingXi } from '@/content/squad';
import { playerPath } from '@/content/squad-slugs';
import { useLocalizedPath } from '@/hooks/use-locale';
import { cx } from '@/utils/class-names';
import styles from './squad-screen.module.scss';

export interface SquadScreenProps {
  isActive: boolean;
  isInert: boolean;
  className?: string;
}

/**
 * Game-style squad menu: the whole XI at once, each a link to its scout
 * report, with the bench underneath. The skim view for recruiters.
 */
export const SquadScreen = ({
  isActive,
  isInert,
  className,
}: SquadScreenProps) => {
  const { t } = useTranslation('squad');
  const localize = useLocalizedPath();

  return (
    <section
      id="squad"
      aria-labelledby="squad-title"
      className={cx(styles.screen, className)}
      data-active={isActive || undefined}
      inert={isInert}
    >
      <Tag>
        {t('team.name')} · {t('team.formation')}
      </Tag>
      <h2 id="squad-title" className={styles.title}>
        {t('team.squadTitle')}
      </h2>
      <p className={styles.lead}>{t('team.squadLead')}</p>
      <ul className={styles.grid}>
        {startingXi.map((player) => (
          <li key={player.slug}>
            <Link
              to={localize(playerPath(player.slug))}
              className={cx(styles.player, player.isCaptain && styles.captain)}
            >
              <span className={styles.number}>{player.number}</span>
              <span className={styles.name}>
                {t(`players.${player.slug}.title`)}
              </span>
              <span className={styles.meta}>
                {POSITION_LABEL[player.slot]} ·{' '}
                {t(`players.${player.slug}.club`)}
              </span>
              <VisuallyHidden> · {t('team.scoutReport')}</VisuallyHidden>
            </Link>
          </li>
        ))}
      </ul>
      <h3 className={styles.benchTitle}>{t('team.bench')}</h3>
      <ul className={styles.bench}>
        {bench.map((sub) => {
          const content = (
            <>
              <span className={styles.subName}>
                {t(`bench.${sub.slug}.title`)}
              </span>
              <span className={styles.subTag}>
                {t(`bench.${sub.slug}.tag`)}
              </span>
            </>
          );
          return (
            <li key={sub.slug} title={t(`bench.${sub.slug}.summary`)}>
              {sub.href ? (
                <a
                  className={styles.sub}
                  href={sub.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {content}
                  <VisuallyHidden>
                    {' '}
                    ({t('common:nav.opensInNewTab')})
                  </VisuallyHidden>
                </a>
              ) : (
                <span className={styles.sub}>{content}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
