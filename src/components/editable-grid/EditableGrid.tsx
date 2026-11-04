import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { AddIcon, CopyIcon, DeleteIcon, HighPriorityIcon } from '../../icons';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { useControllableState } from '../../hooks/useControllableState';
import { formatLocaleNumber, parseLocaleNumber } from '../../utilities/number';
import { Button } from '../button';
import styles from './EditableGrid.module.css';

export type EditableCellType = 'text' | 'number' | 'select' | 'checkbox' | 'date';

export interface EditableGridColumn<T> {
  /** Field of the row object. */
  key: keyof T & string;
  /** Column header. */
  header: string;
  /** Editor and display type. @default 'text' */
  type?: EditableCellType;
  /** Choices for `select` columns. */
  options?: { value: string; label: string }[];
  /** Whether cells can be edited; a function decides per row. @default true */
  editable?: boolean | ((row: T) => boolean);
  /** Empty values are errors. @default false */
  required?: boolean;
  /** Returns an error message for invalid values. Runs after the required check. */
  validate?: (value: unknown, row: T) => string | null | undefined;
  /** Custom display of the (non-editing) cell. */
  format?: (value: unknown, row: T) => ReactNode;
  /** Decimal places of `number` columns. */
  decimals?: number;
  /** CSS width, e.g. `8rem`. */
  width?: string;
  /** Text alignment. Numbers default to `end`. */
  align?: 'start' | 'end' | 'center';
}

export interface EditableGridError {
  rowId: string;
  rowIndex: number;
  key: string;
  column: string;
  message: string;
}

export interface EditableGridLabels {
  addRow: string;
  deleteRow: (rowNumber: number) => string;
  duplicateRow: (rowNumber: number) => string;
  actions: string;
  /** Header of the duplicate column (visually hidden). */
  duplicateColumn: string;
  /** Header of the delete column (visually hidden). */
  deleteColumn: string;
  yes: string;
  no: string;
  required: string;
  invalidNumber: string;
  empty: string;
  /** Location prefix of the message bar, e.g. "Row 2, Quantity". */
  location: (rowNumber: number, column: string) => string;
  rowAdded: string;
  rowDeleted: string;
  rowDuplicated: string;
  pasted: (rows: number, cells: number) => string;
  /** Usage hint read with the grid name. */
  instructions: string;
}

export interface EditableGridProps<T extends { id: string }> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Accessible name and caption, e.g. "Order items". */
  label: string;
  /** Columns in display order. */
  columns: EditableGridColumn<T>[];
  /** Rows. Providing it makes the grid controlled. */
  rows?: T[];
  /** Initial rows when uncontrolled. @default [] */
  defaultRows?: T[];
  /** Called with the new rows after every committed edit, paste, add, duplicate or delete. */
  onRowsChange?: (rows: T[]) => void;
  /** Creates an empty row. Enables Add row and pasting beyond the last row. */
  createRow?: () => T;
  /** Shows a delete button per row (Ctrl+Delete). @default true */
  allowDelete?: boolean;
  /** Shows a duplicate button per row (Ctrl+D). Requires `createRow` for the new id. @default false */
  allowDuplicate?: boolean;
  /** Shows validation errors on every cell, not only edited ones, e.g. after a save attempt. @default false */
  showAllErrors?: boolean;
  /** Receives all current validation errors, e.g. for FormErrorSummary or MessagePopover. */
  onValidationChange?: (errors: EditableGridError[]) => void;
  /** Locale for number display and entry. */
  locale?: string;
  /** Maximum height before the body scrolls. */
  maxHeight?: string;
  /** Read-only grid. @default false */
  readOnly?: boolean;
  /** Overrides for the built-in strings. */
  labels?: Partial<EditableGridLabels>;
}

const defaultLabels: EditableGridLabels = {
  addRow: 'Add row',
  deleteRow: (n) => `Delete row ${n}`,
  duplicateRow: (n) => `Duplicate row ${n}`,
  actions: 'Actions',
  duplicateColumn: 'Duplicate',
  deleteColumn: 'Delete',
  yes: 'Yes',
  no: 'No',
  required: 'Enter a value.',
  invalidNumber: 'Enter a valid number.',
  empty: 'No rows yet.',
  location: (n, column) => `Row ${n}, ${column}`,
  rowAdded: 'Row added',
  rowDeleted: 'Row deleted',
  rowDuplicated: 'Row duplicated',
  pasted: (rows, cells) => `Pasted ${cells} ${cells === 1 ? 'cell' : 'cells'} into ${rows} ${rows === 1 ? 'row' : 'rows'}`,
  instructions: 'Arrow keys move between cells. Enter or typing edits, Escape cancels. Ctrl+Delete deletes a row. Paste copied cells with Ctrl+V.',
};

