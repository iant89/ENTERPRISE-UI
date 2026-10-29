import { Button, MessageStrip, Stack } from '@enterprise-ui/react';

export const title = 'Message strips';
export const description = 'Inline, page-level messages. Use `announce` when a message appears dynamically.';

export default function MessageStripBasic() {
  return (
    <Stack gap={2}>
      <MessageStrip tone="information" title="Planned maintenance">The system is unavailable on Saturday 02:00–04:00 UTC.</MessageStrip>
      <MessageStrip tone="success" dismissible>Purchase order 4500012 was released.</MessageStrip>
      <MessageStrip tone="warning" actions={<Button size="sm" variant="tertiary">Review</Button>}>3 items are below the safety stock.</MessageStrip>
      <MessageStrip tone="error" title="Posting failed:">Period 10/2026 is closed for company code 1000.</MessageStrip>
      <MessageStrip tone="neutral">Prices exclude VAT.</MessageStrip>
    </Stack>
  );
}
