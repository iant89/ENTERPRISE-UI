import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import { space, type Space } from '../space';
import styles from './Stack.module.css';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** @default 'vertical' */
  /** Direction in which children are laid out. */
  direction?: 'vertical' | 'horizontal';
  /** Gap on the spacing scale. @default 3 */
  gap?: Space;
  /** Cross-axis alignment of the children. */
  align?: CSSProperties['alignItems'];
  /** Main-axis distribution of the children. */
  justify?: CSSProperties['justifyContent'];
  /** @default false */
  /** Whether children wrap onto new lines when they do not fit. */
  wrap?: boolean;
  /** Draw a divider between children. @default false */
  dividers?: boolean;
  /** @default 'div' */
  /** HTML element rendered as the root. */
  as?: ElementType;
}

/** Arranges children in a single column or row with consistent spacing. */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  { direction = 'vertical', gap = 3, align, justify, wrap = false, dividers = false, as: As = 'div', className, style, ...rest },
  ref,
) {
  const g = space(gap);
  return (
    <As
      ref={ref}
      className={cx(styles.stack, styles[direction], wrap && styles.wrap, dividers && styles.dividers, className)}
      style={{ gap: g, alignItems: align, justifyContent: justify, '--_gap': g, ...style } as CSSProperties}
      {...rest}
    />
  );
});
