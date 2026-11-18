import type { StadiumFocus } from '@/components/domain/stadium-scene';
import type { Stage } from './stage';

/** What the big screens, LED boards and pitch show in each chapter. */
export const focusFor = ({ chapter, playerIndex }: Stage): StadiumFocus => {
  switch (chapter) {
    case 'tunnel':
    case 'walk-out':
      return { kind: 'welcome' };
    case 'lineup':
    case 'squad':
      return { kind: 'lineup' };
    case 'coach':
      return { kind: 'coach' };
    case 'intros':
      return { kind: 'player', index: Math.max(0, playerIndex) };
    default:
      return { kind: 'name' };
  }
};
