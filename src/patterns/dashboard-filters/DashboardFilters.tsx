import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useControllableState } from '../../hooks/useControllableState';
import { FilterTokenGroup } from '../../components/filter-token';
import styles from './DashboardFilters.module.css';
import slimArrowRightSvg from '../../assets/icons/slim-arrow-right.svg?raw';
import { svgIcon } from '../../icons/svgIcon';

/** One cross-filter, e.g. Region = EMEA, usually set by clicking a chart. */
export interface DashboardFilter {
  /** Field key, e.g. `region`. One filter per field. */
  id: string;
  /** Field name shown in the token, e.g. "Region". */
  name: string;
  /** Selected value, e.g. "EMEA". */
  value: string;
}

/** One level of a drill-down path, e.g. Country = Germany below Region = EMEA. */
export interface DashboardDrillStep {
  /** Level key, e.g. `country`. */
  level: string;
  /** Level name, e.g. "Country". */
  name: string;
  /** Value drilled into. */
  value: string;
}

/** Everything the dashboard is currently filtered by. Serialize it to the URL to make views shareable. */
export interface DashboardFilterState {
  filters: DashboardFilter[];
  drillPath: DashboardDrillStep[];
}

export interface DashboardFiltersApi extends DashboardFilterState {
  /** Sets the filter for `filter.id`, replacing any previous value of that field. */
  setFilter: (filter: DashboardFilter) => void;
  /** Sets the filter, or removes it when the same value is already active (click again to clear). */
  toggleFilter: (filter: DashboardFilter) => void;
  removeFilter: (id: string) => void;
  clearFilters: () => void;
  /** Value of the filter on field `id`, if any. */
  valueOf: (id: string) => string | undefined;
  /** Adds a level to the drill path. */
  drillDown: (step: DashboardDrillStep) => void;
  /** Returns to the step at `index`; `-1` returns to the top level. */
  drillTo: (index: number) => void;
}

const DashboardFiltersContext = createContext<DashboardFiltersApi | null>(null);

/** Reads and changes the dashboard's cross-filters and drill path. Must be used inside a DashboardFilterProvider. */
export function useDashboardFilters(): DashboardFiltersApi {
  const api = useContext(DashboardFiltersContext);
  if (!api) throw new Error('useDashboardFilters must be used inside a DashboardFilterProvider.');
  return api;
}

export interface DashboardFilterProviderProps {
  /** Current state. Providing it makes the provider controlled, e.g. to sync with the URL. */
  value?: DashboardFilterState;
  /** Initial state when uncontrolled. @default { filters: [], drillPath: [] } */
  defaultValue?: DashboardFilterState;
  /** Called with the new state. Reload widget data from here. */
  onChange?: (state: DashboardFilterState) => void;
  /** The dashboard. */
  children: ReactNode;
}

const EMPTY: DashboardFilterState = { filters: [], drillPath: [] };

/** Shares cross-filters and a drill path between the widgets of a dashboard. */
export function DashboardFilterProvider({ value, defaultValue = EMPTY, onChange, children }: DashboardFilterProviderProps) {
  const [state, setState] = useControllableState(value, defaultValue, onChange);
  const setFilter = useCallback(
    (filter: DashboardFilter) => setState((s) => ({ ...s, filters: [...s.filters.filter((f) => f.id !== filter.id), filter] })),
    [setState],
  );
  const api = useMemo<DashboardFiltersApi>(
    () => ({
      ...state,
      setFilter,
      toggleFilter: (filter) =>
        setState((s) =>
          s.filters.some((f) => f.id === filter.id && f.value === filter.value)
            ? { ...s, filters: s.filters.filter((f) => f.id !== filter.id) }
            : { ...s, filters: [...s.filters.filter((f) => f.id !== filter.id), filter] },
        ),
      removeFilter: (id) => setState((s) => ({ ...s, filters: s.filters.filter((f) => f.id !== id) })),
      clearFilters: () => setState((s) => ({ ...s, filters: [] })),
      valueOf: (id) => state.filters.find((f) => f.id === id)?.value,
      drillDown: (step) => setState((s) => ({ ...s, drillPath: [...s.drillPath, step] })),
      drillTo: (index) => setState((s) => ({ ...s, drillPath: s.drillPath.slice(0, Math.max(index + 1, 0)) })),
    }),
    [state, setFilter, setState],
  );
  return <DashboardFiltersContext.Provider value={api}>{children}</DashboardFiltersContext.Provider>;
}

