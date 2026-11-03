import { PasswordInput, Stack } from '@enterprise-ui/react';

export const title = 'Sign-in and new passwords';
export const description = 'The eye button shows the password. New passwords get a strength meter and a live checklist; the meter is a hint, so enforce the real policy on the server.';

export default function PasswordInputBasic() {
  return (
    <Stack gap={4} style={{ maxWidth: 360 }}>
      <PasswordInput label="Password" />
      <PasswordInput
        label="New password"
        purpose="new"
        requirements={[
          { label: 'At least 12 characters', test: (p) => p.length >= 12 },
          { label: 'An uppercase and a lowercase letter', test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
          { label: 'A number or symbol', test: (p) => /[\d\W]/.test(p) },
        ]}
      />
    </Stack>
  );
}
