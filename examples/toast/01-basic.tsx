import { Button, Stack, useToast } from '@enterprise-ui/react';

export const title = 'Toasts';
export const description = 'Toasts are announced through a live region, pause on hover or focus, and errors persist until dismissed. Wrap your app in `ToastProvider`.';

export default function ToastBasic() {
  const toast = useToast();
  return (
    <Stack direction="horizontal" gap={2} wrap>
      <Button onClick={() => toast.show({ title: 'Changes saved', tone: 'success' })}>Success</Button>
      <Button onClick={() => toast.show({ title: 'Price list updated', description: '24 prices changed.', tone: 'information' })}>Info</Button>
      <Button onClick={() => toast.show({ title: 'Order moved to archive', action: { label: 'Undo', onClick: () => toast.show({ title: 'Restored' }) } })}>With action</Button>
      <Button onClick={() => toast.show({ title: 'Sync failed', description: 'The ERP system is not reachable.', tone: 'error' })}>Error</Button>
    </Stack>
  );
}
