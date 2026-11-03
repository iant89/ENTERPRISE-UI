import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { Download, FileText, Upload } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { Button } from '../../components/button';
import { Checkbox } from '../../components/checkbox';
import { DescriptionList } from '../../components/description-list';
import { MessageStrip } from '../../components/message-strip';
import { Select } from '../../components/select';
import { Table, type TableColumn } from '../../components/table';
import { Wizard } from '../wizard';
import { csvCell, parseDelimited } from './csv';
import styles from './ImportWizard.module.css';

export interface ImportField {
  /** Key of the value in each imported record. */
  key: string;
  /** Field name shown to the user. */
  label: string;
  /** Rows with an empty value for this field are rejected. @default false */
  required?: boolean;
  /** Help text shown in the mapping step, such as the expected format. */
  description?: string;
  /** Other column headings that map to this field automatically. Matching ignores case, spaces and punctuation. */
  aliases?: string[];
  /** Converts the cell text. Throw an `Error` to reject the value; its message is shown. Runs on non-empty values only. */
  parse?: (value: string) => unknown;
  /** Return a message to reject the parsed value. Runs on non-empty values only. */
  validate?: (value: unknown, row: Readonly<Record<string, string>>) => string | undefined;
}

export interface ImportRecord {
  /** Row number in the source file (1-based, counting the heading row). */
  row: number;
  /** Parsed values by field key. Unmapped and empty optional fields are omitted. */
  values: Record<string, unknown>;
}

export interface ImportRowError {
  /** Row number in the source file. */
  row: number;
  /** Key of the field the error belongs to, when it belongs to one. */
  field?: string;
  message: string;
}

export interface ImportResult {
  /** Number of records the host saved. Defaults to the number of records sent. */
  imported?: number;
  /** Records the host rejected, shown to the user after the import. */
  failed?: ImportRowError[];
}

export interface ImportWizardProps {
  /** Fields the imported records have. */
  fields: ImportField[];
  /** Saves the valid records. Throw to keep the user on the last step with the error shown. */
  onImport: (records: ImportRecord[]) => ImportResult | void | Promise<ImportResult | void>;
  /** Plural noun for the records, used in headings and buttons. @default 'records' */
  entityName?: string;
  /** Singular noun for one record. Defaults to `entityName` without a trailing "s". */
  entityNameSingular?: string;
  /** Extensions or MIME types offered in the file picker. @default ['.csv', '.tsv', '.txt'] */
  accept?: string[];
  /** Largest accepted file size, in bytes. @default 5_000_000 */
  maxFileSize?: number;
  /** Largest number of data rows accepted. */
  maxRows?: number;
  /**
   * Reads a file into rows of cell text, for formats other than delimited
   * text (for example spreadsheets). The first row may be a heading row.
   * Defaults to a CSV / TSV parser that detects the delimiter.
   */
  parseFile?: (file: File) => Promise<string[][]>;
  /**
   * File loaded when the wizard first opens, for example one the user dropped
   * onto a list page that then opened the wizard.
   */
  defaultFile?: File;
  /** Offer a CSV template with one column per field. @default true */
  showTemplate?: boolean;
  /** Number of rows shown in the review table. @default 100 */
  previewRowLimit?: number;
  /** Called when the user cancels. Shows a Cancel button. */
  onCancel?: () => void;
  /** Called when the user closes the results screen. Shows a Done button. */
  onDone?: (result: Required<ImportResult>) => void;
  /** Accessible name of the wizard. Defaults to "Import {entityName}". */
  'aria-label'?: string;
  /** Additional CSS class names for the root element. */
  className?: string;
}

interface Loaded {
  name: string;
  size: number;
  grid: string[][];
}

interface CheckedRow {
  id: string;
  row: number;
  cells: string[];
  values: Record<string, unknown>;
  errors: Record<string, string>;
}

const NONE = 'none';
const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const columnValue = (index: number) => `c${index}`;
const formatBytes = (bytes: number) => (bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : bytes >= 1000 ? `${Math.round(bytes / 1000)} KB` : `${bytes} bytes`);
const plural = (n: number, one: string, many: string) => `${n.toLocaleString()} ${n === 1 ? one : many}`;

