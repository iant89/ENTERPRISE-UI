import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { useControllableState } from '../../hooks/useControllableState';
import { cx } from '../../utilities/cx';
import styles from './Panel.module.css';
export interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Text heading for the panel. */
  title: string;
  children: ReactNode;
  /** Non-collapsible panel. @default false */
  fixed?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** @default 2 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}
/** A collapsible section with a native disclosure button. */
export const Panel = forwardRef<HTMLElement, PanelProps>(function Panel({ title, children, fixed = false, expanded, defaultExpanded = true, onExpandedChange, headingLevel = 2, className, ...rest }, ref) {
  const [open, setOpen] = useControllableState(expanded, defaultExpanded, onExpandedChange);
  const id = useId(); const headingId = `${id}-heading`; const Heading = `h${headingLevel}` as const;
  const visible = fixed || open;
  return <section {...rest} ref={ref} aria-labelledby={headingId} className={cx(styles.panel, className)}>
    <Heading id={headingId} className={styles.heading}>{fixed ? title : <button className={styles.toggle} type="button" aria-expanded={visible} aria-controls={id} onClick={() => setOpen(!open)}><ChevronRight className={cx(styles.chevron, visible && styles.expanded)} aria-hidden="true" />{title}</button>}</Heading>
    <div id={id} hidden={!visible} className={styles.content}>{children}</div>
  </section>;
});
