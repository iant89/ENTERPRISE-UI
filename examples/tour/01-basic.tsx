import { useState } from 'react';
import { Button, Input, MessageStrip, Tour, type TourStep } from '@enterprise-ui/react';

export const title = 'Guided tour';
export const description = 'Callouts point at parts of the page in turn. The last step has no target, so it is centred. Skip is always available, and Escape skips too.';

const STEPS: TourStep[] = [
  { id: 'search', target: '#tour-example-search', title: 'Search', content: 'Find any order by number, customer or product.' },
  { id: 'create', target: '#tour-example-create', title: 'Create an order', content: 'Starts a new order. Drafts are saved as you type.', placement: 'left' },
  { id: 'done', title: 'You are ready', content: 'Replay this tour at any time from the help menu.' },
];

export default function TourBasic() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap' }}>
        <Input id="tour-example-search" aria-label="Search orders" placeholder="Search orders" />
        <Button id="tour-example-create" variant="primary">Create order</Button>
      </div>
      <div>
        <Button onClick={() => { setResult(null); setOpen(true); }}>Start the tour</Button>
      </div>
      {result && <MessageStrip tone="information">{result}</MessageStrip>}
      <Tour
        steps={STEPS}
        open={open}
        onFinish={() => { setOpen(false); setResult('Tour finished.'); }}
        onSkip={(step) => { setOpen(false); setResult(`Tour skipped at step ${step + 1}.`); }}
      />
    </div>
  );
}
