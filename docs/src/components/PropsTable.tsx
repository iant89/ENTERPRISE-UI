import { Badge, Table, type TableColumn } from '@enterprise-ui/react';
import api from '../../generated/api.json';
import { renderInlineCode } from './ExampleBlock';
import styles from './Docs.module.css';

export interface PropDoc {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
}

interface ComponentApi {
  name: string;
  description: string;
  source: string;
  props: PropDoc[];
  inheritsNative: boolean;
}

export const componentApi = (api as unknown as { components: Record<string, ComponentApi> }).components;
export const hookApi = (api as unknown as { hooks: Record<string, { name: string; description: string; source: string }> }).hooks;

const columns: TableColumn<PropDoc>[] = [
  {
    id: 'name', header: 'Prop', accessor: 'name', rowHeader: true, width: '18%',
    cell: (p) => (
      <span className={styles.propName}>
        <code>{p.name}</code>
        {p.required && <Badge tone="information">Required</Badge>}
      </span>
    ),
  },
  { id: 'type', header: 'Type', accessor: 'type', width: '30%', cell: (p) => <code className={styles.propType}>{p.type}</code> },
  { id: 'default', header: 'Default', accessor: 'default', width: '12%', cell: (p) => (p.default ? <code>{p.default}</code> : <span aria-label="None">—</span>) },
  { id: 'description', header: 'Description', accessor: 'description', cell: (p) => renderInlineCode(p.description || '') },
];

/** Props and defaults extracted from the component's TypeScript interface. */
export function PropsTable({ component }: { component: string }) {
  const entry = componentApi[component];
  if (!entry) return <p>No API information for {component}.</p>;
  return (
    <div className={styles.props}>
      {entry.props.length > 0 ? (
        <Table caption={`${component} props`} columns={columns} data={entry.props} getRowId={(p) => p.name} density="compact" responsive="stack" />
      ) : (
        <p>This component has no props of its own.</p>
      )}
      {entry.inheritsNative && <p className={styles.propsNote}>Also accepts the native HTML attributes of its root element (`className`, `style`, `aria-*`, event handlers…).</p>}
    </div>
  );
}
