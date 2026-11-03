import { forwardRef, useMemo, useState, type HTMLAttributes, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { useControllableState } from '../../hooks/useControllableState';
import { IconButton } from '../icon-button';
import styles from './DualListSelector.module.css';

export interface DualListOption {
  /** Unique value. */
  value: string;
  /** Visible label; also used for search. */
  label: string;
  /** Secondary line, e.g. a description or ID. */
  description?: ReactNode;
  /** Prevents moving the option either way (e.g. a mandatory column). */
  disabled?: boolean;
}

export interface DualListSelectorLabels {
  available: string;
  selected: string;
  search: (pane: string) => string;
  add: string;
  addAll: string;
  remove: string;
  removeAll: string;
  moveUp: string;
  moveDown: string;
  /** Count under each pane title. */
  count: (checked: number, total: number) => string;
  /** Polite announcement after moving. */
  moved: (count: number, pane: string) => string;
  empty: string;
  noMatches: string;
}

export interface DualListSelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** All options, in their natural order. */
  options: DualListOption[];
  /** Chosen values, in chosen order. Providing it makes the component controlled. */
  value?: string[];
  /** Initially chosen values when uncontrolled. @default [] */
  defaultValue?: string[];
  /** Called with the new chosen values (in order). */
  onChange?: (value: string[]) => void;
  /** Shows a filter field above each list. @default true */
  searchable?: boolean;
  /** Adds move up / move down for the chosen list, e.g. for column order. @default false */
  reorderable?: boolean;
  /** Height of each list. @default '16rem' */
  listHeight?: string;
  /** Disables the whole control. @default false */
  disabled?: boolean;
  /** Overrides for the built-in strings. */
  labels?: Partial<DualListSelectorLabels>;
}

const defaultLabels: DualListSelectorLabels = {
  available: 'Available',
  selected: 'Selected',
  search: (pane) => `Filter ${pane.toLowerCase()} items`,
  add: 'Add selected',
  addAll: 'Add all',
  remove: 'Remove selected',
  removeAll: 'Remove all',
  moveUp: 'Move up',
  moveDown: 'Move down',
  count: (checked, total) => `${checked} of ${total} checked`,
  moved: (count, pane) => `${count} ${count === 1 ? 'item' : 'items'} moved to ${pane}`,
  empty: 'No items',
  noMatches: 'No matching items',
};

interface PaneProps {
  id: string;
  title: string;
  items: DualListOption[];
  checked: Set<string>;
  onToggle: (value: string) => void;
  onToggleAll: (values: string[], on: boolean) => void;
  query: string;
  onQuery: (q: string) => void;
  searchable: boolean;
  disabled: boolean;
  height: string;
  labels: DualListSelectorLabels;
}

