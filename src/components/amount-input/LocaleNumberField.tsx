import { forwardRef, useEffect, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { formatLocaleNumber, parseLocaleNumber } from '../../utilities/number';
import { Input, type InputProps } from '../input';

export interface LocaleNumberFieldProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange' | 'type' | 'inputMode' | 'min' | 'max'> {
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  locale?: string;
  /** Fixed number of decimals (rounded on commit), e.g. 2 for EUR. */
  decimals?: number;
  min?: number;
  max?: number;
  /** Shown when the text cannot be read as a number. */
  invalidMessage: string;
  /** Shown when the value is outside min/max. */
  rangeMessage?: (min?: number, max?: number) => string;
  /** Content after the number (currency or unit control). */
  end?: ReactNode;
}

/** Text input that commits locale-formatted numbers on blur or Enter. Shared by AmountInput and QuantityInput. */
export const LocaleNumberField = forwardRef<HTMLInputElement, LocaleNumberFieldProps>(function LocaleNumberField(
  { value, defaultValue = null, onChange, locale, decimals, min, max, invalidMessage, rangeMessage, end, error, onBlur, onKeyDown, onFocus, ...rest },
  ref,
) {
  const [current, setCurrent] = useControllableState<number | null>(value, defaultValue, onChange);
  const display = (n: number | null) => formatLocaleNumber(n, locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const [text, setText] = useState(() => display(current));
  const [focused, setFocused] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  // Follow outside changes (and decimal/locale changes, e.g. switching currency) when not typing.
  useEffect(() => {
    if (!focused) setText(display(current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, decimals, locale, focused]);

  const commit = () => {
    const parsed = parseLocaleNumber(text, locale);
    if (parsed === null) {
      setProblem(null);
      setCurrent(null);
      setText('');
      return;
    }
    if (Number.isNaN(parsed)) {
      setProblem(invalidMessage);
      return;
    }
    const rounded = decimals !== undefined ? Number(parsed.toFixed(decimals)) : parsed;
    if ((min !== undefined && rounded < min) || (max !== undefined && rounded > max)) {
      setProblem(rangeMessage?.(min, max) ?? invalidMessage);
      return;
    }
    setProblem(null);
    setCurrent(rounded);
    setText(display(rounded));
  };

  return (
    <Input
      ref={ref}
      {...rest}
      type="text"
      inputMode={decimals === 0 ? 'numeric' : 'decimal'}
      autoComplete="off"
      value={text}
      error={problem ?? error}
      style={{ textAlign: 'end', ...rest.style }}
      endAdornment={end}
      onChange={(event: ChangeEvent<HTMLInputElement>) => setText(event.target.value)}
      onFocus={(event: FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event: FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        commit();
        onBlur?.(event);
      }}
      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') commit();
        onKeyDown?.(event);
      }}
    />
  );
});
