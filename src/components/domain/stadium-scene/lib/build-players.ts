import {
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RingGeometry,
  type WebGLRenderer,
} from 'three';
import { buildFigure, looksFor } from './build-figure';
import { FORMATION_433, type Slot } from './formation';
import { walkPoseAt } from './walk-out';
import { DISPLAY_FONT, SCENE_COLORS, createPaintedTexture } from './textures';

export interface SquadMember {
  number: string;
  slot: Slot;
  isCaptain: boolean;
}

export interface Players {
  group: Group;
  /** Lights the ring under one player; `null` lights none. */
  highlight(index: number | null): void;
  /** Walks the team out of the tunnel to the 4-3-3 with scroll progress; call every frame. */
  place(progress: number): void;
  /** Walking bob and idle sway; call every frame with elapsed seconds (skip for reduced motion). */
  tick(seconds: number): void;
}

const KIT = {
  outfield: SCENE_COLORS.volt,
  keeper: SCENE_COLORS.electric,
  shorts: '#0b1a44',
  boots: '#101010',
};

/** Shirt number painted on a small transparent canvas, for chest and back. */
const numberMaterial = (
  renderer: WebGLRenderer,
  number: string,
  ink: string,
) => {
  const painted = createPaintedTexture(renderer, 128, 128);
  const { context: c } = painted;
  c.clearRect(0, 0, 128, 128);
  c.font = `92px ${DISPLAY_FONT}`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = ink;
  c.fillText(number, 64, 70);
  painted.texture.needsUpdate = true;
  return new MeshBasicMaterial({
    map: painted.texture,
    transparent: true,
    depthWrite: false,
  });
};

/** A footballer in the Volt kit, facing +x, with numbers front and back. */
const buildPlayer = (
  renderer: WebGLRenderer,
  { number, slot, isCaptain }: SquadMember,
  seed: number,
): Group => {
  const isKeeper = slot === 'GK';
  const shirt = isKeeper ? KIT.keeper : KIT.outfield;
  const { group: figure, leftArm } = buildFigure({
    shirt,
    forearms: isKeeper ? shirt : undefined,
    shorts: KIT.shorts,
    socks: shirt,
    boots: KIT.boots,
    ...looksFor(seed),
  });

  if (isCaptain) {
    const band = new Mesh(
      new CylinderGeometry(0.064, 0.064, 0.06, 12),
      new MeshStandardMaterial({ color: '#ffffff' }),
    );
    band.position.y = -0.12;
    leftArm.add(band);
  }

  const ink = isKeeper ? '#ffffff' : '#0b0d02';
  const front = new Mesh(
    new PlaneGeometry(0.2, 0.2),
    numberMaterial(renderer, number, ink),
  );
  front.position.set(0.142, 1.4, 0);
  front.rotation.y = Math.PI / 2;
  const back = new Mesh(
    new PlaneGeometry(0.32, 0.32),
    numberMaterial(renderer, number, ink),
  );
  back.position.set(-0.142, 1.34, 0);
  back.rotation.y = -Math.PI / 2;
  figure.add(front, back);
  return figure;
};

/** The starting XI: queued in the tunnel, walking out, then in a 4-3-3 with a spotlight ring. */
export const buildPlayers = (
  renderer: WebGLRenderer,
  squad: readonly SquadMember[],
): Players => {
  const group = new Group();
  const ringMaterial = new MeshBasicMaterial({
    color: SCENE_COLORS.volt,
    toneMapped: false,
    transparent: true,
    opacity: 0.9,
  });
  // The captain leads the team out; the rest follow in squad order.
  const captain = Math.max(
    0,
    squad.findIndex((member) => member.isCaptain),
  );
  const queue = [captain, ...squad.keys()].filter(
    (index, position, all) => all.indexOf(index) === position,
  );
  const figures = squad.map((member, index) => {
    const figure = buildPlayer(renderer, member, index);
    const target = FORMATION_433[member.slot];
    const ring = new Mesh(new RingGeometry(0.75, 0.95, 48), ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(target.x, 0.03, target.z);
    ring.visible = false;
    group.add(figure, ring);
    return {
      figure,
      ring,
      target,
      place: queue.indexOf(index),
      heading: 0,
      isMoving: false,
      phase: Math.random() * Math.PI * 2,
    };
  });

  return {
    group,
    highlight: (index) => {
      figures.forEach(({ ring }, i) => {
        ring.visible = i === index;
      });
    },
    place: (progress) => {
      for (const player of figures) {
        const pose = walkPoseAt(player.place, player.target, progress);
        player.figure.position.set(pose.x, 0, pose.z);
        player.figure.rotation.y = pose.heading;
        player.heading = pose.heading;
        player.isMoving = pose.isMoving;
      }
    },
    tick: (seconds) => {
      for (const { figure, heading, isMoving, phase } of figures) {
        if (isMoving) {
          figure.position.y = Math.abs(Math.sin(seconds * 9 + phase)) * 0.05;
        } else {
          figure.rotation.y = heading + Math.sin(seconds * 0.6 + phase) * 0.08;
          figure.position.y =
            Math.max(0, Math.sin(seconds * 2.2 + phase)) * 0.025;
        }
      }
    },
  };
};
