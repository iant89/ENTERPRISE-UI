import { useState } from 'react';
import { Button, ViewSettingsDialog, type ViewSettings } from '@enterprise-ui/react';

export const title = 'View settings dialog';
export const description = 'Sort, group and filter a table; changes apply on OK.';

export default function ViewSettingsDialogBasic() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<ViewSettings>({ sortBy: 'date', sortDescending: true, groupDescending: false, filters: {} });
  return (
    <>
      <Button onClick={() => setOpen(true)}>View settings</Button>
      <p>Sorted by {settings.sortBy} {settings.sortDescending ? '(descending)' : '(ascending)'}</p>
      <ViewSettingsDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={setSettings}
        settings={settings}
        sortItems={[{ id: 'date', label: 'Date' }, { id: 'amount', label: 'Amount' }, { id: 'supplier', label: 'Supplier' }]}
        groupItems={[{ id: 'status', label: 'Status' }, { id: 'supplier', label: 'Supplier' }]}
        filterItems={[{ id: 'status', label: 'Status', options: [{ id: 'open', label: 'Open' }, { id: 'approved', label: 'Approved' }] }]}
      />
    </>
  );
}
