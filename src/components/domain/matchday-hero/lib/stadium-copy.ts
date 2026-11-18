import type { StadiumCopy } from '@/components/domain/stadium-scene';
import { POSITION_LABEL, type SquadPlayer } from '@/content/squad';
import type { TFunction } from 'i18next';

/** Text painted onto the stadium's screens, boards and tunnel wall. */
export const buildStadiumCopy = (
  t: TFunction<'home'>,
  ts: TFunction<'squad'>,
  squad: readonly SquadPlayer[],
): StadiumCopy => ({
  welcome: { kicker: t('scene.matchday'), title: t('scene.welcome') },
  name: {
    kicker: t('scene.coachKicker'),
    firstName: t('intro.firstName'),
    lastName: t('intro.lastName'),
  },
  lineup: {
    kicker: t('scene.lineupKicker'),
    title: ts('team.name'),
    board: ts('team.board'),
  },
  board: t('scene.board'),
  wall: t('scene.wall'),
  players: squad.map((player) => {
    const title = ts(`players.${player.slug}.title`);
    const position = POSITION_LABEL[player.slot];
    const captain = player.isCaptain ? ` · ${ts('team.captain')}` : '';
    return {
      number: player.number,
      slot: player.slot,
      isCaptain: player.isCaptain === true,
      title,
      detail: `${position}${captain} · ${ts(`players.${player.slug}.club`)}`,
      board: `#${player.number} ${title}${captain} · ${position}`.toUpperCase(),
      ...(player.shot && { image: player.shot.screen }),
    };
  }),
});
