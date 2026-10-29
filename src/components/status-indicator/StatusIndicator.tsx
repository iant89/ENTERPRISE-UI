import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, MinusCircle, XCircle } from 'lucide-react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import styles from './StatusIndicator.module.css';

export interface StatusIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status text. Always provide text — colour alone must not convey meaning. */
  children: ReactNode;
  /** @default 'neutral' */
  tone?: Tone;
  /**
   * `icon` shows a semantic icon, `dot` a coloured dot, `none` text only.
   * @default 'icon'
   */
  indicator?: 'icon' | 'dot' | 'none';
  /** Custom icon (overrides the semantic default). */
  icon?: ReactNode;
  /** Filled, high-emphasis variant. @default false */
  inverted?: boolean;
  /** @default 'md' */
  size?: 'sm' | 'md';
}

const ICONS: Record<Tone, typeof Info> = {
  neutral: MinusCircle,
  information: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

/** Shows the status of an object (e.g. "Approved", "Overdue") with colour, icon and text. */
export const StatusIndicator = forwardRef<HTMLSpanElement, StatusIndicatorProps>(function StatusIndicator(
  { children, tone = 'neutral', indicator = 'icon', icon, inverted = false, size = 'md', className, ...rest },
  ref,
) {
  const Icon = ICONS[tone];
  return (
    <span ref={ref} className={cx(styles.status, styles[tone], inverted && styles.inverted, size === 'sm' && styles.small, className)} {...rest}>
      {indicator === 'icon' && <span className={styles.icon} aria-hidden="true">{icon ?? <Icon />}</span>}
      {indicator === 'dot' && <span className={styles.dotMark} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
});
