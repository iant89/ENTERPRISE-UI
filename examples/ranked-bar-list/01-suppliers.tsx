import { useState } from 'react';
import { RankedBarList } from '@enterprise-ui/react';

export const title = 'Spend by supplier';
export const description = 'Top five suppliers by spend, with share of total. Rows are buttons (`onSelect`) so the list can drive cross-filtering; "Show all" reveals the rest. Values are always printed, so the bars are decorative.';

const suppliers = [
  { id: 'fab', label: 'Fabrikam', meta: 'DE', value: 412_000 },
  { id: 'con', label: 'Contoso', meta: 'US', value: 268_500 },
  { id: 'nor', label: 'Northwind Traders', meta: 'UK', value: 190_250, tone: 'warning' as const },
  { id: 'lit', label: 'Litware', meta: 'US', value: 121_000 },
  { id: 'tai', label: 'Tailspin Toys', meta: 'NL', value: 98_400 },
  { id: 'adv', label: 'Adventure Works', meta: 'US', value: 64_900 },
  { id: 'woo', label: 'Woodgrove', meta: 'CA', value: 31_200 },
];

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });

export default function SupplierSpend() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <RankedBarList
      label="Spend by supplier, year to date"
      items={suppliers}
      formatValue={(v) => usd.format(v)}
      showShare
      onSelect={(item) => setSelected((current) => (current === item.id ? null : item.id))}
      selectedId={selected}
    />
  );
}