async function readText(file: File): Promise<string> {
  if (typeof file.text === 'function') return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('The file could not be read.'));
    reader.readAsText(file);
  });
}

function accepted(file: File, rules: string[]) {
  return !rules.length || rules.some((rule) => {
    const value = rule.trim().toLowerCase();
    if (value.startsWith('.')) return file.name.toLowerCase().endsWith(value);
    if (value.endsWith('/*')) return file.type.toLowerCase().startsWith(value.slice(0, -1));
    return value === file.type.toLowerCase();
  });
}

/** Maps each field to the first unused column whose heading matches its key, label or an alias. */
export function autoMapColumns(fields: ImportField[], headers: string[]): Record<string, number | null> {
  const used = new Set<number>();
  const mapping: Record<string, number | null> = {};
  const normalized = headers.map(normalize);
  for (const field of fields) {
    const names = new Set([field.key, field.label, ...(field.aliases ?? [])].map(normalize));
    const index = normalized.findIndex((h, i) => h !== '' && !used.has(i) && names.has(h));
    mapping[field.key] = index >= 0 ? index : null;
    if (index >= 0) used.add(index);
  }
  return mapping;
}

/**
 * Imports records from a CSV or similar file in four steps: upload, map
 * columns to fields, review validated rows, and import. Built on Wizard.
 * Parsing and validation run in the browser; the host saves the records in
 * `onImport` and can report rows it rejected.
 */
