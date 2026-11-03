import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../../tests/utils';
import { Kbd, describeKeys } from './Kbd';

describe('Kbd', () => {
  it('shows platform key caps and reads them as words', () => {
    const { container, rerender } = renderWithTheme(<Kbd keys="Mod+K" platform="other" />);
    expect([...container.querySelectorAll('kbd kbd')].map((k) => k.textContent)).toEqual(['Ctrl', 'K']);
    expect(container.querySelector('.eui-visually-hidden')).toHaveTextContent('Control plus K');
    rerender(<Kbd keys={['Mod', 'Shift', 'P']} platform="mac" />);
    expect([...container.querySelectorAll('kbd kbd')].map((k) => k.textContent)).toEqual(['⌘', '⇧', 'P']);
    expect(describeKeys('Ctrl++', 'other')).toBe('Control plus +');
  });
});
