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
  /** Breadcrumbs shown above the title. */
  breadcrumbs?: ReactNode;
  /** Title-bar actions (always visible). */
  actions?: ReactNode;
  /** Collapsible header content (key facts, filters). */
  headerContent?: ReactNode;
  /** Sticky footer, typically finalizing actions. */
  footer?: ReactNode;
  /** Whether the header content is expanded. Providing it makes the expanded state controlled. */
  headerExpanded?: boolean;
  /** @default true */
  /** Whether the header content is expanded initially when the expanded state is uncontrolled. */
  defaultHeaderExpanded?: boolean;
  /** Called with the new expanded state when the user expands or collapses the header. */
  onHeaderExpandedChange?: (expanded: boolean) => void;
  /** Keep the header expanded while scrolling. Controlled with `onHeaderPinnedChange`. */
  headerPinned?: boolean;
  /** @default false */
  /** Whether the header is pinned initially. A pinned header stays expanded while the page scrolls. */
  defaultHeaderPinned?: boolean;
  /** Called with the new pinned state when the user pins or unpins the header. */
  onHeaderPinnedChange?: (pinned: boolean) => void;
  /** Hide the pin button. @default false */
  hidePinButton?: boolean;
  /** Localized control names. */
  labels?: { expand: string; collapse: string; pin: string; unpin: string };
  /** Content rendered inside the dynamic page. */
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
