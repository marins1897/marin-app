import { Quaternion, type Vector3 } from 'three';

export interface Aim {
  /** Heading around the vertical axis, radians; 0 looks towards −z. */
  yaw: number;
  /** Up/down tilt, radians; negative looks down. */
  pitch: number;
  /** Distance from the camera to its target. */
  distance: number;
}

export const aimOf = (position: Vector3, target: Vector3): Aim => {
  const dx = target.x - position.x;
  const dy = target.y - position.y;
  const dz = target.z - position.z;
  const distance = Math.hypot(dx, dy, dz);
  return {
    yaw: Math.atan2(-dx, -dz),
    pitch: Math.asin(dy / distance),
    distance,
  };
};

/** Writes `position + direction(aim) × distance` into `out`. */
export const targetOf = (
  position: Vector3,
  { yaw, pitch, distance }: Aim,
  out: Vector3,
): Vector3 => {
  const flat = Math.cos(pitch) * distance;
  return out.set(
    position.x - Math.sin(yaw) * flat,
    position.y + Math.sin(pitch) * distance,
    position.z - Math.cos(yaw) * flat,
  );
};

/** Re-expresses each yaw within ±π of the previous one, so blending takes the short way round. */
export const unwrapYaws = (yaws: readonly number[]): number[] => {
  const out: number[] = [];
  for (const yaw of yaws) {
    const previous = out.at(-1);
    if (previous === undefined) {
      out.push(yaw);
      continue;
    }
    const delta = yaw - previous;
    out.push(
      previous + delta - 2 * Math.PI * Math.round(delta / (2 * Math.PI)),
    );
  }
  return out;
};

/**
 * Monotone cubic (Fritsch–Carlson) through `values` at 0, 1, 2, …: smooth, and
 * never overshoots a key, so the camera never swings past where it is going.
 */
export const monotoneSpline = (
  values: readonly number[],
): ((s: number) => number) => {
  const at = (i: number) => values[i] ?? 0;
  const last = values.length - 1;
  const slopes = values.map((_, i) => {
    const before = i > 0 ? at(i) - at(i - 1) : 0;
    const after = i < last ? at(i + 1) - at(i) : 0;
    if (i === 0) return after;
    if (i === last) return before;
    if (before * after <= 0) return 0;
    return (2 * before * after) / (before + after);
  });
  return (s) => {
    const clamped = Math.min(last, Math.max(0, s));
    const i = Math.min(last - 1, Math.floor(clamped));
    if (i < 0) return at(0);
    const f = clamped - i;
    const f2 = f * f;
    const f3 = f2 * f;
    return (
      (2 * f3 - 3 * f2 + 1) * at(i) +
      (f3 - 2 * f2 + f) * (slopes[i] ?? 0) +
      (-2 * f3 + 3 * f2) * at(i + 1) +
      (f3 - f2) * (slopes[i + 1] ?? 0)
    );
  };
};

const turn = new Quaternion();
const step = new Quaternion();

/**
 * Rotates the unit vector `current` towards the unit vector `desired` by at
 * most `maxAngle` radians, in place.
 */
export const turnTowards = (
  current: Vector3,
  desired: Vector3,
  maxAngle: number,
): Vector3 => {
  const angle = current.angleTo(desired);
  if (angle <= maxAngle) return current.copy(desired);
  turn.setFromUnitVectors(current, desired);
  return current
    .applyQuaternion(step.identity().slerp(turn, maxAngle / angle))
    .normalize();
};
