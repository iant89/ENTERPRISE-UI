import { useState } from 'react';
import { Button, KeyboardShortcutsDialog } from '@enterprise-ui/react';

export const title = 'Shortcut help';
export const description = 'Press ? anywhere outside a text field, or use the button. Single-key shortcuts never fire while typing (WCAG 2.1.4).';

export default function KeyboardShortcutsBasic() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Keyboard shortcuts</Button>
      <KeyboardShortcutsDialog
        open={open}
        onOpenChange={setOpen}
        groups={[
          { title: 'General', shortcuts: [{ keys: ['Mod+K'], description: 'Open command palette' }, { keys: ['?'], description: 'Show keyboard shortcuts' }, { keys: ['Mod+S'], description: 'Save' }] },
          { title: 'Lists', shortcuts: [{ keys: ['J', 'ArrowDown'], description: 'Next item' }, { keys: ['K', 'ArrowUp'], description: 'Previous item' }, { keys: ['Enter'], description: 'Open item' }] },
          { title: 'Editing', shortcuts: [{ keys: ['Mod+Enter'], description: 'Post comment' }, { keys: ['Escape'], description: 'Cancel' }] },
        ]}
      />
    </>
  );
}
