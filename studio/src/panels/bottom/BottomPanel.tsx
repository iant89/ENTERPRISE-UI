import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Button, IconButton, Link, SegmentedButton, IconProvider } from '@enterprise-ui/react';
import { CONSOLE_CAP, filterConsole, type ConsoleEntry, type ConsoleFilter } from '../../preview/console';
import { BOTTOM_TABS, type BottomTab } from '../../app/workspace/layout';
import { ReferencesPanel, type ReferenceSet } from './ReferencesPanel';
import styles from '../../app/workspace/CodeWorkspace.module.css';

export const BOTTOM_LABELS: Record<BottomTab, string> = {
  problems: 'Problems', console: 'Console', tests: 'Tests', 'component-docs': 'Component Docs', output: 'Output', 'preview-events': 'Preview Events', references: 'References',
};

export interface Problem { file: string; line: number | null; column?: number | null; message: string; severity: 'error' | 'warning' | 'info'; origin?: string }

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
  /** C3: references pinned from the peek. */
  references?: ReferenceSet | null;
  onOpenReference?: (path: string, line: number, column: number) => void;
  onClearReferences?: () => void;
  /** C4: preview console entries. */
  consoleEntries?: readonly ConsoleEntry[];
  onClearConsole?: () => void;
  /** Messages dropped by the console cap (shown as a marker). */
  consoleDropped?: number;
  /** C7: Component Docs tab content. */
  componentDocs?: ReactNode;
  onOpenSource?: (path: string, line: number | null, column: number | null) => void;
}

const EMPTY: Record<BottomTab, ReactNode> = {
  problems: 'No problems in the project.',
  console: 'No console output yet. Preview logs appear here.',
  tests: 'No tests run yet. The test runner arrives in C6.',
  'component-docs': 'Select a component in the editor to see its documentation (C5).',
  output: 'No build output yet.',
  'preview-events': 'No preview events yet.',
  references: null,
};

/** Problems, Console, Tests, Component Docs, Output, Preview Events. Empty states until C4–C6. */
export function BottomPanel({ tab, onTab, problems, onGoTo, onCollapse, summary, expanded, onExpanded, references = null, onOpenReference, onClearReferences, consoleEntries = [], onClearConsole, onOpenSource, consoleDropped = 0, componentDocs }: BottomPanelProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const grouped = useMemo(() => groupProblems(problems), [problems]);
  if (summary && !expanded) {
    return (
      <section className={styles.bottomSummary} aria-label="Bottom panel">
        <button type="button" className={styles.summaryButton} aria-expanded={false} onClick={() => onExpanded?.(true)}>
          <span className={styles.countBadge}>{problems.length}</span> Problems <span>Console ({consoleEntries.length})</span>
          {IconProvider.getIcon('slim-arrow-up', { 'aria-hidden': "true", className: styles.summaryChevron })}
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
              {BOTTOM_LABELS[t]}{t === 'problems' && problems.length > 0 && ` (${problems.length})`}{t === 'console' && consoleEntries.length > 0 && ` (${consoleEntries.length})`}{t === 'references' && references && ` (${references.groups.reduce((n, g) => n + g.items.length, 0)})`}
            </button>
          ))}
        </div>
        {summary
          ? <IconButton size="sm" variant="tertiary" icon={IconProvider.getIcon('slim-arrow-down')} label="Collapse to summary" onClick={() => onExpanded?.(false)} />
          : <IconButton size="sm" variant="tertiary" icon={IconProvider.getIcon('toaster-down')} label="Hide bottom panel" onClick={onCollapse} />}
      </div>
      <div role="tabpanel" id="bottom-tabpanel" aria-labelledby={`bottom-tab-${tab}`} className={styles.bottomBody} tabIndex={0}>
        {tab === 'references' ? (
          <ReferencesPanel references={references} onOpen={(p, l, c) => onOpenReference?.(p, l, c)} onClear={() => onClearReferences?.()} />
        ) : tab === 'problems' && problems.length > 0 ? (
          <div>
            {grouped.map((g) => (
              <section key={g.file} aria-label={`${g.file || 'Project'}, ${g.items.length} ${g.items.length === 1 ? 'problem' : 'problems'}`}>
                <h3 className={styles.problemGroup}>{g.file || 'Project'} ({g.items.length})</h3>
                <ul className={styles.problemList}>
                  {g.items.map((p, i) => (
                    <li key={i} className={`${styles.problem} ${styles.problemRow}`} tabIndex={0} data-testid="problem"
                      onClick={() => onGoTo(p)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onGoTo(p); } }}>
                      <span className={p.severity === 'error' ? styles.errorText : styles.warningText}>{p.severity === 'error' ? 'Error' : p.severity === 'warning' ? 'Warning' : 'Info'}</span>
                      <span className={styles.problemMessage}>{p.message}</span>
                      <Link href="#" tabIndex={-1} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onGoTo(p); }}>{p.file}{p.line ? `:${p.line}` : ''}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : tab === 'component-docs' && componentDocs ? (
          <div data-testid="component-docs-tab">{componentDocs}</div>
        ) : tab === 'console' ? (
          <ConsoleView entries={consoleEntries} dropped={consoleDropped} onClear={() => onClearConsole?.()} onOpen={(p, l, c) => onOpenSource?.(p, l, c)} />
        ) : <p className={styles.empty}>{EMPTY[tab]}</p>}
      </div>
    </section>
  );
}

/** Problems grouped by file (files sorted, project-level last), errors first, then by line. */
export function groupProblems(problems: readonly Problem[]): { file: string; items: Problem[] }[] {
  const rank = { error: 0, warning: 1, info: 2 } as const;
  const map = new Map<string, Problem[]>();
  for (const p of problems) map.set(p.file, [...(map.get(p.file) ?? []), p]);
  return [...map.entries()]
    .sort(([a], [b]) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b)))
    .map(([file, items]) => ({ file, items: items.sort((x, y) => rank[x.severity] - rank[y.severity] || (x.line ?? 0) - (y.line ?? 0)) }));
}

