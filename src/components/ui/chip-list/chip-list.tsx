import { cx } from '../lib/cx';
import styles from './chip-list.module.scss';

export interface ChipListProps {
  items: readonly string[];
  /** Accessible name for the list, e.g. "Stack". */
  label: string;
  className?: string;
}

/** A row of outlined labels, such as a tech stack. */
export const ChipList = ({ items, label, className }: ChipListProps) => (
  <ul aria-label={label} className={cx(styles.list, className)}>
    {items.map((item) => (
      <li key={item} className={styles.chip}>
        {item}
      </li>
    ))}
  </ul>
);
