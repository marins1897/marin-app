import { cx } from '../lib/cx';
import styles from './stat-tiles.module.scss';

export interface StatTile {
  value: string;
  label: string;
}

export interface StatTilesProps {
  items: readonly StatTile[];
  className?: string;
}

/** Big numbers on skewed tiles, as a description list (value + what it counts). */
export const StatTiles = ({ items, className }: StatTilesProps) => (
  <dl
    className={cx(styles.tiles, className)}
    style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
  >
    {items.map(({ value, label }) => (
      <div key={label} className={styles.tile}>
        <dt className={styles.label}>{label}</dt>
        <dd className={styles.value}>{value}</dd>
      </div>
    ))}
  </dl>
);
