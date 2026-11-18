import { CatmullRomCurve3, Vector3 } from 'three';
import { COACH_SPOT } from './build-coach';
import { BIG_SCREEN } from './build-signage';
import { aimOf, monotoneSpline, targetOf, unwrapYaws } from './camera-aim';
import { FORMATION_433, type Slot } from './formation';
import { FIRST_ROW_RADIUS } from './stand-layout';
import { INTRO_SPAN, TIMELINE, introStart, within } from './timeline';

/** Where the tunnel starts: the front of the main stand. */
export const TUNNEL_MOUTH_Z = FIRST_ROW_RADIUS;

/** The camera never drops below eye height, whatever the spline does between keys. */
export const MIN_CAMERA_HEIGHT = 1.6;

export interface CameraKey {
  /** Scroll progress at which the camera reaches this pose. */
  at: number;
  /** Progress either side of `at` during which the camera stays on this pose. */
  hold: number;
  position: Vector3;
  target: Vector3;
}

export interface CameraPose {
  position: Vector3;
  target: Vector3;
}

export interface CameraPath {
  keys: readonly CameraKey[];
  /** Pose at scroll progress `t` (0 → 1). Writes into `out` to avoid allocations. */
  poseAt(t: number, out?: CameraPose): CameraPose;
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);
const key = (
  at: number,
  position: Vector3,
  target: Vector3,
  hold = 0,
): CameraKey => ({ at, hold, position, target });

/** Share of each player's (and the coach's) scroll the camera holds still for. */
export const HOLD_SHARE = 0.6;

/** How far the aim point sits beside the coach, so he stands in the right third of the frame. */
export const CLOSE_UP_FRAMING = 2.2;

const CLOSE_UP_DISTANCE = 5.5;
const CLOSE_UP_HEIGHT = 2;

/** How close-ups compose the frame around the panels of one screen shape. */
export interface Framing {
  /** Camera offset to the player's right; puts him left of centre. */
  sidestep: number;
  /** Turn right off the screen line (radians); moves the big screen left of centre. */
  turn: number;
  /** How far the aim drops over 10 m; a bigger drop lifts the player up the frame. */
  aimDrop: number;
  /** Aim point beside the coach; puts him right of centre. */
  coachOffset: number;
}

/** Wide screens: player in the left third, card on the right. */
export const LANDSCAPE: Framing = {
  sidestep: 1.3,
  turn: 0.14,
  aimDrop: 0.3,
  coachOffset: CLOSE_UP_FRAMING,
};

/**
 * Portrait phones: the view is narrow (±15°) and the card is a bottom sheet,
 * so the player stands centred with his upper body mid-screen and the big
 * screen above him.
 */
export const PORTRAIT: Framing = {
  sidestep: 0,
  turn: 0,
  aimDrop: 1.4,
  coachOffset: 0,
};

/**
 * Close-up from behind the player's shoulder line towards the west big screen,
 * so his project is up on the screen behind him: he stands in the left third,
 * the screen above and left of centre, the player card on the right.
 */
export const closeUpOf = (
  slot: Slot,
  framing: Framing = LANDSCAPE,
): Pick<CameraKey, 'position' | 'target'> => {
  const { x, z } = FORMATION_433[slot];
  const toScreen = v(-BIG_SCREEN.x - x, 0, -z).normalize();
  const right = v(-toScreen.z, 0, toScreen.x);
  const position = v(x, CLOSE_UP_HEIGHT, z)
    .addScaledVector(toScreen, -CLOSE_UP_DISTANCE)
    .addScaledVector(right, framing.sidestep);
  const heading = toScreen.clone().applyAxisAngle(v(0, 1, 0), -framing.turn);
  return {
    position,
    target: position
      .clone()
      .addScaledVector(heading, 10)
      .setY(CLOSE_UP_HEIGHT - framing.aimDrop),
  };
};

/**
 * The coach in the technical area, seen across the touchline at an angle so
 * the camera only turns part way from the players' west-facing close-ups. The
 * coach card sits on the left, so the aim point is to his left: he stands in
 * the right third of the frame.
 */
export const coachCloseUp = (
  framing: Framing = LANDSCAPE,
): [position: Vector3, target: Vector3] => {
  const position = v(COACH_SPOT.x + 4.4, 2.1, COACH_SPOT.z - 3.6);
  const toCoach = v(COACH_SPOT.x, 0, COACH_SPOT.z)
    .sub(v(position.x, 0, position.z))
    .normalize();
  const left = v(toCoach.z, 0, -toCoach.x);
  return [
    position,
    v(COACH_SPOT.x, 1.3 + 0.3 - framing.aimDrop, COACH_SPOT.z).addScaledVector(
      left,
      framing.coachOffset,
    ),
  ];
};

