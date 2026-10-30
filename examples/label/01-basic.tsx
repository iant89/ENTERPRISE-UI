import { Label, Input, Stack } from '@enterprise-ui/react';
export const title = 'Label';
export default function Example() { return <Stack gap={2}><Label htmlFor="label-example" required>Account</Label><Input id="label-example" required /></Stack>; }
