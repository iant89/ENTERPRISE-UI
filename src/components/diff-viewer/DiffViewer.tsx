import styles from './DiffViewer.module.css';

export type DiffValue = null | boolean | number | string | DiffValue[] | { [key: string]: DiffValue };
export interface DiffEntry { path: string; kind: 'added' | 'removed' | 'modified'; before?: DiffValue; after?: DiffValue }
export interface DiffViewerProps {
  /** Changes supplied by a trusted source or produced with compareDiffValues. */
  changes: readonly DiffEntry[];
  title?: string;
}
const isObject = (value: DiffValue): value is { [key: string]: DiffValue } => value !== null && typeof value === 'object' && !Array.isArray(value);
/** Compare JSON-shaped values. Arrays are treated as a single value; paths use JSON Pointer escaping. */
export function compareDiffValues(before: DiffValue, after: DiffValue): DiffEntry[] {
  const changes: DiffEntry[] = [];
  const walk = (a: DiffValue, b: DiffValue, path: string) => {
    if (isObject(a) && isObject(b)) {
      const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
      for (const key of keys) {
        const next = `${path}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;
        if (!Object.hasOwn(a, key)) changes.push({ path: next, kind: 'added', after: b[key] });
        else if (!Object.hasOwn(b, key)) changes.push({ path: next, kind: 'removed', before: a[key] });
        else walk(a[key], b[key], next);
      }
    } else if (!equal(a, b)) changes.push({ path: path || '/', kind: 'modified', before: a, after: b });
  };
  walk(before, after, '');
  return changes;
}
function equal(a: DiffValue, b: DiffValue): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((value, index) => equal(value, b[index]));
  if (isObject(a) && isObject(b)) {
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every((key) => Object.hasOwn(b, key) && equal(a[key], b[key]));
  }
  return false;
}
const format = (value: DiffValue | undefined) => value === undefined ? 'Not present' : typeof value === 'string' ? value : JSON.stringify(value);
/** Accessible structured comparison; indicators do not rely on color alone. */
export function DiffViewer({ changes, title = 'Changes' }: DiffViewerProps) {
  return <section aria-label={title} className={styles.root}>
    <h3>{title}</h3>
    {changes.length === 0 ? <p>No changes.</p> : <div className={styles.scroll}><table>
      <thead><tr><th scope="col">Field</th><th scope="col">Change</th><th scope="col">Before</th><th scope="col">After</th></tr></thead>
      <tbody>{changes.map((change, index) => <tr key={`${change.path}-${index}`}><th scope="row">{change.path}</th><td className={styles[change.kind]}>{change.kind === 'added' ? 'Added' : change.kind === 'removed' ? 'Removed' : 'Modified'}</td><td>{format(change.before)}</td><td>{format(change.after)}</td></tr>)}</tbody>
    </table></div>}
  </section>;
}
