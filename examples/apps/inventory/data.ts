/** Extra sample data for the Northwind inventory demo (purchasing, stock movements, invoices). */
import { products as baseProducts, type Product } from '../../data';

export type PageId =
  | 'home' | 'products' | 'categories' | 'stock' | 'orders' | 'suppliers' | 'invoices' | 'reports' | 'settings' | 'help';

export const PAGE_TITLES: Record<PageId, string> = {
  home: 'Overview',
  products: 'Products',
  categories: 'Categories',
  stock: 'Stock movements',
  orders: 'Purchase orders',
  suppliers: 'Suppliers',
  invoices: 'Invoices',
  reports: 'Reports',
  settings: 'Settings',
  help: 'Help',
};

export const PAGE_IDS = Object.keys(PAGE_TITLES) as PageId[];
export const isPageId = (id: string): id is PageId => id in PAGE_TITLES;

export const initialProducts: Product[] = baseProducts.map((p) => ({ ...p }));

export type PoStatus = 'Draft' | 'Submitted' | 'Approved' | 'Received' | 'Cancelled';
export interface PurchaseOrder {
  id: string;
  supplier: string;
  items: number;
  amount: number;
  status: PoStatus;
  ordered: string;
  expected: string;
}
export const poTone = { Draft: 'neutral', Submitted: 'information', Approved: 'success', Received: 'success', Cancelled: 'error' } as const;
export const purchaseOrders: PurchaseOrder[] = [
  { id: 'PO-4500012', supplier: 'Contoso Ltd', items: 12, amount: 18450, status: 'Approved', ordered: '2026-10-27', expected: '2026-11-06' },
  { id: 'PO-4500013', supplier: 'Fabrikam Inc', items: 4, amount: 3120, status: 'Submitted', ordered: '2026-10-28', expected: '2026-11-09' },
  { id: 'PO-4500014', supplier: 'Northwind Traders', items: 30, amount: 41200, status: 'Received', ordered: '2026-10-14', expected: '2026-10-25' },
  { id: 'PO-4500015', supplier: 'Litware', items: 2, amount: 980, status: 'Draft', ordered: '2026-10-30', expected: '2026-11-12' },
  { id: 'PO-4500016', supplier: 'Adventure Works', items: 8, amount: 7640, status: 'Cancelled', ordered: '2026-10-20', expected: '2026-10-31' },
  { id: 'PO-4500017', supplier: 'Contoso Ltd', items: 16, amount: 22990, status: 'Submitted', ordered: '2026-11-01', expected: '2026-11-13' },
  { id: 'PO-4500018', supplier: 'Fabrikam Inc', items: 6, amount: 5410, status: 'Approved', ordered: '2026-11-02', expected: '2026-11-10' },
];

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  rating: number;
  leadTimeDays: number;
}
export const suppliers: Supplier[] = [
  { id: 'S-01', name: 'Northwind Traders', contact: 'Maria Anders', email: 'orders@northwind.example', phone: '+1 206 555 0100', country: 'United States', rating: 5, leadTimeDays: 7 },
  { id: 'S-02', name: 'Contoso Ltd', contact: 'Yoshi Tannamuri', email: 'sales@contoso.example', phone: '+44 20 7946 0958', country: 'United Kingdom', rating: 4, leadTimeDays: 10 },
  { id: 'S-03', name: 'Fabrikam Inc', contact: 'Hanna Moos', email: 'b2b@fabrikam.example', phone: '+49 30 901820', country: 'Germany', rating: 4, leadTimeDays: 8 },
  { id: 'S-04', name: 'Adventure Works', contact: 'Pedro Afonso', email: 'supply@adventure-works.example', phone: '+55 11 5555 0199', country: 'Brazil', rating: 3, leadTimeDays: 14 },
  { id: 'S-05', name: 'Litware', contact: 'Aiko Sato', email: 'partners@litware.example', phone: '+81 3 5555 0123', country: 'Japan', rating: 5, leadTimeDays: 12 },
];

export type MovementType = 'Receipt' | 'Issue' | 'Transfer' | 'Adjustment';
export interface StockMovement {
  id: string;
  type: MovementType;
  product: string;
  quantity: number;
  date: string;
  reference: string;
}
export const movementTone = { Receipt: 'success', Issue: 'warning', Transfer: 'information', Adjustment: 'neutral' } as const;
export const stockMovements: StockMovement[] = [
  { id: 'M-9001', type: 'Receipt', product: 'ProBook 14', quantity: 20, date: '2026-11-03', reference: 'PO-4500014' },
  { id: 'M-9002', type: 'Issue', product: 'Dock Station D5', quantity: -6, date: '2026-11-03', reference: 'SO-50214' },
  { id: 'M-9003', type: 'Transfer', product: 'UltraView 27"', quantity: 4, date: '2026-11-02', reference: 'Plant 1000 → 1100' },
  { id: 'M-9004', type: 'Adjustment', product: 'Wireless Mouse M2', quantity: -2, date: '2026-11-01', reference: 'Cycle count' },
  { id: 'M-9005', type: 'Receipt', product: 'Mesh Router X3', quantity: 15, date: '2026-10-30', reference: 'PO-4500012' },
  { id: 'M-9006', type: 'Issue', product: 'Workstation W9', quantity: -1, date: '2026-10-29', reference: 'SO-50211' },
  { id: 'M-9007', type: 'Issue', product: 'USB-C Hub 8-in-1', quantity: -12, date: '2026-10-27', reference: 'SO-50216' },
];
/** Movements newer than this date count as unread in the navigation badge. */
export const MOVEMENTS_SEEN_BEFORE = '2026-11-02';

export type InvoiceStatus = 'Paid' | 'Open' | 'Overdue';
export interface Invoice {
  id: string;
  supplier: string;
  purchaseOrder: string;
  amount: number;
  due: string;
  status: InvoiceStatus;
}
export const invoiceTone = { Paid: 'success', Open: 'information', Overdue: 'error' } as const;
export const invoices: Invoice[] = [
  { id: 'INV-7001', supplier: 'Northwind Traders', purchaseOrder: 'PO-4500014', amount: 41200, due: '2026-11-14', status: 'Open' },
  { id: 'INV-7002', supplier: 'Contoso Ltd', purchaseOrder: 'PO-4500012', amount: 18450, due: '2026-11-20', status: 'Open' },
  { id: 'INV-7003', supplier: 'Fabrikam Inc', purchaseOrder: 'PO-4500009', amount: 6200, due: '2026-10-28', status: 'Overdue' },
  { id: 'INV-7004', supplier: 'Litware', purchaseOrder: 'PO-4500007', amount: 2150, due: '2026-10-15', status: 'Paid' },
  { id: 'INV-7005', supplier: 'Adventure Works', purchaseOrder: 'PO-4500005', amount: 9800, due: '2026-10-10', status: 'Paid' },
];

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  /** Where clicking the notification goes. */
  target: PageId;
  /** Optional product status filter applied when opening Products. */
  status?: Product['status'];
}
export const initialNotifications: AppNotification[] = [
  { id: 'n1', title: 'Out of stock: Dock Station D5', description: '2 minutes ago', read: false, target: 'products', status: 'Out of stock' },
  { id: 'n2', title: 'PO 4500012 approved', description: '1 hour ago', read: false, target: 'orders' },
  { id: 'n3', title: 'Supplier price update', description: 'Yesterday', read: false, target: 'suppliers' },
  { id: 'n4', title: 'Invoice INV-7003 is overdue', description: '2 days ago', read: true, target: 'invoices' },
];
