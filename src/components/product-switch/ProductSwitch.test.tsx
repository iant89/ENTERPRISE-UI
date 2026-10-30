import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { ProductSwitch } from './ProductSwitch';

const items = [
  { id: 'crm', title: 'CRM', current: true },
  { id: 'erp', title: 'ERP', href: '#erp' },
  { id: 'hr', title: 'HR' },
];

describe('ProductSwitch', () => {
  it('renders links and buttons in a labelled navigation', async () => {
    const onItemClick = vi.fn();
    const { user } = renderWithTheme(<ProductSwitch items={items} onItemClick={onItemClick} />);
    expect(screen.getByRole('navigation', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ERP' })).toHaveAttribute('href', '#erp');
    expect(screen.getByRole('button', { name: 'CRM' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: 'HR' }));
    expect(onItemClick).toHaveBeenCalledWith(items[2]);
  });
  it('moves focus with arrow keys', async () => {
    const { user } = renderWithTheme(<ProductSwitch items={items} />);
    screen.getByRole('button', { name: 'CRM' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('link', { name: 'ERP' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'HR' })).toHaveFocus();
  });
  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<ProductSwitch items={items} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
