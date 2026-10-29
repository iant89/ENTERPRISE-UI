import { Input, Stack } from '@enterprise-ui/react';

export const title = 'Validation states';
export const description = 'Errors set `aria-invalid` and are announced with the field. Warning, success and information states follow the Fiori value-state pattern.';

export default function InputValidation() {
  return (
    <Stack gap={4} style={{ maxWidth: 360 }}>
      <Input label="VAT number" defaultValue="DE12345" error="VAT number must have 11 characters." />
      <Input label="Discount" defaultValue="35%" status="warning" statusMessage="Discount exceeds the usual 20% limit." />
      <Input label="IBAN" defaultValue="DE89 3704 0044 0532 0130 00" status="success" statusMessage="IBAN verified." />
      <Input label="Cost center" defaultValue="CC-1000" status="information" statusMessage="Inherited from the requester." />
    </Stack>
  );
}
