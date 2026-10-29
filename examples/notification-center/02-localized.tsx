import { useState } from 'react';
import { NotificationCenter, type NotificationItem } from '@enterprise-ui/react';

const initial: NotificationItem[] = [{ id: '1', title: 'الموافقة على الطلب PO-1042', description: 'تم اعتماد طلب الشراء.', timestamp: '2026-01-15T12:00:00Z', read: false }];
const date = new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeZone: 'UTC' });
const number = new Intl.NumberFormat('ar');
export default function LocalizedNotifications() {
  const [notifications, setNotifications] = useState(initial);
  return <NotificationCenter dir="rtl" lang="ar" notifications={notifications}
    messages={{ title: 'الإشعارات', unreadCount: (count) => `غير مقروء: ${number.format(count)}`, loading: 'جارٍ تحميل الإشعارات…', empty: 'لا توجد إشعارات.', unread: 'غير مقروء', markRead: 'وضع علامة مقروء', dismiss: 'إزالة', markReadLabel: (title) => `وضع علامة مقروء: ${title}`, dismissLabel: (title) => `إزالة: ${title}` }}
    formatTimestamp={(value) => date.format(new Date(value))}
    onMarkRead={(id) => setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item))}
    onDismiss={(id) => setNotifications((items) => items.filter((item) => item.id !== id))} />;
}
