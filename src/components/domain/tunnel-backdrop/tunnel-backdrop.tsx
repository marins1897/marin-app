import { cx } from '@/utils/class-names';
import styles from './tunnel-backdrop.module.scss';

export interface TunnelBackdropProps {
  /** Lamps switch on one by one, on a loop, while the 3D scene loads. */
  isLoading: boolean;
  className?: string;
}

/** Vanishing point of the drawing, in viewBox units (1600 × 900). */
const MOUTH = { left: 720, right: 880, top: 370, bottom: 470 };

/** How far down the tunnel each ceiling lamp hangs, 0 (here) → 1 (the mouth). */
const LAMP_DEPTHS = [0.06, 0.3, 0.48, 0.61, 0.71, 0.79, 0.85];

/**
 * A flat drawing of the players' tunnel: what the visitor sees while the 3D
 * scene loads (its lamps switch on one by one) and the backdrop when there is
 * no WebGL. Inline SVG, so it is in the prerendered HTML and paints at once.
 */
export const TunnelBackdrop = ({
  isLoading,
  className,
}: TunnelBackdropProps) => (
  <svg
    className={cx(styles.backdrop, className)}
    data-loading={isLoading || undefined}
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <radialGradient id="tunnel-mouth-glow" cx="50%" cy="46%" r="38%">
        <stop offset="0" className={styles.glowCore} />
        <stop offset="1" className={styles.glowEdge} />
      </radialGradient>
    </defs>
    <polygon
      className={styles.ceiling}
      points={`0,0 1600,0 ${MOUTH.right},${MOUTH.top} ${MOUTH.left},${MOUTH.top}`}
    />
    <polygon
      className={styles.wall}
      points={`0,0 ${MOUTH.left},${MOUTH.top} ${MOUTH.left},${MOUTH.bottom} 0,900`}
    />
    <polygon
      className={styles.wall}
      points={`1600,0 ${MOUTH.right},${MOUTH.top} ${MOUTH.right},${MOUTH.bottom} 1600,900`}
    />
    <polygon
      className={styles.floor}
      points={`0,900 ${MOUTH.left},${MOUTH.bottom} ${MOUTH.right},${MOUTH.bottom} 1600,900`}
    />
    <rect
      className={styles.mouth}
      x={MOUTH.left}
      y={MOUTH.top}
      width={MOUTH.right - MOUTH.left}
      height={MOUTH.bottom - MOUTH.top}
    />
    <rect
      className={styles.pitch}
      x={MOUTH.left}
      y={MOUTH.bottom - 34}
      width={MOUTH.right - MOUTH.left}
      height={34}
    />
    <rect
      className={styles.glow}
      width="1600"
      height="900"
      fill="url(#tunnel-mouth-glow)"
    />
    <line
      className={styles.line}
      x1="200"
      y1="900"
      x2="746"
      y2={MOUTH.bottom}
    />
    <line
      className={styles.line}
      x1="1400"
      y1="900"
      x2="854"
      y2={MOUTH.bottom}
    />
    {LAMP_DEPTHS.map((depth, index) => {
      const width = (1600 - 2 * MOUTH.left * depth) * 0.34;
      return (
        <rect
          key={depth}
          className={styles.lamp}
          style={{ animationDelay: `${index * 140}ms` }}
          x={800 - width / 2}
          y={MOUTH.top * depth}
          width={width}
          height={14 * (1 - depth) + 2}
        />
      );
    })}
  </svg>
);
