import { useState } from 'react';
import { CopyButton, InlineEdit } from '@enterprise-ui/react';

export default function LocalizedInlineEdit() {
  const [value, setValue] = useState('طلب الشراء PO-42');
  return <div dir="rtl" lang="ar">
    <InlineEdit label="وصف الطلب" value={value} onSave={(next) => setValue(next)}
      validate={(next) => next.trim() ? undefined : 'أدخل الوصف.'}
      messages={{ edit: 'تعديل', editLabel: (label) => `تعديل ${label}`, save: 'حفظ', cancel: 'إلغاء', validationFailed: 'فشل التحقق.', saveFailed: 'تعذر الحفظ.', emptyValue: 'فارغ' }} />
    <CopyButton value={value} label="نسخ" messages={{ copied: 'تم النسخ.', failed: 'تعذر النسخ.', clipboardUnavailable: 'الحافظة غير متاحة.' }} />
  </div>;
}
