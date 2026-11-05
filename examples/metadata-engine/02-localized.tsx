import { MetadataProvider, SmartForm } from '@enterprise-ui/react';
import { productRecords, productSchema } from '../metadata';

export const title = 'Locale, messages and display mode';
export const description = '`MetadataProvider` sets the locale for every Smart component below it and replaces built-in strings. Here a German locale formats the price, dates and numbers; `mode="display"` shows the record as read-only text.';

export default function MetadataLocalized() {
  return (
    <MetadataProvider locale="de-DE" messages={{ yes: 'Ja', no: 'Nein', empty: '–' }}>
      <SmartForm schema={productSchema} mode="display" aria-label="Produkt" defaultValues={productRecords[3]} fields={['name', 'category', 'price', 'stock', 'released', 'counted', 'tags']} columns={3} />
    </MetadataProvider>
  );
}
