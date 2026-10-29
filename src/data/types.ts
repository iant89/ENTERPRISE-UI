/** A zero-based page request. Both values must be integers, with page >= 0 and pageSize > 0. */
export interface DataPagination {
  page: number;
  pageSize: number;
}

/** Field names are application-defined; adapters decide which fields are supported. */
export interface DataSort {
  field: string;
  direction: 'asc' | 'desc';
}

export type DataFilter =
  | { field: string; operator: 'equals'; value: string | number | boolean | null }
  | { field: string; operator: 'contains'; value: string }
  | { field: string; operator: 'gte' | 'lte'; value: string | number };

export interface DataRequest {
  pagination: DataPagination;
  /** Sort priority is the order of this array. */
  sort?: DataSort[];
  /** All filters must match. */
  filters?: DataFilter[];
  search?: string;
}

export interface DataPage<T> {
  items: T[];
  /** Total number of matching items before pagination. */
  total: number;
}

/** Transport-neutral contract. Adapters should honor the signal when possible. */
export interface DataAdapter<T> {
  load(request: DataRequest, signal: AbortSignal): Promise<DataPage<T>>;
}

export type DataLoadState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'refreshing'; data: DataPage<T>; error: null }
  | { status: 'success'; data: DataPage<T>; error: null }
  | { status: 'error'; data: DataPage<T> | null; error: unknown };
