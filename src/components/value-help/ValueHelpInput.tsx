import { useState } from 'react';
import { IconProvider } from '../../icons';
import { useControllableState } from '../../hooks/useControllableState';
import { Input, type InputProps } from '../input';
import { Tokenizer } from '../token';
import { ValueHelpDialog, type ValueHelpDialogProps } from './ValueHelpDialog';
import styles from './ValueHelp.module.css';

export interface ValueHelpInputProps<T>
  extends Omit<ValueHelpDialogProps<T>, 'open' | 'onClose' | 'onConfirm' | 'defaultSelected' | 'initialSearch'>,
    Omit<InputProps, 'value' | 'defaultValue' | 'onChange' | 'title' | 'type'> {
  /** Field label. */
  label: string;
  /** Selected items. Providing it makes the selection controlled. */
  value?: T[];
  /** Initial selection when uncontrolled. @default [] */
  defaultValue?: T[];
  /** Called with the new selection. */
  onChange?: (items: T[]) => void;
  /** Accessible name of the open button. Defaults to the dialog title. */
  openLabel?: string;
}

/**
 * A field with a value help: the button or F4 opens a ValueHelpDialog. Single selection shows the
 * chosen item as text; multiple selection shows removable tokens.
 */
export function ValueHelpInput<T>({
  label, value, defaultValue = [], onChange, openLabel, title, columns, getKey, getLabel, items, fetchItems, filters, selectionMode = 'single', labels, disabled, readOnly, ...inputProps
}: ValueHelpInputProps<T>) {
  const [selected, setSelected] = useControllableState(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const multiple = selectionMode === 'multiple';
  const text = !multiple && selected[0] ? getLabel(selected[0]) : typed;

  return (
    <div className={styles.field}>
      <Input
        {...inputProps}
        label={label}
        disabled={disabled}
        readOnly={readOnly}
        value={text}
        aria-haspopup="dialog"
        aria-keyshortcuts="F4"
        onChange={(e) => {
          setTyped(e.target.value);
          if (!multiple && selected.length) setSelected([]);
        }}
        onKeyDown={(e) => {
          if (e.key === 'F4' && !disabled && !readOnly) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        endAdornment={
          <button type="button" className={styles.openButton} aria-label={openLabel ?? title} title={`${openLabel ?? title} (F4)`} disabled={disabled || readOnly} onClick={() => setOpen(true)}>
            {IconProvider.getIcon('filter-fields', { 'aria-hidden': "true" })}
          </button>
        }
      />
      {multiple && selected.length > 0 && (
        <Tokenizer
          aria-label={label}
          readOnly={readOnly}
          disabled={disabled}
          tokens={selected.map((s) => ({ id: getKey(s), text: getLabel(s) }))}
          onTokenDelete={(key) => setSelected(selected.filter((s) => getKey(s) !== key))}
        />
      )}
      <ValueHelpDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={(chosen) => {
          setSelected(chosen);
          setTyped('');
          setOpen(false);
        }}
        title={title}
        columns={columns}
        getKey={getKey}
        getLabel={getLabel}
        items={items}
        fetchItems={fetchItems}
        filters={filters}
        selectionMode={selectionMode}
        defaultSelected={selected}
        initialSearch={typed}
        labels={labels}
      />
    </div>
  );
}
