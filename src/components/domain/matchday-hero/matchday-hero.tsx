import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { ChapterRail } from '@/components/domain/chapter-rail';
import { CoachCard } from '@/components/domain/coach-card';
import { FullTimePanel } from '@/components/domain/full-time-panel';
import { HeroIntro } from '@/components/domain/hero-intro';
import { LineupBoard } from '@/components/domain/lineup-board';
import { PlayerReel } from '@/components/domain/player-reel';
import { SquadScreen } from '@/components/domain/squad-screen';
import { StadiumScene } from '@/components/domain/stadium-scene';
import { introOrder } from '@/content/squad';
import { useIsHydrated } from '@/hooks/use-is-hydrated';
import { useScrollProgress } from '@/hooks/use-scroll-progress';
import { buildStadiumCopy } from './lib/stadium-copy';
import { focusFor } from './lib/stadium-focus';
import {
  CHAPTERS,
  chapterStop,
  isSameStage,
  stageAt,
  stopForHash,
  type Chapter,
} from './lib/stage';
import { useStageNavigation } from './lib/use-stage-navigation';
import styles from './matchday-hero.module.scss';

const CHAPTER_LABEL_KEYS: Record<Chapter, string> = {
  tunnel: 'chapters.tunnel',
  'walk-out': 'chapters.walkOut',
  lineup: 'chapters.lineup',
  intros: 'chapters.intros',
  coach: 'chapters.coach',
  squad: 'chapters.squad',
  contact: 'chapters.contact',
};

/**
 * The whole home page story: a tall scroll track with a sticky stage. Scroll
 * progress drives the 3D camera; the chapter decides which panel is on stage:
 * the intro, the line-up, each player's introduction, the coach's card, the squad
 * screen and full time. Every panel is in the prerendered HTML, so crawlers
 * and no-JS visitors get the full content as a normal page.
 */
export const MatchdayHero = () => {
  const { t } = useTranslation('home');
  const { t: ts } = useTranslation('squad');
  const trackRef = useRef<HTMLElement>(null);
  const { progressRef, selected: stage } = useScrollProgress(
    trackRef,
    stageAt,
    isSameStage,
  );
  const goTo = useStageNavigation(trackRef);
  const { hash, pathname, search } = useLocation();

  // Return links (`/#player-<slug>`, `/#squad`) land back where the visitor
  // left; the hash is then dropped so a refresh does not jump again.
  useEffect(() => {
    const stop = stopForHash(
      hash,
      introOrder.map((player) => player.slug),
    );
    if (!stop) return;
    const frame = window.requestAnimationFrame(() => {
      goTo(stop, { isInstant: true });
      window.history.replaceState(window.history.state, '', pathname + search);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [goTo, hash, pathname, search]);
  const isHydrated = useIsHydrated();
  const copy = useMemo(() => buildStadiumCopy(t, ts, introOrder), [t, ts]);
  const focus = useMemo(() => focusFor(stage), [stage]);
  const isOn = (chapter: Chapter) => stage.chapter === chapter;
  const inert = (chapter: Chapter) => isHydrated && !isOn(chapter);

  return (
    <section
      ref={trackRef}
      className={styles.track}
      aria-label={t('intro.kicker')}
    >
      <div className={styles.stage}>
        <StadiumScene
          className={styles.scene}
          progressRef={progressRef}
          focus={focus}
          copy={copy}
        />
        <div className={styles.shade} aria-hidden="true" />
        <HeroIntro
          className={styles.intro}
          isActive={isOn('tunnel')}
          isInert={inert('tunnel')}
          onSkip={() => goTo(chapterStop('squad'))}
        />
        <LineupBoard
          className={styles.lineup}
          isActive={isOn('lineup')}
          isInert={inert('lineup')}
        />
        <PlayerReel
          className={styles.players}
          activeIndex={stage.playerIndex}
          isInert={inert('intros')}
        />
        <CoachCard
          className={styles.coach}
          isActive={isOn('coach')}
          isInert={inert('coach')}
        />
        <SquadScreen
          className={styles.squad}
          isActive={isOn('squad')}
          isInert={inert('squad')}
        />
        <FullTimePanel
          className={styles.fullTime}
          isActive={isOn('contact')}
          isInert={inert('contact')}
        />
        <ChapterRail
          className={styles.rail}
          chapters={CHAPTERS}
          current={stage.chapter}
          labelKey={(chapter) => CHAPTER_LABEL_KEYS[chapter]}
          onSelect={(chapter) => goTo(chapterStop(chapter))}
        />
      </div>
    </section>
  );
};
