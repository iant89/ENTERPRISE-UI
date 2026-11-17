import { useState } from 'react';
import { Button, Card, ErrorBoundary } from '@enterprise-ui/react';

export const title = 'A failing panel';
export const description = 'The panel throws while rendering; the boundary shows a fallback in its place while the rest of the page keeps working. Try again renders it once more.';

function Report({ broken }: { broken: boolean }) {
  if (broken) throw new Error('The report data could not be read.');
  return <p style={{ margin: 0 }}>Revenue this quarter: 1.2 M</p>;
}

export default function ErrorBoundaryExample() {
  const [broken, setBroken] = useState(true);
  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: '32rem' }}>
      <Button onClick={() => setBroken((b) => !b)}>{broken ? 'Fix the data' : 'Break the data'}</Button>
      <Card>
        <ErrorBoundary resetKey={broken} headingLevel={3} onError={(error) => console.info('Reported:', error.message)}>
          <Report broken={broken} />
        </ErrorBoundary>
      </Card>
    </div>
  );
}
