import {
  INTRO_SPAN,
  TIMELINE,
  introStart,
} from '@/components/domain/stadium-scene/lib/timeline';
import {
  STOPS,
  chapterStop,
  isSameStage,
  stageAt,
  stepFrom,
  stopForHash,
} from './stage';

describe('stageAt', () => {
  describe('given the walk-out from top to bottom', () => {
    it('when the visitor has not scrolled, then the tunnel chapter is on with no player', () => {
      // Given
      const progress = 0;

      // When
      const stage = stageAt(progress);

      // Then
      expect(stage).toEqual({ chapter: 'tunnel', playerIndex: -1 });
    });

    it('when progress reaches the line-up, then the line-up chapter is on', () => {
      // Given
      const progress = TIMELINE.lineup + 0.01;

      // When
      const stage = stageAt(progress);

      // Then
      expect(stage.chapter).toBe('lineup');
    });

    it('when progress walks through the introductions, then each player gets an equal share in shirt order', () => {
      // Given
      const middles = Array.from(
        { length: 11 },
        (_, i) => introStart(i) + INTRO_SPAN / 2,
      );

      // When
      const indices = middles.map((p) => stageAt(p).playerIndex);

      // Then
      expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('when progress passes the last introduction, then the squad screen and then contact follow', () => {
      // Given
      const squad = TIMELINE.squad + 0.01;
      const end = 1;

      // When
      const stages = [stageAt(squad), stageAt(end)];

      // Then
      expect(stages).toEqual([
        { chapter: 'squad', playerIndex: -1 },
        { chapter: 'contact', playerIndex: -1 },
      ]);
    });
  });
});

describe('isSameStage', () => {
  describe('given two stages in the same chapter', () => {
    it('when only the player differs, then they are not the same', () => {
      // Given
      const a = { chapter: 'intros', playerIndex: 0 } as const;
      const b = { chapter: 'intros', playerIndex: 1 } as const;

      // When
      const same = isSameStage(a, b);

      // Then
      expect(same).toBe(false);
    });
  });
});

describe('stops', () => {
  describe('given the walk-out stops', () => {
    it('when listed, then they run in order and each lands on its own chapter and player', () => {
      // Given
      const positions = STOPS.map((stop) => stop.at);

      // When
      const stages = STOPS.map((stop) => stageAt(stop.at));

      // Then
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
      stages.forEach((stage, index) => {
        expect(stage.chapter).toBe(STOPS[index]?.chapter);
        expect(stage.playerIndex).toBe(STOPS[index]?.playerIndex);
      });
    });

    it('when stepping from a player, then the arrows move one player at a time and stop at the ends', () => {
      // Given
      const third = STOPS.find((stop) => stop.playerIndex === 2);
      if (!third) throw new Error('No third player stop');

      // When
      const next = stepFrom(third.at, 1);
      const previous = stepFrom(third.at, -1);

      // Then
      expect(next?.playerIndex).toBe(3);
      expect(previous?.playerIndex).toBe(1);
      expect(stepFrom(0, -1)).toBeUndefined();
      expect(stepFrom(1, 1)).toBeUndefined();
      expect(chapterStop('intros').playerIndex).toBe(0);
    });
  });
});

describe('stopForHash', () => {
  describe('given return links', () => {
    it('when read, then a player hash lands on his close-up, a chapter hash on the chapter, anything else nowhere', () => {
      // Given
      const slugs = ['first', 'second', 'third'];

      // When
      const player = stopForHash('#player-second', slugs);
      const squad = stopForHash('#squad', slugs);

      // Then
      expect(player?.playerIndex).toBe(1);
      expect(squad?.chapter).toBe('squad');
      expect(stopForHash('#player-nobody', slugs)).toBeUndefined();
      expect(stopForHash('#profile', slugs)).toBeUndefined();
      expect(stopForHash('', slugs)).toBeUndefined();
    });
  });
});
