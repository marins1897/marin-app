import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Mesh,
  MeshStandardMaterial,
} from 'three';
import { RACE_SAMPLES, racePoint } from './race-track';
import {
  FIRST_ROW_RADIUS,
  ROW_DEPTH,
  ROW_RISE,
  isTunnelGap,
  TUNNEL_HEIGHT,
  rowHeight,
  rowRadius,
  rowsAt,
} from './stand-layout';

export interface FanSpot {
  x: number;
  y: number;
  z: number;
  /** Rotation about y so the fan faces the pitch. */
  facing: number;
}

const SEAT = new Color(0x1d4aa6);
const SEAT_BAND = new Color(0xdfe6f2);
const CONCRETE = new Color(0x283044);

class QuadBuffer {
  readonly positions: number[] = [];
  readonly colors: number[] = [];
  readonly indices: number[] = [];

  add(corners: readonly (readonly [number, number, number])[], color: Color) {
    const first = this.positions.length / 3;
    for (const corner of corners) {
      this.positions.push(...corner);
      this.colors.push(color.r, color.g, color.b);
    }
    this.indices.push(first, first + 1, first + 2, first, first + 2, first + 3);
  }

  toGeometry(): BufferGeometry {
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute(this.positions, 3),
    );
    geometry.setAttribute('color', new Float32BufferAttribute(this.colors, 3));
    geometry.setIndex(this.indices);
    geometry.computeVertexNormals();
    return geometry;
  }
}

/**
 * The Poljud bowl: stepped seating rows following the track outline, tall on
 * the long sides and low at the open ends, with the players' tunnel cut out of
 * the main stand. Returns the mesh and a seat position for every fan.
 */
export const buildBowl = (
  fanSpacing: number,
  random: () => number = Math.random,
): { bowl: Mesh; fans: FanSpot[] } => {
  const quads = new QuadBuffer();
  const fans: FanSpot[] = [];

  for (let i = 0; i < RACE_SAMPLES; i += 1) {
    const j = (i + 1) % RACE_SAMPLES;
    const rows = Math.min(rowsAt(i), rowsAt(j));

    for (let row = 0; row < rows; row += 1) {
      if (isTunnelGap(i, row) || isTunnelGap(j, row)) continue;
      const near = rowRadius(row);
      const far = near + ROW_DEPTH;
      const y = rowHeight(row);
      const a0 = racePoint(i, near);
      const b0 = racePoint(j, near);
      const a1 = racePoint(i, far);
      const b1 = racePoint(j, far);
      quads.add(
        [
          [a0.x, y, a0.z],
          [b0.x, y, b0.z],
          [b1.x, y, b1.z],
          [a1.x, y, a1.z],
        ],
        row % 7 === 3 ? SEAT_BAND : SEAT,
      );
      quads.add(
        [
          [a1.x, y, a1.z],
          [b1.x, y, b1.z],
          [b1.x, y + ROW_RISE, b1.z],
          [a1.x, y + ROW_RISE, a1.z],
        ],
        CONCRETE,
      );

      const length = Math.hypot(b0.x - a0.x, b0.z - a0.z);
      for (let u = random() * fanSpacing; u < length; u += fanSpacing) {
        if (random() < 0.14) continue;
        const f = u / length;
        fans.push({
          x: a0.x + (b0.x - a0.x) * f + (a1.x - a0.x) * 0.45,
          y,
          z: a0.z + (b0.z - a0.z) * f + (a1.z - a0.z) * 0.45,
          facing: Math.atan2(-a0.nx, -a0.nz),
        });
      }
    }

    const top = rowRadius(rows);
    const wallTop = rowHeight(rows) + 1.2;
    const a = racePoint(i, top);
    const b = racePoint(j, top);
    const wallBottom = isTunnelGap(i, 0) ? TUNNEL_HEIGHT : 0;
    quads.add(
      [
        [a.x, wallBottom, a.z],
        [b.x, wallBottom, b.z],
        [b.x, wallTop, b.z],
        [a.x, wallTop, a.z],
      ],
      CONCRETE,
    );

    if (!isTunnelGap(i, 0)) {
      const f0 = racePoint(i, FIRST_ROW_RADIUS);
      const f1 = racePoint(j, FIRST_ROW_RADIUS);
      const lip = rowHeight(0);
      quads.add(
        [
          [f0.x, 0, f0.z],
          [f1.x, 0, f1.z],
          [f1.x, lip, f1.z],
          [f0.x, lip, f0.z],
        ],
        CONCRETE,
      );
    }
  }

  const bowl = new Mesh(
    quads.toGeometry(),
    new MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      side: DoubleSide,
    }),
  );
  bowl.receiveShadow = true;
  return { bowl, fans };
};
