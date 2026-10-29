import { Tab, TabList, TabPanel, Tabs } from '@enterprise-ui/react';

export const title = 'Contained variant with manual activation';
export const description = '`variant="contained"` places tabs on a surface bar. `activation="manual"` waits for Enter/Space — use it when panels are expensive to load.';

export default function TabsContained() {
  return (
    <Tabs defaultValue="open" variant="contained" activation="manual">
      <TabList aria-label="Order status">
        <Tab value="open" count={12}>Open</Tab>
        <Tab value="progress" count={5}>In progress</Tab>
        <Tab value="done" count={148}>Completed</Tab>
      </TabList>
      <TabPanel value="open">12 open orders.</TabPanel>
      <TabPanel value="progress">5 orders in progress.</TabPanel>
      <TabPanel value="done">148 completed orders.</TabPanel>
    </Tabs>
  );
}
