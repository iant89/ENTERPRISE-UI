import type { ReactNode } from 'react';
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

export interface ComponentApi {
  name: string;
  description: string;
  source: string;
  props: PropDoc[];
  inheritsNative: boolean;
  /** Design tokens read by the component's CSS. */
  cssVariables?: string[];
}

export const componentApi = (api as unknown as { components: Record<string, ComponentApi> }).components;
export const hookApi = (api as unknown as { hooks: Record<string, { name: string; description: string; source: string }> }).hooks;

export type ApiGroup = 'properties' | 'events' | 'states' | 'slots';

/** Properties that describe interactive or visual state rather than configuration. */
const STATE_NAMES = new Set([
  'disabled', 'readOnly', 'required', 'loading', 'busy', 'error', 'invalid', 'valueState', 'open', 'expanded', 'checked',
  'indeterminate', 'selected', 'pressed', 'active', 'collapsed', 'navCollapsed', 'value', 'selectedId', 'selectedIds',
  'expandedIds', 'headerExpanded', 'headerPinned', 'page', 'step', 'sort', 'mode', 'dirty', 'conflict',
]);

const isEvent = (p: PropDoc) => /^on[A-Z]/.test(p.name) && p.type.includes('=>');
const isSlot = (p: PropDoc) => p.name === 'children' || (!isEvent(p) && /^(ReactNode|ReactElement|ReactElement<.*>|\(.*\) => ReactNode)( \| .*)?$/.test(p.type));
const isState = (p: PropDoc, names: Set<string>) =>
  STATE_NAMES.has(p.name) || /^default[A-Z]/.test(p.name) || names.has(`default${p.name[0].toUpperCase()}${p.name.slice(1)}`);

/** Sorts a component's properties into the reference sections. */
export function groupProps(props: PropDoc[]): Record<ApiGroup, PropDoc[]> {
  const names = new Set(props.map((p) => p.name));
  const groups: Record<ApiGroup, PropDoc[]> = { properties: [], events: [], states: [], slots: [] };
  for (const p of props) {
    if (isEvent(p)) groups.events.push(p);
    else if (isSlot(p)) groups.slots.push(p);
    else if (isState(p, names)) groups.states.push(p);
    else groups.properties.push(p);
  }
  return groups;
}

/** Splits `(value: string, item?: Item) => void` into its parameters and return type. */
export function eventSignature(type: string): { payload: string; returns?: string } {
  const match = /^\((.*)\) => (.+)$/.exec(type.trim());
  if (!match) return { payload: type };
  const returns = match[2].trim();
  return { payload: match[1].trim(), returns: returns === 'void' ? undefined : returns };
}

const nameCell = (p: PropDoc) => (
  <span className={styles.propName}>
    <code className={styles.propCode}>{p.name}</code>
    {p.required && <Badge tone="information">Required</Badge>}
  </span>
);
const typeCell = (type: string) => <code className={styles.propType}>{type}</code>;
const defaultCell = (p: PropDoc) => (p.default ? <code>{p.default}</code> : <span className={styles.none} aria-label="None">—</span>);
const description = (p: PropDoc) => renderInlineCode(p.description || '');

const propertyColumns: TableColumn<PropDoc>[] = [
  { id: 'name', header: 'Property', accessor: 'name', rowHeader: true, width: '20%', cell: nameCell },
  { id: 'type', header: 'Type', accessor: 'type', width: '28%', cell: (p) => typeCell(p.type) },
  { id: 'default', header: 'Default', accessor: 'default', width: '12%', cell: defaultCell },
  { id: 'description', header: 'Description', accessor: 'description', cell: description },
];

const eventColumns: TableColumn<PropDoc>[] = [
  { id: 'name', header: 'Event', accessor: 'name', rowHeader: true, width: '20%', cell: nameCell },
  {
    id: 'payload', header: 'Payload', accessor: 'type', width: '32%',
    cell: (p) => {
      const { payload, returns } = eventSignature(p.type);
      return (
        <span className={styles.signature}>
          {payload ? typeCell(payload) : <span className={styles.none}>No arguments</span>}
          {returns && <span className={styles.returns}>Returns {typeCell(returns)}</span>}
        </span>
      );
    },
  },
  { id: 'description', header: 'Description', accessor: 'description', cell: description },
];

