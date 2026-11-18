import { cx } from '../lib/cx';
import styles from './link-button.module.scss';
import type { ComponentPropsWithRef } from 'react';

export interface LinkButtonProps extends ComponentPropsWithRef<'a'> {
  variant?: 'brand' | 'outline';
  size?: 'sm' | 'md';
}

/**
 * An anchor styled as a call to action: a skewed block with a hard offset
 * shadow (brand) or a white outline. A plain `<a>` on purpose: react-aria's
 * Link would add ~11 kB to the initial bundle for client-side routing the
 * prerendered pages do not need.
 */
export const LinkButton = ({
  variant = 'brand',
  size = 'md',
  className,
  children,
  ...rest
}: LinkButtonProps) => (
  <a
    className={cx(styles.linkButton, styles[variant], styles[size], className)}
    {...rest}
  >
    <span className={styles.label}>{children}</span>
  </a>
);
