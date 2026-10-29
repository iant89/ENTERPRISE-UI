import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Button } from '../button';
import styles from './FileUploader.module.css';

export type UploadStatus = 'queued' | 'uploading' | 'succeeded' | 'failed' | 'cancelled';
export interface UploadItem { id: string; file: File; status: UploadStatus; progress: number; error?: string }
export interface UploadContext { signal: AbortSignal; onProgress: (fraction: number) => void }
/** Text and accessible names for the upload queue. Hosts translate file names and transport errors as appropriate. */
export interface FileUploaderMessages {
  instructions: string;
  uploadFailed: string;
  typeNotAccepted: string;
  fileTooLarge: string;
  statuses: Record<UploadStatus, string>;
  summary: (uploaded: number, failed: number, total: number) => string;
  progressAnnouncement: (fileName: string, percent: number) => string;
  progressLabel: (fileName: string) => string;
  cancel: string;
  cancelLabel: (fileName: string) => string;
  retry: string;
  retryLabel: (fileName: string) => string;
}
const defaultMessages: FileUploaderMessages = {
  instructions: 'Choose files or drop them here.', uploadFailed: 'Upload failed.',
  typeNotAccepted: 'File type is not accepted.', fileTooLarge: 'File exceeds the size limit.',
  statuses: { queued: 'queued', uploading: 'uploading', succeeded: 'succeeded', failed: 'failed', cancelled: 'cancelled' },
  summary: (uploaded, failed, total) => `${uploaded} uploaded, ${failed} failed, ${total} total.`,
  progressAnnouncement: (fileName, percent) => `${fileName}: ${percent}% uploaded.`,
  progressLabel: (fileName) => `Upload progress for ${fileName}`,
  cancel: 'Cancel', cancelLabel: (fileName) => `Cancel ${fileName}`,
  retry: 'Retry', retryLabel: (fileName) => `Retry ${fileName}`,
};
export interface FileUploaderProps {
  /** Transport must honor AbortSignal and report progress from 0 to 1. */
  upload: (file: File, context: UploadContext) => Promise<void>;
  /** MIME types, MIME wildcards, or extensions (e.g. .pdf). Empty means all types. */
  accept?: string[];
  maxFileSize?: number;
  multiple?: boolean;
  /** Enable retry only when the transport uses idempotency or confirms the server outcome. @default false */
  retrySafe?: boolean;
  label?: string;
  /** Overrides visible text and announcements. Supply all statuses when overriding them. */
  messages?: Partial<FileUploaderMessages>;
  dir?: 'ltr' | 'rtl' | 'auto';
  lang?: string;
  /** Notifications are observational; consumers must not treat them as server-side audit records. */
  onItemsChange?: (items: readonly UploadItem[]) => void;
}
function accepted(file: File, rules: string[]) {
  return !rules.length || rules.some((rule) => {
    const value = rule.trim().toLowerCase();
    if (value.startsWith('.')) return file.name.toLowerCase().endsWith(value);
    if (value.endsWith('/*')) return file.type.toLowerCase().startsWith(value.slice(0, -1));
    return value === file.type.toLowerCase();
  });
}
/** Sequential, transport-independent upload queue. Retrying is an explicit user action. */
export function FileUploader({ upload, accept = [], maxFileSize, multiple = true, retrySafe = false, label = 'Upload files', onItemsChange, messages, dir, lang }: FileUploaderProps) {
  const text = { ...defaultMessages, ...messages };
  const textRef = useRef(text); textRef.current = text;
  const [items, setItems] = useState<UploadItem[]>([]);
  const nextId = useRef(0);
  const active = useRef<{ id: string; controller: AbortController } | null>(null);
  const uploadRef = useRef(upload); uploadRef.current = upload;
  const notifyRef = useRef(onItemsChange); notifyRef.current = onItemsChange;
  useEffect(() => { notifyRef.current?.(items); }, [items]);
  useEffect(() => () => { active.current?.controller.abort(); active.current = null; }, []);
  useEffect(() => {
    if (active.current) return;
    const item = items.find((entry) => entry.status === 'queued');
    if (!item) return;
    const controller = new AbortController();
    active.current = { id: item.id, controller };
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: 'uploading', progress: 0, error: undefined } : entry));
    const current = () => active.current?.controller === controller && !controller.signal.aborted;
    Promise.resolve().then(() => current() ? uploadRef.current(item.file, { signal: controller.signal, onProgress: (fraction) => {
      if (!current() || !Number.isFinite(fraction)) return;
      setItems((entries) => entries.map((entry) => entry.id === item.id && entry.status === 'uploading' ? { ...entry, progress: Math.max(0, Math.min(1, fraction)) } : entry));
    } }) : undefined).then(() => {
      if (current()) { active.current = null; setItems((entries) => entries.map((entry) => entry.id === item.id ? { ...entry, status: 'succeeded', progress: 1 } : entry)); }
    }, (error: unknown) => {
      if (current()) { active.current = null; setItems((entries) => entries.map((entry) => entry.id === item.id ? { ...entry, status: 'failed', error: error instanceof Error && error.message ? error.message : textRef.current.uploadFailed } : entry)); }
    }).finally(() => { if (active.current?.controller === controller) active.current = null; });
  }, [items]);
  const add = (incoming: FileList | File[]) => {
    const files = Array.from(incoming); if (!multiple) files.splice(1);
    const added = files.map((file): UploadItem => {
      const error = !accepted(file, accept) ? text.typeNotAccepted : maxFileSize !== undefined && file.size > maxFileSize ? text.fileTooLarge : undefined;
      return { id: `upload-${++nextId.current}`, file, status: error ? 'failed' : 'queued', progress: 0, error };
    });
    setItems((current) => [...current, ...added]);
  };
  const cancel = (id: string) => {
    if (active.current?.id === id) { active.current.controller.abort(); active.current = null; }
    setItems((current) => current.map((entry) => entry.id === id && (entry.status === 'queued' || entry.status === 'uploading') ? { ...entry, status: 'cancelled' } : entry));
  };
  const retry = (id: string) => setItems((current) => current.map((entry) => {
    if (entry.id !== id || (entry.status !== 'failed' && entry.status !== 'cancelled')) return entry;
    if (!accepted(entry.file, accept) || (maxFileSize !== undefined && entry.file.size > maxFileSize)) return entry;
    return { ...entry, status: 'queued', progress: 0, error: undefined };
  }));
  const drop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); add(event.dataTransfer.files); };
  const input = (event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) add(event.target.files); event.target.value = ''; };
  const done = items.filter((item) => item.status === 'succeeded').length;
  const failed = items.filter((item) => item.status === 'failed').length;
  const uploading = items.find((item) => item.status === 'uploading');
  return <section aria-label={label} dir={dir} lang={lang} className={styles.root}>
    <div className={styles.drop} onDragOver={(event) => event.preventDefault()} onDrop={drop}>
      <label>{label}<input type="file" multiple={multiple} accept={accept.join(',')} onChange={input} /></label>
      <p>{text.instructions}</p>
    </div>
    {items.length > 0 && <><p role="status">{text.summary(done, failed, items.length)}{uploading && ` ${text.progressAnnouncement(uploading.file.name, Math.floor(uploading.progress * 10) * 10)}`}</p><ul className={styles.queue}>{items.map((item) => <li key={item.id}>
      <strong><bdi>{item.file.name}</bdi></strong> — {text.statuses[item.status]}
      {item.status === 'uploading' && <progress aria-label={text.progressLabel(item.file.name)} value={item.progress} max={1} />}
      {item.error && <p>{item.error}</p>}
      {(item.status === 'queued' || item.status === 'uploading') && <Button size="sm" onClick={() => cancel(item.id)} aria-label={text.cancelLabel(item.file.name)}>{text.cancel}</Button>}
      {retrySafe && (item.status === 'failed' || item.status === 'cancelled') && accepted(item.file, accept) && (maxFileSize === undefined || item.file.size <= maxFileSize) && <Button size="sm" onClick={() => retry(item.id)} aria-label={text.retryLabel(item.file.name)}>{text.retry}</Button>}
    </li>)}</ul></>}
  </section>;
}
