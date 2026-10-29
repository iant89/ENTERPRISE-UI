import { useEffect, useRef, useState } from 'react';
import { Card, Grid, Page, StatusIndicator, Table, useTheme } from '@enterprise-ui/react';
import { docs } from '../registry';
import { href } from '../router';
import styles from './Pages.module.css';

const pairs: Array<[string, string, number, string]> = [
  ['color-text', 'color-surface', 4.5, 'Body text'],
  ['color-text-secondary', 'color-surface', 4.5, 'Secondary text'],
  ['color-text-secondary', 'color-background', 4.5, 'Secondary text on background'],
  ['color-on-primary', 'color-primary', 4.5, 'Primary button label'],
  ['color-link', 'color-surface', 4.5, 'Links'],
  ['color-error-text', 'color-surface', 4.5, 'Error text'],
  ['color-warning-text', 'color-surface', 4.5, 'Warning text'],
  ['color-success-text', 'color-surface', 4.5, 'Success text'],
  ['color-error-text', 'color-error-subtle', 4.5, 'Error message on tinted field'],
  ['color-border-strong', 'color-surface', 3, 'Input borders (non-text)'],
  ['color-focus', 'color-surface', 3, 'Focus indicator'],
];

function parse(color: string): [number, number, number] | null {
  const hex = /^#([0-9a-f]{6})$/i.exec(color.trim());
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)) as [number, number, number];
  const rgb = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color);
  return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] : null;
}

function luminance([r, g, b]: [number, number, number]) {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function ContrastTable() {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [rows, setRows] = useState<Array<{ id: string; label: string; fg: string; bg: string; ratio: number; min: number }>>([]);
  useEffect(() => {
    const style = ref.current ? getComputedStyle(ref.current) : null;
    if (!style) return;
    setRows(
      pairs.map(([fg, bg, min, label]) => {
        const f = parse(style.getPropertyValue(`--eui-${fg}`));
        const b = parse(style.getPropertyValue(`--eui-${bg}`));
        const ratio = f && b ? (Math.max(luminance(f), luminance(b)) + 0.05) / (Math.min(luminance(f), luminance(b)) + 0.05) : 0;
        return { id: `${fg}-${bg}`, label, fg, bg, ratio, min };
      }),
    );
  }, [resolvedTheme]);
  return (
    <div ref={ref}>
      <Table
        caption={`Contrast ratios in the ${resolvedTheme} theme`}
        responsive="stack"
        density="compact"
        data={rows}
        columns={[
          { id: 'label', header: 'Usage', accessor: 'label', rowHeader: true },
          { id: 'pair', header: 'Tokens', cell: (r) => <span className={styles.tokenValue}>{r.fg} on {r.bg}</span> },
          { id: 'ratio', header: 'Ratio', align: 'end', cell: (r) => `${r.ratio.toFixed(2)}:1` },
          { id: 'result', header: 'Result', cell: (r) => <StatusIndicator size="sm" tone={r.ratio >= r.min ? 'success' : 'error'}>{r.ratio >= r.min ? `Pass (≥ ${r.min}:1)` : `Fail (< ${r.min}:1)`}</StatusIndicator> },
        ]}
      />
    </div>
  );
}

export function AccessibilityPage() {
  const keyboardDocs = docs.filter((d) => d.keyboard?.length);
  return (
    <Page
      title="Accessibility"
      subtitle="The library targets WCAG 2.2 level AA. Components handle semantics, keyboard support and focus so applications start accessible."
      breadcrumbs={[{ label: 'Docs', href: '#/' }, { label: 'Foundations' }, { label: 'Accessibility' }]}
    >
      <Grid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        <Card title="Semantic HTML first" headingLevel={2}>Native buttons, inputs, tables, lists, fieldsets and landmarks. ARIA only where HTML has no equivalent (comboboxes, menus, trees, tabs).</Card>
        <Card title="Keyboard support" headingLevel={2}>Every interaction works without a mouse, following WAI-ARIA Authoring Practices: roving focus, arrow keys, Home/End and type-ahead.</Card>
        <Card title="Visible focus" headingLevel={2}>A 2px focus ring (3px in high contrast) using the <code>--eui-color-focus</code> token with ≥ 3:1 contrast, shown for keyboard users via <code>:focus-visible</code>.</Card>
        <Card title="Focus management" headingLevel={2}>Dialogs, drawers and panels trap focus and restore it on close. Menus and popovers return focus to their trigger. Route changes focus the new page heading.</Card>
        <Card title="Announcements" headingLevel={2}>ThemeProvider hosts polite and assertive live regions. Toasts, multi-select changes and filtered result counts are announced.</Card>
        <Card title="Motion & targets" headingLevel={2}>Durations collapse with <code>prefers-reduced-motion</code>. Touch devices get ≥ 44px hit areas; all targets meet the 24px minimum (WCAG 2.5.8).</Card>
      </Grid>

      <section className="docs-section" aria-labelledby="contrast">
        <h2 id="contrast">Colour contrast</h2>
        <p className="docs-muted" style={{ margin: 0 }}>Computed live from the active theme’s tokens. Switch themes in the header to compare.</p>
        <ContrastTable />
      </section>

      <section className="docs-section" aria-labelledby="keyboard-summary">
        <h2 id="keyboard-summary">Keyboard support by component</h2>
        <Table
          caption="Keyboard support summary"
          responsive="stack"
          data={keyboardDocs}
          getRowId={(d) => d.slug}
          columns={[
            { id: 'name', header: 'Component', rowHeader: true, cell: (d) => <a href={href(`/components/${d.slug}`)}>{d.name}</a> },
            { id: 'keys', header: 'Keys', cell: (d) => d.keyboard!.map((k) => k.keys).join(' · ') },
          ]}
        />
      </section>

      <section className="docs-section" aria-labelledby="testing">
        <h2 id="testing">How accessibility is tested</h2>
        <ul className={styles.checklist}>
          <li>Unit tests (Vitest + Testing Library) assert roles, names, states and keyboard behaviour, and run axe-core against every documentation example.</li>
          <li>Browser tests (Playwright) run axe-core with colour-contrast checks on every documentation page in light, dark and high-contrast themes.</li>
          <li><code>scripts/contrast.mjs</code> verifies theme token pairs against WCAG thresholds.</li>
        </ul>
        <h2 id="checklist">Checklist for application teams</h2>
        <ul className={styles.checklist}>
          <li>Give every page one <code>h1</code> (Page does this) and keep heading levels in order.</li>
          <li>Always pass <code>label</code> to form controls and IconButtons; use <code>hideLabel</code> rather than omitting labels.</li>
          <li>Pair status colours with text (StatusIndicator, Badge) — never rely on colour alone.</li>
          <li>Provide <code>getRowLabel</code> for selectable tables so checkboxes have meaningful names.</li>
          <li>Keep toasts for non-essential confirmations; put required actions in the page or a dialog.</li>
          <li>Test with a keyboard, a screen reader (NVDA, JAWS, VoiceOver), 200% zoom and the high-contrast theme.</li>
        </ul>
      </section>
    </Page>
  );
}
