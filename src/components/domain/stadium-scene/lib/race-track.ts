/**
 * Athletics-track geometry the whole bowl is built on: two straights joined by
 * semicircles, sampled into a fixed number of points so every ring (track
 * lanes, stand rows, the stand's back wall) lines up sample for sample.
 * Units are metres; the pitch is centred on the origin, its length along x.
 */
export const STRAIGHT_LENGTH = 84.39;
export const TRACK_INNER_RADIUS = 36.5;
export const TRACK_OUTER_RADIUS = 46.3;
export const STRAIGHT_SAMPLES = 90;
export const CURVE_SAMPLES = 120;
export const RACE_SAMPLES = 2 * STRAIGHT_SAMPLES + 2 * CURVE_SAMPLES;

export interface RacePoint {
  x: number;
  z: number;
  /** Outward unit normal. */
  nx: number;
  nz: number;
}

/**
 * Point `index` (0 … RACE_SAMPLES - 1) of the track outline at `radius`.
 * Order: top straight (+z), left curve, bottom straight (−z), right curve.
 */
export const racePoint = (index: number, radius: number): RacePoint => {
  const half = STRAIGHT_LENGTH / 2;
  const i = ((index % RACE_SAMPLES) + RACE_SAMPLES) % RACE_SAMPLES;

  if (i < STRAIGHT_SAMPLES) {
    const f = i / STRAIGHT_SAMPLES;
    return { x: half - f * STRAIGHT_LENGTH, z: radius, nx: 0, nz: 1 };
  }
  if (i < STRAIGHT_SAMPLES + CURVE_SAMPLES) {
    const a = Math.PI / 2 + ((i - STRAIGHT_SAMPLES) / CURVE_SAMPLES) * Math.PI;
    return curvePoint(-half, a, radius);
  }
  if (i < 2 * STRAIGHT_SAMPLES + CURVE_SAMPLES) {
    const f = (i - STRAIGHT_SAMPLES - CURVE_SAMPLES) / STRAIGHT_SAMPLES;
    return { x: -half + f * STRAIGHT_LENGTH, z: -radius, nx: 0, nz: -1 };
  }
  const a =
    -Math.PI / 2 +
    ((i - 2 * STRAIGHT_SAMPLES - CURVE_SAMPLES) / CURVE_SAMPLES) * Math.PI;
  return curvePoint(half, a, radius);
};

const curvePoint = (cx: number, angle: number, radius: number): RacePoint => ({
  x: cx + Math.cos(angle) * radius,
  z: Math.sin(angle) * radius,
  nx: Math.cos(angle),
  nz: Math.sin(angle),
});
