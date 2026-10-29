import { AppBreadcrumbBar, Button } from '@enterprise-ui/react';
export default function Example() { return <AppBreadcrumbBar items={[{ label: 'Home', href: '/' }, { label: 'Purchase orders', href: '/orders' }, { label: 'PO-1042' }]} actions={<Button>Export</Button>} />; }
