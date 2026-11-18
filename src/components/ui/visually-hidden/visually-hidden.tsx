import { cx } from '../lib/cx';
import styles from './visually-hidden.module.scss';
import type { ComponentPropsWithoutRef, ElementType } from 'react';

export interface VisuallyHiddenProps extends ComponentPropsWithoutRef<'span'> {
  as?: 'span' | 'div' | 'p';
}

/** Text for assistive technology only; stays in the accessibility tree. */
export const VisuallyHidden = ({
  as = 'span',
  className,
  ...rest
}: VisuallyHiddenProps) => {
  const Tag: ElementType = as;
  return <Tag className={cx(styles.visuallyHidden, className)} {...rest} />;
};
