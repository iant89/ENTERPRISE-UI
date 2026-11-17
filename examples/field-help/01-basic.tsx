import { FieldHelp, Input, NumberInput, WithFieldHelp } from '@enterprise-ui/react';

export const title = 'Field help';
export const description = 'The "i" holds the longer explanation; what is needed to fill the field in stays under it. Hover or focus shows the tip, a click or tap keeps it open.';

export default function FieldHelpExample() {
  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: '24rem' }}>
      <Input
        label="Endpoint"
        defaultValue="https://api.example.com/v1"
        endAdornment={<FieldHelp label="Endpoint">The base URL requests are sent to. Changing the host requires entering the API key again.</FieldHelp>}
      />
      <WithFieldHelp label="Timeout" help="How long to wait for the first byte of a reply before trying the next provider.">
        <NumberInput label="Timeout" description="1–600 seconds" defaultValue={30} min={1} max={600} />
      </WithFieldHelp>
    </div>
  );
}
