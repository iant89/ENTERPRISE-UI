import { useState, type ReactNode } from 'react';
import { Input, NumberInput, Select, Switch } from '@enterprise-ui/react';
import { CodeBlock } from './CodeBlock';
import styles from './Docs.module.css';

export type ControlDef =
  | { name: string; type: 'select'; options: string[]; default: string }
  | { name: string; type: 'boolean'; default: boolean }
  | { name: string; type: 'text'; default: string }
  | { name: string; type: 'number'; default: number; min?: number; max?: number };

export type PlaygroundValues = Record<string, string | boolean | number>;

export interface PlaygroundDef {
  controls: ControlDef[];
  render: (values: PlaygroundValues) => ReactNode;
  code: (values: PlaygroundValues) => string;
}

/** Interactive preview whose props are driven by form controls. */
export function Playground({ def, name }: { def: PlaygroundDef; name: string }) {
  const [values, setValues] = useState<PlaygroundValues>(() => Object.fromEntries(def.controls.map((c) => [c.name, c.default])));
  const set = (key: string, value: string | boolean | number) => setValues((v) => ({ ...v, [key]: value }));
  return (
    <div className={styles.playground}>
      <div className={styles.playgroundStage}>
        <div className={styles.playgroundPreview} aria-live="off">{def.render(values)}</div>
        <form className={styles.playgroundControls} aria-label={`${name} preview controls`} onSubmit={(e) => e.preventDefault()}>
          {def.controls.map((control) => {
            const label = control.name;
            switch (control.type) {
              case 'select':
                return <Select key={label} label={label} size="sm" value={String(values[label])} options={control.options.map((o) => ({ value: o, label: o }))} onChange={(v) => v && set(label, v)} />;
              case 'boolean':
                return <Switch key={label} label={label} checked={Boolean(values[label])} onChange={(v) => set(label, v)} />;
              case 'number':
                return <NumberInput key={label} label={label} size="sm" value={Number(values[label])} min={control.min} max={control.max} onChange={(v) => set(label, v ?? 0)} />;
              default:
                return <Input key={label} label={label} size="sm" value={String(values[label])} onChange={(e) => set(label, e.target.value)} />;
            }
          })}
        </form>
      </div>
      <CodeBlock code={def.code(values)} label={`${name} playground code`} />
    </div>
  );
}

/** Builds a JSX string, omitting props equal to their defaults. */
export function jsx(component: string, props: Record<string, unknown>, defaults: Record<string, unknown>, children?: string): string {
  const attrs = Object.entries(props)
    .filter(([key, value]) => value !== defaults[key] && value !== undefined && value !== '')
    .map(([key, value]) => {
      if (value === true) return key;
      if (typeof value === 'string') return `${key}="${value}"`;
      return `${key}={${JSON.stringify(value)}}`;
    });
  const open = attrs.length ? `<${component} ${attrs.join(' ')}` : `<${component}`;
  return children ? `${open}>${children}</${component}>` : `${open} />`;
}
