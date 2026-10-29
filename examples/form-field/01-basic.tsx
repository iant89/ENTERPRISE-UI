import { FormField, Input, Stack, useFormFieldContext } from '@enterprise-ui/react';

export const title = 'Wrapping controls in a FormField';
export const description = 'FormField lays out the label, description and validation message, and passes ids to nested controls through context — including your own controls via `useFormFieldContext()`.';

/** A custom control that connects itself to the surrounding FormField. */
function ColorInput() {
  const field = useFormFieldContext();
  return (
    <input
      type="color"
      id={field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.status === 'error' || undefined}
      defaultValue="#0a6ed1"
      style={{ width: 64, height: 36, padding: 2, border: '1px solid var(--eui-color-border-strong)', borderRadius: 4 }}
    />
  );
}

export default function FormFieldBasic() {
  return (
    <Stack gap={4} style={{ maxWidth: 360 }}>
      <FormField label="Cost center" description="Format: CC-0000" required error="Enter a cost center.">
        <Input />
      </FormField>
      <FormField label="Brand color" description="Used in printed documents.">
        <ColorInput />
      </FormField>
    </Stack>
  );
}
