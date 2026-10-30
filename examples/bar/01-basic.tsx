import { Bar, Button, Stack } from '@enterprise-ui/react';

export const title = 'Page bars';
export const description = 'Place page content at the start, center and end without implying toolbar keyboard behavior.';
export default function BarExample() {
  return <Stack gap={4}>
    <Bar startContent={<Button>Back</Button>} endContent={<Button variant="primary">Save</Button>}><strong>Order details</strong></Bar>
    <Bar design="footer" endContent={<Button>Close</Button>}>Changes saved</Bar>
  </Stack>;
}
