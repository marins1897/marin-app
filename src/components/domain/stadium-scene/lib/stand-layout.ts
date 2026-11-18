import { RACE_SAMPLES, TRACK_OUTER_RADIUS, racePoint } from './race-track';

/** Seating rows: depth and rise per row, distance of the first row from the track. */
export const ROW_DEPTH = 0.8;
export const ROW_RISE = 0.5;
export const FIRST_ROW_RADIUS = TRACK_OUTER_RADIUS + 3;
export const FIRST_ROW_HEIGHT = 1.2;
/** Poljud's long sides rise high under the shells; the open ends stay low. */
export const ROWS_SIDE = 36;
export const ROWS_END = 20;
/** Half-width of the players' tunnel through the lower rows of the main stand. */
export const TUNNEL_HALF_WIDTH = 3.4;
export const TUNNEL_ROWS = 10;
export const TUNNEL_HEIGHT = 3.6;

/** 1 along the long sides, falling to 0 at the ends. */
export const sideWeight = (index: number): number =>
  Math.abs(racePoint(index, 1).nz) ** 1.6;

export const rowsAt = (index: number): number =>
  Math.round(ROWS_END + (ROWS_SIDE - ROWS_END) * sideWeight(index));

export const rowRadius = (row: number): number =>
  FIRST_ROW_RADIUS + row * ROW_DEPTH;

export const rowHeight = (row: number): number =>
  FIRST_ROW_HEIGHT + row * ROW_RISE;

/** True where a lower row is cut away for the tunnel (main stand, +z side). */
export const isTunnelGap = (index: number, row: number): boolean => {
  const i = ((index % RACE_SAMPLES) + RACE_SAMPLES) % RACE_SAMPLES;
  return (
    row < TUNNEL_ROWS &&
    racePoint(i, 1).nz === 1 &&
    Math.abs(racePoint(i, FIRST_ROW_RADIUS).x) < TUNNEL_HALF_WIDTH + 0.4
  );
};
