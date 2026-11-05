import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  COUNT_MEASURE,
  SchemaError,
  aggregateRecords,
  compareFieldValues,
  countActiveFilters,
  createDefaultValues,
  defineSchema,
  filterRecords,
  formatFieldValue,
  resolveFields,
  validateField,
  validateRecord,
  type FieldDefinition,
  type InferRecord,
} from '../index';

const schema = defineSchema({
  name: 'Order',
  label: 'Orders',
  key: 'id',
  titleField: 'customer',
  fields: [
    { name: 'id', type: 'string', label: 'ID', hidden: true },
    { name: 'customer', type: 'string', label: 'Customer', required: true, validation: [{ type: 'maxLength', value: 10 }] },
    { name: 'email', type: 'string', label: 'Email', validation: [{ type: 'email' }] },
    { name: 'quantity', type: 'number', label: 'Quantity', defaultValue: 1, format: { unit: 'pcs' }, validation: [{ type: 'min', value: 1 }, { type: 'max', value: 99 }] },
    { name: 'amount', type: 'currency', label: 'Amount', currencyField: 'currencyCode' },
    { name: 'currencyCode', type: 'string', label: 'Currency', hidden: true, defaultValue: 'EUR' },
    { name: 'urgent', type: 'boolean', label: 'Urgent' },
    { name: 'ordered', type: 'date', label: 'Ordered', validation: [{ type: 'min', value: '2026-01-01' }] },
    { name: 'shipped', type: 'datetime', label: 'Shipped' },
    { name: 'priority', type: 'enum', label: 'Priority', options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }] },
    { name: 'tags', type: 'multi', label: 'Tags', validation: [{ type: 'maxLength', value: 2 }] },
  ],
});
type Order = InferRecord<typeof schema>;
const field = (name: string) => schema.fields.find((f) => f.name === name)! as FieldDefinition;
const ctx = { locale: 'en-US' };

const orders: Order[] = [
  { id: '1', customer: 'Acme', email: '', quantity: 5, amount: 100, currencyCode: 'EUR', urgent: true, ordered: '2026-01-15', shipped: null, priority: 'high', tags: ['b2b'] },
  { id: '2', customer: 'Globex', email: '', quantity: 2, amount: 50.5, currencyCode: 'EUR', urgent: false, ordered: '2026-02-03', shipped: '2026-02-04T10:00', priority: 'low', tags: ['b2b', 'export'] },
  { id: '3', customer: 'Initech', email: '', quantity: 1, amount: 20, currencyCode: 'USD', urgent: false, ordered: '2026-02-20', shipped: null, priority: 'high', tags: [] },
];

describe('schema definition', () => {
  it('infers record types from field types', () => {
    expectTypeOf<Order['quantity']>().toEqualTypeOf<number | null>();
    expectTypeOf<Order['urgent']>().toEqualTypeOf<boolean>();
    expectTypeOf<Order['tags']>().toEqualTypeOf<string[]>();
    expectTypeOf<Order['priority']>().toEqualTypeOf<string | null>();
  });

  it('rejects inconsistent schemas', () => {
    expect(() => defineSchema({ fields: [{ name: 'a', type: 'string', label: 'A' }, { name: 'a', type: 'number', label: 'B' }] })).toThrow(SchemaError);
    expect(() => defineSchema({ fields: [{ name: 'p', type: 'enum', label: 'P' }] })).toThrow(/needs options/);
    expect(() => defineSchema({ fields: [{ name: 'a', type: 'currency', label: 'A', currencyField: 'nope' }] })).toThrow(/unknown currency field/);
    expect(() => defineSchema({ key: 'x', fields: [{ name: 'a', type: 'string', label: 'A' }] })).toThrow(/key "x"/);
  });

  it('creates default values and resolves visible fields', () => {
    expect(createDefaultValues(schema)).toMatchObject({ customer: '', quantity: 1, amount: null, currencyCode: 'EUR', urgent: false, ordered: null, tags: [] });
    expect(resolveFields(schema).map((f) => f.name)).not.toContain('id');
    expect(resolveFields(schema, ['priority', 'customer', 'missing']).map((f) => f.name)).toEqual(['priority', 'customer']);
  });
});

describe('validation', () => {
  it('applies required, length, range, date and email rules with default messages', () => {
    expect(validateField(field('customer'), '  ')).toBe('Enter Customer.');
    expect(validateField(field('customer'), 'A very long name')).toBe('Customer can have at most 10 characters.');
    expect(validateField(field('quantity'), 0, {}, ctx)).toBe('Quantity must be 1 pcs or more.');
    expect(validateField(field('quantity'), null)).toBeUndefined();
    expect(validateField(field('ordered'), '2025-12-31', {}, ctx)).toBe('Ordered must be Jan 1, 2026 or more.');
    expect(validateField(field('email'), 'nope')).toMatch(/email address/);
    expect(validateField(field('tags'), ['a', 'b', 'c'])).toBe('Tags can have at most 2 values.');
  });

  it('supports custom messages, custom cross-field rules and localized messages', () => {
    const f: FieldDefinition = {
      name: 'end',
      type: 'date',
      label: 'End',
      required: true,
      validation: [{ type: 'required', message: 'Pick an end date.' }, { type: 'custom', validate: (v, r) => (String(v) < String(r.start) ? 'End must follow start.' : null) }],
    };
    expect(validateField(f, null)).toBe('Pick an end date.');
    expect(validateField(f, '2026-01-01', { start: '2026-02-01' })).toBe('End must follow start.');
    expect(validateField(field('customer'), '', {}, { messages: { required: (l) => `${l} fehlt.` } })).toBe('Customer fehlt.');
  });

  it('treats a required boolean as "must be checked"', () => {
    const terms: FieldDefinition = { name: 'terms', type: 'boolean', label: 'Terms', required: true };
    expect(validateField(terms, false)).toBe('Enter Terms.');
    expect(validateField(terms, true)).toBeUndefined();
  });

  it('validates a whole record', () => {
    expect(validateRecord(schema, { ...orders[0], customer: '', quantity: 200 }, ctx)).toEqual({ customer: 'Enter Customer.', quantity: 'Quantity must be 99 pcs or less.' });
    expect(validateRecord(schema, orders[0], ctx)).toEqual({});
  });
});

