import { StepInput } from '@enterprise-ui/react';
export const title = 'Step input';
export default function Example() {
  return <StepInput label="Quantity" defaultValue={2} min={0} max={10} />;
}
