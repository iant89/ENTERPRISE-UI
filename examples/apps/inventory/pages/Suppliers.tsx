import { useState } from 'react';
import { Button, DataGrid, DescriptionList, Dialog, Page, type DataGridColumn } from '@enterprise-ui/react';
import { suppliers, type Supplier } from '../data';
import { useInventory } from '../store';
import { crumbs } from '../crumbs';

export function Suppliers() {
  const { navigate, products, showProducts } = useInventory();
  const [open, setOpen] = useState<Supplier | null>(null);
  const columns: DataGridColumn<Supplier>[] = [
    { id: 'name', header: 'Supplier', accessor: 'name', sortable: true, rowHeader: true, alwaysVisible: true },
    { id: 'contact', header: 'Contact', accessor: 'contact' },
    { id: 'country', header: 'Country', accessor: 'country', sortable: true },
    { id: 'lead', header: 'Lead time', accessor: 'leadTimeDays', sortable: true, align: 'end', cell: (s) => `${s.leadTimeDays} days` },
    { id: 'rating', header: 'Rating', accessor: 'rating', sortable: true, align: 'end', cell: (s) => `${s.rating} / 5` },
  ];
  const count = open ? products.filter((p) => p.supplier === open.name).length : 0;
  return (
    <Page title="Suppliers" subtitle="Vendors that supply the catalog. Choose one for contact details." breadcrumbs={crumbs(navigate, ['Home', 'home'], 'Purchasing', 'Suppliers')}>
      <DataGrid title="Suppliers" columns={columns} data={suppliers} getRowLabel={(s) => s.name} onRowClick={setOpen} />
      <Dialog
        open={open != null}
        onClose={() => setOpen(null)}
        title={open?.name ?? ''}
        footer={
          <>
            <Button onClick={() => setOpen(null)}>Close</Button>
            <Button variant="primary" onClick={() => open && showProducts({ supplier: open.name })}>View {count} products</Button>
          </>
        }
      >
        {open && (
          <DescriptionList
            columns={1}
            items={[
              { term: 'Contact', description: open.contact },
              { term: 'Email', description: <a href={`mailto:${open.email}`}>{open.email}</a> },
              { term: 'Phone', description: open.phone },
              { term: 'Country', description: open.country },
              { term: 'Lead time', description: `${open.leadTimeDays} days` },
              { term: 'Rating', description: `${open.rating} / 5` },
            ]}
          />
        )}
      </Dialog>
    </Page>
  );
}
