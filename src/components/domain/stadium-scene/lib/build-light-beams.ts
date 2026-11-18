import {
  AdditiveBlending,
  CylinderGeometry,
  DoubleSide,
  InstancedMesh,
  Matrix4,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from 'three';
import { shellLampPoints } from './build-shells';

const BEAMS_PER_SHELL = 9;

/**
 * Floodlight beams in the night air: soft additive cones from the shell lamps
 * down onto the pitch, brightest near the lamp and fading towards the grass
 * and at the cone's edges. One draw call for all of them.
 */
export const buildLightBeams = (): InstancedMesh => {
  const lamps = [
    ...shellLampPoints(1, BEAMS_PER_SHELL),
    ...shellLampPoints(-1, BEAMS_PER_SHELL),
  ];
  const geometry = new CylinderGeometry(0.05, 1, 1, 24, 1, true).translate(
    0,
    -0.5,
    0,
  );
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms: { uStrength: { value: 0.22 } },
    vertexShader: `varying float vAlong;
      varying float vFacing;
      void main() {
        vAlong = uv.y;
        vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vec3 worldNormal = normalize(mat3(modelMatrix * instanceMatrix) * normal);
        vFacing = abs(dot(worldNormal, normalize(cameraPosition - world.xyz)));
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: `uniform float uStrength;
      varying float vAlong;
      varying float vFacing;
      void main() {
        float alpha = pow(clamp(vAlong, 0.0, 1.0), 1.6) * vFacing * vFacing * uStrength;
        gl_FragColor = vec4(vec3(1.0, 0.96, 0.88) * alpha, 1.0);
      }`,
  });

  const beams = new InstancedMesh(geometry, material, lamps.length);
  const down = new Vector3(0, -1, 0);
  const matrix = new Matrix4();
  const turn = new Quaternion();
  const scale = new Vector3();
  lamps.forEach((lamp, i) => {
    const aim = new Vector3(lamp.x * 0.8, 0, lamp.z * 0.2).sub(lamp);
    const length = aim.length();
    turn.setFromUnitVectors(down, aim.normalize());
    scale.set(length * 0.11, length, length * 0.11);
    beams.setMatrixAt(i, matrix.compose(lamp, turn, scale));
  });
  beams.instanceMatrix.needsUpdate = true;
  beams.frustumCulled = false;
  return beams;
};
