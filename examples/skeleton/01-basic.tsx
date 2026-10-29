import { Card, Skeleton, Stack } from '@enterprise-ui/react';

export const title = 'Skeleton loading';
export const description = 'Skeletons mirror the final layout. They are hidden from assistive technology — mark the region `aria-busy` instead.';

export default function SkeletonBasic() {
  return (
    <Card aria-busy="true" aria-label="Loading supplier" style={{ maxWidth: 420 }}>
      <Stack direction="horizontal" gap={3} align="center">
        <Skeleton variant="circle" width={48} height={48} />
        <Stack gap={1} style={{ flex: 1 }}>
          <Skeleton width="60%" />
          <Skeleton width="40%" />
        </Stack>
      </Stack>
      <div style={{ marginTop: 16 }}>
        <Skeleton lines={3} />
      </div>
      <div style={{ marginTop: 16 }}>
        <Skeleton variant="rect" height={120} />
      </div>
    </Card>
  );
}
