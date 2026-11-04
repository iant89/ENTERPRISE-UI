import { ApplicationHeader, SapBoxIcon, SearchField, Tag, TaskIcon, FactoryIcon, ProductIcon, ShippingStatusIcon } from '@enterprise-ui/react';

export const title = 'Shell bar';
export const description = 'Branding, a trial-system tag in the context area, global search, AI assistant, notifications, a product action with a counter, help, the product switch and the user menu (Settings lives there). Make the window narrower: search collapses first, then the actions move into the overflow menu (it carries the counter), then the tag and finally the product name hide.';

export default function ApplicationHeaderBasic() {
  return (
    <ApplicationHeader
      productName="Northwind"
      secondaryTitle="Procurement"
      logo={<SapBoxIcon color="var(--eui-color-primary)" />}
      homeHref="#"
      context={[{ id: 'trial', priority: 1, content: <Tag colorScheme={7} set={2}>Trial: 14 days left</Tag> }]}
      search={<SearchField aria-label="Search" placeholder="Search orders, suppliers…" size="sm" />}
      onAssistantClick={() => {}}
      notificationCount={12}
      onNotificationsClick={() => {}}
      additionalActions={[{ id: 'tasks', label: 'My tasks', icon: <TaskIcon />, count: 4, onClick: () => {} }]}
      helpItems={[{ id: 'docs', label: 'Documentation' }, { id: 'whatsnew', label: "What's new" }]}
      onSettingsClick={() => {}}
      user={{ name: 'Grace Hopper', email: 'grace@northwind.example' }}
      userMenuItems={[{ id: 'profile', label: 'My profile' }, { id: 'logout', label: 'Sign out' }]}
      productSwitchItems={[
        { id: 'procurement', title: 'Procurement', icon: <ProductIcon />, current: true },
        { id: 'manufacturing', title: 'Manufacturing', icon: <FactoryIcon /> },
        { id: 'logistics', title: 'Logistics', icon: <ShippingStatusIcon /> },
      ]}
    />
  );
}