/**
 * Tunnel (facing north) → walk-out, turning left → the line-up from the
 * attacking end → one close-up per player in shirt order → up over the pitch
 * to the coach → high over the formation (squad screen) → the full-time wide
 * shot. After the walk-out every shot faces west (−x), towards the players'
 * faces, so the camera turns once instead of flipping. Every pose after the
 * tunnel stays inside the bowl.
 */
export const buildCameraKeys = (
  introOrder: readonly Slot[],
  framing: Framing = LANDSCAPE,
): CameraKey[] => [
  key(0, v(0, 1.7, TUNNEL_MOUTH_Z + 34), v(0, 1.6, TUNNEL_MOUTH_Z - 10)),
  key(within('tunnel', 0.6), v(0, 1.7, TUNNEL_MOUTH_Z + 6), v(0, 1.8, 0)),
  key(TIMELINE.walkOut, v(0, 1.8, 40), v(0, 3, -10)),
  key(within('walkOut', 0.5), v(10, 5, 26), v(-30, 6, -10)),
  key(within('lineup', 0.5), v(22, 30, -4), v(-26, 0, 8)),
  ...introOrder.map((slot, index) => {
    const { position, target } = closeUpOf(slot, framing);
    return key(
      introStart(index) + INTRO_SPAN / 2,
      position,
      target,
      (INTRO_SPAN * HOLD_SHARE) / 2,
    );
  }),
  key(within('coach', 0.2), v(4, 8, 10), v(-14, 1, 22)),
  key(
    within('coach', 0.62),
    ...coachCloseUp(framing),
    within('coach', 0.3) - TIMELINE.coach,
  ),
  key(within('squad', 0.1), v(6, 24, 8), v(-22, 0, 0)),
  key(within('squad', 0.6), v(10, 72, 0), v(-24, 0, 0)),
  key(1, v(40, 10, 0), v(-40, 5, 0)),
];

/** Catmull-Rom through the keys, timed so each key is reached at its `at`. */
export const createCameraPath = (
  introOrder: readonly Slot[],
  framing: Framing = LANDSCAPE,
): CameraPath => {
  const keys = buildCameraKeys(introOrder, framing);
  const last = keys.length - 1;
  const positions = new CatmullRomCurve3(
    keys.map((k) => k.position),
    false,
    'centripetal',
  );
  // The view direction is blended as angles, not by moving the aim point
  // along its own spline, so long moves turn smoothly instead of whipping.
  const aims = keys.map((k) => aimOf(k.position, k.target));
  const yaw = monotoneSpline(unwrapYaws(aims.map((aim) => aim.yaw)));
  const pitch = monotoneSpline(aims.map((aim) => aim.pitch));
  const distance = monotoneSpline(aims.map((aim) => aim.distance));

  // Each key holds from `at - hold` to `at + hold`; the camera moves only in
  // the gaps between holds, easing out of and into any held pose.
  const curveParam = (t: number): number => {
    const clamped = Math.min(1, Math.max(0, t));
    for (let i = 0; i < last; i += 1) {
      const from = keys[i];
      const to = keys[i + 1];
      if (!from || !to) break;
      const leave = from.at + from.hold;
      const arrive = to.at - to.hold;
      if (clamped <= leave) return i / last;
      if (clamped < arrive) {
        const f = (clamped - leave) / (arrive - leave);
        const eased =
          from.hold > 0 && to.hold > 0
            ? f * f * (3 - 2 * f)
            : from.hold > 0
              ? f * f
              : to.hold > 0
                ? 1 - (1 - f) ** 2
                : f;
        return (i + eased) / last;
      }
    }
    return 1;
  };

  return {
    keys,
    poseAt: (t, out = { position: new Vector3(), target: new Vector3() }) => {
      const u = curveParam(t);
      positions.getPoint(u, out.position);
      out.position.y = Math.max(out.position.y, MIN_CAMERA_HEIGHT);
      const s = u * last;
      targetOf(
        out.position,
        { yaw: yaw(s), pitch: pitch(s), distance: distance(s) },
        out.target,
      );
      return out;
    },
  };
};
