import { Icon, IconProvider, IconRegistry, Stack, Text } from '@enterprise-ui/react';

export const title = 'Icons by name or code point';
export const description = 'IconProvider supplies the SAP icon set, so Icon can look icons up by name, sap-icon:// URI or font code point. A nested provider adds a product-specific icon from a 16×16 SVG path.';

const company = IconRegistry.sap().extend({ 'company-logo': 'M8 1 15 5v6l-7 4-7-4V5zm0 2.3L3 6.1v3.8l5 2.8 5-2.8V6.1z' });

export default function IconProviderBasic() {
  const rows: [string, string][] = [['bar-code', 'Name'], ['sap-icon://bell', 'UI5 URI'], ['&#xe08d;', 'Code point'], ['company-logo', 'Custom icon']];
  return (
    <IconProvider registry={company}>
      <Stack gap={2}>
        {rows.map(([ref, kind]) => (
          <Stack key={ref} direction="horizontal" gap={2} align="center">
            <Icon name={ref} label={ref} style={{ fontSize: 24, color: 'var(--eui-color-primary)' }} />
            <Text><code>{ref}</code> ({kind})</Text>
          </Stack>
        ))}
      </Stack>
    </IconProvider>
  );
}