type Slot<T> = { kind: 'data'; column: EditableGridColumn<T> } | { kind: 'duplicate' } | { kind: 'delete' };

const isEmpty = (v: unknown) => v === undefined || v === null || v === '';

/**
 * Spreadsheet-style editing of line items (order items, journal entries, price lists): keyboard
 * navigation, in-cell editors, per-cell validation, row add/duplicate/delete and paste from Excel.
 */
export function EditableGrid<T extends { id: string }>({
  label, columns, rows: rowsProp, defaultRows = [], onRowsChange, createRow, allowDelete = true, allowDuplicate = false,
  showAllErrors = false, onValidationChange, locale, maxHeight, readOnly = false, labels: labelOverrides, className, ...rest
}: EditableGridProps<T>) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const id = useId(undefined, 'grid');
  const [rows, setRows] = useControllableState(rowsProp, defaultRows, onRowsChange);
  const [focus, setFocus] = useState({ row: 0, col: 0 });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftError, setDraftError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const tableRef = useRef<HTMLTableElement>(null);
  const editorRef = useRef<HTMLInputElement & HTMLSelectElement>(null);
  const within = useRef(false);

  const slots = useMemo<Slot<T>[]>(
    () => [
      ...columns.map((column) => ({ kind: 'data' as const, column })),
      ...(allowDuplicate && createRow && !readOnly ? [{ kind: 'duplicate' as const }] : []),
      ...(allowDelete && !readOnly ? [{ kind: 'delete' as const }] : []),
    ],
    [columns, allowDuplicate, allowDelete, createRow, readOnly],
  );
  const cellKey = (rowId: string, key: string) => `${rowId}:${key}`;
  const canEdit = (column: EditableGridColumn<T>, row: T) => !readOnly && (typeof column.editable === 'function' ? column.editable(row) : column.editable !== false);

  const errorFor = (column: EditableGridColumn<T>, row: T): string | undefined => {
    const value = row[column.key];
    if (column.required && isEmpty(value)) return labels.required;
    return column.validate?.(value, row) ?? undefined;
  };

  const errors = useMemo<EditableGridError[]>(
    () =>
      rows.flatMap((row, rowIndex) =>
        columns.flatMap((column) => {
          const msg = errorFor(column, row);
          return msg ? [{ rowId: row.id, rowIndex, key: column.key, column: column.header, message: msg }] : [];
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, columns],
  );
  const errorsKey = JSON.stringify(errors);
  const onValidationChangeRef = useRef(onValidationChange);
  onValidationChangeRef.current = onValidationChange;
  useEffect(() => onValidationChangeRef.current?.(JSON.parse(errorsKey)), [errorsKey]);

  // Keep focus inside the grid's bounds when rows or columns change.
  const rowCount = rows.length;
  useEffect(() => {
    setFocus((f) => ({ row: Math.min(f.row, Math.max(rowCount - 1, 0)), col: Math.min(f.col, slots.length - 1) }));
  }, [rowCount, slots.length]);

  // Move DOM focus to the focused cell (or its editor / button) while the grid has focus.
  useEffect(() => {
    if (!within.current) return;
    if (editing) {
      editorRef.current?.focus();
      return;
    }
    const cell = tableRef.current?.querySelector<HTMLElement>(`[data-cell="${focus.row}-${focus.col}"]`);
    const button = cell?.querySelector<HTMLElement>('button');
    (button ?? cell)?.focus();
  }, [focus, editing, rowCount]);

  const displayText = (column: EditableGridColumn<T>, value: unknown): string => {
    if (isEmpty(value)) return '';
    switch (column.type) {
      case 'number':
        return typeof value === 'number' ? formatLocaleNumber(value, locale, { minimumFractionDigits: column.decimals, maximumFractionDigits: column.decimals }) : String(value);
      case 'select':
        return column.options?.find((o) => o.value === value)?.label ?? String(value);
      case 'checkbox':
        return value ? labels.yes : labels.no;
      default:
        return String(value);
    }
  };

  /** Converts typed or pasted text to a column value; `undefined` means invalid. */
  const parseText = (column: EditableGridColumn<T>, text: string): unknown => {
    const t = text.trim();
    switch (column.type) {
      case 'number': {
        if (t === '') return null;
        const n = parseLocaleNumber(t, locale);
        if (n === null) return null;
        if (Number.isNaN(n)) {
          const plain = Number(t);
          return Number.isNaN(plain) ? undefined : plain;
        }
        return column.decimals !== undefined ? Number(n.toFixed(column.decimals)) : n;
      }
      case 'checkbox':
        return /^(1|true|yes|x|✓|ja|oui|sí)$/i.test(t) || t === labels.yes;
      case 'select': {
        const match = column.options?.find((o) => o.value === t || o.label.toLowerCase() === t.toLowerCase());
        return t === '' ? '' : match ? match.value : undefined;
      }
      default:
        return text;
    }
  };

  const updateCell = (rowIndex: number, column: EditableGridColumn<T>, value: unknown) => {
    const row = rows[rowIndex];
    if (!row || Object.is(row[column.key], value)) return;
    setRows(rows.map((r, i) => (i === rowIndex ? { ...r, [column.key]: value } : r)));
    setTouched((t) => new Set(t).add(cellKey(row.id, column.key)));
  };

  const startEdit = (initial?: string, at = focus) => {
    const slot = slots[at.col];
    const row = rows[at.row];
    if (slot?.kind !== 'data' || !row || !canEdit(slot.column, row)) return;
    if (slot.column.type === 'checkbox') {
      updateCell(at.row, slot.column, !row[slot.column.key]);
      return;
    }
    setFocus(at);
    const value = row[slot.column.key];
    setDraft(
      initial ??
        (slot.column.type === 'number' && typeof value === 'number'
          ? formatLocaleNumber(value, locale, { useGrouping: false, maximumFractionDigits: slot.column.decimals })
          : isEmpty(value)
            ? ''
            : String(value)),
    );
    setDraftError(null);
    setEditing(true);
    // Select the existing text so typing replaces it; a typed first character stays in place.
    requestAnimationFrame(() => {
      const el: HTMLElement | null = editorRef.current;
      if (el instanceof HTMLInputElement && el.type === 'text') {
        if (initial === undefined) el.select();
        else el.setSelectionRange(el.value.length, el.value.length);
      }
    });
  };

  /** Commits the draft; returns false (and keeps editing) when the text is not valid for the column. */
  const commit = (): boolean => {
    const slot = slots[focus.col];
    if (!editing || slot?.kind !== 'data') return true;
    const value = parseText(slot.column, draft);
    if (value === undefined) {
      setDraftError(slot.column.type === 'number' ? labels.invalidNumber : labels.required);
      return false;
    }
    updateCell(focus.row, slot.column, value);
    setEditing(false);
    setDraftError(null);
    return true;
  };

  const cancel = () => {
    setEditing(false);
    setDraftError(null);
  };

  const move = (row: number, col: number) => {
    setFocus({ row: Math.min(Math.max(row, 0), Math.max(rows.length - 1, 0)), col: Math.min(Math.max(col, 0), slots.length - 1) });
  };

  const addRow = (afterIndex = rows.length - 1, copyOf?: T) => {
    if (!createRow) return;
    const fresh = createRow();
    const row = copyOf ? { ...copyOf, id: fresh.id } : fresh;
    const next = [...rows.slice(0, afterIndex + 1), row, ...rows.slice(afterIndex + 1)];
    within.current = true;
    setRows(next);
    setFocus({ row: afterIndex + 1, col: 0 });
    setMessage(copyOf ? labels.rowDuplicated : labels.rowAdded);
  };

  const deleteRow = (index: number) => {
    within.current = true;
    setRows(rows.filter((_, i) => i !== index));
    setFocus((f) => ({ row: Math.max(Math.min(f.row, rows.length - 2), 0), col: f.col }));
    setMessage(labels.rowDeleted);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const { row, col } = focus;
    const slot = slots[col];
    const ctrl = event.ctrlKey || event.metaKey;
    if (editing) {
      if (event.key === 'Escape') {
        event.preventDefault();
        cancel();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (commit()) move(row + (event.shiftKey ? -1 : 1), col);
      } else if (event.key === 'Tab') {
        if (!commit()) {
          event.preventDefault();
          return;
        }
        // Tab moves through data cells like a spreadsheet; at the last cell it leaves the grid.
        const lastData = columns.length - 1;
        if (event.shiftKey ? row === 0 && col === 0 : row === rows.length - 1 && col >= lastData) return;
        event.preventDefault();
        if (event.shiftKey) {
          if (col === 0) move(row - 1, lastData);
          else move(row, col - 1);
        } else if (col >= lastData) move(row + 1, 0);
        else move(row, col + 1);
      }
      return;
    }
    // A key pressed on a row action button activates it natively.
    if ((event.target as HTMLElement).tagName === 'BUTTON' && (event.key === 'Enter' || event.key === ' ')) return;
    const keys: Record<string, () => void> = {
      ArrowRight: () => move(row, col + 1),
      ArrowLeft: () => move(row, col - 1),
      ArrowDown: () => move(row + 1, col),
      ArrowUp: () => move(row - 1, col),
      Home: () => (ctrl ? move(0, 0) : move(row, 0)),
      End: () => (ctrl ? move(rows.length - 1, slots.length - 1) : move(row, slots.length - 1)),
      PageDown: () => move(row + 10, col),
      PageUp: () => move(row - 10, col),
      Enter: () => startEdit(),
      F2: () => startEdit(),
      ' ': () => slot?.kind === 'data' && slot.column.type === 'checkbox' && startEdit(),
      Delete: () => {
        if (ctrl && allowDelete && !readOnly) deleteRow(row);
        else if (slot?.kind === 'data' && rows[row] && canEdit(slot.column, rows[row]) && slot.column.type !== 'checkbox') updateCell(row, slot.column, slot.column.type === 'number' ? null : '');
      },
      Backspace: () => keys.Delete(),
      d: () => ctrl && allowDuplicate && rows[row] && addRow(row, rows[row]),
    };
    const handler = keys[event.key];
    if (handler && (event.key !== 'd' || ctrl)) {
      event.preventDefault();
      handler();
      return;
    }
    // Typing a character starts editing with it, like a spreadsheet.
    if (event.key.length === 1 && !ctrl && !event.altKey && slot?.kind === 'data' && slot.column.type !== 'checkbox' && slot.column.type !== 'select') {
      event.preventDefault();
      startEdit(event.key);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLTableElement>) => {
    if (editing || readOnly) return;
    const text = event.clipboardData.getData('text/plain');
    if (!text) return;
    event.preventDefault();
    const lines = text.replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n').map((l) => l.split('\t'));
    let next = [...rows];
    let cells = 0;
    lines.forEach((cellsInLine, i) => {
      const r = focus.row + i;
      if (r >= next.length) {
        if (!createRow) return;
        next = [...next, createRow()];
      }
      cellsInLine.forEach((raw, j) => {
        const slot = slots[focus.col + j];
        if (slot?.kind !== 'data' || !canEdit(slot.column, next[r])) return;
        const value = parseText(slot.column, raw);
        if (value === undefined) return;
        next[r] = { ...next[r], [slot.column.key]: value };
        cells++;
        setTouched((t) => new Set(t).add(cellKey(next[r].id, slot.column.key)));
      });
    });
    setRows(next);
    setMessage(labels.pasted(Math.min(lines.length, next.length - focus.row), cells));
  };

  const onCopy = (event: ClipboardEvent<HTMLTableElement>) => {
    if (editing) return;
    const slot = slots[focus.col];
    const row = rows[focus.row];
    if (slot?.kind !== 'data' || !row) return;
    event.preventDefault();
    event.clipboardData.setData('text/plain', displayText(slot.column, row[slot.column.key]));
  };

  const focusedSlot = slots[focus.col];
  const focusedRow = rows[focus.row];
  const focusedError =
    draftError ??
    (focusedSlot?.kind === 'data' && focusedRow && (showAllErrors || touched.has(cellKey(focusedRow.id, focusedSlot.column.key))) ? errorFor(focusedSlot.column, focusedRow) : undefined);

  const renderEditor = (column: EditableGridColumn<T>) => {
    const common = {
      ref: editorRef,
      className: styles.editor,
      'aria-label': `${column.header}, ${labels.location(focus.row + 1, column.header)}`,
      'aria-invalid': draftError ? true : undefined,
      onBlur: () => {
        // Leaving the cell commits; invalid text is dropped rather than trapping focus.
        if (!commit()) cancel();
      },
    };
    if (column.type === 'select') {
      return (
        <select {...common} value={draft} onChange={(e) => setDraft(e.target.value)}>
          <option value="" />
          {column.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    return <input {...common} type={column.type === 'date' ? 'date' : 'text'} inputMode={column.type === 'number' ? 'decimal' : undefined} value={draft} onChange={(e) => setDraft(e.target.value)} />;
  };

  return (
    <div className={cx(styles.root, className)} {...rest}>
      <div className={styles.scroll} style={{ maxHeight }}>
        <table
          ref={tableRef}
          className={styles.table}
          role="grid"
          aria-label={label}
          aria-describedby={`${id}-help`}
          aria-rowcount={rows.length + 1}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onCopy={onCopy}
          onFocus={() => (within.current = true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) within.current = false;
          }}
        >
          <thead>
            <tr role="row">
              <th className={styles.rowNumber} role="columnheader" aria-label="#">
                #
              </th>
              {slots.map((slot) =>
                slot.kind === 'data' ? (
                  <th key={slot.column.key} role="columnheader" style={{ width: slot.column.width, textAlign: slot.column.align ?? (slot.column.type === 'number' ? 'end' : 'start') }}>
                    {slot.column.header}
                    {slot.column.required && (
                      <span className={styles.required} aria-hidden="true">
                        {' '}
                        *
                      </span>
                    )}
                  </th>
                ) : (
                  <th key={slot.kind} role="columnheader" className={styles.actionHeader}>
                    <span className="eui-visually-hidden">{slot.kind === 'delete' ? labels.deleteColumn : labels.duplicateColumn}</span>
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr role="row">
                <td role="gridcell" colSpan={slots.length + 1} className={styles.empty}>
                  {labels.empty}
                </td>
              </tr>
            )}
            {rows.map((row, r) => (
              <tr key={row.id} role="row" aria-rowindex={r + 2} className={cx(focus.row === r && styles.focusedRow)}>
                <th scope="row" className={styles.rowNumber}>
                  {r + 1}
                </th>
                {slots.map((slot, c) => {
                  const focused = focus.row === r && focus.col === c;
                  const common = {
                    role: 'gridcell',
                    'data-cell': `${r}-${c}`,
                    tabIndex: focused && !editing ? 0 : -1,
                    onClick: () => {
                      within.current = true;
                      if (editing && !focused && !commit()) return;
                      setFocus({ row: r, col: c });
                    },
                    // Focus can also arrive from assistive technology or scripts; follow it.
                    onFocus: () => {
                      within.current = true;
                      if (!editing && !focused) setFocus({ row: r, col: c });
                    },
                  };
                  if (slot.kind !== 'data') {
                    const isDelete = slot.kind === 'delete';
                    return (
                      <td key={slot.kind} {...common} className={styles.actionCell}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          tabIndex={focused ? 0 : -1}
                          aria-label={isDelete ? labels.deleteRow(r + 1) : labels.duplicateRow(r + 1)}
                          title={isDelete ? labels.deleteRow(r + 1) : labels.duplicateRow(r + 1)}
                          onClick={() => (isDelete ? deleteRow(r) : addRow(r, row))}
                        >
                          {isDelete ? <DeleteIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
                        </button>
                      </td>
                    );
                  }
                  const { column } = slot;
                  const value = row[column.key];
                  const editable = canEdit(column, row);
                  const shownError = (showAllErrors || touched.has(cellKey(row.id, column.key))) && errorFor(column, row);
                  const align = column.align ?? (column.type === 'number' ? 'end' : 'start');
                  return (
                    <td
                      key={column.key}
                      {...common}
                      aria-readonly={!editable || undefined}
                      aria-invalid={shownError ? true : undefined}
                      className={cx(styles.cell, focused && styles.focused, !editable && styles.readOnly, shownError && styles.invalid, editing && focused && styles.editing)}
                      style={{ textAlign: align }}
                      onDoubleClick={() => {
                        within.current = true;
                        if (column.type !== 'checkbox') startEdit(undefined, { row: r, col: c });
                      }}
                    >
                      {editing && focused ? (
                        renderEditor(column)
                      ) : column.type === 'checkbox' ? (
                        <span className={cx(styles.check, value ? styles.checked : undefined)} onClick={() => editable && updateCell(r, column, !value)}>
                          <span aria-hidden="true">{value ? '✓' : ''}</span>
                          <span className="eui-visually-hidden">{value ? labels.yes : labels.no}</span>
                        </span>
                      ) : (
                        <span className={styles.value}>{column.format ? column.format(value, row) : displayText(column, value)}</span>
                      )}
                      {shownError && !(editing && focused) && <HighPriorityIcon className={styles.errorIcon} aria-hidden="true" />}
                      {shownError && <span className="eui-visually-hidden">, {shownError}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.footer}>
        {createRow && !readOnly && (
          <Button size="sm" variant="tertiary" icon={<AddIcon />} onClick={() => addRow()}>
            {labels.addRow}
          </Button>
        )}
        <p className={cx(styles.messageBar, focusedError && styles.messageError)} aria-live="polite">
          {focusedError && focusedSlot?.kind === 'data' && (
            <>
              <HighPriorityIcon aria-hidden="true" />
              {labels.location(focus.row + 1, focusedSlot.column.header)}: {focusedError}
            </>
          )}
        </p>
      </div>
      <span id={`${id}-help`} className="eui-visually-hidden">
        {labels.instructions}
      </span>
      <span className="eui-visually-hidden" aria-live="polite">
        {message}
      </span>
    </div>
  );

}
