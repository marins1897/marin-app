import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router';
import { ChipList } from '@/components/ui/chip-list';
import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/link-button';
import { Panel } from '@/components/ui/panel';
import { Picture } from '@/components/ui/picture';
import { StatTiles } from '@/components/ui/stat-tiles';
import { Tag } from '@/components/ui/tag';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { POSITION_LABEL, findPlayer, startingXi } from '@/content/squad';
import { playerPath } from '@/content/squad-slugs';
import { playerHash } from '@/components/domain/matchday-hero/lib/stage';
import { useLocalizedPath } from '@/hooks/use-locale';
import { registerNamespace } from '@/i18n/i18n';
import scout from '@/i18n/locales/en/scout.json';
import squad from '@/i18n/locales/en/squad.json';
import { DEFAULT_LOCALE } from '@/seo/site';
import { NotFoundContent } from '../not-found/not-found';
import { projectMeta } from './lib/project-meta';
import styles from './project.module.scss';
import type { Route } from './+types/project';

registerNamespace('squad', squad);
registerNamespace('scout', scout);

export const meta: Route.MetaFunction = ({ params }) =>
  projectMeta(params.slug, DEFAULT_LOCALE);

/** Scout report: one project from the starting XI, in full. */
export default function ProjectPage() {
  const { slug } = useParams();
  const { t } = useTranslation('squad');
  const { t: ts } = useTranslation('scout');
  const localize = useLocalizedPath();
  const cameFromSquad =
    (useLocation().state as { from?: string } | null)?.from === 'squad';
  const player = findPlayer(slug);
  if (!player) return <NotFoundContent />;

  const index = startingXi.indexOf(player);
  const previous =
    startingXi[(index - 1 + startingXi.length) % startingXi.length];
  const next = startingXi[(index + 1) % startingXi.length];
  // `fallback` covers stat values that only some languages translate.
  const copy = (key: string, fallback?: string) =>
    t(`players.${player.slug}.${key}`, { defaultValue: fallback });
  const report = (key: string) => ts(`players.${player.slug}.${key}`);
  const points = ts(`players.${player.slug}.points`, {
    returnObjects: true,
  }) as string[];
  const position = POSITION_LABEL[player.slot];
  const isExternal = player.href?.startsWith('http') === true;

  return (
    <article className={styles.page}>
      <Container>
        <Link
          to={localize(
            `/#${cameFromSquad ? 'squad' : playerHash(player.slug)}`,
          )}
          className={styles.back}
        >
          ← {ts('page.back')}
        </Link>

        <header className={styles.hero}>
          <div className={styles.intro}>
            <p className={styles.badges}>
              <Tag tone="brand">{position}</Tag>
              {player.isCaptain && <Tag>{t('team.captain')}</Tag>}
            </p>
            <p className={styles.number} aria-hidden="true">
              {player.number}
            </p>
            <h1 className={styles.title}>
              <VisuallyHidden>#{player.number} </VisuallyHidden>
              {copy('title')}
            </h1>
            <p className={styles.club}>
              {copy('club')} · {copy('period')}
            </p>
            <p className={styles.summary}>{report('summary')}</p>
            {player.href && report('link') && (
              <LinkButton
                className={styles.visit}
                href={player.href}
                {...(isExternal && {
                  target: '_blank',
                  rel: 'noopener noreferrer',
                })}
              >
                {ts('page.visit')} {report('link')} {isExternal ? '↗' : ''}
                {isExternal && (
                  <VisuallyHidden>
                    {' '}
                    ({t('common:nav.opensInNewTab')})
                  </VisuallyHidden>
                )}
              </LinkButton>
            )}
          </div>
          {player.shot && (
            <Panel edge="left" className={styles.shotPanel}>
              <Picture
                picture={player.shot.picture}
                alt={copy('imageAlt')}
                sizes="(max-width: 1024px) 100vw, 40rem"
                priority
                className={styles.shot}
              />
            </Panel>
          )}
        </header>

        <section className={styles.grid} aria-label={ts('page.position')}>
          <Panel isTextured className={styles.why}>
            <p>
              <strong>
                {t('team.why', { position: t(`positions.${position}`) })}
              </strong>{' '}
              {copy('why')}
            </p>
            <StatTiles
              className={styles.stats}
              items={player.stats.map((stat) => ({
                value: copy(`values.${stat.labelKey}`, stat.value),
                label: copy(`stats.${stat.labelKey}`),
              }))}
            />
          </Panel>
          <Panel edge="left" className={styles.details}>
            <h2 className={styles.heading}>{ts('page.built')}</h2>
            <ul className={styles.points}>
              {points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <h2 className={styles.heading}>{ts('page.role')}</h2>
            <p className={styles.role}>{report('role')}</p>
            <h2 className={styles.heading}>{ts('page.stack')}</h2>
            <ChipList label={ts('page.stack')} items={player.stack} />
          </Panel>
        </section>

        <nav className={styles.pager} aria-label={t('team.startingXi')}>
          {previous && (
            <Link
              to={localize(playerPath(previous.slug))}
              className={styles.pageLink}
            >
              <span className={styles.pageLabel}>← {ts('page.previous')}</span>
              <span className={styles.pageName}>
                {previous.number} · {t(`players.${previous.slug}.title`)}
              </span>
            </Link>
          )}
          {next && (
            <Link
              to={localize(playerPath(next.slug))}
              className={`${styles.pageLink} ${styles.pageNext}`}
            >
              <span className={styles.pageLabel}>{ts('page.next')} →</span>
              <span className={styles.pageName}>
                {next.number} · {t(`players.${next.slug}.title`)}
              </span>
            </Link>
          )}
        </nav>
      </Container>
    </article>
  );
}
