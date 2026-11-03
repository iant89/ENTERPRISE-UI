import { forwardRef, useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { ArrowDownToLine, Download, WrapText } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { IconButton } from '../icon-button';
import { SegmentedButton } from '../segmented-button';
import styles from './LogViewer.module.css';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogLine {
  id?: string;
  /** Display timestamp, e.g. an ISO string. */
  timestamp?: string;
  level?: LogLevel;
  message: string;
}

export interface LogViewerLabels {
  search: string;
  levels: Record<LogLevel, string>;
  levelFilter: string;
  wrap: string;
  follow: string;
  jumpToLatest: string;
  download: string;
  count: (shown: number, total: number) => string;
  empty: string;
}

export interface LogViewerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Accessible name, e.g. "Import job 4711 log". */
  label: string;
  /** Lines; plain strings get their level from words like ERROR or WARN. Append to stream. */
  lines: (string | LogLine)[];
  /** Height of the scroll area in pixels. @default 320 */
  height?: number;
  /** Keeps the newest line in view as lines arrive, until the user scrolls up. @default true */
  follow?: boolean;
  /** Shows line numbers. @default true */
  lineNumbers?: boolean;
  /** File name for Download (without extension). Hides the button when omitted. */
  downloadFileName?: string;
  /** Overrides for the built-in strings. */
  labels?: Partial<LogViewerLabels>;
}

const defaultLabels: LogViewerLabels = {
  search: 'Search log',
  levels: { error: 'Errors', warn: 'Warnings', info: 'Info', debug: 'Debug' },
  levelFilter: 'Levels',
  wrap: 'Wrap lines',
  follow: 'Follow new lines',
  jumpToLatest: 'Jump to latest',
  download: 'Download log',
  count: (shown, total) => (shown === total ? `${total.toLocaleString()} lines` : `${shown.toLocaleString()} of ${total.toLocaleString()} lines`),
  empty: 'No lines match.',
};

const LINE_HEIGHT = 20;
const LEVELS: LogLevel[] = ['error', 'warn', 'info', 'debug'];

function normalize(line: string | LogLine, index: number): Required<Pick<LogLine, 'message'>> & LogLine & { n: number } {
  if (typeof line !== 'string') return { ...line, n: index + 1, level: line.level ?? 'info' };
  const level: LogLevel = /\b(ERROR|FATAL|SEVERE)\b/i.test(line) ? 'error' : /\bWARN(ING)?\b/i.test(line) ? 'warn' : /\bDEBUG|TRACE\b/i.test(line) ? 'debug' : 'info';
  return { message: line, level, n: index + 1 };
}

function highlight(text: string, query: string): ReactNode {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p));
}

/**
 * Searchable, filterable job or system log with level coloring, line numbers and follow mode.
 * Long logs are windowed (only visible lines render) unless lines wrap.
 */
export const LogViewer = forwardRef<HTMLDivElement, LogViewerProps>(function LogViewer(
  { label, lines, height = 320, follow: followDefault = true, lineNumbers = true, downloadFileName, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides, levels: { ...defaultLabels.levels, ...labelOverrides?.levels } };
  const [query, setQuery] = useState('');
  const [levels, setLevels] = useState<LogLevel[]>(LEVELS);
  const [wrap, setWrap] = useState(false);
  const [follow, setFollow] = useState(followDefault);
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const all = useMemo(() => lines.map(normalize), [lines]);
  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => all.filter((l) => levels.includes(l.level ?? 'info') && (!q || l.message.toLowerCase().includes(q) || l.timestamp?.toLowerCase().includes(q))), [all, levels, q]);

  // Follow: keep the newest line in view while following.
  useEffect(() => {
    const el = scrollRef.current;
    if (follow && el) el.scrollTop = el.scrollHeight;
  }, [filtered.length, follow, wrap]);

  const windowed = !wrap && filtered.length > 200;
  const first = windowed ? Math.max(0, Math.floor(scrollTop / LINE_HEIGHT) - 20) : 0;
  const last = windowed ? Math.min(filtered.length, Math.ceil((scrollTop + height) / LINE_HEIGHT) + 20) : filtered.length;
  const visible = filtered.slice(first, last);
  const digits = String(all.length).length;

  const download = () => {
    const text = all.map((l) => [l.timestamp, l.level?.toUpperCase(), l.message].filter(Boolean).join(' ')).join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `${downloadFileName}.log` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div ref={ref} className={cx(styles.root, className)} {...rest}>
      <div className={styles.toolbar}>
        <input type="search" className={styles.search} placeholder={labels.search} aria-label={labels.search} value={query} onChange={(e) => setQuery(e.target.value)} />
        <SegmentedButton
          size="sm"
          aria-label={labels.levelFilter}
          selectionMode="multiple"
          items={LEVELS.map((l) => ({ value: l, label: labels.levels[l] }))}
          value={levels}
          onChange={(v) => v.length && setLevels(v as LogLevel[])}
        />
        <span className={styles.spacer} />
        <IconButton icon={<WrapText />} label={labels.wrap} size="sm" aria-pressed={wrap} onClick={() => setWrap((w) => !w)} />
        <IconButton icon={<ArrowDownToLine />} label={labels.follow} size="sm" aria-pressed={follow} onClick={() => setFollow((f) => !f)} />
        {downloadFileName && <IconButton icon={<Download />} label={labels.download} size="sm" onClick={download} />}
      </div>
      <div
        ref={scrollRef}
        className={cx(styles.scroll, wrap && styles.wrap)}
        style={{ height }}
        role="log"
        aria-live="off"
        aria-label={label}
        tabIndex={0}
        onScroll={(e) => {
          const el = e.currentTarget;
          setScrollTop(el.scrollTop);
          // Scrolling up pauses follow; reaching the bottom resumes it.
          const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < LINE_HEIGHT;
          if (!atBottom && follow) setFollow(false);
          else if (atBottom && !follow && followDefault) setFollow(true);
        }}
      >
        {filtered.length === 0 ? (
          <p className={styles.empty}>{labels.empty}</p>
        ) : (
          <div style={windowed ? { height: filtered.length * LINE_HEIGHT, position: 'relative' } : undefined}>
            <div style={windowed ? { transform: `translateY(${first * LINE_HEIGHT}px)` } : undefined}>
              {visible.map((l) => (
                <div key={l.id ?? l.n} className={cx(styles.line, styles[l.level ?? 'info'])}>
                  {lineNumbers && (
                    <span className={styles.number} style={{ width: `${digits + 1}ch` }} aria-hidden="true">
                      {l.n}
                    </span>
                  )}
                  {l.timestamp && <span className={styles.time}>{l.timestamp}</span>}
                  {typeof lines[l.n - 1] !== 'string' && l.level && <span className={styles.level}>{l.level.toUpperCase()}</span>}
                  <span className={styles.message}>{highlight(l.message, query.trim())}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={styles.footer}>
        <span>{labels.count(filtered.length, all.length)}</span>
        {!follow && followDefault && (
          <button
            type="button"
            className={styles.jump}
            onClick={() => {
              setFollow(true);
              if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }}
          >
            {labels.jumpToLatest}
          </button>
        )}
      </div>
    </div>
  );
});
