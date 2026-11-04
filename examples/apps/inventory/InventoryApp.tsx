import { useCallback, useState, type ReactNode } from 'react';
import { BarChart3, Boxes, FileText, Home, LifeBuoy, Package, Settings as SettingsIcon, ShoppingCart, Truck, Users } from 'lucide-react';
import {
  AppShell, ApplicationHeader, Button, DescriptionList, Dialog, List, NavigationGroup, NavigationItem, SearchField, SideNavigation, StatusIndicator,
  ThemeProvider, ToastProvider, useTheme, useToast, type Density, type ThemePreference,
} from '@enterprise-ui/react';
import { isPageId, type PageId } from './data';
import { InventoryProvider, useInventory } from './store';
import { Overview } from './pages/Overview';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { StockMovements } from './pages/StockMovements';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { Suppliers } from './pages/Suppliers';
import { Invoices } from './pages/Invoices';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { NotFound } from './pages/NotFound';

export interface InventoryAppProps {
  /** Fill the viewport (true) or the parent element (false). */
  fullHeight?: boolean;
  /** Current page id (controlled, e.g. from the URL). Unknown ids show a not-found page. */
  page?: string;
  /** Called when the app navigates; pair with `page` to sync the URL. */
  onPageChange?: (page: PageId) => void;
  /** Theme (controlled). When omitted, the app keeps its own theme, starting from the surrounding one. */
  theme?: ThemePreference;
  onThemeChange?: (theme: ThemePreference) => void;
  density?: Density;
  onDensityChange?: (density: Density) => void;
}

const shortcuts = [
  { term: 'Tab / Shift+Tab', description: 'Move between controls' },
  { term: 'Enter in search', description: 'Search products by name or SKU' },
  { term: 'Space on a row checkbox', description: 'Select a row for bulk actions' },
  { term: 'Esc', description: 'Close dialogs, menus and popovers' },
];

