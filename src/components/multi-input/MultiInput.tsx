import { forwardRef, useState, type KeyboardEvent } from 'react';
import { cx } from '../../utilities/cx';
import { useControllableState } from '../../hooks/useControllableState';
import { Input, type InputProps } from '../input';
import { Tokenizer } from '../token';
import styles from './MultiInput.module.css';

export interface MultiInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> {
  /** Committed values. */
  value?: string[];
  /** @default [] */
  /** The initial value when the component is uncontrolled. */
  defaultValue?: string[];
  /** Called with the new value when the user changes it. */
  onChange?: (value: string[]) => void;
  /** Validates or normalizes typed text before it becomes a token; return null to reject. */
  parseValue?: (text: string) => string | null;
  /** Keys that commit the typed text. @default ['Enter', ','] */
  commitKeys?: string[];
  /** Accessible name for the token list. @default 'Selected values' */
  tokensLabel?: string;
  /** Localized delete-button name. */
  deleteLabel?: (text: string) => string;
  /** Suggested values offered through a native datalist. */
  suggestions?: string[];
}

/** Free-text entry of multiple values, each committed as a removable token. */
export const MultiInput = forwardRef<HTMLInputElement, MultiInputProps>(function MultiInput(
  { value, defaultValue = [], onChange, parseValue = (t) => t.trim() || null, commitKeys = ['Enter', ','], tokensLabel = 'Selected values', deleteLabel, suggestions, onKeyDown, onBlur, disabled, readOnly, className, id, ...rest },
  ref,
) {
  const [values, setValues] = useControllableState(value, defaultValue, onChange);
  const [text, setText] = useState('');
  const listId = suggestions?.length ? `${id ?? 'multi-input'}-suggestions` : undefined;
  const commit = () => {
    const parsed = parseValue(text);
    if (parsed == null) return false;
    if (!values.includes(parsed)) setValues([...values, parsed]);
    setText('');
    return true;
  };
  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (commitKeys.includes(event.key) && text.trim()) { event.preventDefault(); commit(); }
    else if (event.key === 'Backspace' && !text && values.length && !readOnly) setValues(values.slice(0, -1));
  };
  return (
    <div className={cx(styles.root, className)}>
      <Input
        ref={ref}
        id={id}
        value={text}
        disabled={disabled}
        readOnly={readOnly}
        list={listId}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        onBlur={(e) => { onBlur?.(e); if (text.trim()) commit(); }}
        {...rest}
      />
      {listId && <datalist id={listId}>{suggestions!.map((s) => <option key={s} value={s} />)}</datalist>}
      {values.length > 0 && (
        <Tokenizer
          aria-label={tokensLabel}
          className={styles.tokens}
          tokens={values.map((v) => ({ id: v, text: v }))}
          readOnly={readOnly}
          disabled={disabled}
          deleteLabel={deleteLabel}
          onTokenDelete={(v) => setValues(values.filter((x) => x !== v))}
        />
      )}
    </div>
  );
});
