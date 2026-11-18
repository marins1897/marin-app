import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  Points,
  ShaderMaterial,
  type Material,
  type WebGLRenderer,
} from 'three';
import { TUNNEL_MOUTH_Z } from './camera-path';
import { TUNNEL_HALF_WIDTH, TUNNEL_HEIGHT as HEIGHT } from './stand-layout';
import { DISPLAY_FONT, SCENE_COLORS, createPaintedTexture } from './textures';

const LENGTH = 40;

/** Dark precast concrete: noise, panel joints and a dado line, repeating along the walls. */
const concretePanels = (renderer: WebGLRenderer, repeat: number) => {
  const panels = createPaintedTexture(renderer, 512, 256, { repeat: true });
  const { context: c } = panels;
  c.fillStyle = '#2b313d';
  c.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 6000; i += 1) {
    c.fillStyle =
      Math.random() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.12)';
    c.fillRect(Math.random() * 512, Math.random() * 256, 2, 2);
  }
  c.fillStyle = 'rgba(0,0,0,.55)';
  for (const x of [0, 256]) c.fillRect(x, 0, 3, 256);
  c.fillRect(0, 168, 512, 2);
  panels.texture.needsUpdate = true;
  panels.texture.repeat.set(repeat, 1);
  return panels.texture;
};

/** Rubber walkway with lime edge lines, repeating along the floor. */
const rubberFloor = (renderer: WebGLRenderer, repeat: number) => {
  const rubber = createPaintedTexture(renderer, 256, 256, { repeat: true });
  const { context: c } = rubber;
  c.fillStyle = '#1a2130';
  c.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3000; i += 1) {
    c.fillStyle = 'rgba(255,255,255,.04)';
    c.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  c.fillStyle = SCENE_COLORS.volt;
  for (const x of [18, 234]) c.fillRect(x, 0, 4, 256);
  rubber.texture.needsUpdate = true;
  rubber.texture.repeat.set(1, repeat);
  return rubber.texture;
};

/** Specks of dust drifting through the lamp light, as soft additive points. */
const buildDust = (
  width: number,
  start: number,
  time: { value: number },
): Points => {
  const count = 420;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * width;
    positions[i * 3 + 1] = 0.3 + Math.random() * (HEIGHT - 0.5);
    positions[i * 3 + 2] = start + Math.random() * LENGTH;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return new Points(
    geometry,
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uTime: time },
      vertexShader: `uniform float uTime;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          float seed = p.x * 12.9 + p.z * 7.3;
          p += vec3(sin(uTime * 0.21 + seed), sin(uTime * 0.17 + seed * 1.7), cos(uTime * 0.19 + seed)) * 0.25;
          vec4 view = viewMatrix * modelMatrix * vec4(p, 1.0);
          vAlpha = 0.5 + 0.5 * sin(uTime * 0.7 + seed);
          gl_PointSize = 26.0 / max(1.0, -view.z);
          gl_Position = projectionMatrix * view;
        }`,
      fragmentShader: `varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float glow = clamp(1.0 - d * 2.0, 0.0, 1.0);
          gl_FragColor = vec4(vec3(1.0, 0.95, 0.85) * glow * glow * vAlpha * 0.5, 1.0);
        }`,
    }),
  );
};

export interface Tunnel {
  group: Group;
  /** Animates the LED chase and the dust; call every frame with elapsed seconds. */
  tick(seconds: number): void;
}

