import {
  CanvasTexture,
  LinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
  type WebGLRenderer,
} from 'three';

export interface PaintedTexture {
  texture: CanvasTexture;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
}

export const DISPLAY_FONT = "'Russo One', 'Arial Black', sans-serif";
export const LABEL_FONT = "'Saira Condensed', 'Arial Narrow', sans-serif";

/** The site's Volt colours, as canvas colour strings. */
export const SCENE_COLORS = {
  volt: '#d4ff1f',
  electric: '#3463f5',
  card: '#0a0c12',
  white: '#ffffff',
} as const;

const display = (size: number) => `${size}px ${DISPLAY_FONT}`;
const label = (size: number) => `600 ${size}px ${LABEL_FONT}`;

/** Sets `font` at `size`, shrinking it until `text` fits in `maxWidth`. */
const fitText = (
  c: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  size: number,
  font: (size: number) => string = display,
) => {
  let current = size;
  c.font = font(current);
  while (current > 12 && c.measureText(text).width > maxWidth) {
    current -= 4;
    c.font = font(current);
  }
};

/** A texture backed by a 2D canvas the caller paints (and may repaint). */
export const createPaintedTexture = (
  renderer: WebGLRenderer,
  width: number,
  height: number,
  { repeat = false }: { repeat?: boolean } = {},
): PaintedTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas is not available');

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  if (repeat) {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.minFilter = LinearFilter;
  }
  return { texture, context, width, height };
};

const scanlines = ({ context, width, height }: PaintedTexture) => {
  context.fillStyle = 'rgba(0,0,0,.24)';
  for (let y = 0; y < height; y += 4) context.fillRect(0, y, width, 1);
};

export interface TapeColors {
  text: string;
  background: string;
}

/** Repeating LED-board text: the texture scrolls by animating `offset.x`. */
export const paintLedTape = (
  target: PaintedTexture,
  text: string,
  { text: ink, background }: TapeColors,
): void => {
  const { context, width, height } = target;
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
  context.font = display(height * 0.62);
  context.textBaseline = 'middle';
  context.fillStyle = ink;
  const unit = `${text}   ·   `;
  const unitWidth = context.measureText(unit).width;
  for (let x = 0; x < width + unitWidth; x += unitWidth) {
    context.fillText(unit, x, height * 0.54);
  }
  scanlines(target);
  target.texture.needsUpdate = true;
};

export type ScreenContent =
  | { kind: 'welcome'; kicker: string; title: string }
  | { kind: 'name'; kicker: string; firstName: string; lastName: string }
  | { kind: 'lineup'; kicker: string; title: string; lines: readonly string[] }
  | {
      kind: 'player';
      number: string;
      title: string;
      detail: string;
      /** Screenshot of the live site, drawn behind the text when loaded. */
      image?: CanvasImageSource & { width: number; height: number };
    };

/** One big-screen frame: dark card, stripes, a skewed lime wedge, Volt type. */
export const paintScreen = (
  target: PaintedTexture,
  content: ScreenContent,
): void => {
  const { context: c, width: w, height: h } = target;
  c.fillStyle = SCENE_COLORS.card;
  c.fillRect(0, 0, w, h);
  c.strokeStyle = 'rgba(212,255,31,.06)';
  c.lineWidth = 10;
  for (let x = -h; x < w; x += 32) {
    c.beginPath();
    c.moveTo(x, h);
    c.lineTo(x + h, 0);
    c.stroke();
  }

  c.textBaseline = 'middle';
  c.textAlign = 'left';
  const left = w * 0.08;
  const room = w * 0.86;

  if (content.kind === 'player' && content.image) {
    const { image } = content;
    const scale = Math.max(w / image.width, h / image.height);
    c.drawImage(image, 0, 0, image.width * scale, image.height * scale);
    const shade = c.createLinearGradient(0, 0, w, 0);
    shade.addColorStop(0, 'rgba(10,12,18,.96)');
    shade.addColorStop(0.5, 'rgba(10,12,18,.78)');
    shade.addColorStop(1, 'rgba(10,12,18,0)');
    c.fillStyle = shade;
    c.fillRect(0, 0, w, h);
  }

  // Skewed lime wedge on the left edge and an electric-blue base line.
  c.fillStyle = SCENE_COLORS.volt;
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(w * 0.045, 0);
  c.lineTo(w * 0.02, h);
  c.lineTo(0, h);
  c.fill();
  c.fillStyle = SCENE_COLORS.electric;
  c.fillRect(0, h - 14, w, 14);

  if (content.kind === 'welcome') {
    c.fillStyle = SCENE_COLORS.volt;
    c.font = label(54);
    c.fillText(content.kicker.toUpperCase(), left, h * 0.28);
    c.fillStyle = SCENE_COLORS.white;
    fitText(c, content.title.toUpperCase(), room, 190);
    c.fillText(content.title.toUpperCase(), left, h * 0.6);
  } else if (content.kind === 'name') {
    c.fillStyle = SCENE_COLORS.volt;
    c.font = label(50);
    c.fillText(content.kicker.toUpperCase(), left, h * 0.2);
    c.fillStyle = SCENE_COLORS.white;
    fitText(c, content.firstName.toUpperCase(), room, 140);
    c.fillText(content.firstName.toUpperCase(), left, h * 0.46);
    c.fillStyle = SCENE_COLORS.volt;
    fitText(c, content.lastName.toUpperCase(), room, 140);
    c.fillText(content.lastName.toUpperCase(), left, h * 0.76);
  } else if (content.kind === 'lineup') {
    c.fillStyle = SCENE_COLORS.volt;
    c.font = label(44);
    c.fillText(content.kicker.toUpperCase(), left, h * 0.14);
    c.fillStyle = SCENE_COLORS.white;
    fitText(c, content.title.toUpperCase(), room, 64);
    c.fillText(content.title.toUpperCase(), left, h * 0.28);
    const half = Math.ceil(content.lines.length / 2);
    content.lines.forEach((line, i) => {
      const column = i < half ? 0 : 1;
      const row = column === 0 ? i : i - half;
      c.fillStyle = row % 2 ? 'rgba(255,255,255,.85)' : SCENE_COLORS.white;
      fitText(c, line.toUpperCase(), w * 0.4, 34, label);
      c.fillText(
        line.toUpperCase(),
        left + column * w * 0.45,
        h * 0.42 + row * h * 0.095,
      );
    });
  } else {
    const textRoom = content.image ? w * 0.6 : room;
    c.fillStyle = SCENE_COLORS.volt;
    c.font = display(130);
    c.fillText(content.number, left, h * 0.27);
    c.fillStyle = SCENE_COLORS.white;
    fitText(c, content.title.toUpperCase(), textRoom, 104);
    c.fillText(content.title.toUpperCase(), left, h * 0.58);
    c.fillStyle = 'rgba(255,255,255,.8)';
    fitText(c, content.detail.toUpperCase(), textRoom, 46, label);
    c.fillText(content.detail.toUpperCase(), left, h * 0.8);
  }
  scanlines(target);
  target.texture.needsUpdate = true;
};
