import { PITCH_LENGTH } from './build-pitch';

/** Positions of a 4-3-3. Left/right are from the team's own point of view. */
export const SLOTS = [
  'GK',
  'RB',
  'RCB',
  'LCB',
  'LB',
  'DM',
  'RCM',
  'LCM',
  'RW',
  'ST',
  'LW',
] as const;

export type Slot = (typeof SLOTS)[number];

export interface PitchSpot {
  x: number;
  z: number;
}

/**
 * Where each position stands for the line-up, in metres. The team lines up in
 * its own half, keeper by the −x goal, attacking towards +x. Facing +x, the
 * right-hand side is +z.
 */
export const FORMATION_433: Record<Slot, PitchSpot> = {
  GK: { x: -PITCH_LENGTH / 2 + 5.5, z: 0 },
  RB: { x: -34, z: 24 },
  RCB: { x: -37, z: 8 },
  LCB: { x: -37, z: -8 },
  LB: { x: -34, z: -24 },
  DM: { x: -27, z: 0 },
  RCM: { x: -18, z: 13 },
  LCM: { x: -18, z: -13 },
  RW: { x: -6, z: 24 },
  ST: { x: -4, z: 0 },
  LW: { x: -6, z: -24 },
};
