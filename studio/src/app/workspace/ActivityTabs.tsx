import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../../../src/utilities/cx';
import { ACTIVITIES, type Activity } from './layout';
import styles from './CodeWorkspace.module.css';
import courseBookSvg from '../../../../src/assets/icons/course-book.svg?raw';
import documentsSvg from '../../../../src/assets/icons/documents.svg?raw';
import gridSvg from '../../../../src/assets/icons/grid.svg?raw';
import sapBoxSvg from '../../../../src/assets/icons/sap-box.svg?raw';
import searchSvg from '../../../../src/assets/icons/search.svg?raw';
import { svgIcon } from '../../../../src/icons/svgIcon';

export const ACTIVITY_META: Record<Activity, { label: string; icon: ReactNode }> = {
  explorer: { label: 'Explorer', icon: svgIcon(documentsSvg, 'documents', { 'aria-hidden': "true" }) },
  search: { label: 'Search', icon: svgIcon(searchSvg, 'search', { 'aria-hidden': "true" }) },
  components: { label: 'Components', icon: svgIcon(sapBoxSvg, 'sap-box', { 'aria-hidden': "true" }) },
  icons: { label: 'Icons', icon: svgIcon(gridSvg, 'grid', { 'aria-hidden': "true" }) },
  docs: { label: 'Docs', icon: svgIcon(courseBookSvg, 'course-book', { 'aria-hidden': "true" }) },
};

export const activityTabId = (a: Activity) => `activity-tab-${a}`;
export const ACTIVITY_PANEL_ID = 'activity-panel';

/** Decision 2: horizontal tablist above the Explorer. Icon-only (with tooltip and aria-label) when compact. */
export function ActivityTabs({ value, onChange, compact = false }: { value: Activity; onChange: (a: Activity) => void; compact?: boolean }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (event: KeyboardEvent) => {
    const i = ACTIVITIES.indexOf(value);
    let next = -1;
    if (event.key === 'ArrowRight') next = (i + 1) % ACTIVITIES.length;
    else if (event.key === 'ArrowLeft') next = (i - 1 + ACTIVITIES.length) % ACTIVITIES.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = ACTIVITIES.length - 1;
    if (next < 0) return;
    event.preventDefault();
    onChange(ACTIVITIES[next]);
    refs.current[next]?.focus();
  };
  return (
    <div role="tablist" aria-label="Sidebar" className={cx(styles.activityTabs, compact && styles.compact)} onKeyDown={onKey}>
      {ACTIVITIES.map((a, i) => (
        <button
          key={a}
          ref={(el) => { refs.current[i] = el; }}
          type="button"
          role="tab"
          id={activityTabId(a)}
          aria-selected={value === a}
          aria-controls={ACTIVITY_PANEL_ID}
          aria-label={ACTIVITY_META[a].label}
          title={compact ? ACTIVITY_META[a].label : undefined}
          tabIndex={value === a ? 0 : -1}
          className={styles.activityTab}
          // Decision 3: opening Docs leaves the caret in the editor.
          onMouseDown={a === 'docs' ? (e) => e.preventDefault() : undefined}
          onClick={() => onChange(a)}
        >
          {ACTIVITY_META[a].icon}{!compact && <span>{ACTIVITY_META[a].label}</span>}
        </button>
      ))}
    </div>
  );
}
