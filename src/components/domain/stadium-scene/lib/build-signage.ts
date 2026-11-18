import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  type WebGLRenderer,
} from 'three';
import { PITCH_LENGTH, PITCH_WIDTH } from './build-pitch';
import {
  createPaintedTexture,
  paintLedTape,
  paintScreen,
  SCENE_COLORS,
  type ScreenContent,
} from './textures';

export interface Signage {
  group: Group;
  showOnBoards(text: string, highlight: boolean): void;
  showOnScreens(content: ScreenContent): void;
  /** Scrolls the LED boards; call every frame with elapsed seconds. */
  tick(delta: number): void;
}

const BOARD_COLORS = {
  normal: { text: SCENE_COLORS.white, background: SCENE_COLORS.card },
  highlight: { text: SCENE_COLORS.volt, background: SCENE_COLORS.card },
};

/** Centre of the big screens behind the open ends, at ±x. */
export const BIG_SCREEN = { x: 118, y: 22 } as const;

/** Pitch-side LED boards and the two big screens behind the open ends. */
export const buildSignage = (renderer: WebGLRenderer): Signage => {
  const group = new Group();
  const tape = createPaintedTexture(renderer, 2048, 96, { repeat: true });
  const boardMaterial = new MeshBasicMaterial({
    map: tape.texture,
    toneMapped: false,
  });
  const housing = new MeshStandardMaterial({
    color: 0x1a2133,
    roughness: 0.95,
  });

  const board = (length: number, x: number, z: number, facing: number) => {
    const face = new Mesh(new PlaneGeometry(length, 0.95), boardMaterial);
    face.position.set(x, 0.5, z);
    face.rotation.y = facing;
    const back = new Mesh(new BoxGeometry(length, 1, 0.15), housing);
    back.position.set(
      x - Math.sin(facing) * 0.1,
      0.5,
      z - Math.cos(facing) * 0.1,
    );
    back.rotation.y = facing;
    group.add(face, back);
  };
  const sideZ = PITCH_WIDTH / 2 + 4;
  const endX = PITCH_LENGTH / 2 + 5;
  board(50, -28, sideZ, Math.PI);
  board(50, 28, sideZ, Math.PI);
  board(110, 0, -sideZ, 0);
  for (const z of [-20, 20]) {
    board(36, endX, z, -Math.PI / 2);
    board(36, -endX, z, Math.PI / 2);
  }

  const screens = [-1, 1].map((side) => {
    const painted = createPaintedTexture(renderer, 1280, 560);
    const screen = new Group();
    const frame = new Mesh(
      new BoxGeometry(23, 10.4, 0.8),
      new MeshStandardMaterial({
        color: 0x05080f,
        metalness: 0.5,
        roughness: 0.5,
      }),
    );
    const face = new Mesh(
      new PlaneGeometry(22, 9.6),
      new MeshBasicMaterial({ map: painted.texture, toneMapped: false }),
    );
    face.position.z = 0.41;
    const mast = new Mesh(new BoxGeometry(0.8, 20, 0.8), housing);
    mast.position.y = -14;
    screen.add(frame, face, mast);
    screen.position.set(side * BIG_SCREEN.x, BIG_SCREEN.y, 0);
    screen.rotation.y = (-side * Math.PI) / 2;
    screen.scale.setScalar(1.3);
    group.add(screen);
    return painted;
  });

  return {
    group,
    showOnBoards: (text, highlight) =>
      paintLedTape(
        tape,
        text,
        highlight ? BOARD_COLORS.highlight : BOARD_COLORS.normal,
      ),
    showOnScreens: (content) => {
      for (const screen of screens) paintScreen(screen, content);
    },
    tick: (delta) => {
      tape.texture.offset.x = (tape.texture.offset.x + delta * 0.04) % 1;
    },
  };
};
