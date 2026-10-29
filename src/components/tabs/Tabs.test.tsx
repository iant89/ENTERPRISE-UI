import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { Tabs, TabList, Tab, TabPanel } from './Tabs';

function Example({ onValueChange, activation }: { onValueChange?: (v: string) => void; activation?: 'automatic' | 'manual' }) {
  return (
    <Tabs defaultValue="general" onValueChange={onValueChange} activation={activation}>
      <TabList aria-label="Product">
        <Tab value="general">General</Tab>
        <Tab value="pricing" count={3}>Pricing</Tab>
        <Tab value="archived" disabled>Archived</Tab>
        <Tab value="history">History</Tab>
      </TabList>
      <TabPanel value="general">General info</TabPanel>
      <TabPanel value="pricing">Price list</TabPanel>
      <TabPanel value="history">Changes</TabPanel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('links tabs and panels', () => {
    renderWithTheme(<Example />);
    const tab = screen.getByRole('tab', { name: 'General' });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'General' })).toHaveTextContent('General info');
  });

  it('moves with arrow keys, skips disabled tabs and activates automatically', async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithTheme(<Example onValueChange={onValueChange} />);
    screen.getByRole('tab', { name: 'General' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: /Pricing/ })).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith('pricing');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'History' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'General' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Changes');
  });

  it('supports manual activation', async () => {
    const { user } = renderWithTheme(<Example activation="manual" />);
    screen.getByRole('tab', { name: 'General' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('General info');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Price list');
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<Example />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
