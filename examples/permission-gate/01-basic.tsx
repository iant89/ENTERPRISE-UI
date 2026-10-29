import { PermissionGate, Button } from '@enterprise-ui/react';
export default function Example() { return <PermissionGate allowed={false} fallback={<p>Archive is unavailable.</p>}><Button>Archive</Button></PermissionGate>; }
