import { Button, ColorPalettePopover } from '@enterprise-ui/react';
export const title = 'Palette popover';
export default function Example() { return <ColorPalettePopover aria-label="Choose a color" trigger={<Button>Choose color</Button>} colors={[{ color: '#0a6ed1', label: 'Blue' }, { color: '#107e3e', label: 'Green' }]} />; }
