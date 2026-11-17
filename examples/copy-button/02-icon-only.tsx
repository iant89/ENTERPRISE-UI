import { CopyButton, Input, useToast } from '@enterprise-ui/react';

export const title = 'Icon only, inside a field';
export const description = 'An icon-only copy button fits in an Input\'s end adornment. The icon turns into a check mark for two seconds; here a toast confirms the copy as well.';

const KEY = 'JBSWY3DPEHPK3PXP';

export default function CopyIconOnlyExample() {
  const toast = useToast();
  return (
    <div style={{ maxWidth: '22rem' }}>
      <Input
        label="Setup key"
        value={KEY}
        readOnly
        endAdornment={
          <CopyButton
            iconOnly
            value={KEY}
            label="Copy setup key"
            size="sm"
            neutral
            onCopied={() => toast.show({ tone: 'success', title: 'Setup key copied' })}
            onError={() => toast.show({ tone: 'error', title: 'Could not copy', description: 'Select the key and copy it instead.' })}
          />
        }
      />
    </div>
  );
}
