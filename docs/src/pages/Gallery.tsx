import { useState } from 'react';
import { Download, Home, Mail, Package, Plus, ShoppingCart, Trash2, Users } from 'lucide-react';
import {
  AlertDialog, Avatar, Badge, Breadcrumbs, Button, ButtonGroup, Card, Checkbox, ComboBox, DataGrid, DatePicker, Dialog, DropdownMenu,
  Grid, GridItem, IconButton, Input, MessageStrip, MetricCard, MultiSelect, NavigationItem, NumberInput, Page, Pagination, ProgressBar,
  RadioGroup, SearchField, Select, SideNavigation, SplitButton, Stack, StatusIndicator, Switch, Tab, TabList, TabPanel, Tabs,
  TextArea, ToggleButton, Tooltip, useToast, type DataGridColumn,
} from '@enterprise-ui/react';
import { categoryOptions, countries, currency, products, statusTone, type Product } from '../../../examples/data';
import styles from './Pages.module.css';

const columns: DataGridColumn<Product>[] = [
  { id: 'name', header: 'Product', accessor: 'name', sortable: true, rowHeader: true },
  { id: 'category', header: 'Category', accessor: 'category', filterOptions: categoryOptions },
  { id: 'status', header: 'Status', accessor: 'status', cell: (p) => <StatusIndicator tone={statusTone[p.status]}>{p.status}</StatusIndicator> },
  { id: 'price', header: 'Price', accessor: 'price', sortable: true, align: 'end', cell: (p) => currency(p.price) },
];

