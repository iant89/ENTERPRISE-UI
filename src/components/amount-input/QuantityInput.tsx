import { forwardRef } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { LocaleNumberField } from './LocaleNumberField';
import type { InputProps } from '../input';
import styles from './AmountInput.module.css';

export interface UnitOfMeasure {
  /** Unit code, e.g. `KG`, `PC`, `M`. */
  code: string;
  /** Display name, e.g. "Kilogram". */
  label?: string;
  /** Decimal places allowed for this unit (0 for pieces). @default 3 */
  decimals?: number;
}

export interface QuantityInputLabels {
  /** Accessible name of the unit select. */
  unit: string;
  invalid: string;
  range: (min?: number, max?: number) => string;
}

export interface QuantityInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'endAdornment'> {
  /** Quantity; `null` when empty. Providing it makes the quantity controlled. */
  value?: number | null;
  /** Initial quantity when uncontrolled. @default null */
  defaultValue?: number | null;
  /** Called with the committed quantity, rounded to the unit's decimals. */
  onChange?: (value: number | null) => void;
  /** Units to choose from (a single unit is shown as fixed text). */
  units: UnitOfMeasure[];
  /** Selected unit code. Providing it makes the unit controlled. */
  unit?: string;
  /** Initial unit when uncontrolled. Defaults to the first unit. */
  defaultUnit?: string;
  /** Called with the new unit code. Converting the quantity is up to the application. */
  onUnitChange?: (unit: string) => void;
  /** Locale for grouping and decimal separators. */
  locale?: string;
  /** Smallest allowed quantity. @default 0 */
  min?: number;
  /** Largest allowed quantity. */
  max?: number;
  /** Overrides for the built-in strings. */
  labels?: Partial<QuantityInputLabels>;
}

const defaultLabels: QuantityInputLabels = {
  unit: 'Unit of measure',
  invalid: 'Enter a valid quantity.',
  range: (min, max) => (min !== undefined && max !== undefined ? `Enter a quantity from ${min} to ${max}.` : min !== undefined ? `Enter ${min} or more.` : `Enter ${max} or less.`),
};

/** A quantity with its unit of measure; decimals follow the unit (whole pieces, 3 decimals for kg). */
export const QuantityInput = forwardRef<HTMLInputElement, QuantityInputProps>(function QuantityInput(
  { units, unit: unitProp, defaultUnit, onUnitChange, locale, min = 0, labels: labelOverrides, disabled, readOnly, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const [unit, setUnit] = useControllableState(unitProp, defaultUnit ?? units[0]?.code ?? '', onUnitChange);
  const selected = units.find((u) => u.code === unit) ?? units[0];
  const end =
    units.length > 1 ? (
      <select className={styles.unitSelect} aria-label={labels.unit} value={unit} disabled={disabled || readOnly} onChange={(e) => setUnit(e.target.value)}>
        {units.map((u) => (
          <option key={u.code} value={u.code}>
            {u.label ? `${u.code} – ${u.label}` : u.code}
          </option>
        ))}
      </select>
    ) : (
      <span className={styles.unit} title={selected?.label}>
        {selected?.code}
      </span>
    );
  return (
    <LocaleNumberField
      ref={ref}
      {...rest}
      disabled={disabled}
      readOnly={readOnly}
      locale={locale}
      min={min}
      decimals={selected?.decimals ?? 3}
      invalidMessage={labels.invalid}
      rangeMessage={labels.range}
      end={end}
    />
  );
});
