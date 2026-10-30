import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, Pin, PinOff } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useControllableState } from '../../hooks/useControllableState';
import { IconButton } from '../icon-button';
import styles from './DynamicPage.module.css';

export interface DynamicPageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Page heading (rendered as the page's `h1`). */
  title: ReactNode;
  /** Text shown next to the title when the header is collapsed (snapped). */
  snappedSubtitle?: ReactNode;
  /** Text shown under the title when the header is expanded. */
  subtitle?: ReactNode;
  breadcrumbs?: ReactNode;
  /** Title-bar actions (always visible). */
  actions?: ReactNode;
  /** Collapsible header content (key facts, filters). */
  headerContent?: ReactNode;
  /** Sticky footer, typically finalizing actions. */
  footer?: ReactNode;
  headerExpanded?: boolean;
  /** @default true */
  defaultHeaderExpanded?: boolean;
  onHeaderExpandedChange?: (expanded: boolean) => void;
  /** Keep the header expanded while scrolling. Controlled with `onHeaderPinnedChange`. */
  headerPinned?: boolean;
  /** @default false */
  defaultHeaderPinned?: boolean;
  onHeaderPinnedChange?: (pinned: boolean) => void;
  /** Hide the pin button. @default false */
  hidePinButton?: boolean;
  /** Localized control names. */
  labels?: { expand: string; collapse: string; pin: string; unpin: string };
  children?: ReactNode;
}

/**
 * A page with a title bar, a collapsible (and pinnable) header and a sticky footer.
 * The application decides when to collapse on scroll by controlling `headerExpanded`.
 */
export const DynamicPage = forwardRef<HTMLDivElement, DynamicPageProps>(function DynamicPage(
  {
    title, subtitle, snappedSubtitle, breadcrumbs, actions, headerContent, footer, headerExpanded, defaultHeaderExpanded = true, onHeaderExpandedChange,
    headerPinned, defaultHeaderPinned = false, onHeaderPinnedChange, hidePinButton = false,
    labels = { expand: 'Expand header', collapse: 'Collapse header', pin: 'Pin header', unpin: 'Unpin header' }, className, children, ...rest
  },
  ref,
) {
  const headerId = useId();
  const [expanded, setExpanded] = useControllableState(headerExpanded, defaultHeaderExpanded, onHeaderExpandedChange);
  const [pinned, setPinned] = useControllableState(headerPinned, defaultHeaderPinned, onHeaderPinnedChange);
  return (
    <div ref={ref} className={cx(styles.page, className)} {...rest}>
      <header className={cx(styles.titleArea, pinned && styles.pinned)}>
        {breadcrumbs && <div className={styles.breadcrumbs}>{breadcrumbs}</div>}
        <div className={styles.titleRow}>
          <div className={styles.heading}>
            <h1 className={styles.title}>{title}</h1>
            {!expanded && snappedSubtitle && <span className={styles.snapped}>{snappedSubtitle}</span>}
            {expanded && subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
        {headerContent && (
          <>
            <div id={headerId} className={styles.headerContent} hidden={!expanded}>{headerContent}</div>
            <div className={styles.headerControls}>
              <IconButton size="sm" icon={expanded ? <ChevronUp /> : <ChevronDown />} label={expanded ? labels.collapse : labels.expand} aria-expanded={expanded} aria-controls={headerId} onClick={() => setExpanded(!expanded)} />
              {!hidePinButton && expanded && (
                <IconButton size="sm" icon={pinned ? <PinOff /> : <Pin />} label={pinned ? labels.unpin : labels.pin} aria-pressed={pinned} onClick={() => setPinned(!pinned)} />
              )}
            </div>
          </>
        )}
      </header>
      <div className={styles.content}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  );
});
