import { forwardRef } from 'react';
import { currencyDigits } from '../../utilities/number';
import { useControllableState } from '../../hooks/useControllableState';
import { LocaleNumberField } from './LocaleNumberField';
import type { InputProps } from '../input';
import styles from './AmountInput.module.css';

export interface AmountInputLabels {
  /** Accessible name of the currency select. */
  currency: string;
  /** Error for text that is not a number in the user's locale. */
  invalid: string;
  /** Error for values outside min/max. */
  range: (min?: number, max?: number) => string;
}

export interface AmountInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'endAdornment'> {
  /** Amount; `null` when empty. Providing it makes the amount controlled. */
  value?: number | null;
  /** Initial amount when uncontrolled. @default null */
  defaultValue?: number | null;
  /** Called with the committed amount (after blur or Enter), rounded to the currency's minor unit. */
  onChange?: (value: number | null) => void;
  /** ISO 4217 currency code, e.g. `EUR`. Providing it makes the currency controlled. */
  currency?: string;
  /** Initial currency when uncontrolled. @default 'EUR' */
  defaultCurrency?: string;
  /** Called with the new currency code. */
  onCurrencyChange?: (currency: string) => void;
  /** Currencies to choose from. Without it the currency is shown as fixed text. */
  currencies?: string[];
  /** Locale for grouping and decimal separators, e.g. `de-DE`. Defaults to the browser locale. */
  locale?: string;
  /** Smallest allowed amount. */
  min?: number;
  /** Largest allowed amount. */
  max?: number;
  /** Overrides for the built-in strings. */
  labels?: Partial<AmountInputLabels>;
}

const defaultLabels: AmountInputLabels = {
  currency: 'Currency',
  invalid: 'Enter a valid amount.',
  range: (min, max) => (min !== undefined && max !== undefined ? `Enter an amount from ${min} to ${max}.` : min !== undefined ? `Enter ${min} or more.` : `Enter ${max} or less.`),
};

/**
 * A money amount with its currency. Accepts input in the user's locale (1.234,56 in German),
 * rounds to the currency's minor unit (JPY 0, EUR 2, KWD 3) and shows grouping after entry.
 */
export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(function AmountInput(
  { currency: currencyProp, defaultCurrency = 'EUR', onCurrencyChange, currencies, locale, labels: labelOverrides, disabled, readOnly, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const [currency, setCurrency] = useControllableState(currencyProp, defaultCurrency, onCurrencyChange);
  const end = currencies?.length ? (
    <select className={styles.unitSelect} aria-label={labels.currency} value={currency} disabled={disabled || readOnly} onChange={(e) => setCurrency(e.target.value)}>
      {currencies.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  ) : (
    <span className={styles.unit}>{currency}</span>
  );
  return (
    <LocaleNumberField
      ref={ref}
      {...rest}
      disabled={disabled}
      readOnly={readOnly}
      locale={locale}
      decimals={currencyDigits(currency, locale)}
      invalidMessage={labels.invalid}
      rangeMessage={labels.range}
      end={end}
    />
  );
});
