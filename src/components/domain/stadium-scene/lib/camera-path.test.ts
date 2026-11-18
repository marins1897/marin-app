import { PerspectiveCamera, Vector3 } from 'three';
import { BIG_SCREEN } from './build-signage';
import { COACH_SPOT } from './build-coach';
import { RACE_SAMPLES, racePoint } from './race-track';
import { FORMATION_433, SLOTS } from './formation';
import {
  HOLD_SHARE,
  PORTRAIT,
  TUNNEL_MOUTH_Z,
  createCameraPath,
} from './camera-path';
import { rowRadius } from './stand-layout';
import { INTRO_SPAN, TIMELINE, introStart, within } from './timeline';

const path = createCameraPath(SLOTS);

describe('createCameraPath', () => {
  describe('given the start of the scroll', () => {
    it('when sampled, then the camera stands inside the tunnel looking towards the pitch', () => {
      // Given
      const progress = 0;

      // When
      const pose = path.poseAt(progress);

      // Then
      expect(pose.position.z).toBeGreaterThan(TUNNEL_MOUTH_Z);
      expect(pose.target.z).toBeLessThan(pose.position.z);
    });
  });

  describe('given the whole route after the walk-out', () => {
    it('when sampled, then the camera stays inside the front row of the bowl and above the ground', () => {
      // Given
      const front = rowRadius(0);
      const edge = Array.from({ length: RACE_SAMPLES }, (_, i) =>
        racePoint(i, front),
      );
      const samples = Array.from(
        { length: 201 },
        (_, i) => TIMELINE.walkOut + (i / 200) * (1 - TIMELINE.walkOut),
      );

      // When
      const positions = samples.map((t) => path.poseAt(t).position.clone());

      // Then
      for (const p of positions) {
        expect(p.y).toBeGreaterThan(1);
        const nearest = edge.reduce((best, q) =>
          Math.hypot(q.x - p.x, q.z - p.z) <
          Math.hypot(best.x - p.x, best.z - p.z)
            ? q
            : best,
        );
        const outward =
          (p.x - nearest.x) * nearest.nx + (p.z - nearest.z) * nearest.nz;
        expect(outward).toBeLessThan(0);
      }
    });
  });

  describe('given the middle of each player introduction', () => {
    it('when sampled, then the player stands in the left third with the big screen in view above, clear of the card', () => {
      // Given
      const camera = new PerspectiveCamera(50, 16 / 9, 0.1, 900);
      const screen = new Vector3(-BIG_SCREEN.x, BIG_SCREEN.y, 0);
      const middles = SLOTS.map((slot, index) => ({
        slot,
        t: introStart(index) + INTRO_SPAN / 2,
      }));

      // When
      const shots = middles.map(({ slot, t }) => {
        const { position, target } = path.poseAt(t);
        camera.position.copy(position);
        camera.lookAt(target);
        camera.updateMatrixWorld();
        const { x, z } = FORMATION_433[slot];
        return {
          distance: Math.hypot(position.x - x, position.z - z),
          player: new Vector3(x, 1, z).project(camera),
          screen: screen.clone().project(camera),
        };
      });

      // Then
      for (const { distance, player, screen: onScreen } of shots) {
        expect(distance).toBeLessThan(8);
        expect(player.x).toBeGreaterThan(-0.85);
        expect(player.x).toBeLessThan(-0.2);
        expect(onScreen.x).toBeGreaterThan(-0.6);
        expect(onScreen.x).toBeLessThan(0);
        expect(onScreen.y).toBeGreaterThan(0.1);
        expect(onScreen.y).toBeLessThan(0.75);
      }
    });
  });
});

describe('the coach close-up', () => {
  describe('given the middle of the coach chapter', () => {
    it('when sampled, then the camera stands on the pitch side a few metres from the coach', () => {
      // Given
      const t = within('coach', 0.62);

      // When
      const { position } = path.poseAt(t);

      // Then
      expect(
        Math.hypot(position.x - COACH_SPOT.x, position.z - COACH_SPOT.z),
      ).toBeLessThan(6);
      expect(position.z).toBeLessThan(COACH_SPOT.z);
    });
  });
});

describe('the camera heading', () => {
  describe('given the line-up and every player introduction', () => {
    it('when sampled, then the camera keeps facing west and never flips round', () => {
      // Given
      const samples = Array.from(
        { length: 301 },
        (_, i) =>
          TIMELINE.lineup +
          0.02 +
          (i / 300) * (TIMELINE.coach - TIMELINE.lineup - 0.02),
      );

      // When
      const headings = samples.map((t) => {
        const { position, target } = path.poseAt(t);
        return target.clone().sub(position).setY(0).normalize();
      });

      // Then
      for (const heading of headings) expect(heading.x).toBeLessThan(-0.5);
    });
  });
});

describe('the hold on each player', () => {
  describe('given a small scroll either side of a close-up', () => {
    it('when sampled, then the camera does not move', () => {
      // Given
      const middle = introStart(4) + INTRO_SPAN / 2;
      const nudge = (INTRO_SPAN * HOLD_SHARE) / 2 - 1e-6;

      // When
      const before = path.poseAt(middle - nudge).position.clone();
      const after = path.poseAt(middle + nudge).position.clone();

      // Then
      expect(before.distanceTo(after)).toBeLessThan(1e-9);
    });
  });
});

describe('portrait framing', () => {
  const portrait = createCameraPath(SLOTS, PORTRAIT);
  const camera = new PerspectiveCamera(62, 390 / 844, 0.1, 900);
  const shoot = (t: number, point: Vector3) => {
    const { position, target } = portrait.poseAt(t);
    camera.position.copy(position);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    return point.clone().project(camera);
  };

  describe('given a phone held upright', () => {
    it('when each player is introduced, then he stands centred above the bottom-sheet card with the big screen above him', () => {
      // Given
      const screen = new Vector3(-BIG_SCREEN.x, BIG_SCREEN.y, 0);

      // When
      const shots = SLOTS.map((slot, index) => {
        const t = introStart(index) + INTRO_SPAN / 2;
        const { x, z } = FORMATION_433[slot];
        return {
          chest: shoot(t, new Vector3(x, 1.4, z)),
          screen: shoot(t, screen),
        };
      });

      // Then
      for (const shot of shots) {
        expect(Math.abs(shot.chest.x)).toBeLessThan(0.35);
        expect(shot.chest.y).toBeGreaterThan(-0.15);
        expect(shot.chest.y).toBeLessThan(0.4);
        expect(shot.screen.y).toBeGreaterThan(0.4);
        expect(shot.screen.y).toBeLessThan(0.8);
        expect(Math.abs(shot.screen.x)).toBeLessThan(0.6);
      }
    });

    it('when the coach is introduced, then he stands centred above the card', () => {
      // Given
      const coach = new Vector3(COACH_SPOT.x, 1.4, COACH_SPOT.z);

      // When
      const chest = shoot(within('coach', 0.62), coach);

      // Then
      expect(Math.abs(chest.x)).toBeLessThan(0.35);
      expect(chest.y).toBeGreaterThan(-0.15);
    });
  });
});
