import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Inventory from '../../examples/dashboard/02-inventory';
import Customers from '../../examples/master-detail/02-customers';
import Wizard from '../../examples/wizard/02-purchase-order';
import Inbox from '../../examples/approval-workflow/02-inbox';
import Assets from '../../examples/data-grid/03-assets';
import { examples } from '../../docs/src/examples';
import { renderWithTheme } from '../utils';

const recipes = ['list-report/03-purchase-orders', 'dashboard/02-inventory', 'master-detail/02-customers', 'wizard/02-purchase-order', 'approval-workflow/02-inbox', 'data-grid/03-assets', 'object-editor/01-object-page'];
describe('enterprise cookbook', () => {
  it('registers every recipe in the documentation examples', () => {
    for (const recipe of recipes) expect(examples.some((example) => example.id === recipe)).toBe(true);
  });
  it('shows inventory empty and stale-data failure states', async () => {
    const { user } = renderWithTheme(<Inventory />);
    await user.click(screen.getByRole('button', { name: 'Show empty state' }));
    expect(screen.getByText('No inventory items.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Simulate refresh failure' }));
    expect(screen.getByRole('alert')).toHaveTextContent('refresh failed');
  });
  it('switches the selected customer', async () => {
    const { user } = renderWithTheme(<Customers />);
    await user.click(screen.getByRole('option', { name: /Northstar Supply/ }));
    expect(screen.getByText('C-102')).toBeInTheDocument();
  });
  it('validates the purchase-order wizard and completes a mock order', async () => {
    const { user } = renderWithTheme(<Wizard />);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Enter a supplier.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Supplier name'), 'Aster');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Order amount' })).toHaveFocus());
    await user.type(screen.getByLabelText('Amount in USD'), '400');
    expect(screen.getByLabelText('Amount in USD')).toHaveValue(400);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Create order' }));
    expect(await screen.findByText('Mock purchase order created')).toBeInTheDocument();
  });
  it('retains an approval after a failed decision and reaches empty after retry', async () => {
    const { user } = renderWithTheme(<Inbox />);
    await user.click(screen.getByLabelText('Simulate service failure'));
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Confirm' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('service unavailable');
    await user.click(screen.getByLabelText('Simulate service failure'));
    for (let index = 0; index < 2; index++) {
      await user.click(screen.getByRole('button', { name: 'Approve' }));
      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Confirm' }));
    }
    expect(await screen.findByText('No approvals waiting.')).toBeInTheDocument();
  });
  it('shows an asset empty state', async () => {
    const { user } = renderWithTheme(<Assets />);
    await user.click(screen.getByRole('button', { name: 'Show empty assets' }));
    expect(screen.getByText('No assets registered.')).toBeInTheDocument();
  });
});
