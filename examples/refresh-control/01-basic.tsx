import { useState } from 'react';
import { RefreshControl } from '@enterprise-ui/react';

export const title = 'Refresh and auto-refresh';
export const description = 'Return a promise from `onRefresh` to show progress. Automatic refreshes pause while the tab is hidden and are not announced; manual ones are.';

export default function RefreshControlBasic() {
  const [updated, setUpdated] = useState(() => Date.now() - 4 * 60_000);
  const [count, setCount] = useState(0);
  const refresh = () =>
    new Promise<void>((resolve) =>
      setTimeout(() => {
        setUpdated(Date.now());
        setCount((c) => c + 1);
        resolve();
      }, 800),
    );
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <RefreshControl onRefresh={refresh} lastUpdated={updated} />
      <p style={{ margin: 0 }}>Refreshed {count} times in this session.</p>
    </div>
  );
}
