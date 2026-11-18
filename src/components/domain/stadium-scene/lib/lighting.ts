import { DirectionalLight, Group, HemisphereLight } from 'three';

/**
 * Night-match light rig (physical intensities). The key light stands in for
 * the floodlight banks and casts the pitch shadows; the emissive lamps on the
 * shells carry the glow through the bloom pass.
 */
export const buildLighting = (shadowMapSize: number): Group => {
  const rig = new Group();
  rig.add(new HemisphereLight(0x9fb6ff, 0x0c2010, 1.4));

  const key = new DirectionalLight(0xfff4e0, 3.2);
  key.position.set(-40, 90, 30);
  key.castShadow = true;
  key.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  Object.assign(key.shadow.camera, {
    left: -120,
    right: 120,
    top: 100,
    bottom: -100,
    near: 10,
    far: 320,
  });
  key.shadow.bias = -0.0004;
  key.shadow.radius = 3;

  const fill = new DirectionalLight(0xb9c8ff, 1.1);
  fill.position.set(50, 60, -40);
  rig.add(key, fill);
  return rig;
};
