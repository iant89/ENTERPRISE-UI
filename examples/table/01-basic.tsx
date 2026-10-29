import { ObjectIdentifier, StatusIndicator, Table, type TableColumn } from '@enterprise-ui/react';
import { currency, products, statusTone, type Product } from '../data';

export const title = 'Sortable table';
export const description = 'Click a sortable header (or press Enter on it) to sort ascending, descending, then unsorted. `rowHeader` marks the identifying column for screen readers.';

const columns: TableColumn<Product>[] = [
  { id: 'name', header: 'Product', accessor: 'name', sortable: true, rowHeader: true, cell: (p) => <ObjectIdentifier title={p.name} text={p.sku} /> },
  { id: 'category', header: 'Category', accessor: 'category', sortable: true },
  { id: 'status', header: 'Status', accessor: 'status', cell: (p) => <StatusIndicator tone={statusTone[p.status]}>{p.status}</StatusIndicator> },
  { id: 'stock', header: 'Stock', accessor: 'stock', sortable: true, align: 'end' },
  { id: 'price', header: 'Price', accessor: 'price', sortable: true, align: 'end', cell: (p) => currency(p.price) },
];

export default function TableBasic() {
  return <Table caption="Products" columns={columns} data={products.slice(0, 6)} defaultSort={{ columnId: 'name', direction: 'ascending' }} />;
}
