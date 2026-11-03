import { useState } from 'react';
import { Button, ErrorPage, SegmentedButton, type ErrorPageVariant } from '@enterprise-ui/react';

export const title = 'Error and status pages';
export const description = 'Each variant has a plain-language title and next steps. Give a support reference for server errors. Inside an app shell, use `standalone={false}` so the page does not add a second main landmark.';

export default function ErrorPageBasic() {
  const [variant, setVariant] = useState<ErrorPageVariant>('notFound');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <SegmentedButton
        aria-label="Variant"
        size="sm"
        items={(['notFound', 'forbidden', 'serverError', 'maintenance', 'offline'] as const).map((v) => ({ value: v, label: v }))}
        value={[variant]}
        onChange={(v) => v[0] && setVariant(v[0] as ErrorPageVariant)}
      />
      <ErrorPage
        standalone={false}
        variant={variant}
        reference={variant === 'serverError' ? 'req-7f3a91c2' : undefined}
        actions={
          <>
            <Button variant="primary">Go to home page</Button>
            <Button variant="secondary">Contact support</Button>
          </>
        }
      />
    </div>
  );
}