export function Gallery() {
  const toast = useToast();
  const [dialog, setDialog] = useState(false);
  const [alert, setAlert] = useState(false);
  const [page, setPage] = useState(2);
  return (
    <Page
      title="Component gallery"
      subtitle="Buttons, inputs, tables, cards, dialogs, tabs, navigation, status indicators and notifications together — switch theme and density in the header."
      breadcrumbs={[{ label: 'Components', href: '#/components' }, { label: 'Gallery' }]}
    >
      <Grid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        <Card title="Buttons" headingLevel={2}>
          <Stack gap={3}>
            <Stack direction="horizontal" gap={2} wrap>
              <Button variant="primary" icon={<Plus />}>Create</Button>
              <Button>Edit</Button>
              <Button variant="tertiary">Cancel</Button>
              <Button variant="destructive" icon={<Trash2 />}>Delete</Button>
            </Stack>
            <Stack direction="horizontal" gap={2} wrap align="center">
              <SplitButton variant="primary" items={[{ id: 'draft', label: 'Save as draft' }]}>Save</SplitButton>
              <ButtonGroup attached aria-label="View">
                <ToggleButton defaultPressed>List</ToggleButton>
                <ToggleButton>Grid</ToggleButton>
              </ButtonGroup>
              <Tooltip content="Download report"><IconButton icon={<Download />} label="Download" hideTitle /></Tooltip>
              <Button loading>Saving</Button>
            </Stack>
          </Stack>
        </Card>

        <Card title="Inputs" headingLevel={2}>
          <Stack gap={3}>
            <Input label="Email" startAdornment={<Mail />} defaultValue="ada@northwind.example" />
            <Input label="VAT ID" defaultValue="DE123" error="VAT ID must have 11 characters." />
            <Grid columns={2} gap={3}>
              <NumberInput label="Quantity" defaultValue={12} unit="pcs" />
              <DatePicker label="Delivery" defaultValue={new Date(2026, 10, 14)} />
            </Grid>
          </Stack>
        </Card>

        <Card title="Selection controls" headingLevel={2}>
          <Stack gap={3}>
            <Select label="Country" options={countries} defaultValue="de" />
            <ComboBox label="Ship to" options={countries} placeholder="Type to search" />
            <MultiSelect label="Categories" options={categoryOptions} defaultValue={['Laptops', 'Monitors']} />
            <Stack direction="horizontal" gap={4} wrap>
              <Checkbox label="Urgent" defaultChecked />
              <Switch label="Notify me" defaultChecked />
            </Stack>
            <RadioGroup label="Delivery" orientation="horizontal" defaultValue="std" options={[{ value: 'std', label: 'Standard' }, { value: 'exp', label: 'Express' }]} />
          </Stack>
        </Card>

        <GridItem span="full">
          <DataGrid title="Products" columns={columns} data={products} selectionMode="multiple" getRowLabel={(p) => p.name} pageSize={5} pageSizeOptions={[5, 10]} />
        </GridItem>

        <Card title="Cards & KPIs" headingLevel={2}>
          <Stack gap={3}>
            <MetricCard title="Revenue" value="1.24" unit="M USD" trend={{ direction: 'up', value: '+8.2%' }} sparkline={[4, 6, 5, 7, 8, 9]} headingLevel={3} />
            <ProgressBar label="Budget used" value={78} tone="warning" />
          </Stack>
        </Card>

        <Card title="Dialogs" headingLevel={2}>
          <Stack gap={3}>
            <div className={styles.galleryDialog} aria-hidden="true">
              <div className={styles.galleryDialogHeader}>Discard changes?</div>
              <div className={styles.galleryDialogBody}>Your edits to PO 4500012 will be lost.</div>
              <div className={styles.galleryDialogFooter}>
                <Button size="sm" tabIndex={-1}>Keep editing</Button>
                <Button size="sm" variant="destructive" tabIndex={-1}>Discard</Button>
              </div>
            </div>
            <Stack direction="horizontal" gap={2} wrap>
              <Button onClick={() => setDialog(true)}>Open dialog</Button>
              <Button variant="destructive" onClick={() => setAlert(true)}>Open alert</Button>
            </Stack>
          </Stack>
          <Dialog open={dialog} onClose={() => setDialog(false)} title="Edit supplier" footer={<><Button variant="tertiary" onClick={() => setDialog(false)}>Cancel</Button><Button variant="primary" onClick={() => setDialog(false)}>Save</Button></>}>
            <Stack gap={3}>
              <Input label="Name" defaultValue="Contoso Ltd" />
              <TextArea label="Notes" />
            </Stack>
          </Dialog>
          <AlertDialog open={alert} tone="error" title="Delete supplier?" confirmLabel="Delete" onCancel={() => setAlert(false)} onConfirm={() => setAlert(false)}>
            Contoso Ltd and its 14 contracts will be deleted.
          </AlertDialog>
        </Card>

        <Card title="Tabs" headingLevel={2}>
          <Tabs defaultValue="items">
            <TabList aria-label="Order">
              <Tab value="general">General</Tab>
              <Tab value="items" count={4}>Items</Tab>
              <Tab value="notes">Notes</Tab>
            </TabList>
            <TabPanel value="general">Supplier, terms and addresses.</TabPanel>
            <TabPanel value="items">4 items · {currency(4820)}</TabPanel>
            <TabPanel value="notes">No notes.</TabPanel>
          </Tabs>
        </Card>

        <Card title="Navigation" headingLevel={2}>
          <Stack gap={3}>
            <Breadcrumbs aria-label="Example breadcrumb" items={[{ label: 'Home', href: '#/' }, { label: 'Sales', href: '#/' }, { label: 'Orders' }]} />
            <SearchField aria-label="Search orders" placeholder="Search orders" />
            <div style={{ border: '1px solid var(--eui-color-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
              <SideNavigation activeId="orders" aria-label="Gallery navigation" onNavigate={(_, e) => e.preventDefault()}>
                <NavigationItem id="home" label="Home" icon={<Home />} href="#home" />
                <NavigationItem id="orders" label="Orders" icon={<ShoppingCart />} href="#orders" badge={3} />
                <NavigationItem id="products" label="Products" icon={<Package />} href="#products" />
              </SideNavigation>
            </div>
            <Pagination page={page} onPageChange={setPage} totalItems={120} pageSize={10} showSummary={false} />
          </Stack>
        </Card>

        <Card title="Status indicators" headingLevel={2}>
          <Stack gap={3}>
            <Stack direction="horizontal" gap={4} wrap>
              <StatusIndicator tone="success">Approved</StatusIndicator>
              <StatusIndicator tone="warning">Pending</StatusIndicator>
              <StatusIndicator tone="error">Rejected</StatusIndicator>
              <StatusIndicator tone="information">In process</StatusIndicator>
            </Stack>
            <Stack direction="horizontal" gap={2} wrap align="center">
              <Badge tone="success">Paid</Badge>
              <Badge tone="error" solid>Blocked</Badge>
              <Badge count={8} tone="information" aria-label="8 new" />
              <Avatar name="Ada Lovelace" size="sm" presence="online" />
              <Avatar name="Contoso Ltd" size="sm" shape="square" />
              <Avatar icon={<Users />} size="sm" aria-label="Team" />
            </Stack>
          </Stack>
        </Card>

        <Card title="Notifications" headingLevel={2}>
          <Stack gap={2}>
            <MessageStrip tone="success">Order released.</MessageStrip>
            <MessageStrip tone="warning">3 items below safety stock.</MessageStrip>
            <MessageStrip tone="error" dismissible>Posting period is closed.</MessageStrip>
            <Stack direction="horizontal" gap={2} wrap>
              <Button size="sm" onClick={() => toast.show({ title: 'Changes saved', tone: 'success' })}>Show toast</Button>
              <DropdownMenu
                trigger={<Button size="sm">More toasts</Button>}
                onAction={(tone) => toast.show({ title: `${tone[0].toUpperCase()}${tone.slice(1)} notification`, tone: tone as 'error', description: 'Toasts stack and announce themselves.' })}
                items={[{ id: 'information', label: 'Information' }, { id: 'warning', label: 'Warning' }, { id: 'error', label: 'Error (persistent)' }]}
              />
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </Page>
  );
}
