import { useEffect, useLayoutEffect, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from 'react';
import { IconProvider } from '@enterprise-ui/react';
import { cx } from '../../../../src/utilities/cx';
import styles from './CodeWorkspace.module.css';

export interface EditorTabsProps {
  tabs: readonly string[];
  active: string;
  dirty: ReadonlySet<string>;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
  /** Visible tabs before the rest collapse into the "+N" menu. Measured from the width when omitted (C3 decision 3a). */
  maxVisible?: number;
  /** C3 split editing: this strip's group (0 = left) and how many groups there are. */
  group?: number;
  groupCount?: number;
  /** The focused group shows the primary line on its active tab; the other a neutral line. */
  focused?: boolean;
  onFocusGroup?: () => void;
  /** Drag and keyboard moves: from group `from` to group `to` at position `index`. */
  onMove?: (path: string, from: number, to: number, index: number) => void;
  onSplit?: () => void;
  onCloseAll?: () => void;
  onCloseOthers?: (path: string) => void;
  /** Rendered before the strip (e.g. the sidebar toggle) and after the group actions. */
  leading?: ReactNode;
  trailing?: ReactNode;
}

const base = (p: string) => p.slice(p.lastIndexOf('/') + 1);
export const TAB_MIME = 'application/x-eui-studio-tab';

/** Drag payload shared by both groups' strips. */
let dragging: { path: string; from: number } | null = null;

/** A small menu built by composition (the library has no tab menu; flag the Tech Lead before changing it). */
function StripMenu({ label, items, onClose }: { label: string; items: { id: string; label: ReactNode; onSelect: () => void; separatorBefore?: boolean }[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus(); }, []);
  const onKey = (e: KeyboardEvent) => {
    const all = [...(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const i = all.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); all[(i + (e.key === 'ArrowDown' ? 1 : -1) + all.length) % all.length]?.focus(); }
    else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); all[e.key === 'Home' ? 0 : all.length - 1]?.focus(); }
    else if (e.key === 'Tab') onClose();
  };
  return (
    <div ref={ref} role="menu" aria-label={label} className={styles.overflowMenu} onKeyDown={onKey}>
      {items.map((it) => (
        <div key={it.id} role="none">
          {it.separatorBefore && <div role="separator" className={styles.menuSeparator} />}
          <button type="button" role="menuitem" tabIndex={-1} className={styles.overflowItem} onClick={() => { onClose(); it.onSelect(); }}>{it.label}</button>
        </div>
      ))}
    </div>
  );
}

/**
 * Editor tabs for one group. C1 decision 5: an unsaved tab shows a dot in place of its close button;
 * hover or focus shows the close button. C3: drag to reorder or onto the other group (decision 4a),
 * Ctrl+Shift+PgUp/PgDn moves the focused tab, middle-click closes, and tabs that do not fit go into a
 * "⌄ +N" menu at the end of the strip with "Close all tabs in group" (decision 3a).
 */
