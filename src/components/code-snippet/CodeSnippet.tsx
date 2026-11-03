import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { CopyButton } from '../copy-button';
import styles from './CodeSnippet.module.css';

export interface CodeSnippetLabels {
  copy: string;
  showMore: (hidden: number) => string;
  showLess: string;
  code: string;
}

export interface CodeSnippetProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** The code. */
  code: string;
  /** Language name shown in the header, e.g. "JSON" (no syntax highlighting is applied). */
  language?: string;
  /** `block` for multi-line code, `inline` for a short value in text (e.g. an API key or command). @default 'block' */
  variant?: 'block' | 'inline';
  /** Shows line numbers (block). @default false */
  lineNumbers?: boolean;
  /** Collapses blocks longer than this many lines behind "Show more". */
  maxLines?: number;
  /** Wraps long lines instead of scrolling. @default false */
  wrap?: boolean;
  /** Shows the copy button. @default true */
  copyable?: boolean;
  /** Accessible name of the code region. Defaults to the language. */
  label?: string;
  /** Overrides for the built-in strings. */
  labels?: Partial<CodeSnippetLabels>;
}

const defaultLabels: CodeSnippetLabels = {
  copy: 'Copy code',
  showMore: (n) => `Show ${n} more ${n === 1 ? 'line' : 'lines'}`,
  showLess: 'Show less',
  code: 'Code',
};

/** Read-only code or command output with copy, line numbers and an expandable long view. */
export const CodeSnippet = forwardRef<HTMLElement, CodeSnippetProps>(function CodeSnippet(
  { code, language, variant = 'block', lineNumbers = false, maxLines, wrap = false, copyable = true, label, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const id = useId(undefined, 'code');
  const [expanded, setExpanded] = useState(false);
  if (variant === 'inline') {
    return (
      <span ref={ref as never} className={cx(styles.inline, className)} {...rest}>
        <code>{code}</code>
        {copyable && <CopyButton value={code} label={labels.copy} />}
      </span>
    );
  }
  const lines = code.replace(/\n$/, '').split('\n');
  const collapsible = maxLines !== undefined && lines.length > maxLines;
  const shown = collapsible && !expanded ? lines.slice(0, maxLines) : lines;
  return (
    <figure ref={ref} className={cx(styles.block, className)} {...rest}>
      {(language || copyable) && (
        <figcaption className={styles.header}>
          <span className={styles.language}>{language}</span>
          {copyable && <CopyButton value={code} label={labels.copy} />}
        </figcaption>
      )}
      {/* Scrollable regions must be focusable so keyboard users can scroll them. */}
      <pre id={id} className={cx(styles.pre, wrap && styles.wrap)} tabIndex={0} aria-label={label ?? language ?? labels.code}>
        <code>
          {shown.map((line, i) => (
            <span key={i} className={styles.line}>
              {lineNumbers && (
                <span className={styles.number} aria-hidden="true">
                  {i + 1}
                </span>
              )}
              {line || ' '}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
      {collapsible && (
        <button type="button" className={styles.more} aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded((e) => !e)}>
          {expanded ? labels.showLess : labels.showMore(lines.length - maxLines!)}
        </button>
      )}
    </figure>
  );
});
