import { forwardRef, useEffect, useRef, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useMergedRefs } from '../../utilities/refs';
import { Portal } from '../../utilities/Portal';
import floating from '../popover/Floating.module.css';
import type { SelectOption } from './types';
import styles from './Listbox.module.css';

export interface ListboxPopupProps {
  id: string;
  options: SelectOption[];
  activeIndex: number;
  isSelected: (option: SelectOption) => boolean;
  onSelect: (option: SelectOption, index: number) => void;
  onActiveChange: (index: number) => void;
  dir?: 'ltr' | 'rtl' | 'auto';
  lang?: string;
  multiple?: boolean;
  labelledBy?: string;
  'aria-label'?: string;
  style: React.CSSProperties;
  emptyText?: ReactNode;
  /** Text to highlight in option labels. */
  highlight?: string;
}

export const optionId = (listId: string, index: number) => `${listId}-option-${index}`;

function highlightLabel(label: string, query?: string): ReactNode {
  if (!query) return label;
  const index = label.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  if (index < 0) return label;
  return (
    <>
      {label.slice(0, index)}
      <mark className={styles.mark}>{label.slice(index, index + query.length)}</mark>
      {label.slice(index + query.length)}
    </>
  );
}

/** Internal: the floating `role="listbox"` used by select-like controls. Focus stays on the combobox. */
export const ListboxPopup = forwardRef<HTMLUListElement, ListboxPopupProps>(function ListboxPopup(
  { id, options, activeIndex, isSelected, onSelect, onActiveChange, multiple, dir, lang, labelledBy, 'aria-label': ariaLabel, style, emptyText = 'No matches', highlight },
  ref,
) {
  const listRef = useRef<HTMLUListElement>(null);
  const merged = useMergedRefs(ref, listRef);

  useEffect(() => {
    if (activeIndex < 0) return;
    const el = listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(optionId(id, activeIndex))}`);
    el?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex, id]);

  const renderOption = (option: SelectOption, index: number) => {
    const selected = isSelected(option);
    return (
      <li
        key={option.value}
        id={optionId(id, index)}
        role="option"
        aria-label={option.content ? option.label : undefined}
        aria-selected={selected}
        aria-disabled={option.disabled || undefined}
        className={cx(styles.option, index === activeIndex && styles.active)}
        onMouseDown={(event) => event.preventDefault()}
        onMouseMove={() => index !== activeIndex && !option.disabled && onActiveChange(index)}
        onClick={() => !option.disabled && onSelect(option, index)}
      >
        {multiple && (
          <span className={styles.check} aria-hidden="true">
            {selected && <Check />}
          </span>
        )}
        {option.icon && (
          <span className={styles.icon} aria-hidden="true">
            {option.icon}
          </span>
        )}
        <span className={styles.text}>
          <span className={styles.label}>{option.content ?? highlightLabel(option.label, highlight)}</span>
          {option.description && <span className={styles.description}> {option.description}</span>}
        </span>
      </li>
    );
  };

  // Group consecutive options that share a `group`.
  const blocks: Array<{ group?: string; groupAccessibleName?: string; items: Array<{ option: SelectOption; index: number }> }> = [];
  options.forEach((option, index) => {
    const last = blocks[blocks.length - 1];
    if (last && last.group === option.group) last.items.push({ option, index });
    else blocks.push({ group: option.group, groupAccessibleName: option.groupAccessibleName, items: [{ option, index }] });
  });

  return (
    <Portal>
      <ul
        ref={merged}
        id={id}
        role="listbox"
        dir={dir}
        lang={lang}
        aria-labelledby={labelledBy}
        aria-label={ariaLabel}
        aria-multiselectable={multiple || undefined}
        tabIndex={-1}
        className={cx(floating.floating, styles.listbox)}
        style={style}
      >
        {options.length === 0 && (
          <li role="presentation" className={styles.empty}>
            {emptyText}
          </li>
        )}
        {blocks.map((block, b) =>
          block.group ? (
            <li key={`g-${b}`} role="presentation">
              <div id={`${id}-group-${b}`} className={styles.groupLabel} aria-hidden="true">
                {block.group}
              </div>
              <ul
                role="group"
                aria-labelledby={block.groupAccessibleName && block.groupAccessibleName !== block.group ? undefined : `${id}-group-${b}`}
                aria-label={block.groupAccessibleName && block.groupAccessibleName !== block.group ? block.groupAccessibleName : undefined}
                className={styles.group}
              >
                {block.items.map(({ option, index }) => renderOption(option, index))}
              </ul>
            </li>
          ) : (
            block.items.map(({ option, index }) => renderOption(option, index))
          ),
        )}
      </ul>
    </Portal>
  );
});
