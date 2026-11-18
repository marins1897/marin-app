import {
  ACESFilmicToneMapping,
  Color,
  Fog,
  Mesh,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  type Material,
  type Texture,
} from 'three';
import { buildAtmosphere } from './build-atmosphere';
import { buildBowl } from './build-bowl';
import { buildCoach } from './build-coach';
import { buildCrowd } from './build-crowd';
import { buildFlares } from './build-flares';
import { buildLightBeams } from './build-light-beams';
import { buildPitch } from './build-pitch';
import { buildPlayers } from './build-players';
import { buildShells } from './build-shells';
import { buildSignage } from './build-signage';
import { buildTunnel } from './build-tunnel';
import { turnTowards } from './camera-aim';
import { LANDSCAPE, PORTRAIT, createCameraPath } from './camera-path';
import { buildLighting } from './lighting';
import { createPostProcessing } from './post-processing';
import { isSoftwareRenderer, rendererNameOf } from './software-renderer';
import type { Slot } from './formation';

export interface StadiumPlayer {
  number: string;
  slot: Slot;
  isCaptain: boolean;
  title: string;
  /** Position and club line under the title on the big screens. */
  detail: string;
  /** Scrolling text for the pitch-side LED boards. */
  board: string;
  /** Same-origin screenshot URL shown on the big screens. */
  image?: string;
}

export interface StadiumCopy {
  welcome: { kicker: string; title: string };
  name: { kicker: string; firstName: string; lastName: string };
  lineup: { kicker: string; title: string; board: string };
  board: string;
  wall: string;
  /** The starting XI in introduction order. */
  players: readonly StadiumPlayer[];
}

/** What the screens, boards and pitch show right now. */
export type StadiumFocus =
  | { kind: 'welcome' }
  | { kind: 'name' }
  | { kind: 'coach' }
  | { kind: 'lineup' }
  | { kind: 'player'; index: number };

export interface StadiumOptions {
  copy: StadiumCopy;
  /** Live 0 → 1 scroll progress, read every frame. */
  getProgress: () => number;
  reducedMotion: boolean;
  /** Phones and small screens: fewer fans, no antialiasing, cheaper shadows. */
  lowPower: boolean;
}

export interface StadiumController {
  setFocus(focus: StadiumFocus): void;
  dispose(): void;
}

/** Fastest the camera may turn, in radians per second, however fast the visitor scrolls. */
const MAX_TURN_SPEED = 1.1;

const smoothstep = (from: number, to: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
};

/**
 * Builds the Poljud night scene into `canvas` and runs it until `dispose()`.
 * The camera follows scroll progress along a fixed path; the screens and LED
 * boards follow `setFocus`. Throws if hardware-accelerated WebGL is unavailable.
 */
