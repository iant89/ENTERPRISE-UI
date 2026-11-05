import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useFormControl, type FieldProps } from '../form-field';
import { richTextToPlain, safeHref, sanitizeRichText } from './sanitize';
import styles from './RichTextEditor.module.css';
import boldTextSvg from '../../assets/icons/bold-text.svg?raw';
import chainLinkSvg from '../../assets/icons/chain-link.svg?raw';
import clearAllSvg from '../../assets/icons/clear-all.svg?raw';
import italicTextSvg from '../../assets/icons/italic-text.svg?raw';
import listSvg from '../../assets/icons/list.svg?raw';
import numberedTextSvg from '../../assets/icons/numbered-text.svg?raw';
import underlineTextSvg from '../../assets/icons/underline-text.svg?raw';
import { svgIcon } from '../../icons/svgIcon';

type Command = 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList';

export interface RichTextEditorLabels {
  toolbar: string;
  bold: string;
  italic: string;
  underline: string;
  bulletList: string;
  numberedList: string;
  link: string;
  clear: string;
  linkUrl: string;
  apply: string;
  removeLink: string;
  cancel: string;
  invalidUrl: string;
  /** Character counter, e.g. "120 of 500 characters". */
  count: (used: number, max: number) => string;
}

export interface RichTextEditorProps extends FieldProps {
  /** HTML content. When it changes from outside, the editor content is replaced. */
  value?: string;
  /** Initial HTML when uncontrolled. @default '' */
  defaultValue?: string;
  /** Called with sanitized HTML after every edit. */
  onChange?: (html: string, plainText: string) => void;
  /** Text shown while empty. */
  placeholder?: string;
  /** Character limit (plain text); shows a counter and flags overruns. */
  maxLength?: number;
  /** Minimum editor height. @default '8rem' */
  minHeight?: string;
  /** Required field. @default false */
  required?: boolean;
  /** Disabled field. @default false */
  disabled?: boolean;
  /** Read-only field. @default false */
  readOnly?: boolean;
  /** Id of the editable element. */
  id?: string;
  /** Class name for the frame. */
  className?: string;
  /** Overrides for the built-in strings. */
  labels?: Partial<RichTextEditorLabels>;
}

const defaultLabels: RichTextEditorLabels = {
  toolbar: 'Formatting',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  bulletList: 'Bulleted list',
  numberedList: 'Numbered list',
  link: 'Link',
  clear: 'Clear formatting',
  linkUrl: 'Link address',
  apply: 'Apply',
  removeLink: 'Remove link',
  cancel: 'Cancel',
  invalidUrl: 'Enter an address starting with https://, http:// or mailto:',
  count: (used, max) => `${used} of ${max} characters`,
};

const COMMANDS: { command: Command; icon: ReactNode; key: keyof RichTextEditorLabels; shortcut?: string }[] = [
  { command: 'bold', icon: svgIcon(boldTextSvg, 'bold-text'), key: 'bold', shortcut: 'Control+B' },
  { command: 'italic', icon: svgIcon(italicTextSvg, 'italic-text'), key: 'italic', shortcut: 'Control+I' },
  { command: 'underline', icon: svgIcon(underlineTextSvg, 'underline-text'), key: 'underline', shortcut: 'Control+U' },
  { command: 'insertUnorderedList', icon: svgIcon(listSvg, 'list'), key: 'bulletList' },
  { command: 'insertOrderedList', icon: svgIcon(numberedTextSvg, 'numbered-text'), key: 'numberedList' },
];

const run = (command: string, arg?: string) => {
  try {
    // execCommand is deprecated but still the only cross-browser editing API for contenteditable.
    document.execCommand(command, false, arg);
  } catch {
    /* unsupported environment */
  }
};
const queryState = (command: string) => {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
};

/**
 * A lightweight rich text field for notes, descriptions and comments: bold, italic, underline,
 * lists and links. Output is sanitized HTML (an allowlist), and pasted content is sanitized too.
 * For documents with tables, images or collaboration, integrate a dedicated editor instead.
 */