export function EditorTabs({
  tabs, active, dirty, onSelect, onClose, maxVisible, group = 0, groupCount = 1, focused = true, onFocusGroup, onMove, onSplit, onCloseAll, onCloseOthers, leading, trailing,
}: EditorTabsProps) {
  const [menu, setMenu] = useState<'overflow' | 'actions' | null>(null);
  const [fit, setFit] = useState<number | null>(null);
  const [drop, setDrop] = useState<number | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const limit = maxVisible ?? fit ?? tabs.length;

  let visible = [...tabs];
  let hidden: string[] = [];
  if (tabs.length > limit) {
    visible = tabs.slice(0, Math.max(1, limit));
    hidden = tabs.slice(Math.max(1, limit));
    // Keep the active tab visible.
    if (hidden.includes(active)) { hidden = [...hidden.filter((t) => t !== active), visible.at(-1)!]; visible = [...visible.slice(0, -1), active]; }
  }

  // Width-based overflow: measure with every tab rendered (fit === null), then cap.
  useLayoutEffect(() => {
    if (maxVisible !== undefined || fit !== null) return;
    const strip = stripRef.current;
    const list = listRef.current;
    if (!strip || !list) return;
    const reserved = [...strip.children].reduce((w, el) => (el === list.parentElement ? w : w + (el as HTMLElement).offsetWidth), 0) + 56;
    const avail = strip.clientWidth - reserved;
    let used = 0;
    let n = 0;
    for (const el of list.children) { used += (el as HTMLElement).offsetWidth; if (used > avail) break; n++; }
    setFit(avail <= 0 || n >= tabs.length ? tabs.length : Math.max(1, n));
  }, [fit, maxVisible, tabs.length]);
  const tabsKey = tabs.join('\n');
  useEffect(() => { setFit(null); }, [tabsKey, active]);
  useEffect(() => {
    if (maxVisible !== undefined || typeof ResizeObserver === 'undefined' || !stripRef.current) return;
    let w = stripRef.current.clientWidth;
    const ro = new ResizeObserver(([e]) => { const nw = Math.round(e.contentRect.width); if (nw !== w) { w = nw; setFit(null); } });
    ro.observe(stripRef.current);
    return () => ro.disconnect();
  }, [maxVisible]);

  useEffect(() => {
    if (!menu) return;
    const down = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(null); };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, [menu]);

  const focusTab = (path: string) => requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-path="${CSS.escape(path)}"] button`)?.focus());

  const onListKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const i = visible.indexOf(active);
    const next = visible[(i + (event.key === 'ArrowRight' ? 1 : -1) + visible.length) % visible.length];
    if (!next) return;
    event.preventDefault();
    onSelect(next);
    focusTab(next);
  };

  const onTabKey = (event: KeyboardEvent, path: string) => {
    const mod = event.ctrlKey || event.metaKey;
    if (event.key === 'Delete' || (event.key.toLowerCase() === 'w' && mod && event.altKey)) { event.preventDefault(); onClose(path); return; }
    if (mod && event.shiftKey && (event.key === 'PageUp' || event.key === 'PageDown') && onMove) {
      event.preventDefault();
      event.stopPropagation();
      const i = tabs.indexOf(path);
      const d = event.key === 'PageUp' ? -1 : 1;
      // Past either end, the tab moves into the other group when there is one.
      if (i + d < 0 && groupCount > 1 && group === 1) onMove(path, group, 0, Number.MAX_SAFE_INTEGER);
      else if (i + d >= tabs.length && groupCount > 1 && group === 0) onMove(path, group, 1, 0);
      else if (i + d >= 0 && i + d < tabs.length) onMove(path, group, group, i + d);
      focusTab(path);
    }
  };

  // Drag and drop (decision 4a). The insertion index is computed from the pointer against tab midpoints.
  const indexAt = (event: DragEvent) => {
    const items = [...(listRef.current?.querySelectorAll<HTMLElement>('[data-path]') ?? [])];
    const x = event.clientX;
    const at = items.findIndex((el) => { const r = el.getBoundingClientRect(); return x < r.left + r.width / 2; });
    const visibleIndex = at < 0 ? items.length : at;
    const path = visible[visibleIndex];
    return path === undefined ? tabs.length : tabs.indexOf(path);
  };
  const onDragStart = (event: DragEvent, path: string) => {
    dragging = { path, from: group };
    setSource(path);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(TAB_MIME, JSON.stringify(dragging));
    event.dataTransfer.setData('text/plain', path);
    const ghost = document.createElement('div');
    ghost.className = styles.dragGhost;
    ghost.textContent = base(path);
    document.body.appendChild(ghost);
    event.dataTransfer.setDragImage?.(ghost, 12, 12);
    setTimeout(() => ghost.remove(), 0);
  };
  const onDragOver = (event: DragEvent) => {
    if (!dragging && !event.dataTransfer.types.includes(TAB_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDrop(indexAt(event));
  };
  const onDrop = (event: DragEvent) => {
    let payload = dragging;
    try { payload ??= JSON.parse(event.dataTransfer.getData(TAB_MIME)) as { path: string; from: number }; } catch { /* not a tab */ }
    setDrop(null);
    if (!payload || !onMove) return;
    event.preventDefault();
    let index = indexAt(event);
    if (payload.from === group && tabs.indexOf(payload.path) < index) index--;
    onMove(payload.path, payload.from, group, index);
    dragging = null;
  };
  const endDrag = () => { dragging = null; setSource(null); setDrop(null); };

  const split = groupCount > 1;
  const listLabel = split ? `Open files, group ${group + 1}` : 'Open files';
  const dropIndex = drop === null ? null : drop >= tabs.length ? visible.length : Math.max(0, visible.indexOf(tabs[drop]));

  return (
    <div ref={stripRef} className={cx(styles.editorTabs, split && styles.groupStrip, focused && split && styles.groupFocused)}
      onMouseDownCapture={() => { if (!focused) onFocusGroup?.(); }}
      onFocusCapture={() => { if (!focused) onFocusGroup?.(); }}
      onDragOver={onMove ? onDragOver : undefined} onDrop={onMove ? onDrop : undefined} onDragLeave={(e) => { if (!stripRef.current?.contains(e.relatedTarget as Node)) setDrop(null); }}
      data-group={group}>
      {leading}
      <div className={styles.editorTabScroll}>
        <div ref={listRef} role="list" aria-label={listLabel} className={styles.editorTabList} onKeyDown={onListKey}>
          {visible.map((path, i) => {
            const isDirty = dirty.has(path);
            const isActive = path === active;
            const name = base(path);
            return (
              <div key={path} role="listitem" data-path={path}
                className={cx(styles.editorTab, isActive && styles.activeTab, isActive && !focused && styles.activeTabNeutral, isDirty && styles.dirtyTab, source === path && styles.dragSource, dropIndex === i && styles.dropBefore)}
                draggable={!!onMove} onDragStart={(e) => onDragStart(e, path)} onDragEnd={endDrag}
                onAuxClick={(e) => { if (e.button === 1) { e.preventDefault(); onClose(path); } }}
                onMouseDown={(e) => { if (e.button === 1) e.preventDefault(); }}>
                <button
                  type="button"
                  aria-current={isActive ? 'true' : undefined}
                  tabIndex={isActive ? 0 : -1}
                  title={path}
                  aria-label={isDirty ? `${name}, unsaved` : name}
                  className={styles.editorTabLabel}
                  onClick={() => onSelect(path)}
                  onKeyDown={(e) => onTabKey(e, path)}
                >
                  {name}
                </button>
                {isDirty && <span className={styles.tabDot} data-testid="dirty-dot" aria-hidden="true" />}
                <button type="button" className={styles.tabClose} aria-label={`Close ${name}`} title={`Close ${name}`} onClick={() => onClose(path)}>
                  {IconProvider.getIcon('decline', { 'aria-hidden': "true" })}
                </button>
              </div>
            );
          })}
          {dropIndex === visible.length && <div className={styles.dropEnd} aria-hidden="true" />}
        </div>
      </div>
      <div className={styles.overflow} ref={menuRef}>
        {hidden.length > 0 && (
          <>
            <button type="button" className={styles.overflowButton} aria-haspopup="menu" aria-expanded={menu === 'overflow'}
              aria-label={`${hidden.length} more open ${hidden.length === 1 ? 'file' : 'files'}`} title="More open files"
              onClick={() => setMenu((m) => (m === 'overflow' ? null : 'overflow'))}>
              {IconProvider.getIcon('slim-arrow-down', { 'aria-hidden': "true" })}+{hidden.length}
            </button>
            {menu === 'overflow' && (
              <StripMenu label="More open files" onClose={() => setMenu(null)} items={[
                ...hidden.map((path) => ({ id: path, label: <>{base(path)}{dirty.has(path) && <span className={styles.tabDot} aria-label="unsaved" />}</>, onSelect: () => { onSelect(path); focusTab(path); } })),
                ...(onCloseAll ? [{ id: '__close-all', label: 'Close all tabs in group', onSelect: onCloseAll, separatorBefore: true }] : []),
              ]} />
            )}
          </>
        )}
        {onSplit && (
          <button type="button" className={styles.overflowButton} aria-label="Split editor right" title="Split editor right (Ctrl+\)" onClick={onSplit}>
            {IconProvider.getIcon('screen-split-two', { 'aria-hidden': "true" })}
          </button>
        )}
        {onCloseAll && (
          <>
            <button type="button" className={styles.overflowButton} aria-haspopup="menu" aria-expanded={menu === 'actions'} aria-label={split ? `Group ${group + 1} actions` : 'Editor actions'}
              title="Group actions" onClick={() => setMenu((m) => (m === 'actions' ? null : 'actions'))}>
              {IconProvider.getIcon('overflow', { 'aria-hidden': "true" })}
            </button>
            {menu === 'actions' && (
              <StripMenu label={split ? `Group ${group + 1} actions` : 'Editor actions'} onClose={() => setMenu(null)} items={[
                ...(onCloseOthers && tabs.length > 1 ? [{ id: 'others', label: 'Close other tabs', onSelect: () => onCloseOthers(active) }] : []),
                ...(onMove && split ? [{ id: 'move', label: `Move tab to group ${group === 0 ? 2 : 1}`, onSelect: () => onMove(active, group, group === 0 ? 1 : 0, Number.MAX_SAFE_INTEGER) }] : []),
                { id: 'close-all', label: 'Close all tabs in group', onSelect: onCloseAll },
              ]} />
            )}
          </>
        )}
      </div>
      {trailing}
    </div>
  );
}
