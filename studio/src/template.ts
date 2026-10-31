/** Starting page for a new Studio project. */
export const STARTER = `import { Button, Card, Stack, Text, Title } from '@enterprise-ui/react';

export default function App() {
  return (
    <Stack gap={4}>
      <Title level={1}>My application</Title>
      <Card>
        <Stack gap={3}>
          <Text>Drag components from the palette onto the canvas, or edit this code.</Text>
          <Button variant="primary">Get started</Button>
        </Stack>
      </Card>
    </Stack>
  );
}
`;
