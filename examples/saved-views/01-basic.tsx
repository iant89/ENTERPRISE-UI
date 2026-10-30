import { useState } from 'react';
import { SavedViews, type SavedView } from '@enterprise-ui/react';

export const title = 'Saved views';
export const description = 'Select, save, rename and delete application-persisted views.';

const config = { filters: [], sort: [], visibleColumns: ['id', 'status'], pageSize: 25 };

export default function SavedViewsBasic() {
  const [views, setViews] = useState<SavedView[]>([
    { id: 'all', name: 'All orders', scope: 'shared', isDefault: true, configuration: config },
    { id: 'mine', name: 'My open orders', scope: 'personal', configuration: config },
  ]);
  const [selected, setSelected] = useState<string | null>('all');
  return (
    <SavedViews
      views={views}
      selectedId={selected}
      onSelect={setSelected}
      onSave={(name, scope) => setViews((all) => [...all, { id: `view-${all.length + 1}`, name, scope, configuration: config }])}
      onRename={(id, name) => setViews((all) => all.map((v) => (v.id === id ? { ...v, name } : v)))}
      onDelete={(id) => setViews((all) => all.filter((v) => v.id !== id))}
    />
  );
}
