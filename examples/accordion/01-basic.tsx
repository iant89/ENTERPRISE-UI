import { Accordion, DescriptionList } from '@enterprise-ui/react';

export const title = 'Supplier details';
export const description = 'Headers are buttons inside headings; ↑ and ↓ move between them. Use `type="multiple"` to let several sections stay open.';

export default function AccordionBasic() {
  return (
    <Accordion
      defaultValue={['general']}
      items={[
        { id: 'general', title: 'General data', content: <DescriptionList items={[{ term: 'Supplier', description: '100045' }, { term: 'Name', description: 'Northwind Components GmbH' }]} /> },
        { id: 'payment', title: 'Payment terms', subtitle: 'Net 30', content: <p style={{ margin: 0 }}>Payment due within 30 days, 2% discount within 10 days.</p> },
        { id: 'bank', title: 'Bank details', subtitle: '1 account', content: <p style={{ margin: 0 }}>IBAN DE89 3704 0044 0532 0130 00</p> },
        { id: 'audit', title: 'Audit', content: 'Restricted', disabled: true },
      ]}
    />
  );
}
