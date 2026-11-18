import { cx } from '../lib/cx';
import styles from './panel.module.scss';
import type { ComponentPropsWithRef, ElementType } from 'react';

export interface PanelProps extends ComponentPropsWithRef<'div'> {
  /** Rendered element; defaults to `div`. */
  as?: 'div' | 'section' | 'article' | 'aside';
  /** Coloured edge: brand along the top, accent down the left. */
  edge?: 'top' | 'left';
  /** Diagonal stripe texture behind the content. */
  isTextured?: boolean;
}

/** Solid dark card with a coloured edge, for broadcast-style overlays. */
export const Panel = ({
  as = 'div',
  edge = 'top',
  isTextured = false,
  className,
  children,
  ...rest
}: PanelProps) => {
  const Tag: ElementType = as;
  return (
    <Tag
      className={cx(
        styles.panel,
        styles[edge],
        isTextured && styles.textured,
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
};
