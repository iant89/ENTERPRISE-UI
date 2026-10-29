/** Sample business data shared by the examples. */

export type ProductStatus = 'In stock' | 'Low stock' | 'Out of stock' | 'Discontinued';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  price: number;
  stock: number;
  status: ProductStatus;
  updated: string;
}

const categories = ['Laptops', 'Monitors', 'Accessories', 'Networking', 'Software'];
const suppliers = ['Northwind Traders', 'Contoso Ltd', 'Fabrikam Inc', 'Adventure Works', 'Litware'];
const names = [
  'ProBook 14', 'UltraView 27"', 'Wireless Mouse M2', 'Dock Station D5', 'Mesh Router X3', 'Office Suite 2026', 'ProBook 16',
  'UltraView 32" 4K', 'Ergo Keyboard K7', 'USB-C Hub 8-in-1', 'Switch 24-Port', 'Security Suite', 'Travel Laptop T13',
  'Portable Monitor 15"', 'Noise-Cancelling Headset', 'Webcam HD Pro', 'Access Point AP6', 'Backup Manager', 'Workstation W9',
  'Curved Display 34"', 'Laptop Stand', 'Firewall F200', 'Design Studio', 'Chromebook C11',
];

const statusFor = (stock: number, i: number): ProductStatus => (i % 11 === 10 ? 'Discontinued' : stock === 0 ? 'Out of stock' : stock < 15 ? 'Low stock' : 'In stock');

export const products: Product[] = names.map((name, i) => {
  const stock = [42, 8, 120, 0, 31, 999, 17, 5, 64, 0, 12, 400, 23, 9, 51, 76, 3, 250, 2, 14, 88, 7, 150, 36][i];
  return {
    id: `P-${1001 + i}`,
    name,
    sku: `SKU-${(48213 + i * 37).toString().padStart(6, '0')}`,
    category: categories[i % categories.length],
    supplier: suppliers[(i * 3) % suppliers.length],
    price: [1299, 449, 39, 229, 189, 299, 1599, 799, 129, 79, 349, 89, 999, 259, 199, 119, 159, 49, 2899, 699, 59, 1199, 499, 399][i],
    stock,
    status: statusFor(stock, i),
    updated: `2026-10-${String(28 - (i % 27)).padStart(2, '0')}`,
  };
});

export const statusTone = {
  'In stock': 'success',
  'Low stock': 'warning',
  'Out of stock': 'error',
  Discontinued: 'neutral',
} as const;

export const categoryOptions = categories.map((c) => ({ value: c, label: c }));
export const supplierOptions = suppliers.map((s) => ({ value: s, label: s }));

export const countries = [
  { value: 'at', label: 'Austria', group: 'Europe' },
  { value: 'be', label: 'Belgium', group: 'Europe' },
  { value: 'de', label: 'Germany', group: 'Europe' },
  { value: 'fr', label: 'France', group: 'Europe' },
  { value: 'nl', label: 'Netherlands', group: 'Europe' },
  { value: 'es', label: 'Spain', group: 'Europe' },
  { value: 'ch', label: 'Switzerland', group: 'Europe' },
  { value: 'gb', label: 'United Kingdom', group: 'Europe' },
  { value: 'ca', label: 'Canada', group: 'Americas' },
  { value: 'mx', label: 'Mexico', group: 'Americas' },
  { value: 'us', label: 'United States', group: 'Americas' },
  { value: 'br', label: 'Brazil', group: 'Americas' },
  { value: 'au', label: 'Australia', group: 'Asia Pacific' },
  { value: 'in', label: 'India', group: 'Asia Pacific' },
  { value: 'jp', label: 'Japan', group: 'Asia Pacific' },
  { value: 'sg', label: 'Singapore', group: 'Asia Pacific' },
];

export const currency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export interface Order {
  id: string;
  customer: string;
  amount: number;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Shipped';
  date: string;
}

export const orders: Order[] = [
  { id: 'SO-50211', customer: 'Acme Corporation', amount: 12450, status: 'Approved', date: '2026-10-27' },
  { id: 'SO-50212', customer: 'Globex', amount: 3200, status: 'Pending', date: '2026-10-27' },
  { id: 'SO-50213', customer: 'Initech', amount: 870, status: 'Rejected', date: '2026-10-26' },
  { id: 'SO-50214', customer: 'Umbrella Group', amount: 22100, status: 'Shipped', date: '2026-10-25' },
  { id: 'SO-50215', customer: 'Stark Industries', amount: 15999, status: 'Pending', date: '2026-10-24' },
  { id: 'SO-50216', customer: 'Wayne Enterprises', amount: 6400, status: 'Approved', date: '2026-10-23' },
];

export const orderTone = { Approved: 'success', Pending: 'warning', Rejected: 'error', Shipped: 'information' } as const;
