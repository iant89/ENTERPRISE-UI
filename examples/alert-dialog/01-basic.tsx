import { useState } from 'react';
import { AlertDialog, Button, useToast } from '@enterprise-ui/react';

export const title = 'Confirm a destructive action';
export const description = 'Focus starts on Cancel (the least destructive choice). Async confirmations show a busy state.';

export default function AlertDialogBasic() {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>Delete order</Button>
      <AlertDialog
        open={open}
        tone="error"
        title="Delete sales order SO-50213?"
        confirmLabel="Delete"
        onCancel={() => setOpen(false)}
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 800));
          setOpen(false);
          toast.show({ title: 'Order deleted', tone: 'success' });
        }}
      >
        The order and its 4 items will be permanently deleted. This cannot be undone.
      </AlertDialog>
    </>
  );
}
