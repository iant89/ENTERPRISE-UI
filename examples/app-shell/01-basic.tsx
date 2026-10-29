import InventoryApp from '../apps/InventoryApp';

export const title = 'Complete application shell';
export const description = 'Header, collapsible side navigation, breadcrumbs, page title and actions, filter bar and a data grid. Resize the window: below 1024px the navigation collapses to icons, below 600px it becomes a drawer.';
export const frame = true;

export default function AppShellBasic() {
  return (
    <div style={{ height: 640 }}>
      <InventoryApp />
    </div>
  );
}
