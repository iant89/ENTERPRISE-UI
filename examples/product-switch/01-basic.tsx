import { ProductSwitch, Icon } from '@enterprise-ui/react';

export const title = 'Product switch';
export const description = 'Switch between related applications.';

export default function ProductSwitchBasic() {
  return (
    <ProductSwitch
      items={[
        { id: 'analytics', title: 'Analytics', subtitle: 'Reports', icon: <Icon name="vertical-bar-chart" />, current: true },
        { id: 'inventory', title: 'Inventory', icon: <Icon name="sap-box" /> },
        { id: 'people', title: 'People', icon: <Icon name="group" /> },
        { id: 'finance', title: 'Finance', subtitle: 'Payables', icon: <Icon name="wallet" /> },
      ]}
    />
  );
}