function Pane({ id, title, items, checked, onToggle, onToggleAll, query, onQuery, searchable, disabled, height, labels }: PaneProps) {
  const q = query.trim().toLowerCase();
  const visible = q ? items.filter((o) => o.label.toLowerCase().includes(q)) : items;
  const selectable = visible.filter((o) => !o.disabled);
  const checkedVisible = selectable.filter((o) => checked.has(o.value)).length;
  const all = selectable.length > 0 && checkedVisible === selectable.length;
  return (
    <section className={styles.pane} aria-labelledby={`${id}-title`}>
      <div className={styles.header}>
        <label className={styles.selectAll}>
          <input
            type="checkbox"
            checked={all}
            ref={(el) => {
              if (el) el.indeterminate = checkedVisible > 0 && !all;
            }}
            disabled={disabled || selectable.length === 0}
            onChange={(e) => onToggleAll(selectable.map((o) => o.value), e.target.checked)}
            aria-labelledby={`${id}-title`}
          />
          <span id={`${id}-title`} className={styles.title}>
            {title}
          </span>
        </label>
        <span className={styles.count}>{labels.count(checked.size, items.length)}</span>
      </div>
      {searchable && (
        <input type="search" className={styles.search} value={query} onChange={(e) => onQuery(e.target.value)} aria-label={labels.search(title)} placeholder={labels.search(title)} disabled={disabled} />
      )}
      <ul className={styles.list} style={{ height }} aria-labelledby={`${id}-title`}>
        {visible.length === 0 && <li className={styles.empty}>{items.length ? labels.noMatches : labels.empty}</li>}
        {visible.map((o) => (
          <li key={o.value}>
            <label className={cx(styles.option, checked.has(o.value) && styles.checked, (o.disabled || disabled) && styles.disabled)}>
              <input type="checkbox" checked={checked.has(o.value)} disabled={disabled || o.disabled} onChange={() => onToggle(o.value)} />
              <span className={styles.optionText}>
                <span>{o.label}</span>
                {o.description && <span className={styles.optionDescription}>{o.description}</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Choose (and optionally order) a subset from a long list by moving items between two panes. */
export const DualListSelector = forwardRef<HTMLDivElement, DualListSelectorProps>(function DualListSelector(
  { options, value, defaultValue = [], onChange, searchable = true, reorderable = false, listHeight = '16rem', disabled = false, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const id = useId(undefined, 'dual-list');
  const [chosen, setChosen] = useControllableState(value, defaultValue, onChange);
  const [checkedAvailable, setCheckedAvailable] = useState<Set<string>>(new Set());
  const [checkedChosen, setCheckedChosen] = useState<Set<string>>(new Set());
  const [queries, setQueries] = useState({ available: '', chosen: '' });
  const [message, setMessage] = useState('');

  const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options]);
  const chosenSet = new Set(chosen);
  const available = options.filter((o) => !chosenSet.has(o.value));
  const chosenItems = chosen.map((v) => byValue.get(v)).filter((o): o is DualListOption => !!o);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void) => (v: string) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setter(next);
  };
  const toggleAll = (set: Set<string>, setter: (s: Set<string>) => void) => (values: string[], on: boolean) => {
    const next = new Set(set);
    values.forEach((v) => (on ? next.add(v) : next.delete(v)));
    setter(next);
  };

  const movable = (items: DualListOption[]) => items.filter((o) => !o.disabled).map((o) => o.value);
  const add = (values: string[]) => {
    if (!values.length) return;
    // Keep the natural option order for newly added items.
    const ordered = options.filter((o) => values.includes(o.value)).map((o) => o.value);
    setChosen([...chosen, ...ordered]);
    setCheckedAvailable(new Set());
    setMessage(labels.moved(ordered.length, labels.selected));
  };
  const remove = (values: string[]) => {
    if (!values.length) return;
    setChosen(chosen.filter((v) => !values.includes(v)));
    setCheckedChosen(new Set());
    setMessage(labels.moved(values.length, labels.available));
  };
  const reorder = (direction: -1 | 1) => {
    const next = [...chosen];
    const indices = next.map((v, i) => (checkedChosen.has(v) ? i : -1)).filter((i) => i >= 0);
    const ordered = direction === -1 ? indices : [...indices].reverse();
    for (const i of ordered) {
      const j = i + direction;
      if (j < 0 || j >= next.length || checkedChosen.has(next[j])) continue;
      [next[i], next[j]] = [next[j], next[i]];
    }
    setChosen(next);
  };

  const checkedAvail = movable(available).filter((v) => checkedAvailable.has(v));
  const checkedSel = movable(chosenItems).filter((v) => checkedChosen.has(v));

  return (
    <div ref={ref} className={cx(styles.root, className)} role="group" {...rest}>
      <Pane
        id={`${id}-available`}
        title={labels.available}
        items={available}
        checked={new Set(checkedAvail)}
        onToggle={toggle(checkedAvailable, setCheckedAvailable)}
        onToggleAll={toggleAll(checkedAvailable, setCheckedAvailable)}
        query={queries.available}
        onQuery={(q) => setQueries((s) => ({ ...s, available: q }))}
        searchable={searchable}
        disabled={disabled}
        height={listHeight}
        labels={labels}
      />
      <div className={styles.actions}>
        <IconButton icon={<ChevronRight />} label={labels.add} variant="secondary" disabled={disabled || !checkedAvail.length} onClick={() => add(checkedAvail)} />
        <IconButton icon={<ChevronsRight />} label={labels.addAll} variant="tertiary" disabled={disabled || !movable(available).length} onClick={() => add(movable(available))} />
        <IconButton icon={<ChevronLeft />} label={labels.remove} variant="secondary" disabled={disabled || !checkedSel.length} onClick={() => remove(checkedSel)} />
        <IconButton icon={<ChevronsLeft />} label={labels.removeAll} variant="tertiary" disabled={disabled || !movable(chosenItems).length} onClick={() => remove(movable(chosenItems))} />
      </div>
      <div className={styles.chosen}>
        <Pane
          id={`${id}-selected`}
          title={labels.selected}
          items={chosenItems}
          checked={new Set(checkedSel)}
          onToggle={toggle(checkedChosen, setCheckedChosen)}
          onToggleAll={toggleAll(checkedChosen, setCheckedChosen)}
          query={queries.chosen}
          onQuery={(q) => setQueries((s) => ({ ...s, chosen: q }))}
          searchable={searchable}
          disabled={disabled}
          height={listHeight}
          labels={labels}
        />
        {reorderable && (
          <div className={styles.reorder}>
            <IconButton icon={<ArrowUp />} label={labels.moveUp} size="sm" disabled={disabled || !checkedSel.length} onClick={() => reorder(-1)} />
            <IconButton icon={<ArrowDown />} label={labels.moveDown} size="sm" disabled={disabled || !checkedSel.length} onClick={() => reorder(1)} />
          </div>
        )}
      </div>
      <span className="eui-visually-hidden" aria-live="polite">
        {message}
      </span>
    </div>
  );
});
