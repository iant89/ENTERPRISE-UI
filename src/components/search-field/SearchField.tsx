import { forwardRef, useRef, type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useMergedRefs } from '../../utilities/refs';
import { useControllableState } from '../../hooks/useControllableState';
import { useFormControl, type FieldProps } from '../form-field';
import styles from '../input/InputBox.module.css';
import { Spinner } from '../spinner';

export interface SearchFieldProps
  extends FieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size' | 'type'> {
  value?: string;
  /** @default '' */
  defaultValue?: string;
  /** Called on every keystroke. */
  onChange?: (value: string) => void;
  /** Called when the user presses Enter. */
  onSearch?: (value: string) => void;
  /** Called after the clear button or Escape empties the field. */
  onClear?: () => void;
  /** Show a busy indicator, e.g. while results load. @default false */
  loading?: boolean;
  /** Accessible label for the clear button. @default 'Clear search' */
  clearLabel?: string;
  /** Accessible label for the busy indicator. @default 'Searching' */
  loadingLabel?: string;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label when no visible `label` is given. @default 'Search' */
  'aria-label'?: string;
}

/** Text input for search with a search icon, clear button and Enter-to-search. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  {
    label, description, error, status, statusMessage, hideLabel, labelPosition,
    value, defaultValue = '', onChange, onSearch, onClear, loading = false, clearLabel = 'Clear search', loadingLabel = 'Searching', size = 'md',
    id, disabled, required, className, placeholder = 'Search', onKeyDown, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, ...rest
  },
  ref,
) {
  const control = useFormControl({ label, description, error, status, statusMessage, hideLabel, labelPosition, id, required, disabled, 'aria-describedby': ariaDescribedBy });
  const [text, setText] = useControllableState(value, defaultValue, onChange);
  const inputRef = useRef<HTMLInputElement>(null);
  const merged = useMergedRefs(ref, inputRef);

  const clear = () => {
    setText('');
    onClear?.();
    inputRef.current?.focus();
  };

  return control.wrap(
    <div
      className={cx(styles.box, styles.withStart, size !== 'md' && styles[size], control.status !== 'none' && styles[control.status], control.disabled && styles.disabled)}
    >
      <span className={cx(styles.adornment, styles.startAdornment)} aria-hidden="true">
        <Search />
      </span>
      <input
        ref={merged}
        id={control.id}
        type="search"
        role="searchbox"
        aria-label={label == null ? ariaLabel ?? 'Search' : undefined}
        className={cx(styles.input, className)}
        value={text}
        placeholder={placeholder}
        disabled={control.disabled}
        required={control.required}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === 'Enter') onSearch?.(text);
          if (event.key === 'Escape' && text) {
            event.preventDefault();
            event.stopPropagation();
            clear();
          }
        }}
        {...control.ariaProps}
        {...rest}
      />
      {loading && <Spinner size="sm" label={loadingLabel} />}
      {text && !control.disabled && (
        <button type="button" className={styles.fieldButton} aria-label={clearLabel} onClick={clear}>
          <X aria-hidden="true" />
        </button>
      )}
    </div>,
  );
});
