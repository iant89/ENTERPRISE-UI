import { forwardRef, useId, type HTMLAttributes } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { cx } from '../../utilities/cx';
import styles from './ExpandableText.module.css';

export interface ExpandableTextProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  text: string;
  /** Maximum Unicode code points shown while collapsed. @default 100 */
  maxCharacters?: number;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Localized expand control. @default 'Show more' */
  moreLabel?: string;
  /** Localized collapse control. @default 'Show less' */
  lessLabel?: string;
}
/** Text with an in-place disclosure when its configured length is exceeded. */
export const ExpandableText = forwardRef<HTMLDivElement, ExpandableTextProps>(function ExpandableText({ text, maxCharacters = 100, expanded, defaultExpanded = false, onExpandedChange, moreLabel = 'Show more', lessLabel = 'Show less', className, ...rest }, ref) {
  const [isExpanded, setExpanded] = useControllableState(expanded, defaultExpanded, onExpandedChange);
  const id = useId();
  const chars = Array.from(text);
  const limit = Number.isFinite(maxCharacters) ? Math.max(0, Math.floor(maxCharacters)) : 100;
  const truncated = chars.length > limit;
  return <div {...rest} ref={ref} className={cx(styles.root, className)}>
    <span id={id}>{truncated && !isExpanded ? `${chars.slice(0, limit).join('')}…` : text}</span>
    {truncated && <button type="button" className={styles.toggle} aria-expanded={isExpanded} aria-controls={id} onClick={() => setExpanded(!isExpanded)}>{isExpanded ? lessLabel : moreLabel}</button>}
  </div>;
});
