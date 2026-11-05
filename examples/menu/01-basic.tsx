import { useState } from 'react';
import { Card, Menu, Icon } from '@enterprise-ui/react';

export const title = 'Standalone menu';
export const description = 'Menu is the list used by DropdownMenu and SplitButton. It supports icons, descriptions, shortcuts, checkable items, group labels and separators.';

export default function MenuBasic() {
  const [wrap, setWrap] = useState(true);
  const [last, setLast] = useState('—');
  return (
    <Card style={{ maxWidth: 300 }} aria-label="Menu example">
      <Menu
        aria-label="Document actions"
        onAction={setLast}
        items={[
          { type: 'label', label: 'Edit' },
          { id: 'edit', label: 'Edit', icon: <Icon name="edit" />, shortcut: 'E' },
          { id: 'duplicate', label: 'Duplicate', icon: <Icon name="copy" />, shortcut: 'Ctrl+D' },
          { id: 'share', label: 'Share…', icon: <Icon name="share-2" />, description: 'Send a link to colleagues' },
          { type: 'separator' },
          { type: 'label', label: 'View' },
          { id: 'wrap', label: 'Wrap text', checked: wrap, onSelect: () => setWrap(!wrap) },
          { type: 'separator' },
          { id: 'delete', label: 'Delete', icon: <Icon name="delete" />, destructive: true },
        ]}
      />
      <p style={{ margin: '8px 16px 0', color: 'var(--eui-color-text-secondary)' }}>Last action: {last}</p>
    </Card>
  );
}
