import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { Accordion } from './Accordion';

const items = [
  { id: 'a', title: 'General', content: 'General data' },
  { id: 'b', title: 'Delivery', content: 'Delivery data', subtitle: '2 addresses' },
  { id: 'c', title: 'Billing', content: 'Billing data', disabled: true },
];

describe('Accordion', () => {
  it('opens one section at a time in single mode and moves focus with arrows', async () => {
    const onValueChange = vi.fn();
    const { user, container } = renderWithTheme(<Accordion items={items} defaultValue={['a']} onValueChange={onValueChange} />);
    const general = screen.getByRole('button', { name: 'General' });
    expect(general).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: 'General' })).toHaveTextContent('General data');
    await user.click(screen.getByRole('button', { name: /Delivery/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(['b']);
    expect(general).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('General data')).not.toBeVisible();
    general.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: /Delivery/ })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(general).toHaveFocus();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('keeps several open in multiple mode and respects collapsible', async () => {
    const { user, rerender } = renderWithTheme(<Accordion items={items} type="multiple" defaultValue={['a']} />);
    await user.click(screen.getByRole('button', { name: /Delivery/ }));
    expect(screen.getAllByRole('region')).toHaveLength(2);
    rerender(<Accordion items={items} value={['a']} collapsible={false} />);
    expect(screen.getByRole('button', { name: 'General' })).toHaveAttribute('aria-disabled', 'true');
  });
});
