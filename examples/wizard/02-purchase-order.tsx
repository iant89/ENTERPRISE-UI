import { useState } from 'react';
import { Input, MessageStrip, Wizard } from '@enterprise-ui/react';
export const title = 'Purchase-order wizard';
export default function PurchaseOrderWizard() {
  const [supplier, setSupplier] = useState(''); const [amount, setAmount] = useState(''); const [done, setDone] = useState(false);
  if (done) return <MessageStrip tone="success" title="Mock purchase order created">Order for {supplier}: ${amount}.</MessageStrip>;
  return <Wizard aria-label="Create purchase order" finishLabel="Create order" onFinish={() => setDone(true)} steps={[
    { id: 'supplier', title: 'Supplier', content: <Input key="supplier" label="Supplier name" value={supplier} onChange={(event) => setSupplier(event.target.value)} />, validate: () => supplier.trim() ? true : 'Enter a supplier.' },
    { id: 'amount', title: 'Order amount', content: <Input key="amount" label="Amount in USD" type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} />, validate: () => Number(amount) > 0 ? true : 'Enter a positive amount.' },
    { id: 'review', title: 'Review', content: <p>Order from {supplier} for ${amount}.</p> },
  ]} />;
}
