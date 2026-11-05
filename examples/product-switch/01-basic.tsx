import { ProductSwitch, IconProvider } from '@enterprise-ui/react';

export const title = 'Product switch';
export const description = 'Switch between related applications.';

export default function ProductSwitchBasic() {
  return (
    <ProductSwitch
      items={[
        { id: 'analytics', title: 'Analytics', subtitle: 'Reports', icon: IconProvider.getIcon('vertical-bar-chart'), current: true },
        { id: 'inventory', title: 'Inventory', icon: IconProvider.getIcon('sap-box') },
        { id: 'people', title: 'People', icon: IconProvider.getIcon('group') },
        { id: 'finance', title: 'Finance', subtitle: 'Payables', icon: IconProvider.getIcon('wallet') },
      ]}
    />
  );
}
