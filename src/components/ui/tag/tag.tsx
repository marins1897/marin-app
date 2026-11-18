import { cx } from '../lib/cx';
import styles from './tag.module.scss';
import type { ComponentPropsWithRef } from 'react';

export interface TagProps extends ComponentPropsWithRef<'span'> {
  tone?: 'brand' | 'accent';
}

/** Skewed label block for kickers, numbers and badges. */
export const Tag = ({
  tone = 'accent',
  className,
  children,
  ...rest
}: TagProps) => (
  <span className={cx(styles.tag, styles[tone], className)} {...rest}>
    <span className={styles.text}>{children}</span>
  </span>
);
