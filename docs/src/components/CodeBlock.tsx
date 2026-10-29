import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { IconButton, cx } from '@enterprise-ui/react';
import { highlight } from './highlight';
import styles from './Docs.module.css';

export interface CodeBlockProps {
  code: string;
  /** Accessible label for the scrollable region. */
  label?: string;
  language?: string;
  className?: string;
}

/** Highlighted, copyable code snippet. */
export function CodeBlock({ code, label = 'Code', language = 'tsx', className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={cx(styles.code, className)}>
      <div className={styles.codeBar}>
        <span className={styles.codeLang}>{language}</span>
        <IconButton
          size="sm"
          neutral
          icon={copied ? <Check /> : <Copy />}
          label={copied ? 'Copied' : 'Copy code'}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              /* clipboard unavailable */
            }
          }}
        />
      </div>
      <pre className={styles.pre} tabIndex={0} role="region" aria-label={label}>
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}
