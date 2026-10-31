import { useState } from 'react';
import { Button, ButtonGroup, Input, NumberInput, Select, Switch, Tab, TabList, TabPanel, Tabs, Text, Title } from '@enterprise-ui/react';
import { ArrowDown, ArrowUp, Code2, Copy, Trash2 } from 'lucide-react';
import type { AttrInput, StudioNode } from './model/jsx';
import { descriptionFor, propsFor } from './model/catalog';
import { displayValue, groupInspectorProps, widgetFor, type PropMeta } from './model/inspector';
import styles from './Studio.module.css';

export interface InspectorProps {
  node: StudioNode | null;
  /** Whether the node is the page root (cannot be moved or deleted). */
  isRoot: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSetAttribute: (name: string, value: AttrInput) => void;
  onSetText: (text: string) => void;
  onAction: (action: 'up' | 'down' | 'duplicate' | 'delete' | 'code') => void;
}

const fieldId = (name: string) => `inspector-${name.replace(/[^a-z0-9-]/gi, '-')}`;

function PropField({ prop, node, onSet, onCode }: { prop: PropMeta; node: StudioNode; onSet: (v: AttrInput) => void; onCode: () => void }) {
  const attr = node.attributes.find((a) => a.name === prop.name);
  const widget = widgetFor(prop.type);
  const value = displayValue(attr?.value);
  const expression = attr?.value.kind === 'expression';
  const description = prop.description ? prop.description.split('\n')[0] : undefined;
  if (widget.kind === 'code' || expression) {
    return (
      <div className={styles.codeProp}>
        <span className={styles.propName}>{prop.name}</span>
        <code className={styles.propValue}>{expression ? String(value) : attr ? String(value) : prop.type}</code>
        <Button size="sm" variant="tertiary" icon={<Code2 />} onClick={onCode} aria-label={`Edit ${prop.name} in code`}>Code</Button>
      </div>
    );
  }
  if (widget.kind === 'boolean') {
    return <Switch label={prop.name} description={description} checked={value === true} onChange={(checked) => onSet(checked ? true : null)} />;
  }
  if (widget.kind === 'select') {
    const options = [{ value: '', label: prop.default ? `Default (${prop.default.replace(/'/g, '')})` : 'Not set' }, ...widget.options.map((o) => ({ value: o, label: o }))];
    return <Select size="sm" label={prop.name} description={description} options={options} value={value === undefined ? '' : String(value)} onChange={(v) => onSet(!v ? null : widget.numeric ? Number(v) : v)} />;
  }
  if (widget.kind === 'number') {
    return <NumberInput size="sm" label={prop.name} description={description} value={typeof value === 'number' ? value : null} onChange={(v) => onSet(v ?? null)} />;
  }
  return <Input size="sm" id={fieldId(prop.name)} label={prop.name} description={description} value={value === undefined ? '' : String(value)} onChange={(e) => onSet(e.target.value === '' ? null : e.target.value)} />;
}

/** Edits the selected element. Widgets come from the generated API metadata (Properties, Events, States). */
export function Inspector({ node, isRoot, canMoveUp, canMoveDown, onSetAttribute, onSetText, onAction }: InspectorProps) {
  const [tab, setTab] = useState('properties');
  if (!node) {
    return <div className={styles.inspectorEmpty}><Text tone="secondary">Select an element on the canvas or in the outline to edit its properties.</Text></div>;
  }
  const name = node.kind === 'fragment' ? 'Fragment' : node.name;
  const known = propsFor(node.name);
  const groups = groupInspectorProps(known);
  const extra = node.attributes.filter((a) => !known.some((p) => p.name === a.name) && a.name !== 'key').map((a) => ({ name: a.name, type: a.value.kind === 'boolean' ? 'boolean' : a.value.kind === 'number' ? 'number' : a.value.kind === 'string' ? 'string' : 'expression' }));
  const fields = (props: PropMeta[]) => props.map((p) => (
    <PropField key={p.name} prop={p} node={node} onSet={(v) => onSetAttribute(p.name, v)} onCode={() => onAction('code')} />
  ));
  return (
    <div className={styles.inspector}>
      <div className={styles.inspectorHead}>
        <Title level={2} size="sm">{name}</Title>
        {descriptionFor(node.name) && <Text size="sm" tone="secondary">{descriptionFor(node.name).split('\n')[0]}</Text>}
        <ButtonGroup aria-label="Element actions">
          <Button size="sm" variant="tertiary" icon={<ArrowUp />} disabled={isRoot || !canMoveUp} onClick={() => onAction('up')}>Up</Button>
          <Button size="sm" variant="tertiary" icon={<ArrowDown />} disabled={isRoot || !canMoveDown} onClick={() => onAction('down')}>Down</Button>
          <Button size="sm" variant="tertiary" icon={<Copy />} disabled={isRoot} onClick={() => onAction('duplicate')}>Duplicate</Button>
          <Button size="sm" variant="tertiary" icon={<Trash2 />} disabled={isRoot} onClick={() => onAction('delete')}>Delete</Button>
          <Button size="sm" variant="tertiary" icon={<Code2 />} onClick={() => onAction('code')}>Code</Button>
        </ButtonGroup>
      </div>
      {node.text !== null && (
        <div className={styles.inspectorSection}>
          <Input size="sm" label="Text content" value={node.text} onChange={(e) => onSetText(e.target.value)} />
        </div>
      )}
      <Tabs value={tab} onValueChange={setTab} variant="line">
        <TabList aria-label="Inspector sections">
          <Tab value="properties" count={groups.properties.length + extra.length}>Properties</Tab>
          <Tab value="events" count={groups.events.length}>Events</Tab>
          <Tab value="states" count={groups.states.length}>States</Tab>
        </TabList>
        <TabPanel value="properties">
          <div className={styles.fields}>
            {fields([...groups.properties, ...extra])}
            {!known.length && !extra.length && <Text size="sm" tone="secondary">No documented properties. Use the code view for HTML attributes.</Text>}
          </div>
        </TabPanel>
        <TabPanel value="events">
          <div className={styles.fields}>
            {groups.events.length === 0 && <Text size="sm" tone="secondary">No events.</Text>}
            {groups.events.map((p) => {
              const attr = node.attributes.find((a) => a.name === p.name);
              return (
                <div key={p.name} className={styles.codeProp}>
                  <span className={styles.propName}>{p.name}</span>
                  <code className={styles.propValue}>{attr ? (attr.value.kind === 'expression' ? attr.value.text : '…') : p.type}</code>
                  {attr
                    ? <Button size="sm" variant="tertiary" icon={<Code2 />} onClick={() => onAction('code')} aria-label={`Edit ${p.name} in code`}>Code</Button>
                    : <Button size="sm" variant="tertiary" onClick={() => onSetAttribute(p.name, { expression: `(${/\(\)/.test(p.type) ? '' : '...args'}) => {}` })} aria-label={`Add ${p.name} handler`}>Add</Button>}
                </div>
              );
            })}
          </div>
        </TabPanel>
        <TabPanel value="states">
          <div className={styles.fields}>
            {groups.states.length === 0 && <Text size="sm" tone="secondary">No state properties.</Text>}
            {fields(groups.states)}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
