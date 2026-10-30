import { useState } from 'react';
import { Button, FlexibleColumnLayout, Stack, type FlexibleColumnLayoutMode } from '@enterprise-ui/react';

export const title = 'Flexible column layout';
export const description = 'Open a detail column from the list, then a further-detail column.';
export const frame = true;

export default function FlexibleColumnLayoutBasic() {
  const [layout, setLayout] = useState<FlexibleColumnLayoutMode>('OneColumn');
  return (
    <FlexibleColumnLayout
      layout={layout}
      style={{ height: 320 }}
      startColumn={<Stack gap={1} style={{ padding: 16 }}><Button onClick={() => setLayout('TwoColumnsMidExpanded')}>Open order 4500012</Button></Stack>}
      midColumn={<Stack gap={1} style={{ padding: 16 }}><p>Order details</p><Button onClick={() => setLayout('ThreeColumnsEndExpanded')}>Open line item 10</Button><Button onClick={() => setLayout('OneColumn')}>Close</Button></Stack>}
      endColumn={<Stack gap={1} style={{ padding: 16 }}><p>Line item 10</p><Button onClick={() => setLayout('TwoColumnsMidExpanded')}>Close</Button></Stack>}
    />
  );
}
