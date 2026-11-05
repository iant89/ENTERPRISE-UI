import type { ReactNode } from 'react';
import { Badge, Button, Tooltip, type Density, type ThemeName } from '@enterprise-ui/react';
import { BUILD_ID, NOT_DOCUMENTED, type DocsPage, type PageProp } from './api-metadata/pageModel';
import { Markdown } from './project-markdown/markdown';
import { LiveExample } from './LiveExample';
import styles from './Docs.module.css';
import actionSvg from '../../../src/assets/icons/action.svg?raw';
import addDocumentSvg from '../../../src/assets/icons/add-document.svg?raw';
import copySvg from '../../../src/assets/icons/copy.svg?raw';
import courseBookSvg from '../../../src/assets/icons/course-book.svg?raw';
import headerSvg from '../../../src/assets/icons/header.svg?raw';
import sourceCodeSvg from '../../../src/assets/icons/source-code.svg?raw';
import { svgIcon } from '../../../src/icons/svgIcon';

export interface DocsPageViewProps {
  page: DocsPage;
  files: Readonly<Record<string, string>>;
  theme: ThemeName;
  density: Density;
  copy: (text: string, what: string) => void;
  onShowSource?: (page: DocsPage) => void;
  onAddDocs?: (page: DocsPage) => void;
  onOpenRelated?: (name: string) => void;
  /** The bottom tab uses a compact layout without the live example. */
  compact?: boolean;
  headingLevel?: 2 | 3;
}

const fromLabel = (o?: string) => (o === 'jsdoc' ? <span className={styles.from}> (from JSDoc)</span> : null);

function PropList({ title, items }: { title: string; items: PageProp[] }) {
  if (!items.length) return null;
  return (
    <section aria-label={title}>
      <h4 className={styles.section}>{title}</h4>
      <dl className={styles.props}>
        {items.map((p) => (
          <div key={p.name} className={styles.prop} data-testid="docs-prop">
            <dt><code>{p.name}</code></dt>
            <dd>
              <span className={styles.type}><code>{p.type ?? 'unknown'}</code>{p.default !== undefined && <> = <code>{p.default}</code></>}{p.required && ' · required'}</span>
              <span className={p.description ? undefined : styles.missing}>{p.description ?? NOT_DOCUMENTED}{fromLabel(p.descriptionFrom)}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** One docs page (library or project), shared by the Docs panel and the Component Docs bottom tab. */
export function DocsPageView({ page, files, theme, density, copy, onShowSource, onAddDocs, onOpenRelated, compact, headingLevel = 2 }: DocsPageViewProps) {
  const H = `h${headingLevel}` as 'h2';
  const undocumented = page.kind === 'project' && !page.docsFile;
  const actions: ReactNode = (
    <div className={styles.actions} role="toolbar" aria-label={`${page.name} docs actions`}>
      <Button size="sm" variant="tertiary" icon={svgIcon(copySvg, 'copy')} onClick={() => copy(page.importStatement, 'Import')}>Copy import</Button>
      {page.example && <Button size="sm" variant="tertiary" icon={svgIcon(copySvg, 'copy')} onClick={() => copy(page.example!, 'Example code')}>Copy example code</Button>}
      {page.kind === 'project' && onShowSource && <Button size="sm" variant="tertiary" icon={svgIcon(sourceCodeSvg, 'source-code')} onClick={() => onShowSource(page)}>Show source</Button>}
      {page.docsUrl && <Button size="sm" variant="tertiary" icon={svgIcon(actionSvg, 'action')} onClick={() => window.open(page.docsUrl, '_blank', 'noopener,noreferrer')}>Open full docs</Button>}
      <Tooltip content="Coming in C8"><Button size="sm" variant="tertiary" icon={svgIcon(headerSvg, 'header')} aria-disabled="true" onClick={(e) => e.preventDefault()}>Open component detail view</Button></Tooltip>
    </div>
  );
  return (
    <article className={styles.page} aria-label={`${page.name} documentation`}>
      <div className={styles.titleRow}>
        <H className={styles.title} data-testid="docs-page-title">{page.name}</H>
        <Badge tone={page.kind === 'project' ? 'information' : 'neutral'}>{page.kind === 'project' ? 'Project' : 'Library'}</Badge>
      </div>
      {undocumented && (
        <div className={styles.empty} data-testid="docs-not-documented">
          {svgIcon(courseBookSvg, 'course-book', { 'aria-hidden': "true" })}
          <p><strong>{page.name} · {NOT_DOCUMENTED}</strong></p>
          <p>No {page.name}.docs.md{page.descriptionFrom === 'jsdoc' ? '' : ' and no JSDoc'}. Props below come from TypeScript only.</p>
          {onAddDocs && <Button size="sm" variant="primary" icon={svgIcon(addDocumentSvg, 'add-document')} onClick={() => onAddDocs(page)}>Add documentation</Button>}
        </div>
      )}
      <h4 className={styles.section}>Overview</h4>
      <p className={page.description ? undefined : styles.missing}>{page.description ?? NOT_DOCUMENTED}{fromLabel(page.descriptionFrom)}</p>
      <p className={styles.import}><code>{page.importStatement}</code></p>
      {!compact && (
        <>
          <h4 className={styles.section}>Usage</h4>
          <LiveExample key={page.id} page={page} files={files} theme={theme} density={density} copy={copy} onShowSource={onShowSource && page.kind === 'project' ? () => onShowSource(page) : undefined} />
        </>
      )}
      {page.markdown && (
        <section aria-label={`${page.name}.docs.md`} className={styles.markdownWrap}>
          <Markdown blocks={page.markdown.filter((b, i) => !(i === 0 && b.t === 'heading' && b.level === 1))} className={styles.markdown} generatedClass={styles.generated} headingOffset={2} />
        </section>
      )}
      <PropList title="Props" items={page.props} />
      <PropList title="Events" items={page.events} />
      {page.states.length > 0 && <PropList title="States" items={page.states} />}
      {page.cssVariables.length > 0 && <><h4 className={styles.section}>CSS variables</h4><p className={styles.list}>{page.cssVariables.map((v) => <code key={v}>{v}</code>)}</p></>}
      {page.a11y.length > 0 && <><h4 className={styles.section}>Accessibility</h4><ul>{page.a11y.map((a) => <li key={a}>{a}</li>)}</ul></>}
      {page.related.length > 0 && <><h4 className={styles.section}>Related</h4><p className={styles.list}>{page.related.map((r) => onOpenRelated ? <Button key={r} size="sm" variant="tertiary" onClick={() => onOpenRelated(r)}>{r}</Button> : <span key={r}>{r}</span>)}</p></>}
      {actions}
      <footer className={styles.footer}>
        {page.source && <span>Source: {page.source}{page.location ? `:${page.location.line}` : ''}</span>}
        <span data-testid="docs-build-id">@enterprise-ui/react {BUILD_ID}</span>
      </footer>
    </article>
  );
}
