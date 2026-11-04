import { SplitButton, useToast, SaveIcon } from '@enterprise-ui/react';

export const title = 'Default action with alternatives';
export const description = 'The main button runs the most common action; the arrow opens related alternatives.';

export default function SplitButtonBasic() {
  const toast = useToast();
  return (
    <SplitButton
      variant="primary"
      icon={<SaveIcon />}
      onClick={() => toast.show({ title: 'Order saved', tone: 'success' })}
      onAction={(id) => toast.show({ title: `Action: ${id}` })}
      items={[
        { id: 'draft', label: 'Save as draft' },
        { id: 'template', label: 'Save as template' },
        { type: 'separator' },
        { id: 'submit', label: 'Save and submit', description: 'Sends the order for approval' },
      ]}
    >
      Save
    </SplitButton>
  );
}
