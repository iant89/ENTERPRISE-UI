import { useState } from 'react';
import { Button, CommandPalette, type PaletteCommand } from '@enterprise-ui/react';

const commands: PaletteCommand[] = [
  { id: 'order', label: 'فتح طلب الشراء PO-123', shortcut: 'G O' },
  { id: 'report', label: 'عرض تقرير المخزون المفصل لجميع المستودعات والمواقع', group: 'تقارير' },
];

/** A localized portal needs its own direction and language. */
export default function LocalizedCommandPaletteExample() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  return <div dir="rtl" lang="ar">
    <Button onClick={() => setOpen(true)}>فتح قائمة الأوامر</Button>
    {selected && <p>الأمر المحدد: <bdi>{selected}</bdi></p>}
    <CommandPalette open={open} onOpenChange={setOpen} commands={commands} recentIds={['order']}
      onSelect={(command) => setSelected(command.label)} dir="rtl" lang="ar" locale="ar"
      title="قائمة الأوامر" searchLabel="البحث عن الأوامر" resultsLabel="نتائج الأوامر"
      defaultGroupLabel="الأوامر" recentLabel="الأخيرة" emptyMessage="لم يتم العثور على أوامر." closeLabel="إغلاق القائمة" />
  </div>;
}
