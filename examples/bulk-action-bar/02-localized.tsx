import { BulkActionBar } from '@enterprise-ui/react';

const number = new Intl.NumberFormat('ar');
export default function LocalizedBulkAction() {
  return <BulkActionBar dir="rtl" lang="ar" aria-label="الإجراءات المجمعة" selectedIds={['PO-1', 'PO-2']}
    messages={{
      selected: (count) => `السجلات المحددة: ${number.format(count)}`, clearSelection: 'إلغاء التحديد', processing: 'جار التنفيذ…',
      summary: (done, failed, unknown) => `نجح ${number.format(done)}؛ ${unknown ? 'غير مؤكد' : 'فشل'} ${number.format(failed)}.`,
      verifyUnknown: 'تحقق من النتائج غير المؤكدة قبل إعادة المحاولة.', retryFailed: 'إعادة محاولة الفاشل', undo: 'تراجع', dismiss: 'إغلاق',
      confirmTitle: (action) => `تأكيد ${action}`, confirmBody: (action, count) => `هل تريد ${action} ${number.format(count)} من السجلات؟`, confirm: 'تأكيد', cancel: 'إلغاء',
      actionChanged: 'تغير الإجراء أو التحديد. راجع وحاول مجدداً.', conflictingResults: 'أعاد الخادم نتائج متعارضة.', missingResult: 'لم ترد نتيجة لهذا السجل.', operationFailed: 'فشل الإجراء.',
      outcomeUnknown: (reason) => `النتيجة غير مؤكدة: ${reason}`, requestFailed: 'فشل الطلب.', undoOutcomeUnknown: (reason) => `نتيجة التراجع غير مؤكدة: ${reason}. تحقق قبل إعادة المحاولة.`,
    }}
    actions={[{ id: 'archive', label: 'الأرشفة', destructive: true, execute: async () => ({ succeeded: ['PO-1'], failed: [] }) }]} />;
}
