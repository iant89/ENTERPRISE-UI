import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Home, Package } from 'lucide-react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { AppShell } from './AppShell';
import { ApplicationHeader } from '../../components/application-header';
import { SideNavigation, NavigationItem, NavigationGroup } from '../../components/side-navigation';
import { Page } from '../page';
import { Button } from '../../components/button';
import { ResizablePanel } from '../resizable-panel';

function Shell({ onNavigate }: { onNavigate?: (id: string) => void }) {
  return (
    <AppShell
      header={
        <ApplicationHeader
          productName="Inventory"
          notificationCount={3}
          onNotificationsClick={() => {}}
          helpItems={[{ id: 'docs', label: 'Documentation' }]}
          onSettingsClick={() => {}}
          user={{ name: 'Ada Lovelace', email: 'ada@example.com' }}
          userMenuItems={[{ id: 'logout', label: 'Sign out' }]}
        />
      }
      navigation={
        <SideNavigation activeId="products" onNavigate={(id, e) => { e.preventDefault(); onNavigate?.(id); }}>
          <NavigationItem id="home" label="Home" icon={<Home />} href="#home" />
          <NavigationGroup label="Catalog">
            <NavigationItem id="catalog" label="Catalog" icon={<Package />}>
              <NavigationItem id="products" label="Products" href="#products" />
              <NavigationItem id="categories" label="Categories" href="#categories" />
            </NavigationItem>
          </NavigationGroup>
        </SideNavigation>
      }
    >
      <Page title="Products" subtitle="All products" breadcrumbs={[{ label: 'Home', href: '#' }, { label: 'Products' }]} actions={<Button variant="primary">Create</Button>}>
        Content
      </Page>
    </AppShell>
  );
}

describe('AppShell', () => {
  it('renders landmarks, skip link and the page heading', () => {
    renderWithTheme(<Shell />);
    expect(screen.getAllByRole('banner')[0]).toHaveTextContent('Inventory');
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('heading', { level: 1, name: 'Products' })).toBeInTheDocument();
  });

  it('marks the active route and expands its section', () => {
    renderWithTheme(<Shell />);
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Catalog' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('navigates and collapses the sidebar', async () => {
    const onNavigate = vi.fn();
    const { user } = renderWithTheme(<Shell onNavigate={onNavigate} />);
    await user.click(screen.getByRole('link', { name: 'Categories' }));
    expect(onNavigate).toHaveBeenCalledWith('categories');
    const toggle = screen.getByRole('button', { name: 'Collapse navigation' });
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Expand navigation' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('labels the notification button with the unread count', () => {
    renderWithTheme(<Shell />);
    expect(screen.getByRole('button', { name: 'Notifications, 3 unread' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<Shell />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('ResizablePanel', () => {
  it('resizes with the keyboard', async () => {
    const onResize = vi.fn();
    const { user } = renderWithTheme(
      <ResizablePanel defaultSize={300} minSize={200} maxSize={400} onResize={onResize}>
        Panel
      </ResizablePanel>,
    );
    const handle = screen.getByRole('separator', { name: 'Resize panel' });
    expect(handle).toHaveAttribute('aria-valuenow', '300');
    handle.focus();
    await user.keyboard('{ArrowRight}');
    expect(onResize).toHaveBeenLastCalledWith(316);
    await user.keyboard('{End}');
    expect(handle).toHaveAttribute('aria-valuenow', '400');
  });
});

describe('SideNavigation collapsed flyout', () => {
  it('lets onNavigate prevent link navigation', async () => {
    const events: Array<{ id: string; prevented: boolean }> = [];
    const { user } = renderWithTheme(
      <SideNavigation
        collapsed
        onNavigate={(id, event) => {
          event.preventDefault();
          events.push({ id, prevented: event.defaultPrevented });
        }}
      >
        <NavigationItem id="catalog" label="Catalog" icon={<Package />}>
          <NavigationItem id="products" label="Products" href="#products" />
        </NavigationItem>
      </SideNavigation>,
    );
    await user.click(screen.getByRole('button', { name: 'Catalog' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Products' }));
    expect(events).toEqual([{ id: 'products', prevented: true }]);
    expect(window.location.hash).not.toBe('#products');
  });
});
