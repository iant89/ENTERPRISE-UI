import { Form, Input, Button } from '@enterprise-ui/react';
export const title = 'Native form';
export default function Example() { return <Form onSubmit={(event) => event.preventDefault()}><Input label="Name" required /><Button type="submit">Save</Button></Form>; }
