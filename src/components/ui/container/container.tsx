import { cx } from '../lib/cx';
import styles from './container.module.scss';
import type { ComponentPropsWithRef, ElementType } from 'react';

export interface ContainerProps extends ComponentPropsWithRef<'div'> {
  /** Rendered element; defaults to `div`. */
  as?: 'div' | 'header' | 'footer' | 'nav' | 'section' | 'article';
  /** `narrow` caps width for long-form text. */
  size?: 'default' | 'narrow';
}

/** Centred, gutter-padded content column (`--container-max`). */
export const Container = ({
  as = 'div',
  size = 'default',
  className,
  children,
  ...rest
}: ContainerProps) => {
  const Tag: ElementType = as;
  return (
    <Tag
      className={cx(
        styles.container,
        size === 'narrow' && styles.narrow,
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
};
