import type { ReactNode } from 'react';
import { AmountInput } from '../../components/amount-input';
import { Checkbox } from '../../components/checkbox';
import { DatePicker } from '../../components/date-picker';
import { DateTimePicker } from '../../components/date-time-picker';
import { Input } from '../../components/input';
import { MultiInput } from '../../components/multi-input';
import { NumberInput } from '../../components/number-input';
import { Select } from '../../components/select';
import { Switch } from '../../components/switch';
import { parseISODate, toISODate } from '../../utilities/date';
import { useMetadata } from '../MetadataProvider';
import type { FieldDefinition, FieldType } from '../engine/schema';
import { numericBounds } from '../engine/validation';

/** Props every field control renderer receives. */
export interface FieldControlProps {
  /** Metadata of the field. */
  field: FieldDefinition;
  /** Current value, in the shape of the field type (see `FieldValueMap`). */
  value: unknown;
  /** Called with the new value. */
  onChange: (value: unknown) => void;
  /** Called when the user leaves the control (or commits a choice, for selects and toggles). */
  onBlur?: () => void;
  /** Id of the control. */
  id?: string;
  /** Form field name. */
  name?: string;
  /** Error message; marks the control invalid. */
  error?: ReactNode;
  /** Shows the value without allowing changes. */
  readOnly?: boolean;
  /** Disables the control. */
  disabled?: boolean;
  /** Marks the control as required. */
  required?: boolean;
  /** Visually hide the label. */
  hideLabel?: boolean;
  /** Control size. */
  size?: 'sm' | 'md' | 'lg';
  /** BCP 47 locale for parsing and formatting. */
  locale?: string;
  /** Currency code for `currency` fields. */
  currency?: string;
  /** Called when the user picks another currency. */
  onCurrencyChange?: (currency: string) => void;
}

/** Renders the control for one field type. Register replacements with `MetadataProvider`'s `renderers`. */
export type FieldControlRenderer = (props: FieldControlProps) => ReactNode;

const common = (p: FieldControlProps) => ({
  id: p.id,
  name: p.name,
  label: p.field.label,
  description: p.field.description,
  error: p.error,
  hideLabel: p.hideLabel,
  required: p.required,
  disabled: p.disabled,
  readOnly: p.readOnly,
  size: p.size,
});

const dateLimit = (field: FieldDefinition, type: 'min' | 'max') => {
  const rule = field.validation?.find((r) => r.type === type);
  return rule && 'value' in rule && typeof rule.value === 'string' ? rule.value : undefined;
};

/** The built-in control for each field type. */
export const defaultFieldRenderers: Record<FieldType, FieldControlRenderer> = {
  string: (p) => (
    <Input {...common(p)} type={p.field.inputType ?? 'text'} placeholder={p.field.placeholder} value={(p.value as string | null) ?? ''} onChange={(e) => p.onChange(e.target.value)} onBlur={p.onBlur} />
  ),
  number: (p) => (
    <NumberInput
      {...common(p)}
      {...numericBounds(p.field)}
      step={p.field.step}
      precision={p.field.format?.fractionDigits}
      unit={p.field.format?.unit}
      locale={p.locale}
      placeholder={p.field.placeholder}
      value={(p.value as number | null) ?? null}
      onChange={p.onChange}
      onBlur={p.onBlur}
    />
  ),
  boolean: (p) => {
    const props = {
      id: p.id,
      name: p.name,
      label: p.hideLabel ? undefined : p.field.label,
      'aria-label': p.hideLabel ? p.field.label : undefined,
      checked: Boolean(p.value),
      // Native checkboxes ignore readOnly, so read-only toggles are disabled.
      disabled: p.disabled || p.readOnly,
      required: p.required,
      onChange: (checked: boolean) => {
        p.onChange(checked);
        p.onBlur?.();
      },
    };
    return p.field.booleanControl === 'checkbox' ? (
      <Checkbox {...props} description={p.field.description} error={p.error} />
    ) : (
      <Switch {...props} description={p.error ?? p.field.description} aria-invalid={p.error ? true : undefined} />
    );
  },
  date: (p) => (
    <DatePicker
      {...common(p)}
      locale={p.locale}
      placeholder={p.field.placeholder}
      min={parseISODate(dateLimit(p.field, 'min') ?? '')}
      max={parseISODate(dateLimit(p.field, 'max') ?? '')}
      value={typeof p.value === 'string' ? parseISODate(p.value.slice(0, 10)) : p.value instanceof Date ? p.value : null}
      onChange={(date) => p.onChange(date ? toISODate(date) : null)}
      onBlur={p.onBlur}
    />
  ),
  datetime: (p) => (
    <DateTimePicker
      {...common(p)}
      min={dateLimit(p.field, 'min')}
      max={dateLimit(p.field, 'max')}
      value={typeof p.value === 'string' ? p.value.slice(0, 16) : ''}
      onChange={(value) => p.onChange(value || null)}
      onBlur={p.onBlur}
    />
  ),
  enum: (p) => (
    <Select
      {...common(p)}
      options={[...(p.field.options ?? [])]}
      placeholder={p.field.placeholder}
      value={(p.value as string | null) ?? null}
      onChange={(value) => {
        p.onChange(value);
        p.onBlur?.();
      }}
    />
  ),
  multi: (p) => (
    <MultiInput
      {...common(p)}
      placeholder={p.field.placeholder}
      suggestions={p.field.options?.map((o) => o.value)}
      value={Array.isArray(p.value) ? (p.value as string[]) : []}
      onChange={p.onChange}
      onBlur={p.onBlur}
    />
  ),
  currency: (p) => (
    <AmountInput
      {...common(p)}
      {...numericBounds(p.field)}
      locale={p.locale}
      placeholder={p.field.placeholder}
      currency={p.currency ?? p.field.currency}
      currencies={p.field.currencies ? [...p.field.currencies] : undefined}
      onCurrencyChange={p.onCurrencyChange}
      value={(p.value as number | null) ?? null}
      onChange={p.onChange}
      onBlur={p.onBlur}
    />
  ),
};

export interface FieldRendererProps extends FieldControlProps {
  /** Renderers that replace the provider's and the built-in ones for this control. */
  renderers?: Partial<Record<FieldType, FieldControlRenderer>>;
}

/**
 * Picks the control for a field's data type: string → Input, number → NumberInput,
 * boolean → Switch or Checkbox, date → DatePicker, datetime → DateTimePicker,
 * enum → Select, multi → MultiInput and currency → AmountInput.
 */
export function FieldRenderer({ renderers, ...props }: FieldRendererProps) {
  const context = useMetadata();
  const Renderer = renderers?.[props.field.type] ?? context.renderers[props.field.type] ?? defaultFieldRenderers[props.field.type];
  return <Renderer {...props} locale={props.locale ?? context.locale} />;
}
