import { useState } from 'react';
import { Button, RadioGroup, Switch, UserSettingsDialog } from '@enterprise-ui/react';

export const title = 'User settings dialog';
export const description = 'Categories on the start side, the chosen category on the end side.';

export default function UserSettingsDialogBasic() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open settings</Button>
      <UserSettingsDialog
        open={open}
        onClose={() => setOpen(false)}
        views={[
          { id: 'appearance', label: 'Appearance', content: <RadioGroup label="Theme" defaultValue="light" options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'hc', label: 'High contrast' }]} /> },
          { id: 'notifications', label: 'Notifications', content: <Switch label="Email me about approvals" defaultChecked /> },
          { id: 'about', label: 'About', content: <p>Enterprise UI 0.1.0</p>, fixed: true },
        ]}
      />
    </>
  );
}