const slotColumns: TableColumn<PropDoc>[] = [
  { id: 'name', header: 'Slot', accessor: 'name', rowHeader: true, width: '20%', cell: nameCell },
  { id: 'type', header: 'Accepts', accessor: 'type', width: '28%', cell: (p) => typeCell(p.type) },
  { id: 'description', header: 'Description', accessor: 'description', cell: description },
];

export const GROUPS: { id: ApiGroup; title: string; intro: string }[] = [
  { id: 'properties', title: 'Properties', intro: 'Configuration that controls content, appearance and behavior.' },
  { id: 'states', title: 'States', intro: 'Controlled and uncontrolled state, and flags such as disabled, read-only or loading. Pass the plain property to control a state and the `default` variant to set its initial value.' },
  { id: 'events', title: 'Events', intro: 'Callback properties. Each one is called with the payload shown.' },
  { id: 'slots', title: 'Slots and children', intro: 'Properties that accept React content.' },
];

function GroupTable({ component, group, rows, headingLevel }: { component: string; group: (typeof GROUPS)[number]; rows: PropDoc[]; headingLevel: 3 | 4 }) {
  const Heading = `h${headingLevel}` as 'h3' | 'h4';
  const columns = group.id === 'events' ? eventColumns : group.id === 'slots' ? slotColumns : propertyColumns;
  return (
    <div className={styles.apiGroup}>
      <Heading className={styles.apiGroupTitle}>
        {group.title} <span className={styles.count}>{rows.length}</span>
      </Heading>
      <p className={styles.apiGroupIntro}>{renderInlineCode(group.intro)}</p>
      <Table caption={`${component} ${group.title.toLowerCase()}`} columns={columns} data={rows} getRowId={(p) => p.name} density="compact" responsive="stack" />
    </div>
  );
}

/** The full API reference of one component: properties, states, events and slots. */
export function ApiTables({ component, headingLevel = 3 }: { component: string; headingLevel?: 3 | 4 }) {
  const entry = componentApi[component];
  if (!entry) return <p>No API information is available for {component}.</p>;
  const groups = groupProps(entry.props);
  const sections = GROUPS.filter((g) => groups[g.id].length > 0);
  return (
    <div className={styles.api}>
      {sections.length === 0 && <p className={styles.apiGroupIntro}>{component} has no properties of its own.</p>}
      {sections.map((g) => <GroupTable key={g.id} component={component} group={g} rows={groups[g.id]} headingLevel={headingLevel} />)}
      {entry.inheritsNative && (
        <p className={styles.propsNote}>
          {component} also accepts the native HTML attributes of its root element, such as <code>className</code>, <code>style</code>, <code>aria-*</code> and event handlers.
        </p>
      )}
    </div>
  );
}

const TOKEN_GROUPS: { label: string; test: (token: string) => boolean }[] = [
  { label: 'Color', test: (t) => t.startsWith('--eui-color-') },
  { label: 'Typography', test: (t) => /^--eui-(font|line-height|letter)/.test(t) },
  { label: 'Spacing and size', test: (t) => /^--eui-(space|size|control|row|icon|gap|density)/.test(t) },
  { label: 'Shape and elevation', test: (t) => /^--eui-(radius|border|shadow|focus)/.test(t) },
  { label: 'Motion and layering', test: (t) => /^--eui-(motion|duration|easing|z-)/.test(t) },
];

/** Design tokens a component reads, grouped by category. */
export function ThemingTokens({ components }: { components: string[] }): ReactNode {
  const tokens = [...new Set(components.flatMap((c) => componentApi[c]?.cssVariables ?? []))].sort();
  if (tokens.length === 0) return null;
  const used = new Set<string>();
  const groups = TOKEN_GROUPS.map((g) => {
    const list = tokens.filter((t) => !used.has(t) && g.test(t));
    list.forEach((t) => used.add(t));
    return { label: g.label, list };
  });
  const other = tokens.filter((t) => !used.has(t));
  if (other.length) groups.push({ label: 'Other', list: other });
  return (
    <dl className={styles.tokenGroups}>
      {groups.filter((g) => g.list.length).map((g) => (
        <div key={g.label} className={styles.tokenGroup}>
          <dt>{g.label}</dt>
          <dd>
            <ul className={styles.tokenList}>
              {g.list.map((t) => <li key={t}><code>{t}</code></li>)}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  );
}
