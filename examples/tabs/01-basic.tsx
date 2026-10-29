import { FileText, History, Package, Paperclip } from 'lucide-react';
import { Tab, TabList, TabPanel, Tabs } from '@enterprise-ui/react';

export const title = 'Tabs';
export const description = 'Arrow keys move between tabs and select them (automatic activation). Only the selected tab is in the Tab order.';

export default function TabsBasic() {
  return (
    <Tabs defaultValue="items">
      <TabList aria-label="Purchase order">
        <Tab value="general" icon={<FileText />}>General</Tab>
        <Tab value="items" icon={<Package />} count={4}>Items</Tab>
        <Tab value="attachments" icon={<Paperclip />} count={2}>Attachments</Tab>
        <Tab value="history" icon={<History />}>History</Tab>
        <Tab value="approvals" disabled>Approvals</Tab>
      </TabList>
      <TabPanel value="general">Supplier, payment terms and delivery address.</TabPanel>
      <TabPanel value="items">4 line items, total $12,450.</TabPanel>
      <TabPanel value="attachments">Contract.pdf, Quote.pdf</TabPanel>
      <TabPanel value="history">Created on Oct 20 by Ada Lovelace.</TabPanel>
    </Tabs>
  );
}
