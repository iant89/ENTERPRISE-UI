import { Pencil, Share2 } from 'lucide-react';
import { Avatar, Button, Card, IconButton, Page, ProgressBar, StatusIndicator } from '@enterprise-ui/react';

export const title = 'Page layout';
export const description = 'Breadcrumbs, title with status, subtitle, actions, header content and a toolbar area above the content region.';
export const frame = true;

export default function PageBasic() {
  return (
    <Page
      breadcrumbs={[{ label: 'Home', href: '#' }, { label: 'Suppliers', href: '#' }, { label: 'Contoso Ltd' }]}
      title="Contoso Ltd"
      titleAddon={<StatusIndicator tone="success">Active</StatusIndicator>}
      subtitle="Supplier 100045 · Office supplies · Since 2019"
      avatar={<Avatar name="Contoso Ltd" shape="square" size="lg" decorative />}
      actions={
        <>
          <IconButton icon={<Share2 />} label="Share" />
          <Button icon={<Pencil />} variant="primary">Edit</Button>
        </>
      }
      headerContent={<div style={{ maxWidth: 320 }}><ProgressBar label="Annual purchase volume" value={72} formatValue={() => '$720K of $1M'} /></div>}
    >
      <Card title="Contact">Jane Doe · purchasing@contoso.example · +49 30 1234567</Card>
    </Page>
  );
}
