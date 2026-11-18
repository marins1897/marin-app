import { cx } from '../lib/cx';
import styles from './skip-link.module.scss';
import type { ComponentPropsWithoutRef } from 'react';

export interface SkipLinkProps extends ComponentPropsWithoutRef<'a'> {
  /** Target fragment, e.g. `#main`. */
  href: string;
}

/** First focusable element on the page; visible only while focused. */
export const SkipLink = ({ className, children, ...rest }: SkipLinkProps) => (
  <a className={cx(styles.skipLink, className)} {...rest}>
    {children}
  </a>
);
