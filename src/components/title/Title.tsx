import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import styles from './Title.module.css';

export type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Semantic heading level. @default 2 */
  level?: TitleLevel;
  /** Visual size, independent of the level. Defaults to the level's size. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Truncate to one line with an ellipsis. @default false */
  truncate?: boolean;
}

const defaultSize = { 1: '2xl', 2: 'xl', 3: 'lg', 4: 'md', 5: 'sm', 6: 'xs' } as const;

/** A semantic heading whose visual size can differ from its document level. */
export const Title = forwardRef<HTMLHeadingElement, TitleProps>(function Title({ level = 2, size, truncate = false, className, ...rest }, ref) {
  const Tag = `h${level}` as const;
  return <Tag ref={ref} className={cx(styles.title, styles[`size-${size ?? defaultSize[level]}`], truncate && styles.truncate, className)} {...rest} />;
});
