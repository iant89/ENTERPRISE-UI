import { formatFieldValue, parseFieldDate, toNumber, type FormatContext } from './format';
import { defaultMessages } from './messages';
import { isEmptyValue, type EntitySchema, type FieldDefinition, type ValidationRule } from './schema';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Errors by field name. Fields without an error are omitted. */
export type RecordErrors = Record<string, string>;

/** The rules that apply to a field: `required` first (when set), then its `validation` rules. */
export function rulesOf(field: FieldDefinition): ValidationRule[] {
  const rules = [...(field.validation ?? [])];
  if (field.required && !rules.some((r) => r.type === 'required')) rules.unshift({ type: 'required' });
  return rules;
}

/** The numeric `min`/`max` bounds of a number or currency field, for the input controls. */
export function numericBounds(field: FieldDefinition): { min?: number; max?: number } {
  const bounds: { min?: number; max?: number } = {};
  for (const rule of field.validation ?? []) {
    if ((rule.type === 'min' || rule.type === 'max') && typeof rule.value === 'number') bounds[rule.type] = rule.value;
  }
  return bounds;
}

/** Compares a value against a min/max limit; numbers numerically, dates chronologically. */
function compareToLimit(field: FieldDefinition, value: unknown, limit: number | string): number | null {
  if (field.type === 'date' || field.type === 'datetime') {
    const a = parseFieldDate(value);
    const b = parseFieldDate(limit);
    return a && b ? a.getTime() - b.getTime() : null;
  }
  const a = toNumber(value);
  const b = toNumber(limit);
  return a == null || b == null ? null : a - b;
}

/**
 * Validates one field value against its metadata. Returns the first error
 * message, or `undefined` when the value is valid. Rules other than
 * `required` and `custom` are skipped for empty values.
 */
export function validateField(field: FieldDefinition, value: unknown, record: object = {}, context: FormatContext = {}): string | undefined {
  const messages = { ...defaultMessages, ...context.messages };
  const empty = isEmptyValue(field.type, value);
  const kind = Array.isArray(value) ? 'list' : 'text';
  const length = Array.isArray(value) ? value.length : String(value ?? '').length;
  const limitText = (limit: number | string) => formatFieldValue({ ...field, format: { ...field.format, formatter: undefined } }, limit, record, context);
  for (const rule of rulesOf(field)) {
    let failed = false;
    let fallback = '';
    switch (rule.type) {
      case 'required':
        // A required boolean must be checked (e.g. "Accept the terms").
        failed = field.type === 'boolean' ? value !== true : empty;
        fallback = messages.required(field.label);
        break;
      case 'custom': {
        const result = rule.validate(value, record as Record<string, unknown>);
        if (result) return result;
        continue;
      }
      default:
        if (empty) continue;
        if (rule.type === 'min' || rule.type === 'max') {
          const diff = compareToLimit(field, value, rule.value);
          failed = diff != null && (rule.type === 'min' ? diff < 0 : diff > 0);
          fallback = messages[rule.type](field.label, limitText(rule.value));
        } else if (rule.type === 'minLength') {
          failed = length < rule.value;
          fallback = messages.minLength(field.label, rule.value, kind);
        } else if (rule.type === 'maxLength') {
          failed = length > rule.value;
          fallback = messages.maxLength(field.label, rule.value, kind);
        } else if (rule.type === 'pattern') {
          const pattern = typeof rule.value === 'string' ? new RegExp(rule.value) : rule.value;
          pattern.lastIndex = 0;
          failed = !(Array.isArray(value) ? value : [value]).every((v) => pattern.test(String(v)));
          fallback = messages.pattern(field.label);
        } else if (rule.type === 'email') {
          failed = !(Array.isArray(value) ? value : [value]).every((v) => EMAIL.test(String(v)));
          fallback = messages.email(field.label);
        }
    }
    if (failed) return rule.message ?? fallback;
  }
  return undefined;
}

/** Validates every field of a record (or only the named ones). Returns errors by field name; `{}` means valid. */
export function validateRecord(schema: EntitySchema, record: object, context: FormatContext = {}, fieldNames?: readonly string[]): RecordErrors {
  const errors: RecordErrors = {};
  for (const field of schema.fields) {
    if (fieldNames && !fieldNames.includes(field.name)) continue;
    const message = validateField(field, (record as Record<string, unknown>)[field.name], record, context);
    if (message) errors[field.name] = message;
  }
  return errors;
}
