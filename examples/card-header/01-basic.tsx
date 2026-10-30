import { Avatar, Button, Card, CardHeader } from '@enterprise-ui/react';
export const title = 'Card header';
export default function Example() { return <Card header={<CardHeader title="Account" subtitle="Account owner" avatar={<Avatar name="Ada Lovelace" />} additionalText="Active" actions={<Button size="sm">Edit</Button>} />}>Account details</Card>; }
