import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RingGeometry,
  SphereGeometry,
} from 'three';
import { buildFigure, looksFor } from './build-figure';
import { PITCH_WIDTH } from './build-pitch';
import { SCENE_COLORS } from './textures';

/** The technical area: just off the touchline in front of the tunnel, left of halfway. */
export const COACH_SPOT = { x: -7, z: PITCH_WIDTH / 2 + 3 } as const;

export interface Coach {
  group: Group;
  highlight(isOn: boolean): void;
  /** Idle movement; call every frame with elapsed seconds. */
  tick(seconds: number): void;
}

const FACING_PITCH = Math.PI / 2;

/**
 * The head coach in the technical area: navy hoodie and joggers, lime lanyard,
 * an open laptop held at the chest, facing the pitch (−z). A developer's
 * touchline outfit.
 */
export const buildCoach = (): Coach => {
  const group = new Group();
  const hoodie = '#0b1a44';
  const { group: figure } = buildFigure(
    {
      shirt: hoodie,
      forearms: hoodie,
      shorts: '#151a24',
      thighs: '#151a24',
      socks: '#151a24',
      boots: '#f2f4f8',
      ...looksFor(2),
    },
    { shoulder: 0.35, elbow: 1.2 },
  );
  const part = (
    geometry: BoxGeometry | SphereGeometry | PlaneGeometry,
    material: MeshStandardMaterial | MeshBasicMaterial,
    [x, y, z]: readonly [number, number, number],
    rotationZ = 0,
  ) => {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.z = rotationZ;
    figure.add(mesh);
    return mesh;
  };
  const lanyard = new MeshStandardMaterial({
    color: SCENE_COLORS.volt,
    roughness: 0.5,
  });
  const laptop = new MeshStandardMaterial({
    color: '#b9c0cc',
    roughness: 0.35,
    metalness: 0.6,
  });

  part(
    new SphereGeometry(0.15, 12, 8).scale(0.7, 0.6, 1),
    new MeshStandardMaterial({ color: hoodie, roughness: 0.85 }),
    [-0.11, 1.6, 0],
  );
  for (const side of [-1, 1]) {
    const strap = part(new BoxGeometry(0.012, 0.36, 0.028), lanyard, [
      0.15,
      1.42,
      side * 0.06,
    ]);
    strap.rotation.x = side * 0.18;
  }
  part(
    new BoxGeometry(0.012, 0.11, 0.08),
    new MeshStandardMaterial({ color: '#ffffff' }),
    [0.156, 1.22, 0],
  );
  part(new BoxGeometry(0.28, 0.02, 0.42), laptop, [0.37, 1.22, 0]);
  part(new BoxGeometry(0.02, 0.28, 0.42), laptop, [0.53, 1.36, 0], -0.3);
  part(
    new PlaneGeometry(0.38, 0.24),
    new MeshBasicMaterial({ color: '#9cc4ff' }),
    [0.518, 1.36, 0],
    -0.3,
  ).rotation.y = -Math.PI / 2;

  figure.position.set(COACH_SPOT.x, 0, COACH_SPOT.z);
  figure.rotation.y = FACING_PITCH;
  const ring = new Mesh(
    new RingGeometry(0.75, 0.95, 48),
    new MeshBasicMaterial({
      color: SCENE_COLORS.volt,
      toneMapped: false,
      transparent: true,
      opacity: 0.9,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(COACH_SPOT.x, 0.03, COACH_SPOT.z);
  ring.visible = false;
  group.add(figure, ring);

  return {
    group,
    highlight: (isOn) => {
      ring.visible = isOn;
    },
    tick: (seconds) => {
      figure.rotation.y = FACING_PITCH + Math.sin(seconds * 0.4) * 0.15;
    },
  };
};
