import {
  INTRO_SPAN,
  SQUAD_SIZE,
  TIMELINE,
  introStart,
  within,
} from '@/components/domain/stadium-scene/lib/timeline';

export const CHAPTERS = [
  'tunnel',
  'walk-out',
  'lineup',
  'intros',
  'coach',
  'squad',
  'contact',
] as const;

export type Chapter = (typeof CHAPTERS)[number];

/** Scroll progress at which each chapter starts; shared with the camera path. */
export const CHAPTER_START: Record<Chapter, number> = {
  tunnel: TIMELINE.tunnel,
  'walk-out': TIMELINE.walkOut,
  lineup: TIMELINE.lineup,
  intros: TIMELINE.intros,
  coach: TIMELINE.coach,
  squad: TIMELINE.squad,
  contact: TIMELINE.contact,
};

export interface Stage {
  chapter: Chapter;
  /** Player being introduced, or -1 outside the introductions. */
  playerIndex: number;
}

export const stageAt = (progress: number): Stage => {
  const chapter =
    [...CHAPTERS].reverse().find((name) => progress >= CHAPTER_START[name]) ??
    'tunnel';
  if (chapter !== 'intros') return { chapter, playerIndex: -1 };
  const index = Math.floor((progress - TIMELINE.intros) / INTRO_SPAN);
  return {
    chapter,
    playerIndex: Math.min(SQUAD_SIZE - 1, Math.max(0, index)),
  };
};

export const isSameStage = (a: Stage, b: Stage): boolean =>
  a.chapter === b.chapter && a.playerIndex === b.playerIndex;

/** A place the walk-out can jump to: where the camera rests in a chapter, or on one player. */
export interface Stop extends Stage {
  /** Scroll progress to jump to. */
  at: number;
}

const stop = (chapter: Chapter, at: number, playerIndex = -1): Stop => ({
  chapter,
  playerIndex,
  at,
});

/**
 * Every stop in walk-out order. Each sits where the camera holds still (the
 * middle of a player's close-up, the coach's hold), read from the same
 * timeline as the camera path.
 */
const KICK_OFF = stop('tunnel', 0);

export const STOPS: readonly Stop[] = [
  KICK_OFF,
  stop('walk-out', within('walkOut', 0.5)),
  stop('lineup', within('lineup', 0.5)),
  ...Array.from({ length: SQUAD_SIZE }, (_, index) =>
    stop('intros', introStart(index) + INTRO_SPAN / 2, index),
  ),
  stop('coach', within('coach', 0.62)),
  stop('squad', within('squad', 0.6)),
  stop('contact', 1),
];

/** The first stop of a chapter (for the players, the first player). */
export const chapterStop = (chapter: Chapter): Stop =>
  STOPS.find((candidate) => candidate.chapter === chapter) ?? KICK_OFF;

/** Small margin so a visitor resting on a stop steps to the next one, not the same. */
const EPSILON = 0.001;

/** The next (`1`) or previous (`-1`) stop from `progress`, if there is one. */
export const stepFrom = (
  progress: number,
  direction: 1 | -1,
): Stop | undefined =>
  direction === 1
    ? STOPS.find((candidate) => candidate.at > progress + EPSILON)
    : [...STOPS]
        .reverse()
        .find((candidate) => candidate.at < progress - EPSILON);
