import {
  AdditiveBlending,
  CanvasTexture,
  Group,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
} from 'three';
import { racePoint } from './race-track';
import { shellLampPoints } from './build-shells';
import { rowHeight, rowRadius } from './stand-layout';

/** Soft round glow with a thin horizontal streak, like a broadcast lens flare. */
const flareTexture = (): CanvasTexture => {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const c = canvas.getContext('2d');
  if (!c) throw new Error('2D canvas is not available');
  const glow = c.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  glow.addColorStop(0, 'rgba(255,255,255,1)');
  glow.addColorStop(0.18, 'rgba(255,245,220,.55)');
  glow.addColorStop(1, 'rgba(255,240,210,0)');
  c.fillStyle = glow;
  c.fillRect(0, 0, size, size);
  const streak = c.createLinearGradient(0, 0, size, 0);
  streak.addColorStop(0, 'rgba(255,255,255,0)');
  streak.addColorStop(0.5, 'rgba(255,255,255,.7)');
  streak.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = streak;
  c.fillRect(0, size / 2 - 1.5, size, 3);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
};

/** Race-track samples at the apex of each open end, where the ultras stand. */
const END_APEXES = [150, 360] as const;

export interface Flares {
  group: Group;
  /** Flickers the pyro; call every frame with elapsed seconds. */
  tick(seconds: number): void;
}

/** Lens flares along the shells' floodlight bands and red pyro in the end stands. */
export const buildFlares = (random: () => number = Math.random): Flares => {
  const group = new Group();
  const texture = flareTexture();

  const lamp = new SpriteMaterial({
    map: texture,
    color: 0xfff1d2,
    blending: AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.5,
    fog: false,
    toneMapped: false,
  });
  for (const side of [1, -1] as const) {
    for (const point of shellLampPoints(side, 22)) {
      const sprite = new Sprite(lamp);
      sprite.position.copy(point);
      sprite.scale.set(4.5, 4.5, 1);
      group.add(sprite);
    }
  }

  const pyro = END_APEXES.flatMap((apex) =>
    [-14, -6, 4, 12].map((offset) => {
      const material = new SpriteMaterial({
        map: texture,
        color: 0xff3a22,
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
        toneMapped: false,
      });
      const row = 6 + Math.floor(random() * 10);
      const point = racePoint(apex + offset, rowRadius(row));
      const sprite = new Sprite(material);
      sprite.position.set(point.x, rowHeight(row) + 1.6, point.z);
      sprite.scale.set(4.5, 4.5, 1);
      group.add(sprite);
      return { sprite, material, phase: random() * 10 };
    }),
  );

  return {
    group,
    tick: (seconds) => {
      for (const { sprite, material, phase } of pyro) {
        const flicker =
          0.75 +
          0.25 *
            Math.sin(seconds * 23 + phase) *
            Math.sin(seconds * 7.3 + phase * 2);
        material.opacity = flicker;
        sprite.scale.setScalar(4.2 + flicker * 0.8);
      }
    },
  };
};
