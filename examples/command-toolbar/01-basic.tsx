import { CommandToolbar, ResizablePanel, SearchField, Icon } from '@enterprise-ui/react';

export const title = 'Overflowing toolbar';
export const description = 'Drag the panel edge: actions that no longer fit move into the “More actions” menu, lowest priority first. Arrow keys move between buttons.';

export default function CommandToolbarBasic() {
  return (
    <ResizablePanel defaultSize={720} minSize={280} maxSize={1000} handleLabel="Resize toolbar container" style={{ border: '1px solid var(--eui-color-border)', borderRadius: 8 }}>
      <CommandToolbar
        bordered
        title="Products (24)"
        start={<div style={{ width: 180 }}><SearchField aria-label="Search products" size="sm" /></div>}
        actions={[
          { id: 'create', label: 'Create', icon: <Icon name="add" />, variant: 'primary', priority: 'always' },
          { id: 'edit', label: 'Edit', icon: <Icon name="edit" /> },
          { id: 'copy', label: 'Copy', icon: <Icon name="copy" />, priority: 'low' },
          { id: 'delete', label: 'Delete', icon: <Icon name="delete" />, variant: 'destructive' },
          { id: 'import', label: 'Import', icon: <Icon name="upload" />, priority: 'low' },
          { id: 'export', label: 'Export', icon: <Icon name="download" />, priority: 'low' },
          { id: 'print', label: 'Print', icon: <Icon name="print" />, iconOnly: true, priority: 'low' },
          { id: 'filter', label: 'Filter', icon: <Icon name="filter" />, iconOnly: true },
        ]}
      />
    </ResizablePanel>
  );
}
