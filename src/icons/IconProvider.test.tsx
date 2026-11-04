import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Icon } from '../components/icon';
import { BarCodeIcon, BellIcon } from './sap-icons.generated';
import { IconRegistry } from './IconRegistry';
import { IconProvider, useIcon } from './IconProvider';

describe('IconRegistry', () => {
  const sap = IconRegistry.sap();

  it('holds every SAP icon and resolves names, URIs and code points', () => {
    expect(sap.size).toBeGreaterThanOrEqual(700);
    for (const ref of ['bar-code', 'Bar-Code', 'sap-icon://bar-code', 0xe08d, '&#xe08d;', '&#xE08D', '&#57485;', 'U+E08D', '0xe08d', '']) {
      expect(sap.get(ref)).toBe(BarCodeIcon);
    }
    expect(sap.codeOf('bar-code')).toBe(0xe08d);
    expect(sap.get('no-such-icon')).toBeUndefined();
    expect(sap.has('bell')).toBe(true);
  });

  it('resolves aliases', () => {
    expect(sap.get('status-completed')).toBeDefined();
  });

  it('registers components and SVG paths, and extend() leaves the original unchanged', () => {
    const custom = sap.extend({ 'my-glyph': 'M0 0h16v16H0z' });
    custom.register('bell', BarCodeIcon);
    expect(custom.get('my-glyph')).toBeDefined();
    expect(custom.get('bell')).toBe(BarCodeIcon);
    expect(sap.get('bell')).toBe(BellIcon);
    expect(sap.has('my-glyph')).toBe(false);
    expect(custom.unregister('my-glyph')).toBe(true);
    expect(custom.has('my-glyph')).toBe(false);
  });

  it('can start empty', () => {
    const r = new IconRegistry({ logo: { icon: 'M1 1h14v14H1z', code: 0xf000 } });
    expect(r.names).toEqual(['logo']);
    expect(r.get(0xf000)).toBe(r.get('logo'));
  });
});

describe('IconProvider', () => {
  it('lets <Icon name> render icons by name or code point', () => {
    const { container } = render(
      <IconProvider>
        <Icon name="bar-code" label="Barcode" />
        <Icon name="&#xe08d;" />
      </IconProvider>,
    );
    expect(container.querySelectorAll('svg[data-icon="bar-code"]')).toHaveLength(2);
    expect(container.querySelector('[role="img"]')).toHaveAttribute('aria-label', 'Barcode');
  });

  it('renders nothing outside a provider or for unknown names', () => {
    const { container } = render(<><Icon name="bar-code" /><IconProvider><Icon name="nope" /></IconProvider></>);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('nested providers add or override icons for their subtree', () => {
    function Probe() { const I = useIcon('bell'); return I ? <I data-testid="probe" /> : null; }
    const { getByTestId } = render(
      <IconProvider>
        <IconProvider icons={{ bell: 'M0 0h8v8H0z' }}><Probe /></IconProvider>
      </IconProvider>,
    );
    expect(getByTestId('probe').getAttribute('data-icon')).toBe('bell');
    expect(getByTestId('probe').querySelector('path')).toHaveAttribute('d', 'M0 0h8v8H0z');
  });

  it('children still take precedence over name', () => {
    const { container } = render(<IconProvider><Icon name="bell"><BarCodeIcon /></Icon></IconProvider>);
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'bar-code');
  });
});
