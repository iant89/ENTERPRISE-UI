import { useState } from 'react';
import { Pagination } from '@enterprise-ui/react';
const number = new Intl.NumberFormat('ar');
export default function LocalizedPagination() {
  const [page, setPage] = useState(2);
  const [size, setSize] = useState(10);
  return <Pagination dir="rtl" lang="ar" aria-label="تنقل صفحات الطلبات" page={page} onPageChange={setPage} totalItems={120} pageSize={size} pageSizeOptions={[10, 25]} onPageSizeChange={(value) => { setSize(value); setPage(1); }}
    messages={{ summary: (from, to, total) => `${number.format(from)}–${number.format(to)} من ${number.format(total)}`, rowsPerPage: 'عدد الصفوف في الصفحة', firstPage: 'الصفحة الأولى', previousPage: 'الصفحة السابقة', nextPage: 'الصفحة التالية', lastPage: 'الصفحة الأخيرة', pageLabel: (value) => `الصفحة ${number.format(value)}`, pageNumber: (value) => number.format(value), compactPage: (value, count) => `الصفحة ${number.format(value)} من ${number.format(count)}` }} />;
}
