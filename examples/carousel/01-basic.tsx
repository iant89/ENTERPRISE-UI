import { Carousel } from '@enterprise-ui/react';
export const title = 'Manual carousel';
export default function Example() { return <Carousel aria-label="Highlights" items={[{ id: 'one', content: <p>First highlight</p> }, { id: 'two', content: <p>Second highlight</p> }]} />; }
