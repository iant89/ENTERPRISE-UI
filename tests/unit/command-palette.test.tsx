import { useState } from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CommandPalette, type PaletteCommand } from '../../src';
import { axeViolations, renderWithTheme } from '../utils';

const commands: PaletteCommand[] = [
  { id: 'orders', label: 'Orders', group: 'Navigation', keywords: ['procurement'], shortcut: 'G O' },
  { id: 'reports', label: 'Reports', group: 'Navigation' },
  { id: 'create', label: 'Create', group: 'Actions', description: 'New order' },
  { id: 'admin', label: 'Admin', group: 'Navigation', permitted: false },
];
function Harness({ onSelect = () => {}, globalShortcut = false }: { onSelect?: (command: PaletteCommand) => void; globalShortcut?: boolean }) {
  const [open, setOpen] = useState(false);
  return <><button onClick={() => setOpen(true)}>Open</button><CommandPalette open={open} onOpenChange={setOpen} commands={commands} recentIds={['reports', 'admin', 'reports', 'missing']} onSelect={onSelect} globalShortcut={globalShortcut} /></>;
}

describe('CommandPalette', () => {
  it('filters permitted commands, groups recent results and searches keywords', async () => {
    const { user } = renderWithTheme(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog', { name: 'Command palette' });
    const input = within(dialog).getByRole('combobox', { name: 'Search commands' });
    await waitFor(() => expect(input).toHaveFocus());
    expect(within(screen.getByRole('group', { name: 'Recent' })).getByRole('option')).toHaveTextContent('Reports');
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
    await user.type(input, 'procurement');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option')).toHaveTextContent('Orders');
    await user.clear(input);
    await user.type(input, 'unmatched');
    expect(screen.getByRole('status')).toHaveTextContent('No commands found');
    expect(await axeViolations(dialog)).toEqual([]);
  });

  it('moves through results, invokes selection, and restores focus on escape', async () => {
    const onSelect = vi.fn();
    const { user } = renderWithTheme(<Harness onSelect={onSelect} />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    const input = screen.getByRole('combobox');
    await waitFor(() => expect(input).toHaveFocus());
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith(commands[0]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(trigger);
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(input).not.toBeInTheDocument();
  });

  it('supports an opt-in global shortcut without reacting to repeated or modified keys', async () => {
    renderWithTheme(<Harness globalShortcut />);
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true, shiftKey: true });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'k', metaKey: true, repeat: true });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('has no axe violations while open', async () => {
    const { user } = renderWithTheme(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await axeViolations(screen.getByRole('dialog'))).toEqual([]);
  });
});

describe('localized CommandPalette', () => {
  it('localizes visible and accessible messages in the portal and matches with the requested locale', async () => {
    const localized: PaletteCommand[] = [{ id: 'i', label: 'İSTANBUL' }, { id: 'j', label: 'طلب PO-123' }];
    const { user } = renderWithTheme(<CommandPalette open onOpenChange={() => {}} commands={localized} recentIds={['j']} onSelect={() => {}}
      locale="tr" dir="rtl" lang="tr" title="Komutlar" searchLabel="Ara" resultsLabel="Sonuçlar"
      defaultGroupLabel="Diğer" recentLabel="Son" emptyMessage="Sonuç yok" closeLabel="Kapat" />);
    const dialog = screen.getByRole('dialog', { name: 'Komutlar' });
    expect(dialog.closest('[dir="rtl"]')).toHaveAttribute('lang', 'tr');
    expect(within(dialog).getByRole('button', { name: 'Kapat' })).toBeInTheDocument();
    expect(within(dialog).getByRole('listbox', { name: 'Sonuçlar' })).toBeInTheDocument();
    expect(within(dialog).getByRole('group', { name: 'Son' })).toBeInTheDocument();
    expect(within(dialog).getByRole('group', { name: 'Diğer' })).toBeInTheDocument();
    const input = within(dialog).getByRole('combobox', { name: 'Ara' });
    await user.type(input, 'istanbul');
    expect(within(dialog).getByRole('option')).toHaveTextContent('İSTANBUL');
    await user.clear(input);
    await user.type(input, 'xyz');
    expect(within(dialog).getByRole('status')).toHaveTextContent('Sonuç yok');
    expect(await axeViolations(dialog)).toEqual([]);
  });
});
