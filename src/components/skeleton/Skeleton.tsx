import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import styles from './Skeleton.module.css';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /** @default 'text' */
  /** Shape of the placeholder. */
  variant?: 'text' | 'rect' | 'circle';
  /** Width of the placeholder. */
  width?: CSSProperties['width'];
  /** Height of the placeholder. */
  height?: CSSProperties['height'];
  /** Number of text lines (the last is shorter). @default 1 */
  lines?: number;
}

/**
 * Placeholder shown while content loads. Decorative: announce loading
 * separately (e.g. `aria-busy` on the region).
 */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { variant = 'text', width, height, lines = 1, className, style, ...rest },
  ref,
) {
  if (variant === 'text' && lines > 1) {
    return (
      <span ref={ref} className={cx(styles.lines, className)} aria-hidden="true" style={style} {...rest}>
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className={cx(styles.skeleton, styles.text)} style={{ width: i === lines - 1 ? '60%' : width ?? '100%' }} />
        ))}
      </span>
    );
  }
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cx(styles.skeleton, variant === 'text' && styles.text, variant === 'circle' && styles.circle, className)}
      style={{ width: width ?? (variant === 'text' ? '100%' : undefined), height, ...style }}
      {...rest}
    />
  );
});
