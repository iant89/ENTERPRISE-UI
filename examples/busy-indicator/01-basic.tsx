import { BusyIndicator, Button } from '@enterprise-ui/react';
export const title = 'Non-blocking loading';
export default function Example() { return <BusyIndicator active delay={0} text="Refreshing orders"><Button>Cancel request</Button></BusyIndicator>; }
