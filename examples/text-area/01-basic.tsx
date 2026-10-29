import { Stack, TextArea } from '@enterprise-ui/react';

export const title = 'Text area';
export const description = 'Use `showCount` with `maxLength` for limited fields and `autoResize` to grow with content.';

export default function TextAreaBasic() {
  return (
    <Stack gap={4} style={{ maxWidth: 480 }}>
      <TextArea label="Delivery instructions" maxLength={200} showCount placeholder="Gate, floor, contact person…" />
      <TextArea label="Internal note" autoResize rows={2} description="Grows as you type." />
      <TextArea label="Rejection reason" error="Please explain why the request was rejected." />
    </Stack>
  );
}
