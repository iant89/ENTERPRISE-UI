import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { ViewSettingsDialog } from './ViewSettingsDialog';

describe('ViewSettingsDialog', () => {
  it('confirms sort and filter changes as a whole', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const { user } = renderWithTheme(
      <ViewSettingsDialog
        open
        onClose={onClose}
        onConfirm={onConfirm}
        settings={{ sortBy: 'date', sortDescending: false, groupDescending: false, filters: {} }}
        sortItems={[{ id: 'date', label: 'Date' }, { id: 'amount', label: 'Amount' }]}
        filterItems={[{ id: 'status', label: 'Status', options: [{ id: 'open', label: 'Open' }, { id: 'closed', label: 'Closed' }] }]}
      />,
    );
    await user.click(screen.getByRole('radio', { name: 'Amount' }));
    await user.click(screen.getByRole('radio', { name: 'Descending' }));
    await user.click(screen.getByRole('tab', { name: 'Filter' }));
    await user.click(screen.getByRole('checkbox', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(onConfirm).toHaveBeenCalledWith({ sortBy: 'amount', sortDescending: true, groupDescending: false, filters: { status: ['open'] } });
    expect(onClose).toHaveBeenCalled();
  });
  it('discards changes on cancel', async () => {
    const onConfirm = vi.fn();
    const { user } = renderWithTheme(<ViewSettingsDialog open onClose={() => {}} onConfirm={onConfirm} settings={{ sortDescending: false, groupDescending: false, filters: {} }} sortItems={[{ id: 'a', label: 'A' }]} />);
    await user.click(screen.getByRole('radio', { name: 'A' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
