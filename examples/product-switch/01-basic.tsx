import { BarChart3, Boxes, Users, Wallet } from 'lucide-react';
import { ProductSwitch } from '@enterprise-ui/react';

export const title = 'Product switch';
export const description = 'Switch between related applications.';

export default function ProductSwitchBasic() {
  return (
    <ProductSwitch
      items={[
        { id: 'analytics', title: 'Analytics', subtitle: 'Reports', icon: <BarChart3 />, current: true },
        { id: 'inventory', title: 'Inventory', icon: <Boxes /> },
        { id: 'people', title: 'People', icon: <Users /> },
        { id: 'finance', title: 'Finance', subtitle: 'Payables', icon: <Wallet /> },
      ]}
    />
  );
}
