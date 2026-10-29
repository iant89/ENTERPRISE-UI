import { useState } from 'react';
import { Checkbox, Stack } from '@enterprise-ui/react';

export const title = 'Checkboxes and select-all';
export const description = 'The parent checkbox shows an indeterminate state when only some children are checked.';

const options = ['Email', 'SMS', 'Push notification'];

export default function CheckboxBasic() {
  const [checked, setChecked] = useState<string[]>(['Email']);
  const all = checked.length === options.length;
  return (
    <Stack gap={1}>
      <Checkbox
        label="All channels"
        checked={all}
        indeterminate={!all && checked.length > 0}
        onChange={(on) => setChecked(on ? options : [])}
      />
      <Stack gap={1} style={{ paddingInlineStart: 26 }}>
        {options.map((o) => (
          <Checkbox key={o} label={o} checked={checked.includes(o)} onChange={(on) => setChecked(on ? [...checked, o] : checked.filter((c) => c !== o))} />
        ))}
      </Stack>
      <Checkbox label="I accept the purchasing terms" error="You must accept the terms to continue." />
      <Checkbox label="Archived (disabled)" disabled defaultChecked />
    </Stack>
  );
}
