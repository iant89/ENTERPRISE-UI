import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Badge, Button, IconButton, MessageStrip, SearchField } from '@enterprise-ui/react';
import { CaseSensitive, ChevronDown, ChevronRight, ChevronsDownUp, Filter, Regex, RotateCw, WholeWord, X } from 'lucide-react';
import { cx } from '../../../../src/utilities/cx';
import { buildMatcher, DEFAULT_MAX_RESULTS, searchFiles, type SearchMatch } from '../../core/vfs/search';
import { pathFilter } from '../../core/vfs/glob';
import styles from './CodeWorkspace.module.css';

export interface SearchPanelProps {
  files: Readonly<Record<string, string>>;
  onOpen: (path: string, line: number, column: number) => void;
  /** Debounce for live search (decision 4). */
  debounceMs?: number;
  maxResults?: number;
}

const plural = (n: number, one: string) => `${n.toLocaleString('en')} ${one}${n === 1 ? '' : 's'}`;

/** Splits a preview line into text and highlighted match. */
function highlight(m: SearchMatch): ReactNode {
  const start = m.column - 1;
  const end = m.endLine === m.line ? m.endColumn - 1 : m.preview.length;
  const from = Math.max(0, start - 24);
  return <>{from > 0 && '…'}{m.preview.slice(from, start)}<mark className={styles.hit}>{m.preview.slice(start, end)}</mark>{m.preview.slice(end)}</>;
}