export interface DashboardFilterBarLabels {
  /** Accessible name of the filter token group. */
  filters: string;
  clearAll: string;
  /** Accessible name of the drill path navigation. */
  drillPath: string;
  /** Announced after a filter is applied. */
  applied: (filter: DashboardFilter) => string;
  /** Announced after filters are removed. */
  removed: (count: number) => string;
  /** Announced after drilling. */
  drilled: (path: string) => string;
}

export interface DashboardFilterBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Name of the top drill level, e.g. "All regions". Shows the drill path when set or when drilled. */
  rootLabel?: string;
  /** Text shown when nothing is filtered. Omit to render nothing in that case. */
  emptyText?: ReactNode;
  /** Overrides for the built-in strings. */
  labels?: Partial<DashboardFilterBarLabels>;
}

const defaultBarLabels: DashboardFilterBarLabels = {
  filters: 'Dashboard filters',
  clearAll: 'Clear all',
  drillPath: 'Drill-down path',
  applied: (f) => `Filtered by ${f.name}: ${f.value}`,
  removed: (count) => (count === 1 ? 'Filter removed' : 'Filters removed'),
  drilled: (path) => `Showing ${path}`,
};

/** The active cross-filters as removable tokens, plus the drill-down path with links back up. */
export const DashboardFilterBar = forwardRef<HTMLDivElement, DashboardFilterBarProps>(function DashboardFilterBar(
  { rootLabel, emptyText, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultBarLabels, ...labelOverrides };
  const api = useDashboardFilters();
  const [message, setMessage] = useState('');
  const previous = useRef(api);
  const labelsRef = useRef(labels);
  labelsRef.current = labels;

  // Announce changes made anywhere (chart clicks included), so the effect on other widgets is not silent.
  useEffect(() => {
    const before = previous.current;
    previous.current = api;
    const text = labelsRef.current;
    const added = api.filters.find((f) => !before.filters.some((b) => b.id === f.id && b.value === f.value));
    if (added) setMessage(text.applied(added));
    else if (api.filters.length < before.filters.length) setMessage(text.removed(before.filters.length - api.filters.length));
    else if (api.drillPath.length !== before.drillPath.length) {
      const path = api.drillPath.length ? api.drillPath[api.drillPath.length - 1].value : rootLabel ?? '';
      if (path) setMessage(text.drilled(path));
    }
  }, [api, rootLabel]);

  const showPath = api.drillPath.length > 0;
  const nothing = !showPath && api.filters.length === 0;

  return (
    <div ref={ref} className={cx(styles.bar, className)} {...rest}>
      {showPath && (
        <nav aria-label={labels.drillPath}>
          <ol className={styles.path}>
            <li>
              <button type="button" className={styles.step} onClick={() => api.drillTo(-1)}>
                {rootLabel ?? api.drillPath[0].name}
              </button>
            </li>
            {api.drillPath.map((step, i) => {
              const current = i === api.drillPath.length - 1;
              return (
                <li key={`${step.level}-${i}`}>
                  {svgIcon(slimArrowRightSvg, 'slim-arrow-right', { 'aria-hidden': "true", className: styles.separator })}
                  {current ? (
                    <span className={styles.current} aria-current="location">
                      {step.value}
                    </span>
                  ) : (
                    <button type="button" className={styles.step} onClick={() => api.drillTo(i)}>
                      {step.value}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      {api.filters.length > 0 && (
        <FilterTokenGroup
          label={labels.filters}
          clearLabel={labels.clearAll}
          tokens={api.filters.map((f) => ({ id: f.id, name: f.name, value: f.value }))}
          onRemove={api.removeFilter}
          onClear={api.clearFilters}
        />
      )}
      {nothing && emptyText && <p className={styles.empty}>{emptyText}</p>}
      <span className="eui-visually-hidden" aria-live="polite">
        {message}
      </span>
    </div>
  );
});
