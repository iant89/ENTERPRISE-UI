import { describe, expect, it } from 'vitest';
import { componentApi, eventSignature, groupProps, type PropDoc } from '../../docs/src/components/ApiTables';

const p = (name: string, type: string): PropDoc => ({ name, type, required: false, description: 'x' });

describe('API reference grouping', () => {
  it('sorts properties into properties, states, events and slots', () => {
    const groups = groupProps([
      p('size', "'sm' | 'md'"), p('disabled', 'boolean'), p('value', 'string'), p('defaultValue', 'string'),
      p('onChange', '(value: string) => void'), p('children', 'ReactNode'), p('icon', 'ReactNode'), p('placement', 'Placement'),
    ]);
    expect(groups.properties.map((x) => x.name)).toEqual(['size', 'placement']);
    expect(groups.states.map((x) => x.name)).toEqual(['disabled', 'value', 'defaultValue']);
    expect(groups.events.map((x) => x.name)).toEqual(['onChange']);
    expect(groups.slots.map((x) => x.name)).toEqual(['children', 'icon']);
  });

  it('splits an event type into payload and return type', () => {
    expect(eventSignature('(value: string, item?: Item) => void')).toEqual({ payload: 'value: string, item?: Item', returns: undefined });
    expect(eventSignature('(id: string) => void | Promise<void>')).toEqual({ payload: 'id: string', returns: 'void | Promise<void>' });
    expect(eventSignature('() => void')).toEqual({ payload: '', returns: undefined });
  });

  it('records the design tokens each component reads', () => {
    expect(componentApi.Button.cssVariables).toContain('--eui-color-primary');
  });
});
