import { Card, DynamicSideContent } from '@enterprise-ui/react';

export const title = 'Dynamic side content';
export const description = 'Side content sits beside the main content and moves below it on phones.';

export default function DynamicSideContentBasic() {
  return (
    <DynamicSideContent sideContent={<Card title="Hints">Approvals over $10k need a second reviewer.</Card>}>
      <Card title="Invoice">Invoice details and line items.</Card>
    </DynamicSideContent>
  );
}
