import { useMemo, useState } from 'react';
import { Download, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  AlertDialog, Button, DataGrid, DescriptionList, FilterBar, FlexibleColumnLayout, IconButton, MultiSelect, ObjectIdentifier, OverflowMenu, Page,
  Select, StatusIndicator, Title, useToast, type DataGridColumn,
} from '@enterprise-ui/react';
import { categoryOptions, currency, statusTone, supplierOptions, type Product, type ProductStatus } from '../../../data';
import { useInventory } from '../store';
import { crumbs } from '../crumbs';
import { downloadFile, toCsv } from '../csv';
import { ProductDialog, type ProductDraft } from './ProductDialog';

const statusOptions = (['In stock', 'Low stock', 'Out of stock', 'Discontinued'] as ProductStatus[]).map((s) => ({ value: s, label: s }));

/** Filters products by the shared filters (header search, category, supplier, status). */
export function filterProducts(products: Product[], f: { query: string; categories: string[]; supplier: string | null; status: ProductStatus | null }) {
  const q = f.query.trim().toLowerCase();
  return products.filter(
    (p) =>
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
      (f.categories.length === 0 || f.categories.includes(p.category)) &&
      (!f.supplier || p.supplier === f.supplier) &&
      (!f.status || p.status === f.status),
  );
}

export const productCsv = (rows: Product[]) =>
  toCsv(rows, [
    { header: 'ID', value: (p) => p.id },
    { header: 'Product', value: (p) => p.name },
    { header: 'SKU', value: (p) => p.sku },
    { header: 'Category', value: (p) => p.category },
    { header: 'Supplier', value: (p) => p.supplier },
    { header: 'Status', value: (p) => p.status },
    { header: 'Stock', value: (p) => p.stock },
    { header: 'Price', value: (p) => p.price },
  ]);

