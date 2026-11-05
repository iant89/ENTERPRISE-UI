import { useState } from 'react';
import { DraftIndicator, FooterToolbar, MessagePopover, Stack, TextArea, useAutosave, IconProvider } from '@enterprise-ui/react';

export const title = 'Edit page footer';
export const description = 'Floats at the bottom of the page and never scrolls away. Actions are text-only or icon-only, right-aligned and sorted from most to least used, so Delete moves into the overflow first. It only appears while there are actions, messages or a draft.';

export default function FooterToolbarBasic() {
  const [notes, setNotes] = useState('');
  const [editing, setEditing] = useState(true);
  const draft = useAutosave(notes, { save: () => new Promise((resolve) => setTimeout(resolve, 500)), enabled: editing });
  return (
    <div style={{ blockSize: 320, overflow: 'auto', border: '1px solid var(--eui-color-border-subtle)' }}>
      <Stack gap={3} style={{ padding: 16, minBlockSize: 480 }}>
        <TextArea label="Inspection notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} readOnly={!editing} />
        <p>Scroll this area: the footer stays in view.</p>
      </Stack>
      <FooterToolbar
        messages={editing ? <MessagePopover messages={[{ id: 'm1', type: 'warning', title: 'Inspection date is in the past' }]} /> : undefined}
        draftIndicator={editing ? <DraftIndicator status={draft.status} lastSaved={draft.lastSaved} /> : undefined}
        actions={editing ? [
          { id: 'save', label: 'Save', variant: 'primary', onClick: () => setEditing(false) },
          { id: 'cancel', label: 'Cancel', onClick: () => setEditing(false) },
          { id: 'delete', label: 'Delete', display: 'icon', icon: IconProvider.getIcon('delete'), variant: 'destructive' },
        ] : []}
      />
    </div>
  );
}
