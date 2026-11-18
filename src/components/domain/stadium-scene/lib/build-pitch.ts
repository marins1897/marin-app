import {
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  type WebGLRenderer,
} from 'three';
import {
  STRAIGHT_LENGTH,
  TRACK_INNER_RADIUS,
  TRACK_OUTER_RADIUS,
} from './race-track';
import { createPaintedTexture } from './textures';

export const PITCH_LENGTH = 105;
export const PITCH_WIDTH = 68;
const GRASS_LENGTH = 124;
const GRASS_WIDTH = 86;
const GROUND_SIZE = [280, 200] as const;

const raceOutline = (
  c: CanvasRenderingContext2D,
  toX: (m: number) => number,
  toZ: (m: number) => number,
  scale: number,
  radius: number,
) => {
  const half = STRAIGHT_LENGTH / 2;
  c.beginPath();
  c.moveTo(toX(half), toZ(radius));
  c.lineTo(toX(-half), toZ(radius));
  c.arc(toX(-half), toZ(0), radius * scale, Math.PI / 2, Math.PI * 1.5);
  c.lineTo(toX(half), toZ(-radius));
  c.arc(toX(half), toZ(0), radius * scale, -Math.PI / 2, Math.PI / 2);
  c.closePath();
};

const speckle = (
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  n: number,
) => {
  for (let i = 0; i < n; i += 1) {
    c.fillStyle =
      Math.random() < 0.5 ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.06)';
    c.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }
};

