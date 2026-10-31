import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import styles from './Spinner.module.css';

const SIZES = { sm: 16, md: 24, lg: 40 } as const;

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** @default 'md' */
  size?: keyof typeof SIZES;
  /**
   * Accessible label announced to screen readers.
   * @default 'Loading'
   */
  label?: string;
  /** Show the label next to the spinner. @default false */
  showLabel?: boolean;
  /** Use the current text color instead of the primary color. @default false */
  inheritColor?: boolean;
  /** Render as decoration only (no role/label), e.g. inside a busy button. @default false */
  decorative?: boolean;
}

/** Indeterminate busy indicator. */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', label = 'Loading', showLabel = false, inheritColor = false, decorative = false, className, ...rest },
  ref,
) {
  const px = SIZES[size];
  const stroke = size === 'lg' ? 4 : size === 'md' ? 3 : 2;
  const r = (px - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span
      ref={ref}
      role={decorative ? undefined : 'status'}
      aria-hidden={decorative || undefined}
      className={cx(styles.root, inheritColor && styles.inherit, className)}
      {...rest}
    >
      <svg className={styles.svg} width={px} height={px} viewBox={`0 0 ${px} ${px}`} fill="none" aria-hidden="true">
        <circle className={styles.track} cx={px / 2} cy={px / 2} r={r} strokeWidth={stroke} />
        <circle
          className={styles.arc}
          cx={px / 2}
          cy={px / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={`${c * 0.3} ${c}`}
        />
      </svg>
      {!decorative &&
        (showLabel ? <span className={styles.label}>{label}</span> : <span className="eui-visually-hidden">{label}</span>)}
    </span>
  );
});
