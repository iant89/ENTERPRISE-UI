import type { KeyboardRow } from '../registry';
import styles from './Docs.module.css';

export function KeyboardTable({ rows, caption }: { rows: KeyboardRow[]; caption: string }) {
  return (
    <table className={styles.kbdTable}>
      <caption className="eui-visually-hidden">{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Key</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.keys}>
            <th scope="row">
              {row.keys.split(' / ').map((key, i) => (
                <span key={key}>
                  {i > 0 && ' / '}
                  <kbd>{key}</kbd>
                </span>
              ))}
            </th>
            <td>{row.action}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
