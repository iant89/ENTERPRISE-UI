/**
 * Metadata engine: describe an entity once (field names, types, labels, rules
 * and formatting) and generate fields, forms, filter bars, tables and charts from it.
 */
export * from './engine';
export { MetadataProvider, useMetadata, type MetadataProviderProps, type MetadataContextValue } from './MetadataProvider';
export * from './field-renderer';
export * from './smart-field';
export * from './smart-form';
export * from './smart-filter-bar';
export * from './smart-table';
export * from './smart-chart';
