import {
  BoxGeometry,
  type BufferGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  Vector3,
  type Material,
  type WebGLProgramParametersWithUniforms,
} from 'three';
// eslint-disable-next-line import-x/extensions -- three only exports its addons under their .js file names
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { FanSpot } from './build-bowl';

/** Home crowd in white and blue, a few red shirts, and everyday dark and grey jackets. */
const SHIRTS = [
  0xffffff, 0xffffff, 0xf1f3f7, 0x1f4fb4, 0x1f4fb4, 0x2b6be0, 0x16336e,
  0x0d1b3d, 0xd6202f, 0x3a3f4a, 0x1a1a1c, 0x2a2e36, 0x5b6170, 0xbfc5cf,
];
const SKIN = [0xe2bea4, 0xd8b49a, 0xc79c7c, 0xa77a5c];
const HAIR = [0x120d0a, 0x2b1d14, 0x3d2a1a, 0x1c1c1c, 0x5a3c22, 0x8a8a8a];
const SCARVES = [0xffffff, 0x1f4fb4, 0xd6202f];
const FLAGS = [0xffffff, 0x1f4fb4, 0xd6202f, 0xd4ff1f];

/** Share of fans holding something up. Each fan gets at most one prop. */
const FLAG_SHARE = 0.015;
const SCARF_SHARE = 0.12;
const ARMS_UP_SHARE = 0.18;
const PHONE_SHARE = 0.05;

export interface Crowd {
  meshes: readonly InstancedMesh[];
  /** Seconds since start; drives the bounce, flags and phone lights. */
  setTime(seconds: number): void;
  /** 0 = seated, ~0.3 = on their feet. */
  setEnergy(energy: number): void;
}

interface ShaderOptions {
  /** Flag cloth: ripple along local x, growing towards the free end. */
  wave?: boolean;
  /** Phone lights: per-instance on/off flicker in the fragment shader. */
  twinkle?: boolean;
}

interface CrowdUniforms {
  uTime: { value: number };
  uJump: { value: number };
}

/**
 * Animates instanced crowd parts on the GPU. Every part of one fan shares the
 * fan's instance matrix, so they bounce together; the per-instance phase comes
 * from the seat position.
 */