export function Products() {
  const store = useInventory();
  const { products, filters, setFilters, navigate } = store;
  const toast = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);

  const filtered = useMemo(() => filterProducts(products, filters), [products, filters]);
  const detail = products.find((p) => p.id === detailId) ?? null;
  const skus = useMemo(() => products.map((p) => p.sku.toUpperCase()), [products]);
  const byId = (ids: string[]) => products.filter((p) => ids.includes(p.id));

  const exportRows = (rows: Product[], label: string) => {
    downloadFile('northwind-products.csv', productCsv(rows));
    toast.show({ title: `Exported ${rows.length} ${rows.length === 1 ? 'product' : 'products'}`, description: label, tone: 'success' });
  };

  const save = (draft: ProductDraft) => {
    if (dialog.product) {
      store.updateProducts([dialog.product.id], draft);
      toast.show({ title: `Saved ${draft.name}`, tone: 'success' });
    } else {
      const created = store.addProduct(draft);
      setDetailId(created.id);
      toast.show({ title: `Created ${created.name}`, description: created.sku, tone: 'success' });
    }
    setDialog({ open: false, product: null });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const n = pendingDelete.length;
    store.removeProducts(pendingDelete);
    setSelected((s) => s.filter((id) => !pendingDelete.includes(id)));
    if (detailId && pendingDelete.includes(detailId)) setDetailId(null);
    setPendingDelete(null);
    toast.show({ title: `Deleted ${n} ${n === 1 ? 'product' : 'products'}`, tone: 'success' });
  };

  const rowAction = (product: Product, action: string) => {
    if (action === 'edit') setDialog({ open: true, product });
    if (action === 'duplicate') {
      const copy = store.duplicateProduct(product.id);
      if (copy) toast.show({ title: `Duplicated as ${copy.name}`, tone: 'success' });
    }
    if (action === 'discontinue') {
      store.updateProducts([product.id], { status: 'Discontinued' });
      toast.show({ title: `${product.name} discontinued` });
    }
    if (action === 'delete') setPendingDelete([product.id]);
  };

  const columns: DataGridColumn<Product>[] = [
    { id: 'name', header: 'Product', accessor: 'name', sortable: true, rowHeader: true, alwaysVisible: true, cell: (p) => <ObjectIdentifier title={p.name} text={p.sku} /> },
    { id: 'category', header: 'Category', accessor: 'category', sortable: true },
    { id: 'supplier', header: 'Supplier', accessor: 'supplier', sortable: true },
    { id: 'status', header: 'Status', accessor: 'status', cell: (p) => <StatusIndicator tone={statusTone[p.status]}>{p.status}</StatusIndicator> },
    { id: 'stock', header: 'Stock', accessor: 'stock', sortable: true, align: 'end' },
    { id: 'price', header: 'Price', accessor: 'price', sortable: true, align: 'end', cell: (p) => currency(p.price) },
    {
      id: 'actions', header: 'Actions', align: 'end', alwaysVisible: true,
      cell: (p) => (
        // Keep menu clicks from also opening the row's detail panel.
        <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
          <OverflowMenu
            label={`Actions for ${p.name}`}
            items={[
              { id: 'edit', label: 'Edit', icon: <Pencil /> },
              { id: 'duplicate', label: 'Duplicate' },
              { id: 'discontinue', label: 'Mark discontinued', disabled: p.status === 'Discontinued' },
              { type: 'separator' },
              { id: 'delete', label: 'Delete', icon: <Trash2 />, destructive: true },
            ]}
            onAction={(id) => rowAction(p, id)}
          />
        </span>
      ),
    },
  ];

  const grid = (
    <DataGrid
      title="Products"
      columns={columns}
      data={filtered}
      selectionMode="multiple"
      selectedIds={selected}
      onSelectionChange={setSelected}
      getRowLabel={(p) => p.name}
      pageSize={10}
      onRowClick={(p) => setDetailId(p.id)}
      selectionActions={(ids) => (
        <>
          <Select
            aria-label="Change status of selected"
            placeholder="Change status"
            size="sm"
            options={statusOptions}
            value={null}
            onChange={(status) => {
              if (!status) return;
              store.updateProducts(ids, { status });
              toast.show({ title: `Set ${ids.length} ${ids.length === 1 ? 'product' : 'products'} to ${status}`, tone: 'success' });
            }}
          />
          <Button size="sm" icon={<Download />} onClick={() => exportRows(byId(ids), 'Selected rows')}>Export selected</Button>
          <Button size="sm" variant="destructive" icon={<Trash2 />} onClick={() => setPendingDelete(ids)}>Delete</Button>
        </>
      )}
    />
  );

  const detailPanel = detail && (
    <div style={{ padding: 'var(--eui-space-4, 1rem)', display: 'grid', gap: 'var(--eui-space-4, 1rem)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Title level={2} size="md" style={{ flex: 1, margin: 0 }}>{detail.name}</Title>
        <Button size="sm" icon={<Pencil />} onClick={() => setDialog({ open: true, product: detail })}>Edit</Button>
        <IconButton icon={<X />} label="Close details" size="sm" onClick={() => setDetailId(null)} />
      </div>
      <DescriptionList
        columns={1}
        items={[
          { term: 'Product ID', description: detail.id },
          { term: 'SKU', description: detail.sku },
          { term: 'Category', description: detail.category },
          { term: 'Supplier', description: detail.supplier },
          { term: 'Status', description: <StatusIndicator tone={statusTone[detail.status]}>{detail.status}</StatusIndicator> },
          { term: 'Stock', description: `${detail.stock} units` },
          { term: 'Price', description: currency(detail.price) },
          { term: 'Stock value', description: currency(detail.price * detail.stock) },
          { term: 'Last updated', description: detail.updated },
        ]}
      />
    </div>
  );

  const activeCount = filters.categories.length + (filters.supplier ? 1 : 0) + (filters.status ? 1 : 0) + (filters.query ? 1 : 0);

  return (
    <Page
      title="Products"
      subtitle="Manage the product catalog, stock levels and prices."
      breadcrumbs={crumbs(navigate, ['Home', 'home'], ['Catalog', 'categories'], 'Products')}
      actions={
        <>
          <Button icon={<Download />} onClick={() => exportRows(filtered, 'Current filters')}>Export</Button>
          <Button variant="primary" icon={<Plus />} onClick={() => setDialog({ open: true, product: null })}>Create product</Button>
        </>
      }
      toolbar={
        <FilterBar liveMode activeCount={activeCount} onClear={() => setFilters({ query: '', categories: [], supplier: null, status: null })}>
          <MultiSelect label="Category" options={categoryOptions} value={filters.categories} onChange={(categories) => setFilters({ categories })} size="sm" />
          <Select label="Supplier" placeholder="All suppliers" options={supplierOptions} value={filters.supplier} onChange={(supplier) => setFilters({ supplier })} size="sm" />
          <Select label="Status" placeholder="All statuses" options={statusOptions} value={filters.status} onChange={(status) => setFilters({ status })} size="sm" />
        </FilterBar>
      }
    >
      {filters.query && (
        <p style={{ margin: '0 0 0.5rem' }}>
          Showing results for “{filters.query}”.{' '}
          <Button size="sm" variant="tertiary" onClick={() => setFilters({ query: '' })}>Clear search</Button>
        </p>
      )}
      {detail ? (
        <FlexibleColumnLayout layout="TwoColumnsStartExpanded" startColumn={grid} midColumn={detailPanel} labels={{ start: 'Product list', mid: 'Product details', end: 'More' }} />
      ) : (
        grid
      )}
      <ProductDialog open={dialog.open} product={dialog.product} existingSkus={skus} onClose={() => setDialog({ open: false, product: null })} onSubmit={save} />
      <AlertDialog
        open={pendingDelete != null}
        tone="error"
        title={pendingDelete?.length === 1 ? 'Delete product?' : `Delete ${pendingDelete?.length ?? 0} products?`}
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      >
        {pendingDelete && byId(pendingDelete).map((p) => p.name).join(', ')} will be removed from the catalog.
      </AlertDialog>
    </Page>
  );
}
