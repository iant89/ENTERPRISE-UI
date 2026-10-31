import { forwardRef, useId, useRef, useState, type DragEvent, type HTMLAttributes, type ReactNode } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { IconButton } from '../icon-button';
import { ProgressBar } from '../progress-bar';
import styles from './UploadCollection.module.css';

export type UploadCollectionItemStatus = 'complete' | 'uploading' | 'error' | 'ready';

export interface UploadCollectionItem {
  id: string;
  fileName: string;
  /** Size in bytes. */
  size?: number;
  status?: UploadCollectionItemStatus;
  /** 0–100 while uploading. */
  progress?: number;
  /** Error or status message. */
  message?: string;
  /** Optional thumbnail or icon. */
  thumbnail?: ReactNode;
  /** Open/download link. */
  href?: string;
  /** Hide the delete action for this item. */
  disableDelete?: boolean;
}

export interface UploadCollectionProps extends Omit<HTMLAttributes<HTMLElement>, 'onDrop'> {
  /** Items shown in the upload collection. */
  items: UploadCollectionItem[];
  /** Accessible name and visible header. */
  title: string;
  /** Files dropped or chosen; the application uploads them and updates `items`. */
  onFilesSelected?: (files: File[]) => void;
  /** Called with the ID of the item the user deletes. */
  onItemDelete?: (id: string) => void;
  /** Native file type filter for the chooser. */
  accept?: string;
  /** @default true */
  /** Allows selecting more than one file. */
  multiple?: boolean;
  /** Shown when there are no items. */
  noDataText?: ReactNode;
  /** Localized labels. */
  labels?: { add: string; dropHere: string; delete: (fileName: string) => string; progress: (fileName: string) => string; statuses: Record<UploadCollectionItemStatus, string> };
}

const defaultLabels = {
  add: 'Add files', dropHere: 'Drop files here to upload',
  delete: (n: string) => `Delete ${n}`, progress: (n: string) => `Upload progress for ${n}`,
  statuses: { complete: 'Uploaded', uploading: 'Uploading', error: 'Upload failed', ready: 'Ready' },
};

export const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0; let n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${i === 0 ? n : n.toFixed(1)} ${units[i]}`;
};

/** A list of uploaded or uploading files with drag-and-drop and per-file actions. Transport stays with the application. */
export const UploadCollection = forwardRef<HTMLElement, UploadCollectionProps>(function UploadCollection(
  { items, title, onFilesSelected, onItemDelete, accept, multiple = true, noDataText = 'No files yet.', labels, className, ...rest },
  ref,
) {
  const text = { ...defaultLabels, ...labels, statuses: { ...defaultLabels.statuses, ...labels?.statuses } };
  const headingId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const onDrop = (event: DragEvent) => {
    event.preventDefault(); setDragging(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length && onFilesSelected) onFilesSelected(multiple ? files : files.slice(0, 1));
  };
  return (
    <section ref={ref} aria-labelledby={headingId} className={cx(styles.root, dragging && styles.dragging, className)} onDragOver={onFilesSelected ? (e) => { e.preventDefault(); setDragging(true); } : undefined} onDragLeave={() => setDragging(false)} onDrop={onFilesSelected ? onDrop : undefined} {...rest}>
      <div className={styles.header}>
        <h3 id={headingId} className={styles.title}>{title} ({items.length})</h3>
        {onFilesSelected && (
          <>
            <button type="button" className={styles.add} onClick={() => input.current?.click()}>{text.add}</button>
            <input ref={input} type="file" hidden accept={accept} multiple={multiple} onChange={(e) => { const files = Array.from(e.target.files ?? []); if (files.length) onFilesSelected(files); e.target.value = ''; }} />
          </>
        )}
      </div>
      {dragging && <p className={styles.dropHint}>{text.dropHere}</p>}
      {items.length === 0 ? <p className={styles.empty}>{noDataText}</p> : (
        <ul className={styles.list}>
          {items.map((item) => {
            const status = item.status ?? 'complete';
            return (
              <li key={item.id} className={styles.item}>
                <span className={styles.thumb} aria-hidden="true">{item.thumbnail ?? <FileText />}</span>
                <div className={styles.details}>
                  {item.href ? <a href={item.href} className={styles.name}>{item.fileName}</a> : <span className={styles.name}>{item.fileName}</span>}
                  <span className={cx(styles.meta, status === 'error' && styles.error)}>
                    {text.statuses[status]}{item.size != null && ` · ${formatFileSize(item.size)}`}{item.message && ` · ${item.message}`}
                  </span>
                  {status === 'uploading' && <ProgressBar value={item.progress ?? 0} label={text.progress(item.fileName)} />}
                </div>
                {onItemDelete && !item.disableDelete && <IconButton icon={<Trash2 />} label={text.delete(item.fileName)} onClick={() => onItemDelete(item.id)} />}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
});
