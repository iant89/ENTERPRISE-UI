import { useState } from 'react';
import { BarChart3, Home, LifeBuoy, Package, ShoppingCart, Users } from 'lucide-react';
import { NavigationGroup, NavigationItem, SideNavigation, Switch, Stack } from '@enterprise-ui/react';

export const title = 'Side navigation';
export const description = 'Compose NavigationItem and NavigationGroup. Items with children expand; the active item gets `aria-current="page"`. Collapsed mode shows icons with tooltips and flyout menus.';

export default function SideNavigationBasic() {
  const [active, setActive] = useState('orders');
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Stack gap={3}>
      <Switch label="Collapsed" checked={collapsed} onChange={setCollapsed} />
      <div style={{ width: collapsed ? 56 : 256, height: 420, border: '1px solid var(--eui-color-border)', borderRadius: 8, overflow: 'auto', transition: 'width 200ms' }}>
        <SideNavigation
          collapsed={collapsed}
          activeId={active}
          onNavigate={(id, e) => {
            e.preventDefault();
            setActive(id);
          }}
          footer={<NavigationItem id="help" label="Help" icon={<LifeBuoy />} />}
        >
          <NavigationItem id="home" label="Home" icon={<Home />} href="#home" />
          <NavigationGroup label="Sales">
            <NavigationItem id="sales" label="Sales" icon={<ShoppingCart />}>
              <NavigationItem id="orders" label="Orders" href="#orders" />
              <NavigationItem id="quotes" label="Quotations" href="#quotes" />
              <NavigationItem id="returns" label="Returns" href="#returns" />
            </NavigationItem>
            <NavigationItem id="customers" label="Customers" icon={<Users />} href="#customers" badge={5} />
          </NavigationGroup>
          <NavigationGroup label="Supply chain">
            <NavigationItem id="products" label="Products" icon={<Package />} href="#products" />
            <NavigationItem id="analytics" label="Analytics" icon={<BarChart3 />} href="#analytics" />
          </NavigationGroup>
        </SideNavigation>
      </div>
    </Stack>
  );
}
