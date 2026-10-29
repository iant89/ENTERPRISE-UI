import { useState } from 'react';
import { Code2 } from 'lucide-react';
import { Button, cx } from '@enterprise-ui/react';
import type { Example } from '../examples';
import { CodeBlock } from './CodeBlock';
import styles from './Docs.module.css';

/** Live preview of an example with collapsible source code. */
export function ExampleBlock({ example, headingLevel = 3 }: { example: Example; headingLevel?: 2 | 3 }) {
  const [showCode, setShowCode] = useState(false);
  const Heading = `h${headingLevel}` as const;
  const codeId = `code-${example.id.replace(/\W/g, '-')}`;
  return (
    <section className={styles.example} aria-labelledby={`${codeId}-title`}>
      <div className={styles.exampleHeader}>
        <Heading id={`${codeId}-title`} className={styles.exampleTitle}>
          {example.title}
        </Heading>
        {example.description && <p className={styles.exampleDescription}>{renderInlineCode(example.description)}</p>}
      </div>
      <div className={cx(styles.preview, example.frame && styles.previewFrame)} data-example={example.id}>
        <example.Component />
      </div>
      <div className={styles.exampleActions}>
        <Button size="sm" variant="tertiary" icon={<Code2 />} aria-expanded={showCode} aria-controls={codeId} onClick={() => setShowCode(!showCode)}>
          {showCode ? 'Hide code' : 'Show code'}
        </Button>
      </div>
      <div id={codeId} hidden={!showCode}>
        {showCode && <CodeBlock code={example.code} label={`${example.title} source code`} className={styles.exampleCode} />}
      </div>
    </section>
  );
}

/** Renders `backtick` spans in plain strings as inline code. */
export function renderInlineCode(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, i) => (part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part));
}
