import type { SelectOption } from '../../components/listbox/types';

/** Data types understood by the metadata engine. Each maps to one default control. */
export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'enum' | 'multi' | 'currency';

/** All field types, in documentation order. */
export const FIELD_TYPES: readonly FieldType[] = ['string', 'number', 'boolean', 'date', 'datetime', 'enum', 'multi', 'currency'];

/**
 * The value each field type holds in a record.
 * Dates are ISO calendar dates (`2026-10-30`) and date-times are local ISO date-times (`2026-10-30T09:30`),
 * so records stay JSON-serializable. `null` means empty.
 */
export interface FieldValueMap {
  string: string;
  number: number | null;
  boolean: boolean;
  date: string | null;
  datetime: string | null;
  enum: string | null;
  multi: string[];
  currency: number | null;
}

/** A declarative validation rule. Every rule takes an optional `message` that replaces the default. */
export type ValidationRule =
  | { type: 'required'; message?: string }
  /** Smallest number, or earliest ISO date for date fields. */
  | { type: 'min'; value: number | string; message?: string }
  /** Largest number, or latest ISO date for date fields. */
  | { type: 'max'; value: number | string; message?: string }
  /** Fewest characters (string) or values (multi). */
  | { type: 'minLength'; value: number; message?: string }
  /** Most characters (string) or values (multi). */
  | { type: 'maxLength'; value: number; message?: string }
  | { type: 'pattern'; value: RegExp | string; message?: string }
  | { type: 'email'; message?: string }
  /** Any check; return a message to fail. Receives the whole record for cross-field rules. */
  | { type: 'custom'; validate: (value: unknown, record: Record<string, unknown>) => string | null | undefined | false };

/** How a value is shown in display mode, tables, filters and charts. */
export interface DisplayFormat {
  /** Fixed number of decimal places for numbers and currency amounts. Currency defaults to its minor unit. */
  fractionDigits?: number;
  /** Unit appended to numbers, e.g. `kg`. Also shown in the number input. */
  unit?: string;
  /** Show numbers as a percentage (`0.25` → `25%`). @default false */
  percent?: boolean;
  /** Use compact notation (`1.2K`). @default false */
  compact?: boolean;
  /** Intl date style for date and date-time fields. @default 'medium' */
  dateStyle?: 'short' | 'medium' | 'long' | 'full';
  /** Intl time style for date-time fields. @default 'short' */
  timeStyle?: 'short' | 'medium' | 'long' | 'full';
  /** Text for `true` boolean values. Overrides the provider's `yes` message. */
  trueLabel?: string;
  /** Text for `false` boolean values. Overrides the provider's `no` message. */
  falseLabel?: string;
  /** Text for empty values. Overrides the provider's `empty` message. */
  emptyText?: string;
  /** Full control over the display text. Receives the value and the whole record. */
  formatter?: (value: unknown, record: Record<string, unknown>) => string;
}

/** Metadata describing one field of a business object. */
export interface FieldDefinition {
  /** Property name in the record. */
  name: string;
  /** Data type; selects the control, formatter, filter and sort order. */
  type: FieldType;
  /** Human-readable label used for the control, column header, filter and chart axis. */
  label: string;
  /** Helper text shown below the control. */
  description?: string;
  /** Hint text shown while the control is empty. */
  placeholder?: string;
  /** The field must have a value. Adds a `required` rule. @default false */
  required?: boolean;
  /** The field is shown but cannot be edited. @default false */
  readOnly?: boolean;
  /** Excluded from forms, tables, filters and charts unless listed explicitly. @default false */
  hidden?: boolean;
  /** Value for new records. Defaults to the empty value of the type. */
  defaultValue?: unknown;
  /** Declarative validation rules, checked in order; the first failure is reported. */
  validation?: readonly ValidationRule[];
  /** Display formatting. */
  format?: DisplayFormat;
  /** Allowed values for `enum`; suggestions and filter choices for `multi`. */
  options?: readonly SelectOption[];
  /** Control used for `boolean` fields. @default 'switch' */
  booleanControl?: 'switch' | 'checkbox';
  /** Native input type for `string` fields. @default 'text' */
  inputType?: 'text' | 'email' | 'tel' | 'url';
  /** Step for number fields. @default 1 */
  step?: number;
  /** Fixed ISO 4217 code for `currency` fields, e.g. `EUR`. */
  currency?: string;
  /** Name of the field in the same record that holds the currency code. Takes precedence over `currency`. */
  currencyField?: string;
  /** Currencies the user may choose in the amount input. */
  currencies?: readonly string[];
  /** Allow sorting by this field in SmartTable. @default true */
  sortable?: boolean;
  /** Offer this field in SmartFilterBar. @default true */
  filterable?: boolean;
}

