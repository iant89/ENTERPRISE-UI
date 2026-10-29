import { ActivityFeed, Input, ObjectEditor, ObjectPage, type ObjectFieldErrors } from '@enterprise-ui/react';
const initial = { name: 'Industrial valve', sku: 'V-1042' };
export default function ObjectEditorExample() {
  return <ObjectEditor initialValue={initial} initialVersion="v1" isEqual={(a, b) => a.name === b.name && a.sku === b.sku}
    validate={(value): ObjectFieldErrors => value.name.trim() ? {} : { name: 'Name is required.' }}
    onSave={async (value) => ({ value, version: 'v2' })}>
    {({ mode, value, onChange, errors }) => <ObjectPage title="Product" sections={[{ id: 'details', title: 'Details', content: <>
      <Input label="Name" value={value.name} readOnly={mode === 'view'} error={errors.name} onChange={(event) => onChange({ ...value, name: event.target.value })} />
      <Input label="SKU" value={value.sku} readOnly />
    </> }, { id: 'activity', title: 'Recent activity', content: <ActivityFeed events={[{ id: 'a1', actor: 'Morgan Lee', type: 'status', timestamp: '2026-10-29T14:00:00Z', description: 'Product reviewed.' }]} /> }]} />}
  </ObjectEditor>;
}
