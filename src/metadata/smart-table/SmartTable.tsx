import { useMemo } from 'react';
import { Table, type TableColumn, type TableProps } from '../../components/table';
import { useMetadata } from '../MetadataProvider';
import { compareFieldValues, formatFieldValue } from '../engine/format';
import { readValue, resolveFields, type EntitySchema, type FieldDefinition } from '../engine/schema';

export interface SmartTableProps<T extends object> extends Omit<TableProps<T>, 'columns'> {
  /** Metadata of the entity shown in the rows. */
  schema: EntitySchema;
  /** Fields to show as columns, in order. Defaults to every visible field. */
  fields?: readonly string[];
  /** Per-field changes to the generated columns, e.g. a custom `cell` or `width`. */
  columnOverrides?: Partial<Record<string, Partial<TableColumn<T>>>>;
  /** Columns appended after the generated ones, e.g. row actions. */
  extraColumns?: TableColumn<T>[];
}

/** Builds Table columns from a schema: labelled headers, formatted cells, type-aware sorting and alignment. */
export function useSmartColumns<T extends object>(schema: EntitySchema, fields?: readonly string[], columnOverrides?: SmartTableProps<T>['columnOverrides']): TableColumn<T>[] {
  const { locale, messages } = useMetadata();
  return useMemo(() => {
    const defs = resolveFields(schema, fields);
    const rowHeader = schema.titleField ?? defs[0]?.name;
    return defs.map((field: FieldDefinition) => {
      const numeric = field.type === 'number' || field.type === 'currency';
      const column: TableColumn<T> = {
        id: field.name,
        header: field.label,
        headerText: field.label,
        accessor: (row) => readValue(row, field.name),
        cell: (row) => formatFieldValue(field, readValue(row, field.name), row, { locale, messages }),
        sortable: field.sortable !== false,
        sortFn: (a, b) => compareFieldValues(field, readValue(a, field.name), readValue(b, field.name), locale),
        align: numeric ? 'end' : 'start',
        rowHeader: field.name === rowHeader,
        wrap: field.type === 'multi' || field.type === 'string',
      };
      return { ...column, ...columnOverrides?.[field.name] };
    });
  }, [schema, fields, columnOverrides, locale, messages]);
}

/**
 * A Table generated from a schema: column headers from labels, cells formatted
 * by type (currency, dates, Yes/No, option labels), numeric columns end-aligned,
 * type-aware sorting, the `key` field as row id and the `titleField` as row header.
 */
export function SmartTable<T extends object>({ schema, fields, columnOverrides, extraColumns, getRowId, getRowLabel, caption, ...rest }: SmartTableProps<T>) {
  const columns = useSmartColumns<T>(schema, fields, columnOverrides);
  const all = extraColumns?.length ? [...columns, ...extraColumns] : columns;
  const key = schema.key;
  const title = schema.titleField;
  return (
    <Table<T>
      {...rest}
      caption={caption ?? schema.label}
      columns={all}
      getRowId={getRowId ?? (key ? (row) => String(readValue(row, key)) : undefined)}
      getRowLabel={getRowLabel ?? (title ? (row) => String(readValue(row, title) ?? '') : undefined)}
    />
  );
}
