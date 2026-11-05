import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { useId } from '../../hooks/useId';
import { cx } from '../../utilities/cx';
import { useMetadata } from '../MetadataProvider';
import { formatFieldValue } from '../engine/format';
import { currencyOf, emptyValue, type FieldDefinition, type FieldType } from '../engine/schema';
import { validateField } from '../engine/validation';
import { FieldRenderer, type FieldControlRenderer } from '../field-renderer/FieldRenderer';
import styles from './SmartField.module.css';

export interface SmartFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'onBlur'> {
  /** Metadata of the field: type, label, rules and formatting. */
  field: FieldDefinition;
  /** Controlled value. Providing it makes the field controlled. */
  value?: unknown;
  /** Initial value when uncontrolled. Defaults to the field's `defaultValue` or the type's empty value. */
  defaultValue?: unknown;
  /** Called with the new value. */
  onChange?: (value: unknown) => void;
  /** Called when the user leaves the control. */
  onBlur?: () => void;
  /** Edit with a control, or show formatted text. @default 'edit' */
  mode?: 'edit' | 'display';
  /** Error from the application (e.g. a server check). Replaces the field's own validation message. */
  error?: ReactNode;
  /** Check the field's rules after the user leaves the control (when no `error` is given). @default true */
  validate?: boolean;
  /** The whole record, for cross-field rules, formatters and the `currencyField`. */
  record?: object;
  /** Currency code for `currency` fields; overrides `currencyField` and `currency`. */
  currency?: string;
  /** Called when the user picks another currency. */
  onCurrencyChange?: (currency: string) => void;
  /** Id of the control. Generated when omitted. */
  controlId?: string;
  /** Form field name. @default field.name */
  name?: string;
  /** Disables the control. @default false */
  disabled?: boolean;
  /** Visually hide the label (it stays available to screen readers). @default false */
  hideLabel?: boolean;
  /** Control size. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Renderers that replace the built-in controls for this field. */
  renderers?: Partial<Record<FieldType, FieldControlRenderer>>;
}

/**
 * Renders one field from its metadata: the right control for its data type
 * in edit mode (with its required, read-only and validation rules), or its
 * formatted value in display mode.
 */
export const SmartField = forwardRef<HTMLDivElement, SmartFieldProps>(function SmartField(
  { field, value, defaultValue, onChange, onBlur, mode = 'edit', error, validate = true, record, currency, onCurrencyChange, controlId, name, disabled = false, hideLabel = false, size, renderers, className, ...rest },
  ref,
) {
  const { locale, messages } = useMetadata();
  const id = useId(controlId, 'smart-field');
  const initial = defaultValue !== undefined ? defaultValue : field.defaultValue !== undefined ? field.defaultValue : emptyValue(field.type);
  const [current, setCurrent] = useControllableState<unknown>(value, initial, onChange);
  const [touched, setTouched] = useState(false);
  // The currency follows the prop, then the record's currency field; otherwise the user's choice is kept here.
  const recordCurrency = field.currencyField && record ? currencyOf(field, record) : undefined;
  const [currencyCode, setCurrencyCode] = useControllableState<string | undefined>(currency ?? recordCurrency, field.currency, (code) => code && onCurrencyChange?.(code));
  const context = { locale, messages };
  const fullRecord = { ...record, [field.name]: current };

  if (mode === 'display') {
    return (
      <div ref={ref} className={cx(styles.root, className)} data-field-type={field.type} {...rest}>
        <dl className={styles.display}>
          <dt className={cx(styles.label, hideLabel && 'eui-visually-hidden')}>{field.label}</dt>
          <dd className={styles.value}>{formatFieldValue(field, current, fullRecord, context)}</dd>
        </dl>
      </div>
    );
  }

  const ownError = validate && touched && !field.readOnly ? validateField(field, current, fullRecord, context) : undefined;
  return (
    <div ref={ref} className={cx(styles.root, className)} data-field-type={field.type} {...rest}>
      <FieldRenderer
        field={field}
        value={current}
        onChange={setCurrent}
        onBlur={() => {
          setTouched(true);
          onBlur?.();
        }}
        id={id}
        name={name ?? field.name}
        error={error ?? ownError}
        required={field.required}
        readOnly={field.readOnly}
        disabled={disabled}
        hideLabel={hideLabel}
        size={size}
        currency={currencyCode}
        onCurrencyChange={setCurrencyCode}
        renderers={renderers}
      />
    </div>
  );
});
