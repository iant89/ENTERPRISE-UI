import { BreadcrumbsItem } from '@enterprise-ui/react';

export const title = 'Composed breadcrumb items';
export const description = 'Use BreadcrumbsItem within an ordered list when composing a custom trail.';

export default function BreadcrumbItemsExample() {
  return <nav aria-label="Workspace path"><ol style={{ display: 'flex', alignItems: 'center', gap: 4, listStyle: 'none', padding: 0 }}>
    <BreadcrumbsItem href="#home" separator>Home</BreadcrumbsItem>
    <BreadcrumbsItem href="#orders" target="_blank" aria-label="Orders, opens in a new tab" separator>Orders ↗</BreadcrumbsItem>
    <BreadcrumbsItem current>Order 42</BreadcrumbsItem>
  </ol></nav>;
}