export function RichTextEditor({
  value, defaultValue = '', onChange, placeholder, maxLength, minHeight = '8rem', labels: labelOverrides, className,
  label, description, error, status, statusMessage, hideLabel, labelPosition, required, disabled, readOnly, id,
}: RichTextEditorProps) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const control = useFormControl({ label, description, error, status, statusMessage, hideLabel, labelPosition, id, required, disabled });
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [plain, setPlain] = useState(() => richTextToPlain(sanitizeRichText(value ?? defaultValue)));
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const lastEmitted = useRef<string | null>(null);
  const editable = !control.disabled && !readOnly;

  // Load initial content, and replace it when `value` changes from outside.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const next = sanitizeRichText(value ?? (lastEmitted.current === null ? defaultValue : el.innerHTML));
    if (value !== undefined && value === lastEmitted.current) return;
    if (el.innerHTML !== next) el.innerHTML = next;
    setPlain(richTextToPlain(next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const refreshState = () => setActive(Object.fromEntries(COMMANDS.map((c) => [c.command, queryState(c.command)])));

  const emit = () => {
    const el = editorRef.current;
    if (!el) return;
    const html = sanitizeRichText(el.innerHTML);
    const text = richTextToPlain(html);
    lastEmitted.current = html;
    setPlain(text);
    onChange?.(html, text);
  };

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    run(command, arg);
    refreshState();
    emit();
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && editorRef.current?.contains(sel.anchorNode)) savedRange.current = sel.getRangeAt(0).cloneRange();
  };
  const restoreSelection = () => {
    const range = savedRange.current;
    const sel = window.getSelection();
    if (range && sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const openLink = () => {
    saveSelection();
    const anchor = window.getSelection()?.anchorNode?.parentElement?.closest('a');
    setLinkUrl(anchor?.getAttribute('href') ?? 'https://');
    setLinkError(null);
    setLinkOpen(true);
  };
  const applyLink = () => {
    const href = safeHref(linkUrl);
    if (!href) {
      setLinkError(labels.invalidUrl);
      return;
    }
    editorRef.current?.focus();
    restoreSelection();
    run('createLink', href);
    setLinkOpen(false);
    emit();
  };
  const removeLink = () => {
    editorRef.current?.focus();
    restoreSelection();
    run('unlink');
    setLinkOpen(false);
    emit();
  };

  const onPaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const html = event.clipboardData.getData('text/html');
    const text = event.clipboardData.getData('text/plain');
    if (html) run('insertHTML', sanitizeRichText(html));
    else run('insertText', text);
    emit();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openLink();
    }
  };

  const over = maxLength !== undefined && plain.length > maxLength;

  return control.wrap(
    <div className={cx(styles.frame, control.status !== 'none' && styles[control.status], over && styles.error, control.disabled && styles.disabled, className)}>
      {editable && (
        <div className={styles.toolbar} role="toolbar" aria-label={labels.toolbar} aria-controls={control.id}>
          {COMMANDS.map((c) => (
            <button
              key={c.command}
              type="button"
              className={styles.tool}
              aria-label={labels[c.key] as string}
              title={c.shortcut ? `${labels[c.key] as string} (${c.shortcut.replace('Control', 'Ctrl')})` : (labels[c.key] as string)}
              aria-pressed={!!active[c.command]}
              aria-keyshortcuts={c.shortcut}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec(c.command)}
            >
              {c.icon}
            </button>
          ))}
          <span className={styles.divider} aria-hidden="true" />
          <button type="button" className={styles.tool} aria-label={labels.link} title={`${labels.link} (Ctrl+K)`} aria-keyshortcuts="Control+K" aria-expanded={linkOpen} onMouseDown={(e) => e.preventDefault()} onClick={openLink}>
            {svgIcon(chainLinkSvg, 'chain-link')}
          </button>
          <button type="button" className={styles.tool} aria-label={labels.clear} title={labels.clear} onMouseDown={(e) => e.preventDefault()} onClick={() => exec('removeFormat')}>
            {svgIcon(clearAllSvg, 'clear-all')}
          </button>
        </div>
      )}
      {linkOpen && (
        <div className={styles.linkBar}>
          <label className={styles.linkLabel}>
            <span>{labels.linkUrl}</span>
            <input
              className={styles.linkInput}
              type="url"
              value={linkUrl}
              autoFocus
              aria-invalid={linkError ? true : undefined}
              aria-describedby={linkError ? `${control.id}-link-error` : undefined}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyLink();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setLinkOpen(false);
                  editorRef.current?.focus();
                  restoreSelection();
                }
              }}
            />
          </label>
          <button type="button" className={styles.textButton} onClick={applyLink}>
            {labels.apply}
          </button>
          <button type="button" className={styles.textButton} onClick={removeLink}>
            {labels.removeLink}
          </button>
          {linkError && (
            <span id={`${control.id}-link-error`} className={styles.linkError}>
              {linkError}
            </span>
          )}
        </div>
      )}
      <div
        ref={editorRef}
        id={control.id}
        className={styles.editor}
        style={{ minHeight }}
        role="textbox"
        aria-multiline="true"
        aria-labelledby={control.labelId}
        {...control.ariaProps}
        aria-readonly={readOnly || undefined}
        aria-disabled={control.disabled || undefined}
        aria-placeholder={placeholder}
        data-placeholder={placeholder}
        data-empty={plain.length === 0 || undefined}
        contentEditable={editable}
        suppressContentEditableWarning
        tabIndex={control.disabled ? -1 : 0}
        onInput={emit}
        onPaste={onPaste}
        onKeyDown={onKeyDown}
        onKeyUp={refreshState}
        onMouseUp={refreshState}
        onFocus={refreshState}
        onBlur={saveSelection}
      />
      {maxLength !== undefined && (
        <div className={cx(styles.counter, over && styles.counterOver)} aria-live="polite">
          {labels.count(plain.length, maxLength)}
        </div>
      )}
    </div>,
  );
}
