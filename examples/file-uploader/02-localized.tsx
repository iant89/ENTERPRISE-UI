import { FileUploader } from '@enterprise-ui/react';
const numbers = new Intl.NumberFormat('ar');
export default function LocalizedFileUploader() {
  return <FileUploader dir="rtl" lang="ar" label="رفع الملفات" accept={['.txt']} maxFileSize={1000000}
    messages={{
      instructions: 'اختر ملفات نصية أو أسقطها هنا.', uploadFailed: 'تعذر الرفع.', typeNotAccepted: 'نوع الملف غير مقبول.', fileTooLarge: 'حجم الملف كبير جداً.',
      statuses: { queued: 'في الانتظار', uploading: 'جار الرفع', succeeded: 'تم الرفع', failed: 'فشل', cancelled: 'ملغى' },
      summary: (done, failed, total) => `تم رفع ${numbers.format(done)}، فشل ${numbers.format(failed)}، الإجمالي ${numbers.format(total)}.`,
      progressAnnouncement: (name, percent) => `${name}: تم رفع ${numbers.format(percent)} بالمئة.`,
      progressLabel: (name) => `تقدم رفع ${name}`, cancel: 'إلغاء', cancelLabel: (name) => `إلغاء ${name}`, retry: 'إعادة المحاولة', retryLabel: (name) => `إعادة محاولة ${name}`,
    }}
    upload={async (_file, { signal, onProgress }) => { if (signal.aborted) throw new Error('تم الإلغاء'); onProgress(1); }} />;
}
