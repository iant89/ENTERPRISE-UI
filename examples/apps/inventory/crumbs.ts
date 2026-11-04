import type { BreadcrumbItem } from '@enterprise-ui/react';
import type { PageId } from './data';

/** Breadcrumbs that link back through the app: each `[label, page]` pair becomes a link, the last item is the current page. */
export function crumbs(navigate: (page: PageId) => void, ...trail: ([string, PageId] | string)[]): BreadcrumbItem[] {
  return trail.map((entry) =>
    typeof entry === 'string'
      ? { label: entry }
      : {
          label: entry[0],
          href: `#/demo/${entry[1]}`,
          onClick: (event) => {
            event.preventDefault();
            navigate(entry[1]);
          },
        },
  );
}
