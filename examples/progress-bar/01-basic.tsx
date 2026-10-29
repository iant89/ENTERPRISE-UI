import { ProgressBar, Stack } from '@enterprise-ui/react';

export const title = 'Progress and utilisation';
export const description = 'Determinate bars expose `aria-valuenow`; omit `value` for indeterminate progress.';

export default function ProgressBarBasic() {
  return (
    <Stack gap={4} style={{ maxWidth: 420 }}>
      <ProgressBar label="Import products" value={64} />
      <ProgressBar label="Budget used" value={92} tone="warning" formatValue={(v) => `$${(v * 1.5).toFixed(0)}K of $150K`} />
      <ProgressBar label="Warehouse capacity" value={100} tone="error" />
      <ProgressBar label="Synchronising" />
      <ProgressBar aria-label="Compact" value={30} size="sm" />
    </Stack>
  );
}
