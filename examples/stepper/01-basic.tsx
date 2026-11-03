import { useState } from 'react';
import { Stepper } from '@enterprise-ui/react';

export const title = 'Order status and onboarding';
export const description = 'Status is stated in text for each step. With `onStepClick`, completed steps become buttons, for example to go back and edit.';

export default function StepperBasic() {
  const [current, setCurrent] = useState(2);
  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <Stepper
        current={3}
        steps={[
          { id: 'ordered', label: 'Ordered', description: '2 Nov' },
          { id: 'confirmed', label: 'Confirmed', description: '3 Nov' },
          { id: 'shipped', label: 'Shipped', description: 'Customs hold', status: 'error' },
          { id: 'delivered', label: 'Delivered' },
          { id: 'invoiced', label: 'Invoiced' },
        ]}
      />
      <Stepper
        orientation="vertical"
        current={current}
        onStepClick={(i) => setCurrent(i)}
        steps={[
          { id: 'company', label: 'Company details', description: 'Contoso AG' },
          { id: 'bank', label: 'Bank account', description: 'DE89 •••• 3000' },
          { id: 'certs', label: 'Certificates', description: 'Upload ISO 9001' },
          { id: 'review', label: 'Review and submit' },
        ]}
      />
    </div>
  );
}
