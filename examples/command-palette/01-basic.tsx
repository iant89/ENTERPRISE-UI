import { useState } from 'react';
import { Button, CommandPalette, type PaletteCommand } from '@enterprise-ui/react';

const commands: PaletteCommand[] = [
  { id: 'orders', label: 'Purchase orders', group: 'Navigation', keywords: ['procurement'], shortcut: 'G O' },
  { id: 'suppliers', label: 'Suppliers', group: 'Navigation' },
  { id: 'new', label: 'Create order', group: 'Actions', description: 'Start a new purchase order' },
];
export default function CommandPaletteExample() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('None');
  const [recent, setRecent] = useState<string[]>(['orders']);
  return <>
    <Button onClick={() => setOpen(true)}>Open command palette</Button>
    <p>Last selection: {selected}</p>
    <CommandPalette open={open} onOpenChange={setOpen} commands={commands} recentIds={recent} onSelect={(command) => { setSelected(command.label); setRecent((ids) => [command.id, ...ids.filter((id) => id !== command.id)]); }} />
  </>;
}
