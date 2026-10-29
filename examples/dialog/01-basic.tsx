import { useState } from 'react';
import { Button, Dialog, FormGroup, Input, Select } from '@enterprise-ui/react';
import { countries } from '../data';

export const title = 'Form dialog';
export const description = 'Focus moves into the dialog, Tab is trapped, Escape closes it, and focus returns to the button that opened it.';

export default function DialogBasic() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>Create supplier</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Create supplier"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Create</Button>
          </>
        }
      >
        <FormGroup columns={2}>
          <Input label="Name" required />
          <Input label="Tax ID" />
          <Select label="Country" options={countries} />
          <Input label="City" />
        </FormGroup>
      </Dialog>
    </>
  );
}