/** Search activity (C2 mockups 01–02): live search with case / word / regex toggles and include/exclude globs. */
export function SearchPanel({ files, onOpen, debounceMs = 300, maxResults = DEFAULT_MAX_RESULTS }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [include, setInclude] = useState('');
  const [exclude, setExclude] = useState('');
  const [showExclude, setShowExclude] = useState(false);
  const [opts, setOpts] = useState({ caseSensitive: false, wholeWord: false, regex: false });
  const [debounced, setDebounced] = useState({ query, include, exclude, opts });
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => setDebounced({ query, include, exclude, opts }), debounceMs);
    return () => clearTimeout(t);
  }, [query, include, exclude, opts, debounceMs]);
  const regexError = opts.regex && query ? (() => { const m = buildMatcher(query, opts); return typeof m === 'string' ? m : null; })() : null;
  const result = useMemo(() => {
    void nonce;
    if (!debounced.query) return null;
    return searchFiles(files, debounced.query, { ...debounced.opts, maxResults, include: pathFilter(debounced.include, debounced.exclude) });
  }, [files, debounced, maxResults, nonce]);
  const groups = useMemo(() => {
    const out = new Map<string, SearchMatch[]>();
    if (result?.ok) for (const m of result.matches) out.set(m.path, [...(out.get(m.path) ?? []), m]);
    return out;
  }, [result]);
  const toggle = (k: keyof typeof opts) => setOpts((o) => ({ ...o, [k]: !o[k] }));
  const onKey = (e: KeyboardEvent) => {
    if (!e.altKey) return;
    const k = e.key.toLowerCase();
    const map: Record<string, keyof typeof opts> = { c: 'caseSensitive', w: 'wholeWord', r: 'regex' };
    if (map[k]) { e.preventDefault(); toggle(map[k]); }
  };
  const clear = () => { setQuery(''); setInclude(''); setExclude(''); };
  const status = !result || regexError ? '' : !result.ok ? '' : result.matches.length === 0 ? 'No results' : `${result.truncated ? `${plural(maxResults, 'result')}+` : plural(result.matches.length, 'result')} in ${plural(result.fileCount, 'file')}`;
  const toggleBtn = (k: keyof typeof opts, label: string, key: string, icon: ReactNode) => (
    <button type="button" className={cx(styles.toggle, opts[k] && styles.toggleOn)} aria-pressed={opts[k]} aria-label={label} title={`${label} (Alt+${key})`} onClick={() => toggle(k)}>{icon}</button>
  );
  return (
    <div className={styles.search} onKeyDown={onKey}>
      <div className={styles.docsHead}>
        <h2 className={styles.paneTitle}>Search</h2>
        <span>
          <IconButton size="sm" variant="tertiary" icon={<RotateCw />} label="Refresh results" onClick={() => setNonce((n) => n + 1)} />
          <IconButton size="sm" variant="tertiary" icon={<ChevronsDownUp />} label="Collapse all" onClick={() => setCollapsed(new Set(groups.keys()))} />
          <IconButton size="sm" variant="tertiary" icon={<X />} label="Clear search" onClick={clear} />
        </span>
      </div>
      <div className={styles.searchFields}>
        <div className={styles.searchRow}>
          <SearchField size="sm" label="Search" hideLabel placeholder="Search" value={query} onChange={setQuery} error={regexError ?? undefined} className={styles.grow} />
          {toggleBtn('caseSensitive', 'Match case', 'C', <CaseSensitive aria-hidden="true" />)}
          {toggleBtn('wholeWord', 'Match whole word', 'W', <WholeWord aria-hidden="true" />)}
          {toggleBtn('regex', 'Use regular expression', 'R', <Regex aria-hidden="true" />)}
        </div>
        <div className={styles.searchRow}>
          <SearchField size="sm" label="Files to include" hideLabel placeholder="Files to include, e.g. src/**" value={include} onChange={setInclude} className={styles.grow} clearLabel="Clear files to include" />
          <button type="button" className={cx(styles.toggle, showExclude && styles.toggleOn)} aria-pressed={showExclude} aria-label="Show files to exclude" title="Files to exclude" onClick={() => setShowExclude((s) => !s)}><Filter aria-hidden="true" /></button>
        </div>
        {showExclude && <SearchField size="sm" label="Files to exclude" hideLabel placeholder="Files to exclude, e.g. **/*.test.tsx" value={exclude} onChange={setExclude} clearLabel="Clear files to exclude" />}
      </div>
      <p className={styles.searchStatus} role="status" aria-live="polite">{status}</p>
      {result?.ok && result.truncated && (
        <MessageStrip tone="warning" className={styles.staleStrip} title={`Showing the first ${plural(maxResults, 'result')}`}>Narrow the search or add files to include.</MessageStrip>
      )}
      {result?.ok && result.matches.length === 0 && !regexError && (
        <div className={styles.empty}>
          <p>No results for “{debounced.query}”. Check the spelling, turn off Match case or Whole word, or widen the files to include.</p>
          {(include || exclude || opts.caseSensitive || opts.wholeWord || opts.regex) && (
            <Button size="sm" onClick={() => { setInclude(''); setExclude(''); setOpts({ caseSensitive: false, wholeWord: false, regex: false }); }}>Clear filters</Button>
          )}
        </div>
      )}
      <div ref={listRef} className={styles.results} aria-label="Search results" role="region">
        {[...groups].map(([path, matches]) => {
          const open = !collapsed.has(path);
          const slash = path.lastIndexOf('/');
          return (
            <div key={path}>
              <button type="button" className={styles.resultFile} aria-expanded={open} title={path}
                onClick={() => setCollapsed((c) => { const n = new Set(c); if (n.has(path)) n.delete(path); else n.add(path); return n; })}>
                {open ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                <strong>{path.slice(slash + 1)}</strong><span className={styles.dim}>{path.slice(0, Math.max(0, slash))}</span>
                <Badge tone="neutral">{matches.length}</Badge><span className="eui-visually-hidden">{matches.length === 1 ? 'match' : 'matches'}</span>
              </button>
              {open && (
                <ul className={styles.resultList}>
                  {matches.map((m) => {
                    const id = `${m.path}:${m.line}:${m.column}`;
                    return (
                      <li key={id}>
                        <button type="button" aria-current={selected === id || undefined} className={cx(styles.resultLine, selected === id && styles.resultOn)}
                          title={`${path}:${m.line}`}
                          onClick={() => { setSelected(id); onOpen(m.path, m.line, m.column); }}>
                          <span className={styles.lineNo}>{m.line}</span><span className={styles.preview}>{highlight(m)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
