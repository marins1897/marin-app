import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { cx } from '../lib/cx';
import styles from './button.module.scss';

export interface ButtonProps extends AriaButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Token-styled button on react-aria-components' Button: consistent press
 * handling across mouse/touch/keyboard, `data-pressed` / `data-focus-visible`
 * state attributes, and `isDisabled`/`isPending` semantics.
 *
 * Use `onPress` (not `onClick`). Styles hook into RAC's data attributes.
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: ButtonProps) => (
  <AriaButton
    className={cx(styles.button, styles[variant], styles[size], className)}
    {...rest}
  />
);
