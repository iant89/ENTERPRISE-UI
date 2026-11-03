import { useEffect, useMemo, useState } from 'react';
import { Dialog } from '../../components/dialog';
import { Kbd } from '../../components/kbd';
import styles from './KeyboardShortcutsDialog.module.css';

export interface Shortcut {
  /** Key combinations; several mean alternatives (e.g. `['Mod+S']` or `['J', 'ArrowDown']`). */
  keys: string[];
  /** What it does, e.g. "Save". */
  description: string;
}

export interface ShortcutGroup {
  title: string;
  shortcuts: Shortcut[];
}

export interface KeyboardShortcutsLabels {
  title: string;
  search: string;
  noMatches: string;
  or: string;
}

export interface KeyboardShortcutsDialogProps {
  /** Shortcuts grouped by area. */
  groups: ShortcutGroup[];
  /** Whether the dialog is open. Without it, the dialog manages itself with `hotkey`. */
  open?: boolean;
  /** Called with the new open state. */
  onOpenChange?: (open: boolean) => void;
  /** Key that opens the dialog when focus is not in a text field; `null` turns it off. @default '?' */
  hotkey?: string | null;
  /** Shows Apple (`mac`) or other key names. Defaults to the device. */
  platform?: 'mac' | 'other';
  /** Overrides for the built-in strings. */
  labels?: Partial<KeyboardShortcutsLabels>;
}

const defaultLabels: KeyboardShortcutsLabels = { title: 'Keyboard shortcuts', search: 'Search shortcuts', noMatches: 'No shortcuts match.', or: 'or' };

const isTyping = (el: Element | null) => !!el && (el.matches('input, textarea, select, [contenteditable=""], [contenteditable="true"]') || el.getAttribute('role') === 'textbox');

/** Lists the application's keyboard shortcuts, searchable, and opens with `?` like most web apps. */
export function KeyboardShortcutsDialog({ groups, open: openProp, onOpenChange, hotkey = '?', platform, labels: labelOverrides }: KeyboardShortcutsDialogProps) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const [own, setOwn] = useState(false);
  const open = openProp ?? own;
  const setOpen = (o: boolean) => {
    if (openProp === undefined) setOwn(o);
    onOpenChange?.(o);
  };
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: KeyboardEvent) => {
      // A single-character shortcut must not fire while typing (WCAG 2.1.4).
      if (e.key !== hotkey || e.ctrlKey || e.metaKey || e.altKey || isTyping(document.activeElement)) return;
      e.preventDefault();
      if (openProp === undefined) setOwn(true);
      onOpenChange?.(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hotkey, openProp, onOpenChange]);

  const q = query.trim().toLowerCase();
  const shown = useMemo(
    () => groups.map((g) => ({ ...g, shortcuts: g.shortcuts.filter((s) => !q || s.description.toLowerCase().includes(q) || s.keys.join(' ').toLowerCase().includes(q)) })).filter((g) => g.shortcuts.length),
    [groups, q],
  );

  return (
    <Dialog open={open} onClose={() => setOpen(false)} title={labels.title} size="md">
      <div className={styles.body}>
        <input type="search" className={styles.search} placeholder={labels.search} aria-label={labels.search} value={query} onChange={(e) => setQuery(e.target.value)} />
        {shown.length === 0 && <p className={styles.empty}>{labels.noMatches}</p>}
        {shown.map((g) => (
          <section key={g.title} className={styles.group} aria-label={g.title}>
            <h3 className={styles.groupTitle}>{g.title}</h3>
            <dl className={styles.list}>
              {g.shortcuts.map((s) => (
                <div key={s.description} className={styles.row}>
                  <dt className={styles.description}>{s.description}</dt>
                  <dd className={styles.keys}>
                    {s.keys.map((k, i) => (
                      <span key={k} className={styles.alt}>
                        {i > 0 && <span className={styles.or}>{labels.or}</span>}
                        <Kbd keys={k} platform={platform} />
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Dialog>
  );
}
