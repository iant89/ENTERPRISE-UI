import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import styles from './Text.module.css';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. @default 'span' */
  as?: 'span' | 'p' | 'div' | 'strong' | 'em' | 'small';
  /** @default 'md' */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** @default 'default' */
  tone?: 'default' | 'secondary' | 'error' | 'warning' | 'success' | 'information';
  /** Clamp to this many lines with an ellipsis. Content remains in the DOM for assistive technology. */
  maxLines?: number;
  /** Render empty text as this indicator (for example an em dash). */
  emptyIndicator?: string;
}

/** Body text with token-based size, tone and optional line clamping. */
export const Text = forwardRef<HTMLElement, TextProps>(function Text({ as: Tag = 'span', size = 'md', tone = 'default', maxLines, emptyIndicator, className, style, children, ...rest }, ref) {
  const clamp: CSSProperties | undefined = maxLines && maxLines > 0 ? { WebkitLineClamp: maxLines, ...style } : style;
  const empty = children == null || children === '' || children === false;
  return (
    <Tag ref={ref as never} className={cx(styles.text, styles[size], tone !== 'default' && styles[tone], maxLines && maxLines > 0 && styles.clamp, className)} style={clamp} {...rest}>
      {empty && emptyIndicator ? emptyIndicator : children}
    </Tag>
  );
});
