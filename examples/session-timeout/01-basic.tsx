import { useState } from 'react';
import { SessionTimeoutDialog, Switch } from '@enterprise-ui/react';

export const title = 'Session timeout warning';
export const description = 'Turn the demo on and stop using the page for 5 seconds. The warning counts down 30 seconds, announces the time left at intervals, and lets you stay signed in (WCAG 2.2.1).';

export default function SessionTimeoutBasic() {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState('Signed in');
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <Switch label="Enable demo timer (5 s idle)" checked={enabled} onChange={setEnabled} />
      <p style={{ margin: 0 }}>{status}</p>
      <SessionTimeoutDialog
        enabled={enabled}
        idleTimeout={5000}
        countdown={30}
        onStay={() => setStatus(`Session extended at ${new Date().toLocaleTimeString()}`)}
        onSignOut={(reason) => {
          setEnabled(false);
          setStatus(reason === 'timeout' ? 'Signed out after inactivity' : 'Signed out');
        }}
      />
    </div>
  );
}
