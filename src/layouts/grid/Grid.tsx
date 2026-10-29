import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import { responsiveVars, space, type Responsive, type Space } from '../space';
import styles from './Grid.module.css';

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /**
   * Column count, optionally per breakpoint: `{ base: 1, sm: 2, md: 3, lg: 4 }`
   * (sm ≥ 600px, md ≥ 1024px, lg ≥ 1440px).
   * @default 1
   */
  columns?: Responsive<number>;
  /** Instead of fixed columns, fit as many columns as possible of at least this width. */
  minChildWidth?: CSSProperties['width'];
  /** Gap on the spacing scale. @default 4 */
  gap?: Responsive<Space>;
  /** @default 'div' */
  as?: ElementType;
}

/** Responsive CSS grid layout. */
const GridBase = forwardRef<HTMLElement, GridProps>(function Grid({ columns = 1, minChildWidth, gap = 4, as: As = 'div', className, style, ...rest }, ref) {
  const vars = {
    ...responsiveVars('_cols', columns, (v) => String(v)),
    ...responsiveVars('_gap', gap, space),
    ...(minChildWidth ? { '--_min': typeof minChildWidth === 'number' ? `${minChildWidth}px` : minChildWidth } : {}),
  } as CSSProperties;
  return <As ref={ref} className={cx(styles.grid, minChildWidth && styles.auto, className)} style={{ ...vars, ...style }} {...rest} />;
});

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Columns to span, or `full` for the whole row. @default 1 */
  span?: number | 'full';
}

/** Optional grid child for spanning several columns. */
export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(function GridItem({ span = 1, className, style, ...rest }, ref) {
  return <div ref={ref} className={cx(styles.item, span === 'full' && styles.full, className)} style={{ '--_span': span === 'full' ? undefined : span, ...style } as CSSProperties} {...rest} />;
});

export const Grid = GridBase;
