import { Copy, Download, Filter, Pencil, Plus, Printer, Trash2, Upload } from 'lucide-react';
import { CommandToolbar, ResizablePanel, SearchField } from '@enterprise-ui/react';

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
          { id: 'create', label: 'Create', icon: <Plus />, variant: 'primary', priority: 'always' },
          { id: 'edit', label: 'Edit', icon: <Pencil /> },
          { id: 'copy', label: 'Copy', icon: <Copy />, priority: 'low' },
          { id: 'delete', label: 'Delete', icon: <Trash2 />, variant: 'destructive' },
          { id: 'import', label: 'Import', icon: <Upload />, priority: 'low' },
          { id: 'export', label: 'Export', icon: <Download />, priority: 'low' },
          { id: 'print', label: 'Print', icon: <Printer />, iconOnly: true, priority: 'low' },
          { id: 'filter', label: 'Filter', icon: <Filter />, iconOnly: true },
        ]}
      />
    </ResizablePanel>
  );
}
