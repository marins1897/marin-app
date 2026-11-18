import {
  CapsuleGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  type BufferGeometry,
} from 'three';

export interface Outfit {
  shirt: string;
  /** Forearms: skin for short sleeves, cloth for long ones. */
  forearms?: string;
  shorts: string;
  /** Thighs: skin under football shorts, cloth for trousers. */
  thighs?: string;
  socks: string;
  boots: string;
  skin: string;
  hair: string;
}

export interface Pose {
  /** Shoulder swing forwards, radians. */
  shoulder?: number;
  /** Elbow bend forwards, radians. */
  elbow?: number;
}

export interface Figure {
  group: Group;
  /** The left upper arm, for an armband. */
  leftArm: Group;
}

const SKIN_TONES = ['#e8c4a8', '#d8b49a', '#c39270', '#9c6e4f', '#6f4a33'];
const HAIR_TONES = ['#120d0a', '#2b1d14', '#3d2a1a', '#5a3c22', '#1c1c1c'];

/** A skin and hair pair picked by `seed`, so every figure looks a little different. */
export const looksFor = (seed: number): Pick<Outfit, 'skin' | 'hair'> => ({
  skin: SKIN_TONES[seed % SKIN_TONES.length] ?? '#d8b49a',
  hair: HAIR_TONES[(seed * 3 + 1) % HAIR_TONES.length] ?? '#1c1c1c',
});

/**
 * A low-poly person about 1.82 m tall, facing +x (+z is their right). Rounded
 * limbs, tapered torso, neck and hair: reads as a person at broadcast
 * distance and stays a few hundred triangles.
 */
export const buildFigure = (
  outfit: Outfit,
  { shoulder = 0.06, elbow = 0.18 }: Pose = {},
): Figure => {
  const group = new Group();
  const cache = new Map<string, MeshStandardMaterial>();
  const cloth = (color: string, roughness = 0.75) => {
    const key = `${color}/${roughness}`;
    const existing = cache.get(key);
    if (existing) return existing;
    const created = new MeshStandardMaterial({ color, roughness });
    cache.set(key, created);
    return created;
  };
  const add = (
    parent: Group,
    geometry: BufferGeometry,
    color: string,
    [x, y, z]: readonly [number, number, number],
    roughness?: number,
  ) => {
    const mesh = new Mesh(geometry, cloth(color, roughness));
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };
  let leftArm: Group | undefined;
  const thighs = outfit.thighs ?? outfit.skin;
  const forearms = outfit.forearms ?? outfit.skin;

  for (const side of [-1, 1]) {
    const z = side * 0.11;
    add(
      group,
      new CapsuleGeometry(0.052, 0.14, 4, 8).rotateZ(Math.PI / 2),
      outfit.boots,
      [0.05, 0.055, z],
      0.4,
    );
    add(group, new CylinderGeometry(0.062, 0.05, 0.44, 10), outfit.socks, [
      0,
      0.32,
      z,
    ]);
    add(group, new CylinderGeometry(0.082, 0.064, 0.34, 10), thighs, [
      0,
      0.68,
      z,
    ]);

    const arm = new Group();
    arm.position.set(0, 1.5, side * 0.235);
    arm.rotation.set(-side * 0.1, 0, shoulder);
    add(
      arm,
      new CapsuleGeometry(0.056, 0.22, 4, 8),
      outfit.shirt,
      [0, -0.15, 0],
    );
    const forearm = new Group();
    forearm.position.y = -0.31;
    forearm.rotation.z = elbow;
    add(
      forearm,
      new CapsuleGeometry(0.046, 0.2, 4, 8),
      forearms,
      [0, -0.13, 0],
    );
    add(forearm, new SphereGeometry(0.052, 10, 8), outfit.skin, [0, -0.28, 0]);
    arm.add(forearm);
    group.add(arm);
    if (side < 0) leftArm = arm;
  }

  add(
    group,
    new CylinderGeometry(0.2, 0.21, 0.27, 14).scale(0.72, 1, 1),
    outfit.shorts,
    [0, 0.9, 0],
  );
  add(
    group,
    new CylinderGeometry(0.235, 0.185, 0.6, 16).scale(0.62, 1, 1),
    outfit.shirt,
    [0, 1.3, 0],
  );
  for (const side of [-1, 1]) {
    add(group, new SphereGeometry(0.09, 12, 8), outfit.shirt, [
      0,
      1.53,
      side * 0.2,
    ]);
  }
  add(
    group,
    new CylinderGeometry(0.05, 0.055, 0.12, 10),
    outfit.skin,
    [0, 1.63, 0],
  );
  add(
    group,
    new SphereGeometry(0.112, 18, 14).scale(0.95, 1.14, 0.9),
    outfit.skin,
    [0.01, 1.77, 0],
    0.65,
  );
  add(
    group,
    new SphereGeometry(0.118, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.52).scale(
      1,
      1.1,
      0.94,
    ),
    outfit.hair,
    [-0.012, 1.79, 0],
    0.9,
  );

  if (!leftArm) throw new Error('Figure has no left arm');
  return { group, leftArm };
};
