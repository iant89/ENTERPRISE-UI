import { useState } from 'react';
import { DraftIndicator, Stack, Switch, TextArea, useAutosave } from '@enterprise-ui/react';

export const title = 'Autosaved draft';
export const description = '`useAutosave` saves 1.5 seconds after typing stops, never runs two saves at once and reports the state for DraftIndicator. Turn on “Simulate offline” to see the error and Retry.';

export default function DraftIndicatorAutosave() {
  const [text, setText] = useState('');
  const [offline, setOffline] = useState(false);
  const draft = useAutosave(text, { save: () => new Promise((resolve, reject) => setTimeout(offline ? () => reject(new Error('offline')) : resolve, 600)) });
  return (
    <Stack gap={3} style={{ maxWidth: 480 }}>
      <TextArea label="Inspection notes" value={text} onChange={(e) => setText(e.target.value)} rows={4} />
      <Switch label="Simulate offline" checked={offline} onChange={setOffline} />
      <DraftIndicator status={draft.status} lastSaved={draft.lastSaved} onRetry={() => void draft.flush()} />
    </Stack>
  );
}
