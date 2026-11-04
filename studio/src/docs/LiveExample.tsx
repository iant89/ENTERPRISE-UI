import { useMemo, useState } from 'react';
import { Button, Input, NumberInput, Select, Switch, type Density, type ThemeName } from '@enterprise-ui/react';
import { Code2, Copy, RotateCcw } from 'lucide-react';
import { usePreviewBuild } from '../preview/usePreviewBuild';
import { CodePreviewFrame } from '../preview/CodePreviewFrame';
import { relative } from '../core/vfs/paths';
import { exampleJsx, inferControl, initialValues, type DocsPage } from './api-metadata/pageModel';
import styles from './Docs.module.css';

export const EXAMPLE_ENTRY = 'src/__docs_example__.tsx';

/** The virtual entry for the live example; it exists only in the preview build, never in the VFS. */
export function exampleEntry(page: DocsPage, jsx: string): string {
  const from = page.kind === 'library' || !page.source ? '@enterprise-ui/react' : relative(EXAMPLE_ENTRY, page.source).replace(/\.[jt]sx?$/, '');
  const imp = page.importStatement.startsWith(`import ${page.name} `) ? `import ${page.name} from '${from}';` : `import { ${page.name} } from '${from}';`;
  return `${imp}\nexport default function DocsExample() {\n  return (\n    ${jsx}\n  );\n}\n`;
}

export interface LiveExampleProps {
  page: DocsPage;
  files: Readonly<Record<string, string>>;
  theme: ThemeName;
  density: Density;
  onShowSource?: () => void;
  copy: (text: string, what: string) => void;
}

/**
 * C7 §7.6: renders through the C4 preview runtime (same compiler, bridge and sandbox) with the
 * project's files; the example entry is virtual. Controls (decision 3a) are preview-only.
 */
export function LiveExample({ page, files, theme, density, onShowSource, copy }: LiveExampleProps) {
  const editable = useMemo(() => [...page.props, ...page.states.filter((s) => !page.props.includes(s))].filter((p) => inferControl(p.type)), [page]);
  const defaults = useMemo(() => initialValues(editable), [editable]);
  const [values, setValues] = useState(defaults);
  const jsx = exampleJsx(page.name, values);
  const buildFiles = useMemo(() => ({ ...files, [EXAMPLE_ENTRY]: exampleEntry(page, jsx) }), [files, page, jsx]);
  const build = usePreviewBuild(buildFiles as Record<string, string>, EXAMPLE_ENTRY, { debounceMs: 150, projectKey: page.id });
  const set = (k: string, v: string | number | boolean | null) => setValues((o) => { const n = { ...o }; if (v === null || v === '') delete n[k]; else n[k] = v; return n; });
  return (
    <div className={styles.example} data-testid="live-example">
      <div className={styles.exampleFrame}>
        <CodePreviewFrame artifact={build.artifact} theme={theme} density={density} title={`${page.name} example`} onConsole={() => {}} onRuntimeError={() => {}} onSuccess={() => {}} />
      </div>
      {editable.length > 0 && (
        <div className={styles.controls}>
          {editable.slice(0, 8).map((p) => {
            const c = inferControl(p.type)!;
            const v = values[p.name];
            if (c.kind === 'switch') return <Switch key={p.name} label={p.name} checked={!!v} onChange={(x) => set(p.name, x)} />;
            if (c.kind === 'number') return <NumberInput key={p.name} size="sm" label={p.name} value={typeof v === 'number' ? v : null} onChange={(x) => set(p.name, x)} />;
            if (c.kind === 'select') return <Select key={p.name} size="sm" label={p.name} value={typeof v === 'string' ? v : null} onChange={(x) => set(p.name, x)} options={c.options.map((o) => ({ value: o, label: o }))} />;
            return <Input key={p.name} size="sm" label={p.name} value={typeof v === 'string' ? v : ''} onChange={(e) => set(p.name, e.currentTarget.value)} />;
          })}
          <p className={styles.note}>Preview-only props · source unchanged</p>
        </div>
      )}
      <div className={styles.exampleActions}>
        <Button size="sm" variant="tertiary" icon={<Copy />} onClick={() => copy(jsx, 'Example code')}>Copy code</Button>
        {onShowSource && <Button size="sm" variant="tertiary" icon={<Code2 />} onClick={onShowSource}>Show source</Button>}
        <Button size="sm" variant="tertiary" icon={<RotateCcw />} onClick={() => setValues(defaults)}>Reset</Button>
      </div>
    </div>
  );
}
