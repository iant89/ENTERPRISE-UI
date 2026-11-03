import { forwardRef, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { useMergedRefs } from '../../utilities/refs';
import { useControllableState } from '../../hooks/useControllableState';
import { useFormControl, type FieldProps } from '../form-field';
import { Avatar } from '../avatar';
import styles from './MentionInput.module.css';

export interface MentionPerson {
  id: string;
  name: string;
  /** Secondary line, e.g. role or email. */
  description?: string;
  /** Avatar image URL. */
  avatar?: string;
}

export interface MentionInputLabels {
  suggestions: string;
  noMatches: string;
  /** Announced when the list opens. */
  available: (count: number) => string;
}

export interface MentionInputProps extends FieldProps {
  /** Text. Providing it makes the input controlled. */
  value?: string;
  /** Initial text when uncontrolled. @default '' */
  defaultValue?: string;
  /** Called with the text and the people mentioned in it. */
  onChange?: (text: string, mentions: MentionPerson[]) => void;
  /** People who can be mentioned (filtered locally). */
  people?: MentionPerson[];
  /** Server lookup instead of `people`; called with the text after the trigger. */
  fetchPeople?: (query: string, signal: AbortSignal) => Promise<MentionPerson[]>;
  /** Character that starts a mention. @default '@' */
  trigger?: string;
  /** Visible rows. @default 3 */
  rows?: number;
  /** Placeholder text. */
  placeholder?: string;
  /** Required field. @default false */
  required?: boolean;
  /** Disabled field. @default false */
  disabled?: boolean;
  /** Id of the textarea. */
  id?: string;
  /** Overrides for the built-in strings. */
  labels?: Partial<MentionInputLabels>;
}

const defaultLabels: MentionInputLabels = {
  suggestions: 'People',
  noMatches: 'No matching people',
  available: (n) => `${n} ${n === 1 ? 'person' : 'people'} available. Use the up and down arrows to choose.`,
};

/** Finds the mention being typed: the trigger at a word start, followed by name characters up to the caret. */
function activeQuery(text: string, caret: number, trigger: string): { start: number; query: string } | null {
  const before = text.slice(0, caret);
  const at = before.lastIndexOf(trigger);
  if (at < 0) return null;
  if (at > 0 && !/\s/.test(before[at - 1])) return null;
  const query = before.slice(at + trigger.length);
  if (/[\n@]/.test(query) || query.length > 30 || /\s{2}/.test(query)) return null;
  return { start: at, query };
}

/** Mentioned people: every listed person whose `@Name` appears in the text. */
export function findMentions(text: string, people: MentionPerson[], trigger = '@'): MentionPerson[] {
  return people.filter((p) => text.includes(`${trigger}${p.name}`));
}

/**
 * A comment field where typing `@` suggests people to mention, as in collaboration feeds. While
 * suggestions show, the arrow keys move through them, Enter or Tab inserts and Escape closes.
 */
export const MentionInput = forwardRef<HTMLTextAreaElement, MentionInputProps>(function MentionInput(
  { value, defaultValue = '', onChange, people = [], fetchPeople, trigger = '@', rows = 3, placeholder, labels: labelOverrides,
    label, description, error, status, statusMessage, hideLabel, labelPosition, required, disabled, id },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const control = useFormControl({ label, description, error, status, statusMessage, hideLabel, labelPosition, id, required, disabled });
  const listId = useId(undefined, 'mentions');
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const merged = useMergedRefs(ref, areaRef);
  const [text, setText] = useControllableState(value, defaultValue);
  const [query, setQuery] = useState<{ start: number; query: string } | null>(null);
  const [remote, setRemote] = useState<MentionPerson[]>([]);
  const [active, setActive] = useState(0);
  const known = useRef(new Map<string, MentionPerson>());
  people.forEach((p) => known.current.set(p.id, p));

  const matches = useMemo(() => {
    if (!query) return [];
    if (fetchPeople) return remote;
    const q = query.query.toLowerCase().trim();
    // Match the start of any word in the name or description ("na" finds Priya Natarajan), like chat tools do.
    const words = (text?: string) => (text ?? '').toLowerCase().split(/[\s.@_-]+/);
    return people.filter((p) => !q || p.name.toLowerCase().startsWith(q) || [...words(p.name), ...words(p.description)].some((w) => w.startsWith(q))).slice(0, 8);
  }, [query, people, fetchPeople, remote]);

  useEffect(() => {
    if (!fetchPeople || !query) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchPeople(query.query, controller.signal)
        .then((list) => {
          if (controller.signal.aborted) return;
          list.forEach((p) => known.current.set(p.id, p));
          setRemote(list.slice(0, 8));
        })
        .catch(() => setRemote([]));
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query?.query, query?.start]);

  const open = !!query && (matches.length > 0 || query.query.length > 0);

  const emit = (next: string) => {
    setText(next);
    onChange?.(next, findMentions(next, [...known.current.values()], trigger));
  };

  const sync = (next: string, caret: number) => {
    const q = activeQuery(next, caret, trigger);
    setQuery(q);
    setActive(0);
  };

  const insert = (person: MentionPerson) => {
    if (!query) return;
    const caret = areaRef.current?.selectionStart ?? text.length;
    const mention = `${trigger}${person.name} `;
    const next = text.slice(0, query.start) + mention + text.slice(caret);
    emit(next);
    setQuery(null);
    const pos = query.start + mention.length;
    requestAnimationFrame(() => {
      areaRef.current?.focus();
      areaRef.current?.setSelectionRange(pos, pos);
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open || !matches.length) {
      if (event.key === 'Escape' && query) setQuery(null);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((a) => (a + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length);
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      insert(matches[active]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setQuery(null);
    }
  };

  return control.wrap(
    <div className={styles.root}>
      <textarea
        ref={merged}
        id={control.id}
        className={cx(styles.area, control.status !== 'none' && styles[control.status])}
        rows={rows}
        value={text}
        placeholder={placeholder}
        disabled={control.disabled}
        required={control.required}
        // A textarea cannot take the combobox role; aria-autocomplete, aria-controls and aria-activedescendant link the suggestions.
        aria-autocomplete="list"
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && matches[active] ? `${listId}-${matches[active].id}` : undefined}
        {...control.ariaProps}
        onChange={(e) => {
          emit(e.target.value);
          sync(e.target.value, e.target.selectionStart ?? e.target.value.length);
        }}
        onKeyDown={onKeyDown}
        onClick={(e) => sync(e.currentTarget.value, e.currentTarget.selectionStart ?? 0)}
        onBlur={() => setTimeout(() => setQuery(null), 150)}
      />
      {open && (
        <ul id={listId} className={styles.list} role="listbox" aria-label={labels.suggestions}>
          {matches.length === 0 ? (
            <li className={styles.empty} role="presentation">
              {labels.noMatches}
            </li>
          ) : (
            matches.map((p, i) => (
              <li
                key={p.id}
                id={`${listId}-${p.id}`}
                role="option"
                aria-selected={i === active}
                className={cx(styles.option, i === active && styles.active)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insert(p)}
              >
                <Avatar name={p.name} src={p.avatar} size="xs" decorative />
                <span className={styles.text}>
                  <span>{p.name}</span>
                  {p.description && <span className={styles.description}>{p.description}</span>}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
      <span className="eui-visually-hidden" aria-live="polite">
        {open && matches.length ? labels.available(matches.length) : ''}
      </span>
    </div>,
  );
});