/** Concrete apron, the red eight-lane track and the infield grass. */
const buildGround = (renderer: WebGLRenderer): Mesh => {
  const [length, width] = GROUND_SIZE;
  const target = createPaintedTexture(renderer, 2800, 2000);
  const { context: c, width: w, height: h } = target;
  const s = w / length;
  const x = (m: number) => w / 2 + m * s;
  const z = (m: number) => h / 2 + m * s;

  c.fillStyle = '#121a2b';
  c.fillRect(0, 0, w, h);
  raceOutline(c, x, z, s, TRACK_OUTER_RADIUS + 2.5);
  c.fillStyle = '#2b3346';
  c.fill();
  raceOutline(c, x, z, s, TRACK_OUTER_RADIUS);
  c.fillStyle = '#a3402c';
  c.fill();
  speckle(c, w, h, 40000);
  c.strokeStyle = 'rgba(255,255,255,.75)';
  c.lineWidth = 0.1 * s;
  const lane = (TRACK_OUTER_RADIUS - TRACK_INNER_RADIUS) / 8;
  for (let k = 0; k <= 8; k += 1) {
    raceOutline(c, x, z, s, TRACK_INNER_RADIUS + k * lane);
    c.stroke();
  }
  raceOutline(c, x, z, s, TRACK_INNER_RADIUS);
  c.fillStyle = '#1d6331';
  c.fill();
  target.texture.needsUpdate = true;

  const ground = new Mesh(
    new PlaneGeometry(length, width),
    new MeshStandardMaterial({ map: target.texture, roughness: 0.95 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.03;
  ground.receiveShadow = true;
  return ground;
};

/** Repeating blade-scale noise; as a bump map it makes the turf catch the floodlights. */
const grassBlades = (renderer: WebGLRenderer) => {
  const blades = createPaintedTexture(renderer, 256, 256, { repeat: true });
  const { context: c } = blades;
  c.fillStyle = '#808080';
  c.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9000; i += 1) {
    const shade = 90 + Math.floor(Math.random() * 90);
    c.fillStyle = `rgb(${shade},${shade},${shade})`;
    c.fillRect(
      Math.random() * 256,
      Math.random() * 256,
      1,
      2 + Math.random() * 3,
    );
  }
  blades.texture.needsUpdate = true;
  blades.texture.repeat.set(GRASS_LENGTH / 1.2, GRASS_WIDTH / 1.2);
  return blades.texture;
};

/** Mown stripes and FIFA markings, painted at 20 px per metre. */
const buildGrass = (renderer: WebGLRenderer): Mesh => {
  const target = createPaintedTexture(renderer, 2480, 1720);
  const { context: c, width: w, height: h } = target;
  const s = w / GRASS_LENGTH;
  const x = (m: number) => (m + GRASS_LENGTH / 2) * s;
  const z = (m: number) => (m + GRASS_WIDTH / 2) * s;

  c.fillStyle = '#2a7330';
  c.fillRect(0, 0, w, h);
  const stripes = 20;
  const stripe = (PITCH_LENGTH / stripes) * s;
  const start = ((GRASS_LENGTH - PITCH_LENGTH) / 2) * s;
  for (let i = -2; i < stripes + 2; i += 1) {
    c.fillStyle = i % 2 ? '#307d35' : '#26692b';
    c.fillRect(start + i * stripe, 0, stripe + 1, h);
  }
  // Cross-mowing: faint bands across the stripes give the checkered look.
  for (let i = 0; i < 12; i += 1) {
    if (i % 2) continue;
    c.fillStyle = 'rgba(255,255,255,.025)';
    c.fillRect(0, (i * h) / 12, w, h / 12);
  }
  // Worn turf where the play concentrates: goalmouths and the centre spot.
  const wear = (mx: number, mz: number, radius: number, strength: number) => {
    const g = c.createRadialGradient(x(mx), z(mz), 0, x(mx), z(mz), radius * s);
    g.addColorStop(0, `rgba(122,104,62,${strength})`);
    g.addColorStop(1, 'rgba(122,104,62,0)');
    c.fillStyle = g;
    c.fillRect(
      x(mx) - radius * s,
      z(mz) - radius * s,
      radius * 2 * s,
      radius * 2 * s,
    );
  };
  for (const side of [-1, 1]) {
    wear(side * (PITCH_LENGTH / 2 - 2.5), 0, 4.5, 0.45);
    wear(side * (PITCH_LENGTH / 2 - 11), 0, 3, 0.25);
  }
  wear(0, 0, 4, 0.22);
  speckle(c, w, h, 90000);

  const L = PITCH_LENGTH / 2;
  const W = PITCH_WIDTH / 2;
  c.strokeStyle = 'rgba(255,255,255,.92)';
  c.fillStyle = '#ffffff';
  c.lineWidth = 0.13 * s;
  c.strokeRect(x(-L), z(-W), PITCH_LENGTH * s, PITCH_WIDTH * s);
  c.beginPath();
  c.moveTo(x(0), z(-W));
  c.lineTo(x(0), z(W));
  c.stroke();
  c.beginPath();
  c.arc(x(0), z(0), 9.15 * s, 0, Math.PI * 2);
  c.stroke();
  const spot = (mx: number) => {
    c.beginPath();
    c.arc(x(mx), z(0), 0.22 * s, 0, Math.PI * 2);
    c.fill();
  };
  spot(0);
  for (const side of [-1, 1]) {
    const goalLine = side * L;
    c.strokeRect(
      Math.min(x(goalLine), x(goalLine - side * 16.5)),
      z(-20.16),
      16.5 * s,
      40.32 * s,
    );
    c.strokeRect(
      Math.min(x(goalLine), x(goalLine - side * 5.5)),
      z(-9.16),
      5.5 * s,
      18.32 * s,
    );
    const arcFrom = side > 0 ? Math.PI * 0.705 : -Math.PI * 0.295;
    const arcTo = side > 0 ? Math.PI * 1.295 : Math.PI * 0.295;
    c.beginPath();
    c.arc(x(goalLine - side * 11), z(0), 9.15 * s, arcFrom, arcTo);
    c.stroke();
    spot(goalLine - side * 11);
  }
  target.texture.needsUpdate = true;

  const grass = new Mesh(
    new PlaneGeometry(GRASS_LENGTH, GRASS_WIDTH),
    new MeshStandardMaterial({
      map: target.texture,
      bumpMap: grassBlades(renderer),
      bumpScale: 1.6,
      roughness: 0.88,
    }),
  );
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  return grass;
};

const buildGoal = (renderer: WebGLRenderer, side: -1 | 1): Group => {
  const goal = new Group();
  const lineX = (side * PITCH_LENGTH) / 2;
  const width = 7.32;
  const height = 2.44;
  const depth = 2;
  const frame = new MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.35,
    metalness: 0.1,
  });

  const net = createPaintedTexture(renderer, 256, 256, { repeat: true });
  net.context.strokeStyle = 'rgba(255,255,255,.75)';
  net.context.lineWidth = 2;
  net.context.beginPath();
  for (let i = 0; i <= 256; i += 16) {
    net.context.moveTo(i, 0);
    net.context.lineTo(i, 256);
    net.context.moveTo(0, i);
    net.context.lineTo(256, i);
  }
  net.context.stroke();
  net.texture.needsUpdate = true;
  net.texture.repeat.set(6, 2);
  const netMaterial = new MeshStandardMaterial({
    map: net.texture,
    transparent: true,
    side: DoubleSide,
    depthWrite: false,
    roughness: 1,
  });

  for (const z of [-width / 2, width / 2]) {
    const post = new Mesh(new CylinderGeometry(0.06, 0.06, height, 12), frame);
    post.position.set(lineX, height / 2, z);
    post.castShadow = true;
    goal.add(post);
    const sideNet = new Mesh(new PlaneGeometry(depth, height), netMaterial);
    sideNet.position.set(lineX + (side * depth) / 2, height / 2, z);
    goal.add(sideNet);
  }
  const bar = new Mesh(new CylinderGeometry(0.06, 0.06, width, 12), frame);
  bar.rotation.x = Math.PI / 2;
  bar.position.set(lineX, height, 0);
  bar.castShadow = true;
  const back = new Mesh(new PlaneGeometry(width, height), netMaterial);
  back.position.set(lineX + side * depth, height / 2, 0);
  back.rotation.y = Math.PI / 2;
  const roof = new Mesh(new PlaneGeometry(depth, width), netMaterial);
  roof.rotation.x = -Math.PI / 2;
  roof.position.set(lineX + (side * depth) / 2, height, 0);
  goal.add(bar, back, roof);
  return goal;
};

