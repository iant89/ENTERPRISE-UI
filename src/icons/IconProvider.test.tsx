import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Icon } from '../components/icon';
import { IconProvider } from './IconProvider';

describe('IconProvider', () => {
  it('lists every icon from src/assets/icons, sorted', () => {
    const names = IconProvider.getIconNames();
    expect(names.length).toBeGreaterThanOrEqual(704);
    expect(names).toContain('bar-code');
    expect(names).toContain('status-completed');
    expect([...names].sort()).toEqual(names);
  });

  it('returns an svg element for a name', () => {
    const { container } = render(IconProvider.getIcon('bar-code', { size: 32, className: 'x' }));
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('data-icon', 'bar-code');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg.getAttribute('class')).toContain('x');
    expect(svg.querySelector('path')!.getAttribute('d')).toMatch(/^M/);
  });

  it('resolves URIs and code points', () => {
    for (const ref of ['Bar-Code', 'sap-icon://bar-code', 0xe08d, '&#xe08d;', '&#57485;', 'U+E08D', '0xe08d', '']) {
      expect(IconProvider.resolveName(ref)).toBe('bar-code');
    }
    expect(IconProvider.getCodePoint('bar-code')).toBe(0xe08d);
  });

  it('labels the icon when given a title', () => {
    const { container } = render(IconProvider.getIcon('bell', { title: 'Notifications' }));
    expect(container.querySelector('svg')).toHaveAttribute('role', 'img');
    expect(container.querySelector('title')).toHaveTextContent('Notifications');
  });

  it('marks direction-dependent icons for mirroring', () => {
    const { container } = render(IconProvider.getIcon('nav-back'));
    expect(container.querySelector('svg')!.getAttribute('class')).toContain('eui-icon-rtl-flip');
  });

  it('returns the fallback icon for unknown names', () => {
    expect(IconProvider.hasIcon('no-such-icon')).toBe(false);
    const { container } = render(IconProvider.getIcon('no-such-icon'));
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'fallback');
  });

  it('registers custom icons', () => {
    IconProvider.registerIcon('company-logo', 'M0 0h16v16H0z', { code: 0xf8f0 });
    expect(IconProvider.getIconNames()).toContain('company-logo');
    const { container } = render(IconProvider.getIcon(0xf8f0));
    expect(container.querySelector('path')).toHaveAttribute('d', 'M0 0h16v16H0z');
  });

  it('powers <Icon name>', () => {
    const { container } = render(<Icon name="sap-icon://bell" label="Bell" />);
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'bell');
  });
});
