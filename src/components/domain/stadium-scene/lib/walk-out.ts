import { TUNNEL_MOUTH_Z } from './camera-path';
import { TIMELINE } from './timeline';
import type { PitchSpot } from './formation';

export interface WalkPose {
  x: number;
  z: number;
  /** Rotation about y for a figure modelled facing +x. */
  heading: number;
  isMoving: boolean;
}

/** Two files, shoulder to shoulder, one pace between ranks. */
const FILE_X = 0.9;
const RANK_GAP = 1.6;
const QUEUE_FRONT_Z = TUNNEL_MOUTH_Z + 20;
/** Where the front rank stops once the block is through the gap in the LED boards. */
const OUT_FRONT_Z = 26;
/** Each player sets off for his position a moment after the one before. */
const STAGGER = 0.003;
const ARRIVE = TIMELINE.lineup - 0.01;
const FACING_PITCH = Math.PI / 2;

const smoothstep = (value: number) => {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
};

/** Turns `from` towards `to` by `t`, the short way round. */
const turn = (from: number, to: number, t: number) => {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + delta * t;
};

/**
 * Where player `place` in the tunnel queue is at scroll `progress`: queued in
 * two files (`place` 0 leads), walking down the tunnel with the camera until
 * the walk-out chapter, then fanning out to `target` by the line-up.
 */
export const walkPoseAt = (
  place: number,
  target: PitchSpot,
  progress: number,
): WalkPose => {
  const x = place % 2 === 0 ? -FILE_X : FILE_X;
  const rank = Math.floor(place / 2);
  const queueZ = QUEUE_FRONT_Z + rank * RANK_GAP;
  const outZ = OUT_FRONT_Z + rank * RANK_GAP;

  if (progress < TIMELINE.walkOut) {
    const t = Math.max(0, progress) / TIMELINE.walkOut;
    return {
      x,
      z: queueZ + (outZ - queueZ) * t,
      heading: FACING_PITCH,
      isMoving: t > 0,
    };
  }

  const start = TIMELINE.walkOut + place * STAGGER;
  const local = (progress - start) / (ARRIVE - start);
  const eased = smoothstep(local);
  const dx = target.x - x;
  const dz = target.z - outZ;
  const walking = Math.atan2(-dz, dx);
  const settle = smoothstep((local - 0.85) / 0.15);
  return {
    x: x + dx * eased,
    z: outZ + dz * eased,
    heading:
      local <= 0
        ? FACING_PITCH
        : turn(turn(FACING_PITCH, walking, smoothstep(local / 0.1)), 0, settle),
    isMoving: local > 0 && local < 1,
  };
};
