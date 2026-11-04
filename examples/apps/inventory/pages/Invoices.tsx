import { useState } from 'react';
import { Dashboard, DataGrid, MetricCard, OverflowMenu, Page, StatusIndicator, useToast, type DataGridColumn } from '@enterprise-ui/react';
import { currency } from '../../../data';
import { invoices as initial, invoiceTone, type Invoice } from '../data';
import { useInventory } from '../store';
import { crumbs } from '../crumbs';

export function Invoices() {
  const { navigate } = useInventory();
  const toast = useToast();
  const [invoices, setInvoices] = useState(initial);
  const total = (s: Invoice['status']) => invoices.filter((i) => i.status === s).reduce((sum, i) => sum + i.amount, 0);
  const columns: DataGridColumn<Invoice>[] = [
    { id: 'id', header: 'Invoice', accessor: 'id', sortable: true, rowHeader: true, alwaysVisible: true },
    { id: 'supplier', header: 'Supplier', accessor: 'supplier', sortable: true },
    { id: 'po', header: 'Purchase order', accessor: 'purchaseOrder' },
    { id: 'due', header: 'Due', accessor: 'due', sortable: true },
    { id: 'amount', header: 'Amount', accessor: 'amount', sortable: true, align: 'end', cell: (i) => currency(i.amount) },
    { id: 'status', header: 'Status', accessor: 'status', cell: (i) => <StatusIndicator tone={invoiceTone[i.status]}>{i.status}</StatusIndicator> },
    {
      id: 'actions', header: 'Actions', align: 'end', alwaysVisible: true,
      cell: (i) => (
        <OverflowMenu
          label={`Actions for ${i.id}`}
          items={[{ id: 'pay', label: 'Mark paid', disabled: i.status === 'Paid' }]}
          onAction={() => {
            setInvoices((list) => list.map((x) => (x.id === i.id ? { ...x, status: 'Paid' } : x)));
            toast.show({ title: `${i.id} marked paid`, tone: 'success' });
          }}
        />
      ),
    },
  ];
  return (
    <Page title="Invoices" subtitle="Supplier invoices and payment status." breadcrumbs={crumbs(navigate, ['Home', 'home'], 'Purchasing', 'Invoices')}>
      <Dashboard title="Invoice totals">
        <MetricCard title="Open" value={currency(total('Open'))} tone="information" />
        <MetricCard title="Overdue" value={currency(total('Overdue'))} tone={total('Overdue') ? 'error' : 'success'} />
        <MetricCard title="Paid" value={currency(total('Paid'))} tone="success" />
      </Dashboard>
      <DataGrid title="Invoices" columns={columns} data={invoices} getRowLabel={(i) => i.id} />
    </Page>
  );
}
