import { Download, Plus } from 'lucide-react';
import { Button, DataGrid, ObjectIdentifier, StatusIndicator, type DataGridColumn } from '@enterprise-ui/react';
import { categoryOptions, currency, products, statusTone, type Product } from '../data';

export const title = 'Product inventory';
export const description = 'Quick search, column filters, sorting, selection with bulk actions, pagination, column visibility and density — all built from library primitives.';

const columns: DataGridColumn<Product>[] = [
  { id: 'name', header: 'Product', accessor: 'name', sortable: true, rowHeader: true, alwaysVisible: true, cell: (p) => <ObjectIdentifier title={p.name} text={p.sku} /> },
  { id: 'category', header: 'Category', accessor: 'category', sortable: true, filterOptions: categoryOptions },
  { id: 'supplier', header: 'Supplier', accessor: 'supplier', sortable: true },
  {
    id: 'status', header: 'Status', accessor: 'status',
    filterOptions: Object.keys(statusTone).map((s) => ({ value: s, label: s })),
    cell: (p) => <StatusIndicator tone={statusTone[p.status]}>{p.status}</StatusIndicator>,
  },
  { id: 'stock', header: 'Stock', accessor: 'stock', sortable: true, align: 'end' },
  { id: 'price', header: 'Price', accessor: 'price', sortable: true, align: 'end', cell: (p) => currency(p.price) },
  { id: 'updated', header: 'Last updated', accessor: 'updated', sortable: true, defaultHidden: true },
];

export default function DataGridBasic() {
  return (
    <DataGrid
      title="Products"
      columns={columns}
      data={products}
      selectionMode="multiple"
      getRowLabel={(p) => p.name}
      getRowHighlight={(p) => (p.status === 'Out of stock' ? 'error' : p.status === 'Low stock' ? 'warning' : undefined)}
      pageSize={8}
      pageSizeOptions={[8, 16, 24]}
      toolbarActions={
        <>
          <Button size="sm" icon={<Download />} variant="tertiary">Export</Button>
          <Button size="sm" icon={<Plus />} variant="primary">Create</Button>
        </>
      }
      selectionActions={(ids) => (
        <Button size="sm" variant="secondary" onClick={() => alert(`Reorder ${ids.length} products`)}>
          Reorder
        </Button>
      )}
    />
  );
}
