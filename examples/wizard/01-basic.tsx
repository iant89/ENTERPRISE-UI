import { useState } from 'react';
import { Checkbox, ComboBox, FormGroup, Input, MessageStrip, NumberInput, Wizard } from '@enterprise-ui/react';
import { countries } from '../data';

export const title = 'Create supplier wizard';
export const description = 'Each step can validate before continuing; focus moves to the new step heading so screen-reader users hear where they are.';

export default function WizardBasic() {
  const [name, setName] = useState('');
  const [done, setDone] = useState(false);
  if (done) return <MessageStrip tone="success" title="Supplier created.">{name} is ready for purchasing.</MessageStrip>;
  return (
    <Wizard
      aria-label="Create supplier"
      onFinish={() => setDone(true)}
      onCancel={() => setName('')}
      finishLabel="Create supplier"
      steps={[
        {
          id: 'basics', title: 'Basic data', description: 'Who is the supplier?',
          content: (
            <FormGroup columns={2}>
              <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
              <ComboBox label="Country" options={countries} />
            </FormGroup>
          ),
          validate: () => (name.trim() ? true : 'Enter the supplier name to continue.'),
        },
        { id: 'terms', title: 'Terms', content: <FormGroup columns={2}><NumberInput label="Payment terms" defaultValue={30} unit="days" /><Input label="Incoterms" defaultValue="FOB" /></FormGroup> },
        { id: 'compliance', title: 'Compliance', optional: true, content: <Checkbox label="Supplier code of conduct signed" /> },
        { id: 'review', title: 'Review', content: <p style={{ margin: 0 }}>Create <strong>{name || 'the supplier'}</strong> with the entered data?</p> },
      ]}
    />
  );
}
