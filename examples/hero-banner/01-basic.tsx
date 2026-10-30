import { Button, HeroBanner } from '@enterprise-ui/react';

export const title = 'Hero banner';
export const description = 'Introduce a workspace with one clear call to action.';

export default function HeroBannerBasic() {
  return <HeroBanner title="Good morning, Alex" subtitle="You have 4 approvals waiting." actions={<Button variant="primary">Review approvals</Button>} />;
}
