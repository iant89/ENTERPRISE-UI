import { useState } from 'react';
import { NotificationCenter, type NotificationItem } from '@enterprise-ui/react';
const initial: NotificationItem[] = [{ id: '1', title: 'Order approved', description: 'Purchase order PO-1042 has been approved.', read: false }];
export default function Example() {
  const [notifications, setNotifications] = useState(initial);
  return <NotificationCenter notifications={notifications} onMarkRead={(id) => setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item))} onDismiss={(id) => setNotifications((items) => items.filter((item) => item.id !== id))} />;
}
