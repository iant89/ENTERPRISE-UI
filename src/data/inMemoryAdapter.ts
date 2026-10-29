import type { DataAdapter, DataRequest } from './types';

type FieldValue = string | number | boolean | null | undefined;

export interface InMemoryAdapterOptions<T> {
  /** Explicit field accessors; unknown fields are rejected instead of silently ignored. */
  fields: Record<string, (item: T) => FieldValue>;
  /** Fields searched case-insensitively. Defaults to all configured fields. */
  searchFields?: string[];
}

/** Creates an adapter over a fixed collection. Replace the adapter to replace the collection. */
export function createInMemoryAdapter<T>(items: readonly T[], options: InMemoryAdapterOptions<T>): DataAdapter<T> {
  const rows = [...items];
  const getField = (name: string) => {
    if (!Object.hasOwn(options.fields, name) || typeof options.fields[name] !== 'function') {
      throw new Error(`Unknown data field: ${name}`);
    }
    return options.fields[name];
  };

  return {
    async load(request: DataRequest, signal: AbortSignal) {
      signal.throwIfAborted();
      const { page, pageSize } = request.pagination;
      if (!Number.isSafeInteger(page) || page < 0 || !Number.isSafeInteger(pageSize) || pageSize < 1) {
        throw new RangeError('Data pagination requires a non-negative integer page and a positive integer pageSize.');
      }
      const filters = (request.filters ?? []).map((filter) => ({ filter, get: getField(filter.field) }));
      const sorts = (request.sort ?? []).map((sort) => ({ sort, get: getField(sort.field) }));
      const search = request.search?.trim().toLocaleLowerCase() ?? '';
      const searchFields = search ? (options.searchFields ?? Object.keys(options.fields)).map(getField) : [];
      const matches = rows.filter((row) => filters.every(({ filter, get }) => {
        const value = get(row);
        if (filter.operator === 'equals') return value === filter.value;
        if (filter.operator === 'contains') return value != null && String(value).toLocaleLowerCase().includes(filter.value.toLocaleLowerCase());
        if (typeof value !== typeof filter.value || value == null) return false;
        if (typeof value === 'number' && typeof filter.value === 'number') return filter.operator === 'gte' ? value >= filter.value : value <= filter.value;
        if (typeof value === 'string' && typeof filter.value === 'string') return filter.operator === 'gte' ? value >= filter.value : value <= filter.value;
        return false;
      }) && (!search || searchFields.some((get) => {
        const value = get(row);
        return value != null && String(value).toLocaleLowerCase().includes(search);
      })));
      if (sorts.length) {
        matches.sort((a, b) => {
          for (const { sort, get } of sorts) {
            const left = get(a);
            const right = get(b);
            // Nullish values always sort last, independently of direction.
            if (left == null || right == null) {
              if (left == null && right == null) continue;
              return left == null ? 1 : -1;
            }
            const comparison = typeof left === 'number' && typeof right === 'number'
              ? left - right : String(left).localeCompare(String(right), undefined, { numeric: true });
            if (comparison) return sort.direction === 'asc' ? comparison : -comparison;
          }
          return 0;
        });
      }
      signal.throwIfAborted();
      return { items: matches.slice(page * pageSize, (page + 1) * pageSize), total: matches.length };
    },
  };
}
