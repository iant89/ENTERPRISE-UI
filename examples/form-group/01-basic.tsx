import { Button, ComboBox, DatePicker, FormGroup, Input, NumberInput, Select, Stack, TextArea } from '@enterprise-ui/react';
import { countries, supplierOptions } from '../data';

export const title = 'Purchase requisition form';
export const description = 'FormGroup arranges fields in up to four responsive columns. Wrap a field in `FormGroup.spanClassName` to span the row.';

export default function FormGroupBasic() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Stack gap={6}>
        <FormGroup title="General" columns={2}>
          <Input label="Title" required defaultValue="Laptops for new hires" />
          <ComboBox label="Supplier" options={supplierOptions} defaultValue="Contoso Ltd" />
          <NumberInput label="Quantity" defaultValue={12} min={1} unit="pcs" />
          <DatePicker label="Needed by" defaultValue={new Date(2026, 11, 1)} />
        </FormGroup>
        <FormGroup title="Delivery" columns={2}>
          <Select label="Country" options={countries} defaultValue="de" />
          <Input label="City" defaultValue="Berlin" />
          <div className={FormGroup.spanClassName}>
            <TextArea label="Notes" rows={2} />
          </div>
        </FormGroup>
        <Stack direction="horizontal" gap={2} justify="flex-end">
          <Button variant="tertiary">Cancel</Button>
          <Button type="submit" variant="primary">Submit</Button>
        </Stack>
      </Stack>
    </form>
  );
}
