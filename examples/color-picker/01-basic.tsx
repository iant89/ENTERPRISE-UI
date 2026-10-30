import { useState } from 'react';
import { ColorPicker, Stack } from '@enterprise-ui/react';
export const title = 'Browser color picker';
export default function Example() { const [color, setColor] = useState('#0a6ed1'); return <Stack gap={2}><label htmlFor="color-example">Brand color</label><ColorPicker id="color-example" value={color} onChange={setColor} /><span>{color}</span></Stack>; }
