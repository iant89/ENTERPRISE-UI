import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { Button } from '../button';
import { ResponsivePopover } from './ResponsivePopover';

describe('ResponsivePopover', () => {
  it('opens as a non-modal popover by default', async () => {
    const { user } = renderWithTheme(<ResponsivePopover presentation="popover" title="Filters" trigger={<Button>Filters</Button>}>Body</ResponsivePopover>);
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    const dialog = await screen.findByRole('dialog', { name: 'Filters' });
    expect(dialog).not.toHaveAttribute('aria-modal', 'true');
  });
  it('opens as a modal dialog in dialog presentation and closes with Escape', async () => {
    const { user } = renderWithTheme(<ResponsivePopover presentation="dialog" title="Filters" trigger={<Button>Open</Button>}>{(close) => <Button onClick={close}>Done</Button>}</ResponsivePopover>);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    expect(await screen.findByRole('dialog', { name: 'Filters' })).toHaveAttribute('aria-modal', 'true');
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