const crowdShader =
  (
    uniforms: CrowdUniforms,
    { wave = false, twinkle = false }: ShaderOptions = {},
  ) =>
  (shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uJump = uniforms.uJump;
    const header = `uniform float uTime;\nuniform float uJump;\nvarying float vPhase;\n`;
    shader.vertexShader = `${header}${shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      #ifdef USE_INSTANCING
        float phase = instanceMatrix[3].x * 1.7 + instanceMatrix[3].z * 2.3;
        vPhase = phase;
        transformed.y += max(0.0, sin(uTime * 7.0 + phase)) * uJump * (0.5 + 0.5 * fract(phase));
        ${wave ? 'transformed.z += sin(uTime * 5.0 + transformed.x * 3.5 + phase) * 0.18 * clamp(transformed.x, 0.0, 1.6);' : ''}
      #endif`,
    )}`;
    if (twinkle) {
      shader.fragmentShader = `${header}${shader.fragmentShader.replace(
        '#include <opaque_fragment>',
        `diffuseColor.rgb *= step(0.35, fract(sin(floor(uTime * 1.5 + vPhase) * 43.7) * 917.3));
        #include <opaque_fragment>`,
      )}`;
    }
  };

/** Two raised arms, from the shoulders up and slightly outwards. */
const armsGeometry = (): BufferGeometry => {
  const arm = (side: number) =>
    new BoxGeometry(0.09, 0.55, 0.09)
      .translate(0, 0.27, 0)
      .rotateZ(-side * 0.35)
      .translate(side * 0.17, 0.66, 0);
  const merged = mergeGeometries([arm(-1), arm(1)]);
  if (!merged) throw new Error('Could not merge arm geometry');
  return merged;
};

interface Part {
  geometry: BufferGeometry;
  material: Material;
  /** Indices into `fans` that carry this part. */
  fans: number[];
  colors?: readonly number[];
}

/**
 * One instanced mesh per body part or prop: bodies, heads, raised arms,
 * scarves, flags on poles and phone lights. Twenty thousand fans stay at a
 * handful of draw calls and no per-frame JavaScript.
 */
export const buildCrowd = (
  fans: readonly FanSpot[],
  random: () => number = Math.random,
): Crowd => {
  const uniforms: CrowdUniforms = { uTime: { value: 0 }, uJump: { value: 0 } };
  const material = <M extends Material>(m: M, options?: ShaderOptions): M => {
    m.onBeforeCompile = crowdShader(uniforms, options);
    return m;
  };
  const everyone = fans.map((_, index) => index);
  const flags: number[] = [];
  const scarves: number[] = [];
  const armsUp: number[] = [];
  const phones: number[] = [];
  for (const index of everyone) {
    const roll = random();
    if (roll < FLAG_SHARE) flags.push(index);
    else if (roll < FLAG_SHARE + SCARF_SHARE) scarves.push(index);
    else if (roll < FLAG_SHARE + SCARF_SHARE + ARMS_UP_SHARE)
      armsUp.push(index);
    else if (random() < PHONE_SHARE) phones.push(index);
  }

  const parts: Part[] = [
    {
      geometry: new CylinderGeometry(0.22, 0.16, 0.7, 7)
        .scale(1, 1, 0.7)
        .translate(0, 0.36, 0),
      material: material(new MeshStandardMaterial({ roughness: 0.85 })),
      fans: everyone,
      colors: SHIRTS,
    },
    {
      geometry: new SphereGeometry(0.13, 8, 6).translate(0, 0.86, 0),
      material: material(new MeshStandardMaterial({ roughness: 0.8 })),
      fans: everyone,
      colors: SKIN,
    },
    {
      geometry: new SphereGeometry(0.138, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2)
        .scale(1, 0.9, 1)
        .translate(0, 0.875, -0.015),
      material: material(new MeshStandardMaterial({ roughness: 0.95 })),
      fans: everyone,
      colors: HAIR,
    },
    {
      geometry: armsGeometry(),
      material: material(new MeshStandardMaterial({ roughness: 0.85 })),
      fans: [...armsUp, ...scarves],
      colors: SKIN,
    },
    {
      geometry: new BoxGeometry(1.1, 0.18, 0.04).translate(0, 1.25, 0),
      material: material(new MeshStandardMaterial({ roughness: 0.9 })),
      fans: scarves,
      colors: SCARVES,
    },
    {
      geometry: new BoxGeometry(0.04, 2.2, 0.04).translate(0.2, 1.4, 0),
      material: material(new MeshStandardMaterial({ color: 0x9aa3b2 })),
      fans: flags,
    },
    {
      geometry: new PlaneGeometry(1.6, 1).translate(1, 2, 0),
      material: material(
        new MeshStandardMaterial({ roughness: 0.9, side: DoubleSide }),
        { wave: true },
      ),
      fans: flags,
      colors: FLAGS,
    },
    {
      geometry: new PlaneGeometry(0.08, 0.14).translate(0.12, 1.12, 0.17),
      material: material(
        new MeshBasicMaterial({ color: 0xf2f6ff, toneMapped: false }),
        { twinkle: true },
      ),
      fans: phones,
    },
  ];

  const matrices = fans.map((fan) =>
    new Matrix4().compose(
      new Vector3(fan.x, fan.y, fan.z),
      new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), fan.facing),
      new Vector3(0.9 + random() * 0.2, 0.85 + random() * 0.3, 1),
    ),
  );
  const color = new Color();

  const meshes = parts.map(
    ({ geometry, material: m, fans: carriers, colors }) => {
      const mesh = new InstancedMesh(geometry, m, carriers.length);
      carriers.forEach((fanIndex, i) => {
        const matrix = matrices[fanIndex];
        if (matrix) mesh.setMatrixAt(i, matrix);
        if (colors) {
          color.setHex(
            colors[Math.floor(random() * colors.length)] ?? 0xffffff,
          );
          mesh.setColorAt(i, color.multiplyScalar(0.72 + random() * 0.33));
        }
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      return mesh;
    },
  );

  return {
    meshes,
    setTime: (seconds) => {
      uniforms.uTime.value = seconds;
    },
    setEnergy: (energy) => {
      uniforms.uJump.value = energy;
    },
  };
};
