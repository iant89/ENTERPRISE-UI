import { useState } from 'react';
import { List, Icon } from '@enterprise-ui/react';

export const title = 'Selectable list';
export const description = 'A `listbox`: arrow keys move, Space toggles, Ctrl/⌘ + A selects all, typing jumps to an item.';

export default function ListSelection() {
  const [selected, setSelected] = useState<string[]>(['contract']);
  return (
    <div style={{ maxWidth: 420, border: '1px solid var(--eui-color-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
      <List
        aria-label="Attachments"
        selectionMode="multiple"
        selectedIds={selected}
        onSelectionChange={setSelected}
        items={[
          { id: 'contract', title: 'Framework contract.pdf', description: '2.4 MB', leading: <Icon name="document-text" /> },
          { id: 'prices', title: 'Price list 2026.xlsx', description: '880 KB', leading: <Icon name="table-view" /> },
          { id: 'photo', title: 'Warehouse photo.jpg', description: '3.1 MB', leading: <Icon name="picture" /> },
          { id: 'old', title: 'Expired certificate.pdf', description: 'Archived', leading: <Icon name="document-text" />, disabled: true },
        ]}
      />
    </div>
  );
}
