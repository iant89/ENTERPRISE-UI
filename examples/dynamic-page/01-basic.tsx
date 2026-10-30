import { Button, DynamicPage, StatusIndicator } from '@enterprise-ui/react';

export const title = 'Dynamic page';
export const description = 'Collapsible, pinnable header with a sticky footer.';
export const frame = true;

export default function DynamicPageBasic() {
  return (
    <DynamicPage
      title="Purchase order 4500012"
      subtitle="Supplier: Acme Components GmbH"
      snappedSubtitle="Acme Components GmbH"
      actions={<Button>Edit</Button>}
      headerContent={<StatusIndicator tone="warning">Awaiting approval</StatusIndicator>}
      footer={<><Button variant="primary">Approve</Button><Button>Reject</Button></>}
    >
      <p>Line items and details go here.</p>
    </DynamicPage>
  );
}
