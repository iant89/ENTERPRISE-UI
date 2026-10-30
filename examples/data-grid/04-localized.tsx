import { DataGrid, type DataGridColumn, type DataGridMessages, type PaginationMessages } from '@enterprise-ui/react';

type Order = { id: string; customer: string; status: string };
const orders: Order[] = [
  { id: 'PO-101', customer: 'شركة الأفق — ACME', status: 'open' },
  { id: 'PO-102', customer: 'مؤسسة الريادة', status: 'closed' },
  { id: 'PO-103', customer: 'شركة الأطلس', status: 'open' },
];
const columns: DataGridColumn<Order>[] = [
  { id: 'id', header: 'رقم الطلب', accessor: 'id', alwaysVisible: true },
  { id: 'customer', header: 'العميل', accessor: 'customer', sortable: true },
  { id: 'status', header: 'الحالة', accessor: 'status', filterOptions: [{ value: 'open', label: 'مفتوح' }, { value: 'closed', label: 'مغلق' }], cell: (order) => order.status === 'open' ? 'مفتوح' : 'مغلق' },
];
const number = new Intl.NumberFormat('ar');
const messages: DataGridMessages = {
  searchPlaceholder: 'بحث', searchLabel: (title) => `البحث في ${title}`, clearSearch: 'مسح البحث', filterLabel: (column) => `تصفية حسب ${column}`,
  filterValue: (column, value) => `${column}: ${value}`, all: 'الكل', clearFilters: 'مسح عوامل التصفية', columns: 'الأعمدة', rowDensity: 'كثافة الصفوف',
  cozy: 'مريحة', compact: 'مدمجة', condensed: 'مكثفة', viewSettings: 'إعدادات العرض', columnWidths: 'عرض الأعمدة',
  columnWidth: (column, width) => `عرض ${column}: ${number.format(width)} بكسل`, selected: (count) => `المحدد: ${number.format(count)}`,
  clearSelection: 'إلغاء التحديد', stale: 'النتائج السابقة معروضة وقد تكون قديمة.', selectAllPage: 'تحديد كل صفوف الصفحة', selectAll: 'تحديد كل الصفوف',
  selectionHeader: 'التحديد', selectRow: (label) => `تحديد ${label}`, unavailable: 'البيانات غير متاحة.', noResults: 'لا توجد نتائج مطابقة.', noData: 'لا توجد بيانات.',
  results: (count) => `النتائج: ${number.format(count)}`,
};
const pagination: PaginationMessages = {
  summary: (from, to, total) => `${number.format(from)}–${number.format(to)} من ${number.format(total)}`,
  rowsPerPage: 'عدد الصفوف في الصفحة', firstPage: 'الصفحة الأولى', previousPage: 'الصفحة السابقة', nextPage: 'الصفحة التالية', lastPage: 'الصفحة الأخيرة',
  pageLabel: (page) => `الصفحة ${number.format(page)}`, pageNumber: (page) => number.format(page), compactPage: (page, count) => `الصفحة ${number.format(page)} من ${number.format(count)}`,
};
export default function LocalizedOrdersGrid() {
  return <DataGrid title="طلبات الشراء" dir="rtl" lang="ar" locale="ar" data={orders} columns={columns} getRowId={(row) => row.id} getRowLabel={(row) => row.id}
    selectionMode="multiple" pageSize={2} pageSizeOptions={[2, 5]} messages={messages} paginationMessages={pagination} paginationLabel="صفحات الطلبات" resizableColumns />;
}
