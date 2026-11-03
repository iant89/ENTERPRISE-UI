import { useRef, useState } from 'react';
import { Button, Coachmark, SearchField, Tour, type TourCloseReason } from '@enterprise-ui/react';

export const title = 'Onboarding tour and coachmark';
export const description = 'Start the tour to step through the toolbar; Escape, Skip or the close button ends it and focus returns to the start button. The coachmark points at a new feature once. Persist completion in `onClose` so users are not shown either again.';

export default function Onboarding() {
  const [tour, setTour] = useState(false);
  const [tip, setTip] = useState(true);
  const [last, setLast] = useState<string | null>(null);
  const newButton = useRef<HTMLButtonElement>(null);
  const filterButton = useRef<HTMLButtonElement>(null);
  const exportButton = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div role="toolbar" aria-label="Orders" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <Button ref={newButton} variant="primary">New order</Button>
        <div ref={search} style={{ flex: '1 1 12rem' }}><SearchField aria-label="Search orders" placeholder="Search orders" /></div>
        <Button ref={filterButton}>Filters</Button>
        <Button ref={exportButton}>Export</Button>
      </div>
      <div>
        <Button variant="tertiary" onClick={() => { setTip(false); setTour(true); }}>Take the tour</Button>
        {last && <span style={{ marginInlineStart: 8, color: 'var(--eui-color-text-secondary)' }}>Last tour ended: {last}</span>}
      </div>
      <Tour
        open={tour}
        onClose={(reason: TourCloseReason, step) => { setTour(false); setLast(`${reason} on step ${step + 1}`); }}
        steps={[
          { id: 'welcome', title: 'Welcome to Orders', content: <p>Three things to help you get started. It takes under a minute.</p> },
          { id: 'new', target: newButton, title: 'Create orders', content: <p>Start a purchase order here. Drafts are saved as you type.</p> },
          { id: 'search', target: search, title: 'Find anything', content: <p>Search by order number, supplier or material.</p> },
          { id: 'filters', target: filterButton, title: 'Narrow the list', content: <p>Filter by status, date or plant, then save the result as a view.</p>, placement: 'bottom-end' },
        ]}
      />
      <Coachmark target={exportButton} open={tip && !tour} onClose={() => setTip(false)} title="New: export to Excel" placement="bottom-end">
        <p>Download the filtered list with all visible columns.</p>
      </Coachmark>
    </div>
  );
}
