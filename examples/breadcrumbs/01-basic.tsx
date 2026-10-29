import { Breadcrumbs, Stack } from '@enterprise-ui/react';

export const title = 'Breadcrumbs';
export const description = 'The last item is the current page (`aria-current="page"`). Long trails collapse middle items into a menu.';

export default function BreadcrumbsBasic() {
  return (
    <Stack gap={4}>
      <Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Purchasing', href: '#purchasing' }, { label: 'Purchase orders', href: '#po' }, { label: '4500012' }]} />
      <Breadcrumbs
        aria-label="Storage location"
        maxItems={4}
        items={[
          { label: 'Home', href: '#' },
          { label: 'Company 1000', href: '#c' },
          { label: 'Plant Berlin', href: '#p' },
          { label: 'Storage location 0001', href: '#s' },
          { label: 'Bin A-12', href: '#b' },
          { label: 'Batch 77821' },
        ]}
      />
    </Stack>
  );
}
