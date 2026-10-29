import { useState } from 'react';
import { List, MasterDetail, ObjectPage } from '@enterprise-ui/react';
export const title = 'Customer master–detail';
const customers = [{ id: 'C-101', name: 'Aster Medical', city: 'Pittsburgh', owner: 'Morgan Lee' }, { id: 'C-102', name: 'Northstar Supply', city: 'Cleveland', owner: 'Taylor Chen' }];
export default function CustomersExample() {
  const [selected, setSelected] = useState(customers[0].id);
  const [showDetail, setShowDetail] = useState(false);
  const customer = customers.find((entry) => entry.id === selected);
  return <div style={{ height: 460 }}><MasterDetail masterLabel="Customers" detailLabel="Customer details" showDetail={showDetail} onBack={() => setShowDetail(false)}
    master={<List aria-label="Customers" selectionMode="single" selectedIds={[selected]} onSelectionChange={(ids) => { if (ids[0]) setSelected(ids[0]); }} onItemClick={() => setShowDetail(true)} items={customers.map((entry) => ({ id: entry.id, title: entry.name, description: entry.city }))} />}
    detail={customer ? <ObjectPage title={customer.name} subtitle={customer.id} attributes={[{ label: 'City', value: customer.city }, { label: 'Account owner', value: customer.owner }]} sections={[{ id: 'overview', title: 'Overview', content: 'Account information from mock data.' }]} /> : <p>Select a customer.</p>} /></div>;
}
