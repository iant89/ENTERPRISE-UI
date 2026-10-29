import { Button, ButtonGroup, Stack } from '@enterprise-ui/react';

export const title = 'Grouped and segmented';
export const description = '`attached` joins buttons into a segmented control; `fullWidth` stretches them on narrow screens.';

export default function ButtonGroupBasic() {
  return (
    <Stack gap={4}>
      <ButtonGroup aria-label="Document actions">
        <Button variant="primary">Approve</Button>
        <Button>Reject</Button>
        <Button variant="tertiary">Forward</Button>
      </ButtonGroup>
      <ButtonGroup attached aria-label="Period">
        <Button>Day</Button>
        <Button>Week</Button>
        <Button>Month</Button>
        <Button>Quarter</Button>
      </ButtonGroup>
    </Stack>
  );
}
