import {
  BufferGeometry,
  CatmullRomCurve3,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  TubeGeometry,
  Vector3,
} from 'three';
import { FIRST_ROW_RADIUS, ROWS_SIDE, ROW_DEPTH } from './stand-layout';

/** Half the shell's length along the pitch, where it meets the ground in the corners. */
const SHELL_HALF_LENGTH = 98;
const CORNER_Z = 64;
const FRONT_EDGE_HEIGHT = 44;
const BACK_EDGE_HEIGHT = 21;

/**
 * A point on one shell. `side` picks the long stand (+1 main, −1 opposite),
 * `x` runs along the pitch, `s` goes from the back edge (0) to the front
 * edge over the track (1). The arch peaks mid-stand and dives into the
 * corners; the section lifts towards the pitch like an opening seashell.
 */
export const shellPoint = (side: 1 | -1, x: number, s: number): Vector3 => {
  const e = Math.min(1, Math.abs(x) / SHELL_HALF_LENGTH);
  const arch = Math.max(0, 1 - e * e) ** 0.62;
  const pinch = e ** 2.6;
  const front = FIRST_ROW_RADIUS + 1;
  const back = FIRST_ROW_RADIUS + ROWS_SIDE * ROW_DEPTH + 4;
  const zFront = front + (CORNER_Z - front) * pinch;
  const zBack = back + (CORNER_Z - back) * pinch;
  const yFront = 3 + FRONT_EDGE_HEIGHT * arch;
  const yBack = 2 + BACK_EDGE_HEIGHT * arch;
  const z = zBack + (zFront - zBack) * s;
  const y =
    yBack +
    (yFront - yBack) * (1 - (1 - s) ** 1.7) -
    Math.sin(s * Math.PI) * 2.2 * arch;
  return new Vector3(x, y, side * z);
};

const tube = (
  points: Vector3[],
  segments: number,
  radius: number,
  material: MeshStandardMaterial | MeshBasicMaterial,
) =>
  new Mesh(
    new TubeGeometry(new CatmullRomCurve3(points), segments, radius, 6),
    material,
  );

const along = (side: 1 | -1, s: number, count: number, span = 1) =>
  Array.from({ length: count + 1 }, (_, a) =>
    shellPoint(
      side,
      -SHELL_HALF_LENGTH * span + (2 * SHELL_HALF_LENGTH * span * a) / count,
      s,
    ),
  );

/** Translucent panels, white ribs, the front-edge beam and its floodlight band. */
const buildShell = (side: 1 | -1): Group => {
  const shell = new Group();
  const columns = 64;
  const rows = 22;
  const positions: number[] = [];
  const indices: number[] = [];
  for (let a = 0; a <= columns; a += 1) {
    for (let b = 0; b <= rows; b += 1) {
      const p = shellPoint(
        side,
        -SHELL_HALF_LENGTH + (2 * SHELL_HALF_LENGTH * a) / columns,
        b / rows,
      );
      positions.push(p.x, p.y, p.z);
    }
  }
  for (let a = 0; a < columns; a += 1) {
    for (let b = 0; b < rows; b += 1) {
      const q = a * (rows + 1) + b;
      indices.push(q, q + rows + 1, q + 1, q + 1, q + rows + 1, q + rows + 2);
    }
  }
  const surface = new BufferGeometry();
  surface.setAttribute('position', new Float32BufferAttribute(positions, 3));
  surface.setIndex(indices);
  surface.computeVertexNormals();
  const panels = new Mesh(
    surface,
    new MeshStandardMaterial({
      color: 0xe6ecf6,
      transparent: true,
      opacity: 0.5,
      side: DoubleSide,
      roughness: 0.35,
      metalness: 0.15,
      emissive: 0x8fa6cf,
      emissiveIntensity: 0.22,
      depthWrite: false,
    }),
  );
  panels.renderOrder = 2;
  shell.add(panels);

  const steel = new MeshStandardMaterial({
    color: 0xf2f5fa,
    roughness: 0.4,
    metalness: 0.35,
  });
  for (let x = -SHELL_HALF_LENGTH + 4; x <= SHELL_HALF_LENGTH - 4; x += 4.2) {
    const points = Array.from({ length: 17 }, (_, b) =>
      shellPoint(side, x, b / 16),
    );
    const rib = tube(points, 16, Math.abs(x) % 21 < 4.2 ? 0.32 : 0.16, steel);
    rib.castShadow = true;
    shell.add(rib);
  }
  for (const s of [0.3, 0.6])
    shell.add(tube(along(side, s, 60), 120, 0.14, steel));
  shell.add(tube(along(side, 1, 80), 160, 0.75, steel));

  const lamps = shellLampPoints(side, 80);
  shell.add(
    tube(
      lamps,
      120,
      0.32,
      new MeshBasicMaterial({ color: 0xfff3da, toneMapped: false }),
    ),
  );
  return shell;
};

/** Points along a shell's floodlight band, just under the front-edge beam. */
export const shellLampPoints = (side: 1 | -1, count: number): Vector3[] =>
  along(side, 0.985, count, 0.72).map((p) => p.setY(p.y - 0.9));

/** Poljud's two seashell roofs over the long stands. */
export const buildShells = (): Group => {
  const shells = new Group();
  shells.add(buildShell(1), buildShell(-1));
  return shells;
};