/** Metadata describing a business object (entity). */
export interface EntitySchema {
  /** Technical name of the entity, e.g. `Product`. */
  name?: string;
  /** Human-readable singular label, e.g. `Product`. */
  label?: string;
  /** Field that uniquely identifies a record. Used as the table row id. */
  key?: string;
  /** Field that names a record. Rendered as the table row header. Defaults to the first visible field. */
  titleField?: string;
  /** Field definitions in their default order. */
  fields: readonly FieldDefinition[];
}

/** The record type described by a schema created with {@link defineSchema}. */
export type InferRecord<S extends EntitySchema> = {
  -readonly [F in S['fields'][number] as F['name']]: FieldValueMap[F['type']];
};

/** Thrown by {@link defineSchema} for an inconsistent schema. */
export class SchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaError';
  }
}

/**
 * Checks a schema and returns it unchanged with its literal types, so
 * `InferRecord<typeof schema>` describes the records. Throws a {@link SchemaError}
 * for duplicate or missing names, unknown types, enums without options and
 * references (`key`, `titleField`, `currencyField`) to fields that do not exist.
 */
export function defineSchema<const S extends EntitySchema>(schema: S): S {
  const names = new Set<string>();
  for (const field of schema.fields) {
    if (!field.name) throw new SchemaError('Every field needs a name.');
    if (names.has(field.name)) throw new SchemaError(`Duplicate field "${field.name}".`);
    names.add(field.name);
    if (!FIELD_TYPES.includes(field.type)) throw new SchemaError(`Field "${field.name}" has unknown type "${String(field.type)}".`);
    if (field.type === 'enum' && !field.options?.length) throw new SchemaError(`Enum field "${field.name}" needs options.`);
  }
  for (const field of schema.fields) {
    if (field.currencyField && !names.has(field.currencyField)) throw new SchemaError(`Field "${field.name}" references unknown currency field "${field.currencyField}".`);
  }
  for (const ref of ['key', 'titleField'] as const) {
    const name = schema[ref];
    if (name && !names.has(name)) throw new SchemaError(`Schema ${ref} "${name}" is not a field.`);
  }
  return schema;
}

/** Finds a field definition by name. */
export function getField(schema: EntitySchema, name: string): FieldDefinition | undefined {
  return schema.fields.find((f) => f.name === name);
}

/**
 * Resolves the fields to show: the named fields in the given order, or every
 * field that is not hidden (and passes `predicate`). Unknown names are ignored.
 */
export function resolveFields(schema: EntitySchema, names?: readonly string[], predicate?: (field: FieldDefinition) => boolean): FieldDefinition[] {
  if (names) return names.map((n) => getField(schema, n)).filter((f): f is FieldDefinition => !!f);
  return schema.fields.filter((f) => !f.hidden && (!predicate || predicate(f)));
}

/** The empty value of a field type. */
export function emptyValue(type: FieldType): unknown {
  switch (type) {
    case 'string':
      return '';
    case 'boolean':
      return false;
    case 'multi':
      return [];
    default:
      return null;
  }
}

/** A new record with every field set to its `defaultValue` or empty value. */
export function createDefaultValues<T extends object = Record<string, unknown>>(schema: EntitySchema, overrides?: Partial<T>): T {
  const values: Record<string, unknown> = {};
  for (const field of schema.fields) values[field.name] = field.defaultValue !== undefined ? field.defaultValue : emptyValue(field.type);
  return { ...values, ...overrides } as T;
}

/** Whether a value counts as empty for its field type (`required` uses this). */
export function isEmptyValue(type: FieldType, value: unknown): boolean {
  if (value == null) return true;
  if (type === 'boolean') return false;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'number') return Number.isNaN(value);
  return false;
}

/** Reads a field value from a record of any shape. */
export const readValue = (record: object, name: string): unknown => (record as Record<string, unknown>)[name];

/** The currency code for a currency field in a record. */
export function currencyOf(field: FieldDefinition, record?: object): string | undefined {
  const fromRecord = field.currencyField && record ? readValue(record, field.currencyField) : undefined;
  return typeof fromRecord === 'string' && fromRecord ? fromRecord : field.currency;
}
