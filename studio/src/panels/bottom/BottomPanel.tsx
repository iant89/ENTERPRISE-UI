import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, PanelBottomClose } from 'lucide-react';
import { IconButton, Link } from '@enterprise-ui/react';
import { BOTTOM_TABS, type BottomTab } from '../../app/workspace/layout';
import styles from '../../app/workspace/CodeWorkspace.module.css';

export const BOTTOM_LABELS: Record<BottomTab, string> = {
  problems: 'Problems', console: 'Console', tests: 'Tests', 'component-docs': 'Component Docs', output: 'Output', 'preview-events': 'Preview Events',
};

export interface Problem { file: string; line: number | null; message: string; severity: 'error' | 'warning' }

export interface BottomPanelProps {
  tab: BottomTab;
  onTab: (t: BottomTab) => void;
  problems: Problem[];
  onGoTo: (p: Problem) => void;
  onCollapse: () => void;
  /** Tablet: render as a summary strip unless expanded. */
  summary?: boolean;
  expanded?: boolean;
  onExpanded?: (expanded: boolean) => void;
}

const EMPTY: Record<BottomTab, ReactNode> = {
  problems: 'No problems in the project.',
  console: 'No console output yet. Preview logs appear here (C4).',
  tests: 'No tests run yet. The test runner arrives in C6.',
  'component-docs': 'Select a component in the editor to see its documentation (C5).',
  output: 'No build output yet (C4).',
  'preview-events': 'No preview events yet (C4).',
};

/** Problems, Console, Tests, Component Docs, Output, Preview Events. Empty states until C4–C6. */
export function BottomPanel({ tab, onTab, problems, onGoTo, onCollapse, summary, expanded, onExpanded }: BottomPanelProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  if (summary && !expanded) {
    return (
      <section className={styles.bottomSummary} aria-label="Bottom panel">
        <button type="button" className={styles.summaryButton} aria-expanded={false} onClick={() => onExpanded?.(true)}>
          <span className={styles.countBadge}>{problems.length}</span> Problems <span>Console (0)</span>
          <ChevronUp aria-hidden="true" className={styles.summaryChevron} />
          <span className={styles.srOnly}>Expand bottom panel</span>
        </button>
      </section>
    );
  }
  const onKey = (event: KeyboardEvent) => {
    const i = BOTTOM_TABS.indexOf(tab);
    const d = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    event.preventDefault();
    const next = (i + d + BOTTOM_TABS.length) % BOTTOM_TABS.length;
    onTab(BOTTOM_TABS[next]);
    refs.current[next]?.focus();
  };
  return (
    <section className={styles.bottom} aria-label="Bottom panel" id="bottom-panel">
      <div className={styles.bottomHead}>
        <div role="tablist" aria-label="Panel" className={styles.bottomTabs} onKeyDown={onKey}>
          {BOTTOM_TABS.map((t, i) => (
            <button key={t} ref={(el) => { refs.current[i] = el; }} type="button" role="tab" id={`bottom-tab-${t}`} aria-selected={tab === t} aria-controls="bottom-tabpanel"
              tabIndex={tab === t ? 0 : -1} className={styles.bottomTab} onClick={() => onTab(t)}>
              {BOTTOM_LABELS[t]}{t === 'problems' && problems.length > 0 && ` (${problems.length})`}
            </button>
          ))}
        </div>
        {summary
          ? <IconButton size="sm" variant="tertiary" icon={<ChevronDown />} label="Collapse to summary" onClick={() => onExpanded?.(false)} />
          : <IconButton size="sm" variant="tertiary" icon={<PanelBottomClose />} label="Hide bottom panel" onClick={onCollapse} />}
      </div>
      <div role="tabpanel" id="bottom-tabpanel" aria-labelledby={`bottom-tab-${tab}`} className={styles.bottomBody} tabIndex={0}>
        {tab === 'problems' && problems.length > 0 ? (
          <ul className={styles.problemList}>
            {problems.map((p, i) => (
              <li key={i} className={styles.problem}>
                <span className={p.severity === 'error' ? styles.errorText : styles.warningText}>{p.severity === 'error' ? 'Error' : 'Warning'}</span>
                <span className={styles.problemMessage}>{p.message}</span>
                <Link href="#" onClick={(e) => { e.preventDefault(); onGoTo(p); }}>{p.file}{p.line ? `:${p.line}` : ''}</Link>
              </li>
            ))}
          </ul>
        ) : <p className={styles.empty}>{EMPTY[tab]}</p>}
      </div>
    </section>
  );
}
