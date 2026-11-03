import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { AddressInput } from './AddressInput';

const labelsInOrder = () => screen.getAllByRole('textbox').map((t) => t.getAttribute('autocomplete'));

describe('AddressInput', () => {
  it('lays out fields per country with autofill tokens', async () => {
    const { user, container } = renderWithTheme(<AddressInput label="Delivery address" defaultValue={{ country: 'DE' }} locale="en" autoCompleteSection="shipping" required />);
    expect(labelsInOrder()).toEqual(['shipping address-line1', 'shipping address-line2', 'shipping postal-code', 'shipping address-level2']);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Country or region' }), 'US');
    expect(screen.getByRole('textbox', { name: /ZIP code/ })).toBeRequired();
    expect(screen.getByRole('textbox', { name: /State/ })).toBeRequired();
    expect(labelsInOrder()).toEqual(['shipping address-line1', 'shipping address-line2', 'shipping address-level2', 'shipping address-level1', 'shipping postal-code']);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('checks the postal code for the country', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<AddressInput label="Address" defaultValue={{ country: 'GB' }} onChange={onChange} />);
    const postcode = screen.getByRole('textbox', { name: 'Postcode' });
    await user.type(postcode, '12345');
    await user.tab();
    expect(screen.getByText('Enter a valid postal code, for example SW1A 1AA.')).toBeInTheDocument();
    await user.clear(postcode);
    await user.type(postcode, 'SW1A 1AA');
    await user.tab();
    expect(postcode).not.toHaveAttribute('aria-invalid', 'true');
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ country: 'GB', postalCode: 'SW1A 1AA' }));
  });

  it('fills the address from a suggestion', async () => {
    const fetchSuggestions = vi.fn(async () => [{ label: 'Jungfernstieg 1, 20095 Hamburg', address: { line1: 'Jungfernstieg 1', postalCode: '20095', city: 'Hamburg' } }]);
    const { user } = renderWithTheme(<AddressInput label="Address" defaultValue={{ country: 'DE' }} fetchSuggestions={fetchSuggestions} />);
    await user.type(screen.getByRole('textbox', { name: 'Street and house number' }), 'Jungf');
    const list = await waitFor(() => screen.getByRole('list', { name: '1 address suggestion' }));
    expect(fetchSuggestions).toHaveBeenLastCalledWith('Jungf', 'DE', expect.any(AbortSignal));
    await user.click(within(list).getByRole('button'));
    expect(screen.getByRole('textbox', { name: 'City' })).toHaveValue('Hamburg');
    expect(screen.getByRole('textbox', { name: 'Postal code' })).toHaveValue('20095');
  });
});