function Shell({ fullHeight }: { fullHeight: boolean }) {
  const store = useInventory();
  const { page, navigate, notifications, unreadMovements } = store;
  const toast = useToast();
  const [search, setSearch] = useState(store.filters.query);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  const contactSupport = () => toast.show({ title: 'Support request sent', description: 'Our team will reply to ada@northwind.example within one business day.', tone: 'success' });
  const runSearch = (q: string) => store.showProducts({ query: q.trim() });

  let content: ReactNode;
  switch (page) {
    case 'home': content = <Overview />; break;
    case 'products': content = <Products />; break;
    case 'categories': content = <Categories />; break;
    case 'stock': content = <StockMovements />; break;
    case 'orders': content = <PurchaseOrders />; break;
    case 'suppliers': content = <Suppliers />; break;
    case 'invoices': content = <Invoices />; break;
    case 'reports': content = <Reports />; break;
    case 'settings': content = <Settings />; break;
    case 'help': content = <Help onShowShortcuts={() => setShortcutsOpen(true)} onContactSupport={contactSupport} />; break;
    default: content = <NotFound />;
  }

  return (
    <AppShell
      fullHeight={fullHeight}
      header={
        <ApplicationHeader
          productName="Northwind"
          secondaryTitle="Inventory Management"
          logo={<Boxes color="var(--eui-color-primary)" />}
          search={
            <SearchField
              aria-label="Search products"
              placeholder="Search products by name or SKU"
              size="sm"
              value={search}
              onChange={setSearch}
              onSearch={runSearch}
              onClear={() => runSearch('')}
            />
          }
          notificationCount={unread}
          notifications={
            <div>
              <List
                aria-label="Notifications"
                onItemClick={(item) => {
                  const n = notifications.find((x) => x.id === item.id);
                  if (!n) return;
                  store.markRead(n.id);
                  if (n.target === 'products') store.showProducts({ status: n.status ?? null });
                  else navigate(n.target);
                }}
                emptyState="No notifications"
                items={notifications.map((n) => ({
                  id: n.id,
                  title: n.title,
                  textValue: n.title,
                  description: n.description,
                  trailing: n.read ? undefined : <StatusIndicator tone="information" size="sm">New</StatusIndicator>,
                }))}
              />
              <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="sm" variant="tertiary" disabled={unread === 0} onClick={store.markAllRead}>Mark all read</Button>
              </div>
            </div>
          }
          helpItems={[{ id: 'docs', label: 'Documentation' }, { id: 'shortcuts', label: 'Keyboard shortcuts' }, { id: 'help', label: 'Help center' }, { type: 'separator' }, { id: 'support', label: 'Contact support' }]}
          onHelpAction={(id) => {
            if (id === 'docs') window.location.hash = '/';
            if (id === 'shortcuts') setShortcutsOpen(true);
            if (id === 'help') navigate('help');
            if (id === 'support') contactSupport();
          }}
          onSettingsClick={() => navigate('settings')}
          user={{ name: 'Ada Lovelace', email: 'ada@northwind.example' }}
          userMenuItems={[{ id: 'profile', label: 'My profile' }, { id: 'prefs', label: 'Preferences' }, { type: 'separator' }, { id: 'logout', label: 'Sign out' }]}
          onUserAction={(id) => {
            if (id === 'profile') setProfileOpen(true);
            if (id === 'prefs') navigate('settings');
            if (id === 'logout') toast.show({ title: 'Signed out', description: 'This is a demo, so you stay signed in.', tone: 'information' });
          }}
        />
      }
      navigation={
        <SideNavigation
          activeId={page}
          onNavigate={(id, event) => {
            event.preventDefault();
            if (id === 'catalog') return;
            if (isPageId(id)) navigate(id);
          }}
          footer={
            <>
              <NavigationItem id="settings" label="Settings" icon={<SettingsIcon />} href="#/demo/settings" />
              <NavigationItem id="help" label="Help" icon={<LifeBuoy />} href="#/demo/help" />
            </>
          }
        >
          <NavigationItem id="home" label="Overview" icon={<Home />} href="#/demo/home" />
          <NavigationGroup label="Inventory">
            <NavigationItem id="catalog" label="Catalog" icon={<Package />}>
              <NavigationItem id="products" label="Products" href="#/demo/products" />
              <NavigationItem id="categories" label="Categories" href="#/demo/categories" />
            </NavigationItem>
            <NavigationItem id="stock" label="Stock movements" icon={<Truck />} href="#/demo/stock" badge={unreadMovements || undefined} />
          </NavigationGroup>
          <NavigationGroup label="Purchasing">
            <NavigationItem id="orders" label="Purchase orders" icon={<ShoppingCart />} href="#/demo/orders" />
            <NavigationItem id="suppliers" label="Suppliers" icon={<Users />} href="#/demo/suppliers" />
            <NavigationItem id="invoices" label="Invoices" icon={<FileText />} href="#/demo/invoices" />
          </NavigationGroup>
          <NavigationItem id="reports" label="Reports" icon={<BarChart3 />} href="#/demo/reports" />
        </SideNavigation>
      }
    >
      {content}
      <Dialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} title="Keyboard shortcuts" footer={<Button onClick={() => setShortcutsOpen(false)}>Close</Button>}>
        <DescriptionList columns={1} items={shortcuts} />
      </Dialog>
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} title="My profile" footer={<Button onClick={() => setProfileOpen(false)}>Close</Button>}>
        <DescriptionList columns={1} items={[{ term: 'Name', description: 'Ada Lovelace' }, { term: 'Email', description: 'ada@northwind.example' }, { term: 'Role', description: 'Inventory manager' }, { term: 'Plant', description: '1000 · Seattle' }]} />
      </Dialog>
    </AppShell>
  );
}

/** A complete inventory management app built only from library components. */
export default function InventoryApp({ fullHeight = false, page: pageProp, onPageChange, theme: themeProp, onThemeChange, density: densityProp, onDensityChange }: InventoryAppProps) {
  const inherited = useTheme();
  const [localPage, setLocalPage] = useState<string>('products');
  const [localTheme, setLocalTheme] = useState<ThemePreference>(inherited.theme);
  const [localDensity, setLocalDensity] = useState<Density>(inherited.density);
  const page = pageProp ?? localPage;
  const navigate = useCallback(
    (next: PageId) => {
      setLocalPage(next);
      onPageChange?.(next);
    },
    [onPageChange],
  );
  const themeControlled = themeProp !== undefined;
  const theme = themeProp ?? localTheme;
  const density = densityProp ?? localDensity;
  const setTheme = useCallback((t: ThemePreference) => (onThemeChange ? onThemeChange(t) : setLocalTheme(t)), [onThemeChange]);
  const setDensity = useCallback((d: Density) => (onDensityChange ? onDensityChange(d) : setLocalDensity(d)), [onDensityChange]);

  const app = (
    <ToastProvider>
      <InventoryProvider page={page as PageId} navigate={navigate} theme={theme} setTheme={setTheme} density={density} setDensity={setDensity}>
        <Shell fullHeight={fullHeight} />
      </InventoryProvider>
    </ToastProvider>
  );
  // Controlled theming means the host already wraps the app in a ThemeProvider.
  return themeControlled ? app : <ThemeProvider theme={theme} density={density} style={{ height: '100%' }}>{app}</ThemeProvider>;
}
