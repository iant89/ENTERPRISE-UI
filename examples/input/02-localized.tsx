import { useState } from 'react';
import { Input } from '@enterprise-ui/react';
export const title = 'Right-to-left customer name';
export const description = 'An application-provided Arabic label and bidirectional customer value. This is a single-component example, not a guarantee of full RTL support.';
export default function LocalizedInput() {
  const [value, setValue] = useState('شركة الأفق — ACME 42');
  return <div dir="rtl" lang="ar"><Input label="اسم العميل كما يظهر في سجلات الشركة" value={value} dir="auto" onChange={(event) => setValue(event.target.value)} /></div>;
}
