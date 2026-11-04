import { Card, Form, FormField, Page, SegmentedButton, Select, THEMES, type Density, type ThemePreference } from '@enterprise-ui/react';
import { useInventory } from '../store';
import { crumbs } from '../crumbs';

export const themeOptions: { value: ThemePreference; label: string }[] = [
  ...THEMES.map((t) => ({ value: t.name as ThemePreference, label: t.label })),
  { value: 'system', label: 'Match system' },
];

export function Settings() {
  const { navigate, theme, setTheme, density, setDensity } = useInventory();
  return (
    <Page title="Settings" subtitle="Appearance for this workspace. Changes apply immediately." breadcrumbs={crumbs(navigate, ['Home', 'home'], 'Settings')}>
      <Card title="Appearance" headingLevel={2}>
        <Form aria-label="Appearance settings" onSubmit={(e) => e.preventDefault()}>
          <Select id="settings-theme" label="Theme" options={themeOptions} value={theme} onChange={(v) => v && setTheme(v)} />
          <FormField label="Density" id="settings-density">
            <SegmentedButton
              aria-label="Density"
              selectionMode="single"
              items={[{ value: 'cozy', label: 'Cozy' }, { value: 'compact', label: 'Compact' }]}
              value={[density]}
              onChange={(v) => v[0] && setDensity(v[0] as Density)}
            />
          </FormField>
        </Form>
      </Card>
    </Page>
  );
}
