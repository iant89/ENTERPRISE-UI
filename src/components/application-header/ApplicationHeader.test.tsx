import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { IconProvider } from '../../icons';
import { Tag } from '../tag';
import { ApplicationHeader, type ApplicationHeaderProps } from './ApplicationHeader';

const base: ApplicationHeaderProps = {
  productName: 'Northwind',
  user: { name: 'Ada Lovelace', email: 'ada@example.com' },
  helpItems: [{ id: 'docs', label: 'Documentation' }],
};

/** Simulates the header's measured width and the widths of the pieces it measures. */
function mockWidths(header: number, widths: Partial<Record<string, number>> = {}) {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.tagName === 'HEADER' ? header : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    const key = this.dataset.measure;
    if (!key) return 0;
    if (key === 'icon') return 36;
    if (key === 'brandText') return widths.brandText ?? 160;
    if (key.startsWith('ctx:')) return widths[key] ?? 100;
    return widths[key] ?? 0;
  });
  class RO { constructor(private cb: () => void) {} observe() { this.cb(); } disconnect() {} }
  vi.stubGlobal('ResizeObserver', RO);
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('ApplicationHeader', () => {
  it('always shows Help and the profile, with Settings in the user menu', async () => {
    const onSettingsClick = vi.fn();
    const { user } = renderWithTheme(<ApplicationHeader {...base} onSettingsClick={onSettingsClick} />);
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'User menu for Ada Lovelace' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Settings' }));
    expect(onSettingsClick).toHaveBeenCalledOnce();
  });

  it('shows Help as a plain button when there are no help items', async () => {
    const onHelpClick = vi.fn();
    const { user } = renderWithTheme(<ApplicationHeader productName="Northwind" user={{ name: 'Ada' }} onHelpClick={onHelpClick} />);
    await user.click(screen.getByRole('button', { name: 'Help' }));
    expect(onHelpClick).toHaveBeenCalledOnce();
  });

  it('shows Back only when onBack is set', async () => {
    const onBack = vi.fn();
    const { user, rerender } = renderWithTheme(<ApplicationHeader {...base} />);
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    rerender(<ApplicationHeader {...base} onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renders the assistant, product actions with counts, context items and the product switch', async () => {
    const onItem = vi.fn();
    const { user } = renderWithTheme(
      <ApplicationHeader
        {...base}
        onAssistantClick={() => {}}
        additionalActions={[{ id: 'tasks', label: 'My tasks', icon: IconProvider.getIcon('task'), count: 4 }]}
        context={[{ id: 'trial', content: <Tag colorScheme={7} set={2}>Trial</Tag> }]}
        productSwitchItems={[{ id: 'a', title: 'Procurement' }, { id: 'b', title: 'Logistics' }]}
        onProductSwitchItemClick={onItem}
      />,
    );
    expect(screen.getByRole('button', { name: 'AI assistant' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'My tasks, 4' })).toBeInTheDocument();
    expect(screen.getAllByText('Trial')[0]).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Products' }));
    await user.click(await screen.findByRole('button', { name: 'Logistics' }));
    expect(onItem).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }));
  });

  it('collapses search, then moves actions into the overflow menu, with the single badge count on it', async () => {
    // Full width needs 616px and collapsed search 412px; at 380px the actions overflow too.
    mockWidths(380);
    const onTasks = vi.fn();
    const { user } = renderWithTheme(
      <ApplicationHeader {...base} search={<input aria-label="Search orders" />} onAssistantClick={() => {}} additionalActions={[{ id: 'tasks', label: 'My tasks', icon: IconProvider.getIcon('task'), count: 4, onClick: onTasks }]} />,
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'More, 1 with new items' })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'AI assistant' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Help' })).not.toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'More, 1 with new items' }));
    expect(await screen.findByRole('menuitem', { name: 'Documentation' })).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'My tasks (4)' }));
    expect(onTasks).toHaveBeenCalledOnce();
  });

  it('shows only an attention dot when several badged actions overflow', async () => {
    mockWidths(300);
    const { container } = renderWithTheme(
      <ApplicationHeader {...base} additionalActions={[{ id: 'a', label: 'Tasks', icon: IconProvider.getIcon('task'), count: 4 }, { id: 'b', label: 'Approvals', icon: IconProvider.getIcon('task'), count: 2 }]} />,
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'More, 2 with new items' })).toBeInTheDocument());
    expect(screen.queryByText('4')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="dotBadge"]')).not.toBeNull();
  });

  it('hides context items from lowest priority, then the product name, then moves search into the overflow', async () => {
    mockWidths(500);
    const onHidden = vi.fn();
    const { unmount } = renderWithTheme(
      <ApplicationHeader
        {...base}
        search={<input aria-label="Search orders" />}
        context={[{ id: 'low', priority: 0, content: 'Low' }, { id: 'high', priority: 2, content: 'High' }]}
        onContextVisibilityChange={onHidden}
      />,
    );
    await waitFor(() => expect(onHidden).toHaveBeenLastCalledWith(['low']));
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    unmount();

    // 380px: the product name hides (still announced), the top context item stays.
    vi.restoreAllMocks();
    mockWidths(380);
    const second = renderWithTheme(<ApplicationHeader {...base} search={<input aria-label="Search orders" />} context={[{ id: 'high', priority: 2, content: 'High' }]} />);
    const visibleProductName = () => Array.from(second.container.querySelectorAll('[class*="product"]')).filter((el) => !el.closest('[inert]'));
    await waitFor(() => expect(visibleProductName()).toHaveLength(0));
    expect(screen.getAllByText('Northwind').filter((el) => !el.closest('[inert]'))[0].className).toMatch(/visuallyHidden/);
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    second.unmount();

    // 250px: search moves into the overflow menu.
    vi.restoreAllMocks();
    mockWidths(250);
    const { user } = renderWithTheme(<ApplicationHeader {...base} search={<input aria-label="Search orders" />} context={[{ id: 'high', priority: 2, content: 'High' }]} />);
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Search' })).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'More' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Search' }));
    expect(screen.getByRole('textbox', { name: 'Search orders' })).toBeVisible();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<ApplicationHeader {...base} notificationCount={3} onNotificationsClick={() => {}} onAssistantClick={() => {}} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
