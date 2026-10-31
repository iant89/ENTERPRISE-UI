import { forwardRef, type FormEvent, type HTMLAttributes, type ReactNode } from 'react';
import { Filter } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useControllableState } from '../../hooks/useControllableState';
import { useId } from '../../hooks/useId';
import { Button } from '../../components/button';
import styles from './FilterBar.module.css';

export interface FilterBarProps extends Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit' | 'title'> {
  /** Filter controls — typically Select, ComboBox, DatePicker etc. with labels. */
  children?: ReactNode;
  /** Optional heading (e.g. a saved-view name). */
  title?: ReactNode;
  /** Quick search slot, always visible. */
  search?: ReactNode;
  /** Number of active filters, shown on the toggle button. */
  activeCount?: number;
  /** Called when the user applies filters (Go button or Enter). */
  onGo?: () => void;
  /** Called by the Clear button. */
  onClear?: () => void;
  /** Hide the Go button when filters apply immediately. @default false */
  liveMode?: boolean;
  /** Controlled expanded state of the filter area. */
  expanded?: boolean;
  /** @default true */
  /** Whether the filter fields are expanded initially when the expanded state is uncontrolled. */
  defaultExpanded?: boolean;
  /** Called with the new expanded state when the user expands or collapses it. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Extra actions (e.g. Adapt Filters). */
  actions?: ReactNode;
}

/**
 * Filter area for list reports: a search slot, a collapsible grid of filter
 * fields, and Go / Clear actions. Implemented as a search form.
 */
export const FilterBar = forwardRef<HTMLFormElement, FilterBarProps>(function FilterBar(
  { children, title, search, activeCount = 0, onGo, onClear, liveMode = false, expanded, defaultExpanded = true, onExpandedChange, actions, className, 'aria-label': ariaLabel, ...rest },
  ref,
) {
  const [isExpanded, setExpanded] = useControllableState(expanded, defaultExpanded, onExpandedChange);
  const filtersId = useId(undefined, 'filters');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onGo?.();
  };
  const actionButtons = (
    <>
      {actions}
      {children && (
        <Button variant="tertiary" icon={<Filter />} aria-expanded={isExpanded} aria-controls={filtersId} onClick={() => setExpanded(!isExpanded)}>
          {isExpanded ? 'Hide filters' : 'Show filters'}
          {activeCount > 0 && ` (${activeCount})`}
        </Button>
      )}
      {onClear && (
        <Button variant="tertiary" onClick={onClear} disabled={activeCount === 0}>
          Clear
        </Button>
      )}
      {!liveMode && (
        <Button type="submit" variant="primary">
          Go
        </Button>
      )}
    </>
  );
  const hasTop = title != null || search != null;
  return (
    <form ref={ref} role="search" aria-label={ariaLabel ?? 'Filters'} className={cx(styles.bar, className)} onSubmit={submit} noValidate {...rest}>
      {hasTop && (
        <div className={styles.top}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {search && <div className={styles.search}>{search}</div>}
          <div className={styles.spacer} />
          {actionButtons}
        </div>
      )}
      {(children || !hasTop) && (
        <div className={styles.body}>
          {children && (
            <div id={filtersId} className={styles.filters} hidden={!isExpanded}>
              {children}
            </div>
          )}
          {!hasTop && <div className={styles.actions}>{actionButtons}</div>}
        </div>
      )}
    </form>
  );
});