const FILTERS: { value: ConsoleFilter; label: string }[] = [
  { value: 'all', label: 'All' }, { value: 'error', label: 'Errors' }, { value: 'warn', label: 'Warnings' }, { value: 'info', label: 'Info' }, { value: 'log', label: 'Logs' },
];

function ConsoleView({ entries, dropped = 0, onClear, onOpen }: { entries: readonly ConsoleEntry[]; dropped?: number; onClear: () => void; onOpen: (path: string, line: number | null, column: number | null) => void }) {
  const [filter, setFilter] = useState<ConsoleFilter>('all');
  const shown = filterConsole(entries, filter);
  return (
    <div>
      <div className={styles.consoleBar}>
        <SegmentedButton size="sm" aria-label="Console level" selectionMode="single" value={[filter]} onChange={(v: string[]) => v[0] && setFilter(v[0] as ConsoleFilter)} items={FILTERS} />
        <span className={styles.toolbarGrow} />
        <Button size="sm" variant="tertiary" onClick={onClear} disabled={!entries.length}>Clear console</Button>
      </div>
      {dropped > 0 && <p className={styles.consoleDropped} data-testid="console-dropped">{dropped.toLocaleString('en-US')} earlier {dropped === 1 ? 'message' : 'messages'} dropped (showing the last {CONSOLE_CAP})</p>}
      {shown.length ? (
        <ul className={styles.consoleList} aria-label="Console output">
          {shown.map((e) => (
            <li key={e.id} className={styles.consoleEntry} data-level={e.level} data-testid="console-entry">
              <span className={styles.consoleText}>{e.level === 'uncaught' ? 'Uncaught ' : ''}{e.text}</span>
              {e.path && <Link href="#" onClick={(ev) => { ev.preventDefault(); onOpen(e.path!, e.line, e.column); }}>{e.path}{e.line ? `:${e.line}` : ''}</Link>}
            </li>
          ))}
        </ul>
      ) : <p className={styles.empty}>{entries.length ? 'No entries at this level.' : EMPTY.console}</p>}
    </div>
  );
}
