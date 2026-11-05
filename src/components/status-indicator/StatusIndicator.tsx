import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import styles from './StatusIndicator.module.css';
import messageErrorSvg from '../../assets/icons/message-error.svg?raw';
import messageInformationSvg from '../../assets/icons/message-information.svg?raw';
import messageSuccessSvg from '../../assets/icons/message-success.svg?raw';
import sysMinusSvg from '../../assets/icons/sys-minus.svg?raw';
import warning2Svg from '../../assets/icons/warning2.svg?raw';
import { svgIcon } from '../../icons/svgIcon';
import { renderIconSource, type IconSource } from '../../icons/IconSource';

const ICON_SVGS: Record<string, string> = { 'message-error': messageErrorSvg, 'message-information': messageInformationSvg, 'message-success': messageSuccessSvg, 'sys-minus': sysMinusSvg, 'warning2': warning2Svg };

export interface StatusIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status text. Always provide text — color alone must not convey meaning. */
  children: ReactNode;
  /** @default 'neutral' */
  /** Semantic tone that sets the color and icon. The text must still convey the status. */
  tone?: Tone;
  /**
   * `icon` shows a semantic icon, `dot` a colored dot, `none` text only.
   * @default 'icon'
   */
  indicator?: 'icon' | 'dot' | 'none';
  /** Custom icon (overrides the semantic default). */
  icon?: IconSource;
  /** Filled, high-emphasis variant. @default false */
  inverted?: boolean;
  /** @default 'md' */
  /** Size of the status indicator. */
  size?: 'sm' | 'md';
}

const ICONS: Record<Tone, string> = {
  neutral: 'sys-minus',
  information: 'message-information',
  success: 'message-success',
  warning: 'warning2',
  error: 'message-error',
};

/** Shows the status of an object (e.g. "Approved", "Overdue") with color, icon and text. */
export const StatusIndicator = forwardRef<HTMLSpanElement, StatusIndicatorProps>(function StatusIndicator(
  { children, tone = 'neutral', indicator = 'icon', icon, inverted = false, size = 'md', className, ...rest },
  ref,
) {
  const Icon = ICONS[tone];
  return (
    <span ref={ref} className={cx(styles.status, styles[tone], inverted && styles.inverted, size === 'sm' && styles.small, className)} {...rest}>
      {indicator === 'icon' && <span className={styles.icon} aria-hidden="true">{icon != null ? renderIconSource(icon) : svgIcon(ICON_SVGS[Icon], Icon)}</span>}
      {indicator === 'dot' && <span className={styles.dotMark} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
});