export const createStadium = (
  canvas: HTMLCanvasElement,
  { copy, getProgress, reducedMotion, lowPower }: StadiumOptions,
): StadiumController => {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: !lowPower,
    powerPreference: 'high-performance',
    // No GPU (software rendering) would make the walk-out crawl and block the
    // main thread; the hero then keeps its plain background instead.
    failIfMajorPerformanceCaveat: true,
  });
  if (isSoftwareRenderer(rendererNameOf(renderer.getContext()))) {
    renderer.dispose();
    throw new Error('WebGL runs on the CPU here; skipping the 3D scene');
  }
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.78;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  const pixelRatio = Math.min(
    window.devicePixelRatio || 1,
    lowPower ? 1.25 : 1.75,
  );
  renderer.setPixelRatio(pixelRatio);

  const scene = new Scene();
  scene.background = new Color(0x040916);
  scene.fog = new Fog(0x060d22, 170, 520);
  const camera = new PerspectiveCamera(50, 1, 0.1, 900);

  const { bowl, fans } = buildBowl(lowPower ? 1.15 : 0.72);
  const crowd = buildCrowd(fans);
  const signage = buildSignage(renderer);
  const flares = buildFlares();
  const players = buildPlayers(renderer, copy.players);
  const coach = buildCoach();
  const tunnel = buildTunnel(renderer, copy.wall);
  const slots = copy.players.map((player) => player.slot);
  const landscapePath = createCameraPath(slots, LANDSCAPE);
  const portraitPath = createCameraPath(slots, PORTRAIT);
  // Portrait phones get their own close-ups (DECISIONS § 17).
  const pathFor = () => (camera.aspect < 1 ? portraitPath : landscapePath);
  scene.add(
    buildLighting(lowPower ? 1024 : 2048),
    buildPitch(renderer),
    bowl,
    ...crowd.meshes,
    buildShells(),
    buildLightBeams(),
    tunnel.group,
    signage.group,
    buildAtmosphere(),
    flares.group,
    players.group,
    coach.group,
  );

  const post = createPostProcessing(renderer, scene, camera, {
    samples: lowPower ? 0 : 4,
  });

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height, false);
    post.setSize(width, height, pixelRatio);
    camera.aspect = width / height;
    camera.fov = width < 760 ? 62 : 50;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  const images = copy.players.map((player) => {
    if (!player.image) return undefined;
    const image = new Image();
    image.decoding = 'async';
    image.src = player.image;
    return image;
  });
  const lineupLines = [...copy.players]
    .sort((a, b) => Number(a.number) - Number(b.number))
    .map((player) => `${player.number}  ${player.title}`);
  const isReady = (image: HTMLImageElement | undefined) =>
    image?.complete === true && image.naturalWidth > 0;

  let shownFocus = '';
  const showPlayer = (index: number, key: string) => {
    const player = copy.players[index];
    if (!player) return;
    const { number, title, detail, board } = player;
    const image = images[index];
    const paint = () =>
      signage.showOnScreens({
        kind: 'player',
        number,
        title,
        detail,
        image: isReady(image) ? image : undefined,
      });
    paint();
    if (image && !isReady(image)) {
      image.addEventListener(
        'load',
        () => {
          if (shownFocus === key) paint();
        },
        { once: true },
      );
    }
    signage.showOnBoards(board, true);
    players.highlight(index);
  };

  const setFocus = (focus: StadiumFocus) => {
    const key = focus.kind === 'player' ? `player-${focus.index}` : focus.kind;
    if (key === shownFocus) return;
    shownFocus = key;

    if (focus.kind === 'player') {
      coach.highlight(false);
      showPlayer(focus.index, key);
      return;
    }
    players.highlight(null);
    coach.highlight(focus.kind === 'coach');
    if (focus.kind === 'lineup') {
      signage.showOnScreens({
        kind: 'lineup',
        kicker: copy.lineup.kicker,
        title: copy.lineup.title,
        lines: lineupLines,
      });
      signage.showOnBoards(copy.lineup.board, true);
      return;
    }
    signage.showOnScreens(
      focus.kind === 'welcome'
        ? { kind: 'welcome', ...copy.welcome }
        : { kind: 'name', ...copy.name },
    );
    signage.showOnBoards(copy.board, false);
  };
  setFocus({ kind: 'welcome' });

  const pose = { position: new Vector3(), target: new Vector3() };
  const look = new Vector3();
  const desiredLook = new Vector3();
  let progress = getProgress();
  pathFor().poseAt(progress, pose);
  look.subVectors(pose.target, pose.position).normalize();
  let previous = performance.now();
  let frame = 0;
  let isVisible = true;

  const draw = (now: number) => {
    frame = 0;
    const delta = Math.min(0.05, (now - previous) / 1000);
    previous = now;
    const target = getProgress();
    progress = reducedMotion
      ? target
      : progress + (target - progress) * (1 - 0.0015 ** delta);

    pathFor().poseAt(progress, pose);
    players.place(progress);
    if (!reducedMotion) {
      pose.position.y += Math.sin(now * 0.0007) * 0.06;
      pose.target.x += Math.sin(now * 0.0004) * 0.2;
    }
    desiredLook.subVectors(pose.target, pose.position).normalize();
    if (reducedMotion) look.copy(desiredLook);
    else turnTowards(look, desiredLook, MAX_TURN_SPEED * delta);
    camera.position.copy(pose.position);
    camera.lookAt(pose.target.addVectors(pose.position, look));

    crowd.setTime(now / 1000);
    crowd.setEnergy(
      reducedMotion ? 0 : 0.06 + smoothstep(0.2, 0.32, progress) * 0.22,
    );
    if (!reducedMotion) {
      signage.tick(delta);
      flares.tick(now / 1000);
      players.tick(now / 1000);
      coach.tick(now / 1000);
      tunnel.tick(now / 1000);
    }
    post.setBloom(0.4 + smoothstep(0.1, 0.3, progress) * 0.2);
    post.render(now / 1000);
    if (isVisible) frame = requestAnimationFrame(draw);
  };

  const visibility = new IntersectionObserver(([entry]) => {
    isVisible = entry?.isIntersecting ?? true;
    if (isVisible && frame === 0) {
      previous = performance.now();
      frame = requestAnimationFrame(draw);
    }
  });
  visibility.observe(canvas);
  frame = requestAnimationFrame(draw);

  return {
    setFocus,
    dispose: () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      post.dispose();
      scene.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        object.geometry.dispose();
        const materials: Material[] = Array.isArray(object.material)
          ? object.material
          : [object.material];
        for (const material of materials) {
          for (const value of Object.values(material)) {
            if (value && typeof value === 'object' && 'isTexture' in value)
              (value as Texture).dispose();
          }
          material.dispose();
        }
      });
      renderer.dispose();
    },
  };
};
