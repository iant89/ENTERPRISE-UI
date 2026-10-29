import { Boxes } from 'lucide-react';
import { ApplicationHeader, SearchField } from '@enterprise-ui/react';

export const title = 'Application header';
export const description = 'Branding, global search (collapses behind a button below 1024px), notifications with a count, help menu, settings and the user menu.';

export default function ApplicationHeaderBasic() {
  return (
    <ApplicationHeader
      productName="Northwind"
      secondaryTitle="Procurement"
      logo={<Boxes color="var(--eui-color-primary)" />}
      homeHref="#"
      search={<SearchField aria-label="Search" placeholder="Search orders, suppliers…" size="sm" />}
      notificationCount={12}
      onNotificationsClick={() => {}}
      helpItems={[{ id: 'docs', label: 'Documentation' }, { id: 'whatsnew', label: "What's new" }]}
      onSettingsClick={() => {}}
      user={{ name: 'Grace Hopper', email: 'grace@northwind.example' }}
      userMenuItems={[{ id: 'profile', label: 'My profile' }, { id: 'logout', label: 'Sign out' }]}
    />
  );
}
