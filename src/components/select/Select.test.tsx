import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { Select } from './Select';

const options = [
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France', disabled: true },
  { value: 'es', label: 'Spain' },
  { value: 'se', label: 'Sweden' },
];

describe('Select', () => {
  it('is a labelled combobox showing the placeholder', () => {
    renderWithTheme(<Select label="Country" options={options} />);
    const combo = screen.getByRole('combobox', { name: /Country/ });
    expect(combo).toHaveAttribute('aria-expanded', 'false');
    expect(combo).toHaveTextContent('Select');
  });

  it('opens with ArrowDown, skips disabled options and selects with Enter', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<Select label="Country" options={options} onChange={onChange} />);
    const combo = screen.getByRole('combobox');
    combo.focus();
    await user.keyboard('{ArrowDown}');
    expect(combo).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(combo.getAttribute('aria-activedescendant')).toMatch(/option-0$/);
    await user.keyboard('{ArrowDown}');
    expect(combo.getAttribute('aria-activedescendant')).toMatch(/option-2$/);
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('es');
    expect(combo).toHaveTextContent('Spain');
    expect(combo).toHaveAttribute('aria-expanded', 'false');
  });

  it('selects by type-ahead while closed', async () => {
    const { user } = renderWithTheme(<Select label="Country" options={options} />);
    screen.getByRole('combobox').focus();
    await user.keyboard('sw');
    expect(screen.getByRole('combobox')).toHaveTextContent('Sweden');
  });

  it('selects with the mouse', async () => {
    const { user } = renderWithTheme(<Select label="Country" options={options} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Germany' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('Germany');
  });

  it('shows an error message linked to the control', () => {
    renderWithTheme(<Select label="Country" options={options} error="Country is required" />);
    const combo = screen.getByRole('combobox');
    expect(combo).toHaveAttribute('aria-invalid', 'true');
    expect(combo).toHaveAccessibleDescription(/Country is required/);
  });

  it('has no axe violations when open', async () => {
    const { user } = renderWithTheme(<Select label="Country" options={options} />);
    await user.click(screen.getByRole('combobox'));
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