describe('display formatting', () => {
  it('formats every type', () => {
    expect(formatFieldValue(field('quantity'), 1234, {}, ctx)).toBe('1,234 pcs');
    expect(formatFieldValue(field('amount'), 50.5, orders[1], ctx)).toBe('€50.50');
    expect(formatFieldValue(field('amount'), 20, orders[2], ctx)).toBe('$20.00');
    expect(formatFieldValue(field('urgent'), true)).toBe('Yes');
    expect(formatFieldValue(field('ordered'), '2026-01-15', {}, ctx)).toBe('Jan 15, 2026');
    expect(formatFieldValue(field('shipped'), '2026-02-04T10:00', {}, ctx)).toBe('Feb 4, 2026, 10:00 AM');
    expect(formatFieldValue(field('priority'), 'high')).toBe('High');
    expect(formatFieldValue(field('tags'), ['b2b', 'export'])).toBe('b2b, export');
    expect(formatFieldValue(field('customer'), '')).toBe('—');
  });

  it('honors percent, fraction digits, custom labels and formatters', () => {
    expect(formatFieldValue({ name: 'r', type: 'number', label: 'Rate', format: { percent: true, fractionDigits: 1 } }, 0.256, {}, ctx)).toBe('25.6%');
    expect(formatFieldValue({ name: 'b', type: 'boolean', label: 'B', format: { trueLabel: 'Active' } }, true)).toBe('Active');
    expect(formatFieldValue({ name: 'f', type: 'string', label: 'F', format: { formatter: (v, r) => `${v}-${r.x}` } }, 'a', { x: 1 })).toBe('a-1');
  });

  it('sorts by type, with empty values last and enums in option order', () => {
    const sorted = [...orders].sort((a, b) => compareFieldValues(field('priority'), a.priority, b.priority));
    expect(sorted.map((o) => o.priority)).toEqual(['low', 'high', 'high']);
    expect([null, 3, 1].sort((a, b) => compareFieldValues(field('quantity'), a, b))).toEqual([1, 3, null]);
  });
});

describe('filtering', () => {
  it('filters by each condition type and counts active filters', () => {
    const run = (filters: Parameters<typeof filterRecords>[2], search?: string) => filterRecords(schema, orders, filters, { ...ctx, search }).map((o) => o.id);
    expect(run({ customer: 'glo' })).toEqual(['2']);
    expect(run({ priority: ['high'] })).toEqual(['1', '3']);
    expect(run({ tags: ['export'] })).toEqual(['2']);
    expect(run({ urgent: true })).toEqual(['1']);
    expect(run({ urgent: null })).toEqual(['1', '2', '3']);
    expect(run({ amount: { from: 30, to: null } })).toEqual(['1', '2']);
    expect(run({ ordered: { start: '2026-02-01', end: '2026-02-20' } })).toEqual(['2', '3']);
    expect(run({}, 'init')).toEqual(['3']);
    expect(run({}, 'Low')).toEqual(['2']);
    expect(countActiveFilters({ customer: '', priority: [], amount: { from: null, to: null }, urgent: false, ordered: { start: '2026-01-01', end: '' } })).toBe(2);
  });
});

describe('aggregation', () => {
  it('groups by an enum in option order and sums measures', () => {
    const result = aggregateRecords(schema, orders, { dimension: 'priority', measures: ['amount', 'quantity'] });
    expect(result.series).toEqual([{ key: 'amount', label: 'Amount' }, { key: 'quantity', label: 'Quantity' }]);
    expect(result.data).toEqual([{ priority: 'Low', amount: 50.5, quantity: 2 }, { priority: 'High', amount: 120, quantity: 6 }]);
  });

  it('counts, averages and buckets dates by month', () => {
    const counts = aggregateRecords(schema, orders, { dimension: 'ordered', aggregation: 'count', locale: 'en-US' });
    expect(counts.series).toEqual([{ key: COUNT_MEASURE, label: 'Count' }]);
    expect(counts.data).toEqual([{ ordered: 'Jan 2026', [COUNT_MEASURE]: 1 }, { ordered: 'Feb 2026', [COUNT_MEASURE]: 2 }]);
    const avg = aggregateRecords(schema, orders, { dimension: 'urgent', measures: ['quantity'], aggregation: 'avg', sort: 'value' });
    expect(avg.data).toEqual([{ urgent: 'Yes', quantity: 5 }, { urgent: 'No', quantity: 1.5 }]);
  });

  it('counts multi-value dimensions once per value', () => {
    const result = aggregateRecords(schema, orders, { dimension: 'tags', aggregation: 'count', sort: 'value' });
    expect(result.data.map((d) => [d.tags, d[COUNT_MEASURE]])).toEqual([['b2b', 2], ['export', 1], ['—', 1]]);
  });
});
