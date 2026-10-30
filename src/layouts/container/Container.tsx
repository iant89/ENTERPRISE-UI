import { forwardRef, type ElementType, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import styles from './Container.module.css';

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** Maximum width. @default 'xl' */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Remove the responsive horizontal padding. @default false */
  flush?: boolean;
  /** @default 'div' */
  /** HTML element rendered as the root. */
  as?: ElementType;
}

/** Centres content with a maximum width and responsive horizontal padding. */
export const Container = forwardRef<HTMLElement, ContainerProps>(function Container({ size = 'xl', flush = false, as: As = 'div', className, ...rest }, ref) {
  return <As ref={ref} className={cx(styles.container, styles[size], flush && styles.flush, className)} {...rest} />;
});
