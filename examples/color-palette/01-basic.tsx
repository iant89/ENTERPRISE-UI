import { ColorPalette } from '@enterprise-ui/react';
export const title = 'Color palette';
export default function Example() { return <ColorPalette aria-label="Choose a color" defaultValue="#0a6ed1" colors={[{ color: '#0a6ed1', label: 'Blue' }, { color: '#107e3e', label: 'Green' }, { color: '#bb0000', label: 'Red' }]} />; }
