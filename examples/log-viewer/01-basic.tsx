import { useEffect, useState } from 'react';
import { Button, LogViewer } from '@enterprise-ui/react';

export const title = 'Import job log';
export const description = 'Levels are detected from the text; search highlights matches and the level buttons filter. New lines are followed until you scroll up. Large logs only render visible lines.';

const messages = ['INFO Reading file suppliers.csv', 'INFO Row 1–200 validated', 'WARN Row 214: unknown unit "PCS", using PC', 'INFO Row 201–400 validated', 'ERROR Row 431: supplier 999999 not found', 'DEBUG cache hit ratio 0.92', 'INFO Row 401–600 validated'];

export default function LogViewerBasic() {
  const [lines, setLines] = useState<string[]>(() => messages.map((m, i) => `12:00:${String(i).padStart(2, '0')} ${m}`));
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLines((l) => [...l, `12:01:${String(l.length % 60).padStart(2, '0')} ${messages[l.length % messages.length]}`]), 700);
    return () => clearInterval(id);
  }, [running]);
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <Button onClick={() => setRunning((r) => !r)} style={{ justifySelf: 'start' }}>
        {running ? 'Stop job' : 'Run job'}
      </Button>
      <LogViewer label="Supplier import log" lines={lines} height={260} downloadFileName="supplier-import" />
    </div>
  );
}
