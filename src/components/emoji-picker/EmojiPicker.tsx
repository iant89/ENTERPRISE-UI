import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { IconButton } from '../icon-button';
import { Popover } from '../popover';
import { SearchField } from '../search-field';
import type { ButtonSize, ButtonVariant } from '../button';
import type { IconSource } from '../../icons/IconSource';
import type { Placement } from '../../utilities/types';
import { DEFAULT_EMOJI_GROUPS, type EmojiGroup } from './emojiGroups';
import styles from './EmojiPicker.module.css';

export interface EmojiPickerLabels {
  /** Accessible name of the popover. */
  dialog: string;
  /** Accessible name of the search field. */
  search: string;
  /** Placeholder of the search field. */
  placeholder: string;
  /** Shown when nothing matches the search. */
  noMatch: (query: string) => string;
}

const defaultLabels: EmojiPickerLabels = {
  dialog: 'Emoji',
  search: 'Search emoji',
  placeholder: 'Search: clock, fix, party…',
  noMatch: (q) => `No emoji match “${q}”.`,
};

export interface EmojiPickerProps {
  /** Called with the chosen emoji. Insert it with `insertTextAtCursor` to keep the caret position of a field. */
  onSelect: (emoji: string) => void;
  /** Accessible name and tooltip of the trigger button. @default 'Insert emoji' */
  label?: string;
  /** Icon of the trigger button. @default 'add' */
  icon?: IconSource;
  /** Visual emphasis of the trigger button. @default 'tertiary' */
  variant?: ButtonVariant;
  /** Size of the trigger button. @default 'md' */
  size?: ButtonSize;
  /** Disables the trigger. @default false */
  disabled?: boolean;
  /** The emoji offered, in groups. @default DEFAULT_EMOJI_GROUPS */
  groups?: readonly EmojiGroup[];
  /** Closes the picker after an emoji is chosen; by default it stays open for more. @default false */
  closeOnSelect?: boolean;
  /** Where the popover opens. @default 'bottom-end' */
  placement?: Placement;
  /** Columns of the emoji grid (six on touch screens, for larger targets). @default 8 */
  columns?: number;
  /** Overrides the strings. */
  labels?: Partial<EmojiPickerLabels>;
}

/**
 * A button that opens a searchable grid of emoji, for adding one to a message or a
 * title. Each emoji has a name, used for search and read by screen readers. Escape
 * closes only the picker, not a dialog it sits in.
 */
export function EmojiPicker({
  onSelect, label = 'Insert emoji', icon = 'add', variant = 'tertiary', size = 'md', disabled = false,
  groups = DEFAULT_EMOJI_GROUPS, closeOnSelect = false, placement = 'bottom-end', columns = 8, labels,
}: EmojiPickerProps) {
  const text = { ...defaultLabels, ...labels };
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const body = useRef<HTMLDivElement>(null);

  // Escape closes the picker only, not the dialog it is in (this capture listener runs first).
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      change(false);
    };
    document.addEventListener('keydown', key, true);
    return () => document.removeEventListener('keydown', key, true);
  }, [open]);

  const change = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery('');
  };

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.map((g) => ({ ...g, emoji: g.emoji.filter((e) => e.name.toLowerCase().includes(q) || e.emoji === q) })).filter((g) => g.emoji.length);
  }, [query, groups]);

  // Arrow keys move between emoji across the groups; Home and End go to the first and last.
  const move = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    const all = Array.from(body.current?.querySelectorAll<HTMLButtonElement>(`.${styles.emoji}`) ?? []);
    const at = all.indexOf(e.currentTarget);
    const grid = e.currentTarget.parentElement;
    const inGrid = Array.from(grid?.children ?? []);
    const first = inGrid[0] as HTMLElement | undefined;
    // Columns as laid out (fewer on touch screens); `columns` when layout is unknown.
    const perRow = first ? inGrid.filter((b) => (b as HTMLElement).offsetTop === first.offsetTop).length : columns;
    const step = perRow > 0 && perRow < inGrid.length ? perRow : columns;
    const to = { ArrowRight: at + 1, ArrowLeft: at - 1, ArrowDown: at + step, ArrowUp: at - step, Home: 0, End: all.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    all[Math.min(Math.max(0, to), all.length - 1)]?.focus();
  };

  return (
    <Popover
      trigger={<IconButton icon={icon} label={label} variant={variant} size={size} disabled={disabled} />}
      aria-label={text.dialog}
      placement={placement}
      width="19rem"
      open={open}
      onOpenChange={change}
    >
      <div ref={body} className={styles.picker} style={{ ['--_columns' as string]: columns }}>
        <SearchField aria-label={text.search} placeholder={text.placeholder} value={query} onChange={setQuery} size="sm" />
        {shown.length === 0 && <p className={styles.empty} role="status">{text.noMatch(query)}</p>}
        {shown.map((g) => (
          <section key={g.name} aria-label={g.name} className={styles.group}>
            <h3 className={styles.heading} aria-hidden="true">{g.name}</h3>
            <div className={styles.grid}>
              {g.emoji.map((e) => (
                <button
                  key={e.emoji}
                  type="button"
                  className={styles.emoji}
                  title={e.name}
                  aria-label={e.name}
                  onKeyDown={move}
                  onClick={() => { onSelect(e.emoji); if (closeOnSelect) change(false); }}
                >
                  {e.emoji}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Popover>
  );
}
