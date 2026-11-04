import { ProductSwitch, GroupIcon, SapBoxIcon, VerticalBarChartIcon, WalletIcon } from '@enterprise-ui/react';

export const title = 'Product switch';
export const description = 'Switch between related applications.';

export default function ProductSwitchBasic() {
  return (
    <ProductSwitch
      items={[
        { id: 'analytics', title: 'Analytics', subtitle: 'Reports', icon: <VerticalBarChartIcon />, current: true },
        { id: 'inventory', title: 'Inventory', icon: <SapBoxIcon /> },
        { id: 'people', title: 'People', icon: <GroupIcon /> },
        { id: 'finance', title: 'Finance', subtitle: 'Payables', icon: <WalletIcon /> },
      ]}
    />
  );
}
