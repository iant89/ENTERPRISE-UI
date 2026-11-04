import { useMemo } from 'react';
import { Button, Checkbox, Dialog, MessageStrip } from '@enterprise-ui/react';
import type { CatalogItem } from '../components/catalog/types';
import { draftDocs, findings } from './project-markdown/generate';
import { importSpecifier } from '../components/catalog/insert';
import styles from './Docs.module.css';

export const docsPathFor = (item: CatalogItem) => {
  const src = item.source ?? '';
  const dir = src.slice(0, src.lastIndexOf('/') + 1);
  const base = src.slice(dir.length).replace(/\.[jt]sx$/, '');
  return `${dir}${base === 'index' ? item.name : base}.docs.md`;
};

/** C7 mockup 03, decision 2a: confirm with a preview, then "Create and open" (one undo step). */
export function AddDocsDialog({ item, files, onClose, onCreate }: { item: CatalogItem; files: Readonly<Record<string, string>>; onClose: () => void; onCreate: (path: string, text: string) => void }) {
  const f = useMemo(() => findings(item, files), [item, files]);
  const path = docsPathFor(item);
  const text = useMemo(() => draftDocs(item, files, importSpecifier(item, 'src/App.tsx', files)), [item, files]);
  return (
    <Dialog open size="md" title={`Add documentation for ${item.name}`} onClose={onClose}
      footer={<><Button variant="tertiary" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={() => onCreate(path, text)}>Create and open</Button></>}>
      <div className={styles.page}>
        <p>Creates <code>{path}</code> as an editable draft and opens it.</p>
        <h3 className={styles.section}>Found</h3>
        <Checkbox checked readOnly label={`${f.props} props${item.propsType ? ` from ${item.propsType}` : ''} (types, required, defaults)`} />
        <Checkbox checked readOnly label={`${f.jsdoc} JSDoc descriptions${f.jsdoc ? '' : ' – placeholders marked TODO'}`} />
        <Checkbox checked readOnly label={f.usages.length ? `${f.usages.length} ${f.usages.length === 1 ? 'usage' : 'usages'} in ${f.usages[0].path.slice(f.usages[0].path.lastIndexOf('/') + 1)} as Usage example` : 'No usages yet – a minimal Usage example'} />
        {f.examples.length > 0 && <Checkbox checked readOnly label={`${f.examples.length} example file`} />}
        <MessageStrip tone="information" title="Draft">Generated sections are marked &lt;!-- generated --&gt;. Regenerating updates only those sections and never overwrites your prose.</MessageStrip>
        <pre className={styles.markdown} aria-label="Markdown preview" tabIndex={0} style={{ maxHeight: 180, overflow: 'auto', margin: 0 }}><code>{text}</code></pre>
      </div>
    </Dialog>
  );
}
