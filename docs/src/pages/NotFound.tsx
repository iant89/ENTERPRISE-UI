import { Button, EmptyState, Page, IconProvider } from '@enterprise-ui/react';
import { navigate } from '../router';

export function NotFound() {
  return (
    <Page title="Page not found">
      <EmptyState icon={IconProvider.getIcon('explorer')} title="We couldn’t find that page" description="The page may have moved. Browse all components or return to the overview." actions={<Button variant="primary" onClick={() => navigate('/')}>Go to overview</Button>} />
    </Page>
  );
}