/** The players' tunnel under the main stand and out past its back wall, with a matchday wall graphic. */
export const buildTunnel = (
  renderer: WebGLRenderer,
  wallText: string,
): Tunnel => {
  const tunnel = new Group();
  const width = TUNNEL_HALF_WIDTH * 2;
  const start = TUNNEL_MOUTH_Z;
  const end = start + LENGTH;
  const middle = (start + end) / 2;
  const walls = new MeshStandardMaterial({
    map: concretePanels(renderer, LENGTH / 3),
    roughness: 0.8,
  });
  const floor = new MeshStandardMaterial({
    map: rubberFloor(renderer, LENGTH / 8),
    roughness: 0.42,
    metalness: 0.15,
  });

  const plane = (
    w: number,
    h: number,
    material: Material,
    position: readonly [number, number, number],
    rotation: readonly [number, number, number],
  ) => {
    const mesh = new Mesh(new PlaneGeometry(w, h), material);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    tunnel.add(mesh);
  };
  plane(width, LENGTH, floor, [0, 0.01, middle], [-Math.PI / 2, 0, 0]);
  plane(width, LENGTH, walls, [0, HEIGHT, middle], [Math.PI / 2, 0, 0]);
  plane(
    LENGTH,
    HEIGHT,
    walls,
    [-width / 2, HEIGHT / 2, middle],
    [0, Math.PI / 2, 0],
  );
  plane(
    LENGTH,
    HEIGHT,
    walls,
    [width / 2, HEIGHT / 2, middle],
    [0, -Math.PI / 2, 0],
  );
  plane(width, HEIGHT, walls, [0, HEIGHT / 2, end], [0, Math.PI, 0]);

  const panel = new MeshBasicMaterial({ color: 0xfff4dc });
  const stripe = new MeshBasicMaterial({ color: SCENE_COLORS.volt });
  for (let z = start + 2; z < end; z += 3) {
    const lamp = new Mesh(new BoxGeometry(2.6, 0.06, 0.5), panel);
    lamp.position.set(0, HEIGHT - 0.05, z);
    const mark = new Mesh(new BoxGeometry(0.06, 2.2, 0.14), stripe);
    mark.position.set(-width / 2 + 0.05, 1.6, z + 1.4);
    tunnel.add(lamp, mark);
  }
  const time = { value: 0 };
  // Lime pulses run along the strips towards the pitch.
  const led = new ShaderMaterial({
    uniforms: { uTime: time, uColor: { value: new Color(SCENE_COLORS.volt) } },
    vertexShader: `varying float vZ;
      void main() {
        vZ = (modelMatrix * vec4(position, 1.0)).z;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `uniform float uTime;
      uniform vec3 uColor;
      varying float vZ;
      void main() {
        float pulse = smoothstep(0.75, 1.0, fract((vZ + uTime * 6.0) / 5.0));
        gl_FragColor = vec4(uColor * (0.35 + 0.9 * pulse), 1.0);
      }`,
  });
  for (const side of [-1, 1]) {
    const strip = new Mesh(new BoxGeometry(0.04, 0.05, LENGTH), led);
    strip.position.set(side * (width / 2 - 0.03), 0.28, middle);
    tunnel.add(strip);
  }
  for (const z of [start + 6, start + 18, start + 30]) {
    const light = new PointLight(0xfff0d0, 9, 16, 2);
    light.position.set(0, HEIGHT - 0.4, z);
    tunnel.add(light);
  }

  const graphic = createPaintedTexture(renderer, 1600, 360);
  const { context: c, width: w, height: h } = graphic;
  c.fillStyle = SCENE_COLORS.card;
  c.fillRect(0, 0, w, h);
  c.fillStyle = SCENE_COLORS.volt;
  c.fillRect(0, h - 18, w, 18);
  let size = 130;
  c.font = `${size}px ${DISPLAY_FONT}`;
  while (size > 40 && c.measureText(wallText.toUpperCase()).width > w - 120) {
    size -= 6;
    c.font = `${size}px ${DISPLAY_FONT}`;
  }
  c.textBaseline = 'middle';
  c.fillStyle = '#ffffff';
  c.fillText(wallText.toUpperCase(), 60, h * 0.45);
  graphic.texture.needsUpdate = true;
  plane(
    14,
    3.1,
    new MeshStandardMaterial({
      map: graphic.texture,
      emissiveMap: graphic.texture,
      emissive: 0xffffff,
      emissiveIntensity: 0.12,
      roughness: 0.6,
    }),
    [width / 2 - 0.02, 1.7, start + 20],
    [0, -Math.PI / 2, 0],
  );
  tunnel.add(buildDust(width, start, time));
  return {
    group: tunnel,
    tick: (seconds) => {
      time.value = seconds;
    },
  };
};
