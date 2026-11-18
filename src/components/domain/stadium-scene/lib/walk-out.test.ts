import { TUNNEL_MOUTH_Z, createCameraPath } from './camera-path';
import { PITCH_WIDTH } from './build-pitch';
import { FORMATION_433, SLOTS } from './formation';
import { TIMELINE } from './timeline';
import { walkPoseAt } from './walk-out';

const squad = SLOTS.map((slot, place) => ({
  place,
  target: FORMATION_433[slot],
}));
const samples = Array.from(
  { length: 401 },
  (_, i) => (i / 400) * TIMELINE.lineup,
);

describe('walkPoseAt', () => {
  describe('given the top of the page', () => {
    it('when sampled, then the team is queued in two files inside the tunnel, facing the pitch', () => {
      // Given
      const progress = 0;

      // When
      const poses = squad.map(({ place, target }) =>
        walkPoseAt(place, target, progress),
      );

      // Then
      for (const pose of poses) {
        expect(pose.z).toBeGreaterThan(TUNNEL_MOUTH_Z);
        expect(Math.abs(pose.x)).toBeLessThan(1.5);
        expect(pose.heading).toBeCloseTo(Math.PI / 2, 6);
      }
    });
  });

  describe('given the line-up chapter', () => {
    it('when sampled, then every player stands on his spot facing the opposing goal', () => {
      // Given
      const progress = TIMELINE.lineup;

      // When
      const poses = squad.map(({ place, target }) => ({
        target,
        pose: walkPoseAt(place, target, progress),
      }));

      // Then
      for (const { target, pose } of poses) {
        expect(pose.x).toBeCloseTo(target.x, 6);
        expect(pose.z).toBeCloseTo(target.z, 6);
        expect(pose.heading).toBeCloseTo(0, 6);
        expect(pose.isMoving).toBe(false);
      }
    });
  });

  describe('given the whole walk-out', () => {
    it('when sampled, then the camera never walks into a player', () => {
      // Given
      const camera = createCameraPath(SLOTS);

      // When
      const closest = Math.min(
        ...samples.flatMap((t) => {
          const { position } = camera.poseAt(t);
          return squad.map(({ place, target }) => {
            const pose = walkPoseAt(place, target, t);
            return Math.hypot(position.x - pose.x, position.z - pose.z);
          });
        }),
      );

      // Then
      expect(closest).toBeGreaterThan(2);
    });

    it('when sampled, then the players leave through the gap in the pitch-side LED boards', () => {
      // Given
      const boardLine = PITCH_WIDTH / 2 + 4;

      // When
      const crossings = samples.flatMap((t) =>
        squad
          .map(({ place, target }) => walkPoseAt(place, target, t))
          .filter((pose) => Math.abs(pose.z - boardLine) < 0.5),
      );

      // Then
      for (const pose of crossings) expect(Math.abs(pose.x)).toBeLessThan(3);
    });
  });
});