export function ImportWizard({
  fields, onImport, entityName = 'records', entityNameSingular, accept = ['.csv', '.tsv', '.txt'], maxFileSize = 5_000_000, maxRows, parseFile, defaultFile,
  showTemplate = true, previewRowLimit = 100, onCancel, onDone, 'aria-label': ariaLabel, className,
}: ImportWizardProps) {
  const id = useId(undefined, 'import');
  const one = entityNameSingular ?? entityName.replace(/s$/, '');
  const [run, setRun] = useState(0);
  const [file, setFile] = useState<Loaded | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [hasHeader, setHasHeader] = useState(true);
  const [mapping, setMapping] = useState<Record<string, number | null>>({});
  const [onlyErrors, setOnlyErrors] = useState(true);
  const [skipInvalid, setSkipInvalid] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<(Required<ImportResult> & { skipped: number }) | null>(null);
  const readToken = useRef(0);
  const resultHeading = useRef<HTMLHeadingElement>(null);

  const headers = useMemo(() => {
    if (!file) return [];
    const width = file.grid[0]?.length ?? 0;
    return Array.from({ length: width }, (_, i) => (hasHeader && file.grid[0][i]?.trim()) || `Column ${i + 1}`);
  }, [file, hasHeader]);
  const dataRows = useMemo(() => (file ? (hasHeader ? file.grid.slice(1) : file.grid) : []), [file, hasHeader]);
  const firstRowNumber = hasHeader ? 2 : 1;

  useEffect(() => {
    if (file) setMapping(autoMapColumns(fields, headers));
    // Re-map only when a new file is loaded or the heading option changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, hasHeader]);

  useEffect(() => {
    if (defaultFile) void load(defaultFile);
    // Load the initial file once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (result) resultHeading.current?.focus();
  }, [result]);

  const checked = useMemo<CheckedRow[]>(() => dataRows.map((cells, index) => {
    const raw: Record<string, string> = {};
    for (const field of fields) {
      const col = mapping[field.key];
      if (col != null) raw[field.key] = (cells[col] ?? '').trim();
    }
    const values: Record<string, unknown> = {};
    const errors: Record<string, string> = {};
    for (const field of fields) {
      const value = raw[field.key] ?? '';
      if (value === '') {
        if (field.required) errors[field.key] = `${field.label} is required.`;
        continue;
      }
      try {
        const parsed = field.parse ? field.parse(value) : value;
        const message = field.validate?.(parsed, raw);
        if (message) errors[field.key] = message;
        else values[field.key] = parsed;
      } catch (err) {
        errors[field.key] = (err instanceof Error && err.message) || `${field.label} is not valid.`;
      }
    }
    const row = index + firstRowNumber;
    return { id: String(row), row, cells, values, errors };
  }), [dataRows, fields, mapping, firstRowNumber]);

  const invalid = checked.filter((r) => Object.keys(r.errors).length > 0);
  const valid = checked.filter((r) => Object.keys(r.errors).length === 0);
  const mappedFields = fields.filter((f) => mapping[f.key] != null);
  const ignoredColumns = headers.filter((_, i) => !Object.values(mapping).includes(i));

  const load = async (picked: File | undefined) => {
    if (!picked) return;
    const token = ++readToken.current;
    setFileError(null);
    setFile(null);
    if (!accepted(picked, accept)) {
      setFileError(`${picked.name} is not a supported file type. Choose a ${accept.join(', ')} file.`);
      return;
    }
    if (picked.size > maxFileSize) {
      setFileError(`${picked.name} is larger than ${formatBytes(maxFileSize)}.`);
      return;
    }
    setReading(true);
    try {
      const grid = parseFile ? await parseFile(picked) : parseDelimited(await readText(picked));
      if (token !== readToken.current) return;
      if (grid.length === 0) setFileError(`${picked.name} is empty.`);
      else if (maxRows != null && grid.length - 1 > maxRows) setFileError(`${picked.name} has more than ${plural(maxRows, 'row', 'rows')}. Split it into smaller files.`);
      else setFile({ name: picked.name, size: picked.size, grid });
    } catch (err) {
      if (token === readToken.current) setFileError((err instanceof Error && err.message) || `${picked.name} could not be read.`);
    } finally {
      if (token === readToken.current) setReading(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void load(event.dataTransfer.files[0]);
  };

  const reset = () => {
    readToken.current++;
    setFile(null);
    setFileError(null);
    setReading(false);
    setHasHeader(true);
    setMapping({});
    setOnlyErrors(true);
    setSkipInvalid(false);
    setResult(null);
    setRun((n) => n + 1);
  };

  const templateHref = `data:text/csv;charset=utf-8,${encodeURIComponent(fields.map((f) => csvCell(f.label)).join(',') + '\r\n')}`;

  if (result) {
    const failed = result.failed;
    return (
      <section className={cx(styles.root, styles.result, className)} aria-label={ariaLabel ?? `Import ${entityName}`}>
        <h2 ref={resultHeading} tabIndex={-1} className={styles.resultHeading}>Import finished</h2>
        <MessageStrip tone={failed.length ? 'warning' : 'success'} announce="polite" title={`Imported ${plural(result.imported, one, entityName)}.`}>
          {[
            failed.length ? `${plural(failed.length, 'row was', 'rows were')} rejected.` : null,
            result.skipped ? `${plural(result.skipped, 'row with errors was', 'rows with errors were')} skipped.` : null,
          ].filter(Boolean).join(' ') || undefined}
        </MessageStrip>
        {failed.length > 0 && (
          <>
          <h3 className={styles.subheading}>Rejected rows</h3>
          <Table
            aria-label="Rejected rows"
            data={failed.map((f, i) => ({ ...f, id: String(i) }))}
            columns={[
              { id: 'row', header: 'Row', accessor: 'row', rowHeader: true, width: '5rem' },
              { id: 'field', header: 'Field', cell: (f) => fields.find((x) => x.key === f.field)?.label ?? f.field ?? '—' },
              { id: 'message', header: 'Problem', accessor: 'message', wrap: true },
            ]}
            responsive="stack"
          />
          </>
        )}
        <div className={styles.resultActions}>
          <Button onClick={reset}>Import another file</Button>
          {onDone && <Button variant="primary" onClick={() => onDone({ imported: result.imported, failed })}>Done</Button>}
        </div>
      </section>
    );
  }

  const columnOptions = [{ value: NONE, label: 'Do not import' }, ...headers.map((h, i) => ({ value: columnValue(i), label: h }))];
  const mappingColumns: TableColumn<ImportField & { id: string }>[] = [
    {
      id: 'field', header: 'Field', rowHeader: true, wrap: true,
      cell: (f) => (
        <span className={styles.fieldName}>
          {f.label}
          {f.required && <span className={styles.required}> (required)</span>}
          {f.description && <span className={styles.hint}>{f.description}</span>}
        </span>
      ),
    },
    {
      id: 'column', header: 'Column in file', minWidth: '12rem',
      cell: (f) => (
        <Select
          aria-label={`Column for ${f.label}`}
          options={columnOptions}
          value={mapping[f.key] == null ? NONE : columnValue(mapping[f.key]!)}
          onChange={(value) => setMapping((m) => ({ ...m, [f.key]: !value || value === NONE ? null : Number(value.slice(1)) }))}
          size="sm"
        />
      ),
    },
    {
      id: 'sample', header: 'First value', wrap: true,
      cell: (f) => {
        const col = mapping[f.key];
        const sample = col == null ? '' : dataRows.find((r) => r[col]?.trim())?.[col]?.trim();
        return sample ? <span className={styles.sample}>{sample}</span> : <span className={styles.muted}>—</span>;
      },
    },
  ];

  const shownRows = (onlyErrors && invalid.length ? invalid : checked).slice(0, previewRowLimit);
  const reviewColumns: TableColumn<CheckedRow>[] = [
    { id: 'row', header: 'Row', accessor: 'row', rowHeader: true, width: '4.5rem' },
    {
      id: 'status', header: 'Status',
      cell: (r) => {
        const n = Object.keys(r.errors).length;
        return n ? <span className={styles.statusError}>{plural(n, 'error', 'errors')}</span> : <span className={styles.statusOk}>Ready</span>;
      },
    },
    ...mappedFields.map<TableColumn<CheckedRow>>((f) => ({
      id: f.key, header: f.label, wrap: true,
      cell: (r) => {
        const text = r.cells[mapping[f.key]!]?.trim() ?? '';
        const error = r.errors[f.key];
        return (
          <span className={styles.cell}>
            {text || <span className={styles.muted}>—</span>}
            {error && <span className={styles.cellError}>{error}</span>}
          </span>
        );
      },
    })),
  ];

  return (
    <Wizard
      key={run}
      className={cx(styles.root, className)}
      aria-label={ariaLabel ?? `Import ${entityName}`}
      finishLabel={`Import ${plural(valid.length, one, entityName)}`}
      onCancel={onCancel}
      onFinish={async () => {
        const records = valid.map((r) => ({ row: r.row, values: r.values }));
        const outcome = (await onImport(records)) || {};
        setResult({ imported: outcome.imported ?? records.length, failed: outcome.failed ?? [], skipped: invalid.length });
      }}
      steps={[
        {
          id: 'upload',
          title: 'Upload file',
          description: `Choose a CSV or tab-separated file with one ${one} per row.`,
          validate: () => (reading ? 'Wait for the file to finish loading.' : fileError ? fileError : !file ? 'Choose a file to import.' : dataRows.length === 0 ? 'The file has no data rows.' : true),
          content: (
            <div className={styles.stack}>
              <div
                className={cx(styles.drop, dragging && styles.dragging)}
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <Upload aria-hidden="true" className={styles.dropIcon} />
                <p className={styles.dropText}>Drop a file here, or</p>
                <label className={styles.browse}>
                  Choose file
                  <input
                    id={`${id}-file`}
                    type="file"
                    className={styles.fileInput}
                    accept={accept.join(',')}
                    aria-describedby={`${id}-limits`}
                    onChange={(event) => {
                      void load(event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                </label>
                <p id={`${id}-limits`} className={styles.hint}>
                  {accept.join(', ')} · up to {formatBytes(maxFileSize)}
                  {maxRows != null && ` · up to ${plural(maxRows, 'row', 'rows')}`}
                </p>
              </div>
              <div role="status" className={styles.fileStatus}>
                {reading && 'Reading file…'}
                {file && !reading && (
                  <span className={styles.fileName}>
                    <FileText aria-hidden="true" />
                    {file.name} · {formatBytes(file.size)} · {plural(dataRows.length, 'data row', 'data rows')}
                  </span>
                )}
              </div>
              {fileError && <MessageStrip tone="error">{fileError}</MessageStrip>}
              {file && <Checkbox label="First row contains column names" checked={hasHeader} onChange={setHasHeader} />}
              {showTemplate && (
                <a className={styles.template} href={templateHref} download={`${entityName.replace(/\s+/g, '-').toLowerCase()}-template.csv`}>
                  <Download aria-hidden="true" />
                  Download a template
                </a>
              )}
            </div>
          ),
        },
        {
          id: 'map',
          title: 'Map columns',
          description: 'Choose the column in your file that holds each field. Columns that match a field name are mapped for you.',
          validate: () => {
            const missing = fields.filter((f) => f.required && mapping[f.key] == null).map((f) => f.label);
            if (missing.length) return `Map a column to ${missing.join(', ')}.`;
            const cols = Object.values(mapping).filter((c): c is number => c != null);
            const duplicate = cols.find((c, i) => cols.indexOf(c) !== i);
            if (duplicate != null) return `The column ${headers[duplicate]} is mapped to more than one field.`;
            if (!cols.length) return 'Map at least one column.';
            return true;
          },
          content: (
            <div className={styles.stack}>
              <Table caption="Field mapping" data={fields.map((f) => ({ ...f, id: f.key }))} columns={mappingColumns} responsive="stack" />
              {ignoredColumns.length > 0 && (
                <p className={styles.hint}>
                  Not imported: {ignoredColumns.join(', ')}.
                </p>
              )}
            </div>
          ),
        },
        {
          id: 'review',
          title: 'Review',
          description: 'Rows are checked against the field rules. Fix problems in your file and upload it again, or skip the rows with errors.',
          validate: () => {
            if (invalid.length && !skipInvalid) return `${plural(invalid.length, 'row has', 'rows have')} errors. Fix the file and upload it again, or choose to skip these rows.`;
            if (!valid.length) return 'No rows are ready to import.';
            return true;
          },
          content: (
            <div className={styles.stack}>
              <MessageStrip tone={invalid.length ? 'warning' : 'success'} title={`${valid.length.toLocaleString()} of ${plural(checked.length, 'row', 'rows')} ready to import.`}>
                {invalid.length ? `${plural(invalid.length, 'row has', 'rows have')} errors.` : 'No problems found.'}
              </MessageStrip>
              {invalid.length > 0 && (
                <div className={styles.options}>
                  <Checkbox label="Show only rows with errors" checked={onlyErrors} onChange={setOnlyErrors} />
                  <Checkbox label={`Skip ${plural(invalid.length, 'row', 'rows')} with errors and import the rest`} checked={skipInvalid} onChange={setSkipInvalid} />
                </div>
              )}
              <Table
                caption="Rows to import"
                data={shownRows}
                columns={reviewColumns}
                getRowHighlight={(r) => (Object.keys(r.errors).length ? 'error' : undefined)}
                maxHeight="24rem"
                density="compact"
                responsive="stack"
              />
              {shownRows.length < (onlyErrors && invalid.length ? invalid.length : checked.length) && (
                <p className={styles.hint}>
                  Showing the first {shownRows.length.toLocaleString()} of {(onlyErrors && invalid.length ? invalid.length : checked.length).toLocaleString()} rows.
                </p>
              )}
            </div>
          ),
        },
        {
          id: 'import',
          title: 'Import',
          description: `Check the summary, then import. Only ${entityName} without errors are sent.`,
          content: (
            <DescriptionList
              columns={2}
              items={[
                { term: 'File', description: file?.name ?? '—' },
                { term: `${entityName[0].toUpperCase()}${entityName.slice(1)} to import`, description: valid.length.toLocaleString() },
                { term: 'Rows skipped', description: invalid.length.toLocaleString() },
                { term: 'Fields', description: mappedFields.map((f) => f.label).join(', ') },
              ]}
            />
          ),
        },
      ]}
    />
  );
}
