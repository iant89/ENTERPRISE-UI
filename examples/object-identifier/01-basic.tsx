import { ObjectIdentifier, Stack } from '@enterprise-ui/react';

export const title = 'Object identifiers';
export const description = 'Name plus ID. Use `href` or `onClick` when the title opens the object.';

export default function ObjectIdentifierBasic() {
  return (
    <Stack direction="horizontal" gap={8} wrap>
      <ObjectIdentifier title="ProBook 14" text="SKU-048213" />
      <ObjectIdentifier title="Purchase Order 4500012" text="Acme Corporation" href="#po-4500012" />
      <ObjectIdentifier title="Northwind Traders" text="Supplier 100045" onClick={() => {}} />
    </Stack>
  );
}