const buildBall = (renderer: WebGLRenderer): Mesh => {
  const target = createPaintedTexture(renderer, 512, 256);
  const { context: c, width: w, height: h } = target;
  c.fillStyle = '#f4f6fa';
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#0c1633';
  for (let i = 0; i < 12; i += 1) {
    const cx = (i % 6) * (w / 6) + (i < 6 ? 0 : w / 12);
    const cy = i < 6 ? h * 0.3 : h * 0.72;
    c.beginPath();
    for (let k = 0; k < 5; k += 1) {
      const a = (k * Math.PI * 2) / 5 - Math.PI / 2;
      c.lineTo(cx + Math.cos(a) * 26, cy + Math.sin(a) * 22);
    }
    c.fill();
  }
  target.texture.needsUpdate = true;
  const ball = new Mesh(
    new SphereGeometry(0.11, 32, 20),
    new MeshStandardMaterial({ map: target.texture, roughness: 0.4 }),
  );
  ball.position.set(0, 0.11, 0);
  ball.castShadow = true;
  return ball;
};

/** A corner flag on each corner of the pitch. */
const buildCornerFlags = (): Group => {
  const flags = new Group();
  const pole = new MeshStandardMaterial({ color: 0xf2f4f8, roughness: 0.4 });
  const cloth = new MeshStandardMaterial({
    color: 0xd4ff1f,
    roughness: 0.8,
    side: DoubleSide,
  });
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const x = (sx * PITCH_LENGTH) / 2;
      const z = (sz * PITCH_WIDTH) / 2;
      const stick = new Mesh(new CylinderGeometry(0.018, 0.018, 1.5, 8), pole);
      stick.position.set(x, 0.75, z);
      stick.castShadow = true;
      const flag = new Mesh(new PlaneGeometry(0.4, 0.28), cloth);
      flag.position.set(x - sx * 0.2, 1.34, z);
      flags.add(stick, flag);
    }
  }
  return flags;
};

/** Everything at ground level: apron, track, pitch, goals and the match ball. */
export const buildPitch = (renderer: WebGLRenderer): Group => {
  const pitch = new Group();
  pitch.add(
    buildGround(renderer),
    buildGrass(renderer),
    buildGoal(renderer, -1),
    buildGoal(renderer, 1),
    buildBall(renderer),
    buildCornerFlags(),
  );
  return pitch;
};
