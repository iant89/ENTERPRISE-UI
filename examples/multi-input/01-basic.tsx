import { MultiInput } from '@enterprise-ui/react';

export const title = 'Multi input';
export const description = 'Type values and press Enter or comma to add them.';

export default function MultiInputBasic() {
  return (
    <MultiInput
      label="Notify"
      description="Email addresses"
      defaultValue={['ap@example.com']}
      parseValue={(text) => (/^\S+@\S+$/.test(text.trim()) ? text.trim() : null)}
    />
  );
}
