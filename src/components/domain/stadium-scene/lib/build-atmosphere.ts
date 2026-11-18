import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  ShaderMaterial,
  SphereGeometry,
} from 'three';

const SKY_RADIUS = 700;
const HILLS_RADIUS = 430;
const CITY_RADIUS = [300, 410] as const;

/** Night sky: navy at the horizon to near-black at the zenith, with stars. */
const buildSky = (): Mesh =>
  new Mesh(
    new SphereGeometry(SKY_RADIUS, 48, 24),
    new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        horizon: { value: new Color(0x16295e) },
        zenith: { value: new Color(0x02040c) },
      },
      vertexShader: `varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `uniform vec3 horizon;
        uniform vec3 zenith;
        varying vec3 vDir;
        float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
        void main() {
          float h = clamp(vDir.y, 0.0, 1.0);
          vec3 color = mix(horizon, zenith, pow(h, 0.45));
          vec3 cell = floor(vDir * 380.0);
          float star = step(0.9985, hash(cell)) * smoothstep(0.08, 0.35, h);
          color += vec3(star * 0.85);
          gl_FragColor = vec4(color, 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );

/** The hills around Split as a dark ring on the horizon (Kozjak, Mosor, Marjan). */
const buildHills = (): Mesh => {
  const segments = 256;
  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const height =
      18 +
      26 * Math.max(0, Math.sin(a * 1.0 + 0.6)) +
      14 * Math.sin(a * 3.0 + 1.3) ** 2 +
      6 * Math.sin(a * 11.0) ** 2;
    const x = Math.cos(a) * HILLS_RADIUS;
    const z = Math.sin(a) * HILLS_RADIUS;
    positions.push(x, -4, z, x, height, z);
    if (i < segments) {
      const k = i * 2;
      indices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  return new Mesh(
    geometry,
    new MeshBasicMaterial({ color: 0x050a19, side: BackSide, fog: false }),
  );
};

/** Warm specks of the city between the stadium and the hills. */
const buildCityLights = (random: () => number): Points => {
  const positions: number[] = [];
  const colors: number[] = [];
  const warm = [new Color(0xffd9a0), new Color(0xfff1d6), new Color(0xffb36b)];
  for (let i = 0; i < 2400; i += 1) {
    const a = random() * Math.PI * 2;
    const r = CITY_RADIUS[0] + random() * (CITY_RADIUS[1] - CITY_RADIUS[0]);
    positions.push(
      Math.cos(a) * r,
      1 + random() * random() * 26,
      Math.sin(a) * r,
    );
    const c = warm[Math.floor(random() * warm.length)] ?? warm[0];
    if (c) colors.push(c.r, c.g, c.b);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return new Points(
    geometry,
    new PointsMaterial({
      size: 2,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: AdditiveBlending,
      depthWrite: false,
      fog: false,
      toneMapped: false,
    }),
  );
};

/** Everything beyond the stadium: sky, stars, hills and the lit city. */
export const buildAtmosphere = (random: () => number = Math.random): Group => {
  const atmosphere = new Group();
  atmosphere.add(buildSky(), buildHills(), buildCityLights(random));
  return atmosphere;
};
