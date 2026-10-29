import { Grid, MessageStrip, Page, ThemeProvider } from '@enterprise-ui/react';
import { CodeBlock } from '../components/CodeBlock';
import { ThemeSample } from './ThemeSample';
import styles from './Pages.module.css';

const usage = `// Whole app
<ThemeProvider theme="dark" density="compact">…</ThemeProvider>

// Follow the operating system (light / dark / increased contrast)
<ThemeProvider theme="system">…</ThemeProvider>

// Themes can be nested — e.g. a dark preview inside a light page
<ThemeProvider theme="light">
  <ThemeProvider theme="dark" transparent>…</ThemeProvider>
</ThemeProvider>

// Read the active theme and density
const { resolvedTheme, density } = useTheme();`;

const custom = `/* Brand a theme by overriding tokens on any themed element */
[data-eui-theme='light'].my-brand {
  --eui-color-primary: #1b5e20;
  --eui-color-primary-hover: #134a17;
  --eui-color-primary-active: #0d3a11;
  --eui-color-primary-subtle: #e8f5e9;
  --eui-color-link: #1b5e20;
  --eui-color-focus: #1b5e20;
}

<ThemeProvider theme="light" className="my-brand">…</ThemeProvider>`;

export function Themes() {
  return (
    <Page
      title="Themes"
      subtitle="Light, dark and high-contrast themes plus cozy and compact densities — switchable at runtime, scoped to any subtree."
      breadcrumbs={[{ label: 'Docs', href: '#/' }, { label: 'Foundations' }, { label: 'Themes' }]}
    >
      <section className="docs-section" aria-labelledby="themes-compare">
        <h2 id="themes-compare">Side by side</h2>
        <Grid columns={{ base: 1, md: 3 }} gap={4}>
          {(['light', 'dark', 'high-contrast'] as const).map((theme) => (
            <ThemeProvider key={theme} theme={theme} className={styles.themePreview}>
              <h3 className={styles.themeLabel}>{theme === 'high-contrast' ? 'High contrast' : theme[0].toUpperCase() + theme.slice(1)}</h3>
              <ThemeSample />
            </ThemeProvider>
          ))}
        </Grid>
      </section>
      <section className="docs-section" aria-labelledby="themes-density">
        <h2 id="themes-density">Density</h2>
        <p className="docs-muted" style={{ margin: 0 }}>
          Cozy (default) uses 36px controls and 44px rows for touch. Compact uses 28px controls and 32px rows for mouse-driven, data-heavy screens.
        </p>
        <Grid columns={{ base: 1, md: 2 }} gap={4}>
          {(['cozy', 'compact'] as const).map((density) => (
            <ThemeProvider key={density} density={density} className={styles.themePreview}>
              <h3 className={styles.themeLabel}>{density === 'cozy' ? 'Cozy' : 'Compact'}</h3>
              <ThemeSample />
            </ThemeProvider>
          ))}
        </Grid>
      </section>
      <section className="docs-section" aria-labelledby="themes-usage">
        <h2 id="themes-usage">Usage</h2>
        <CodeBlock code={usage} label="Theme usage" />
        <h2 id="themes-custom">Custom branding</h2>
        <CodeBlock code={custom} language="css" label="Custom theme" />
        <MessageStrip tone="warning" title="Check contrast:">
          When overriding colour tokens, keep text at 4.5:1 and interactive borders and focus indicators at 3:1 against their backgrounds.
          The repository includes <code>node scripts/contrast.mjs</code> to verify theme pairs.
        </MessageStrip>
        <h2 id="themes-motion">Reduced motion</h2>
        <p className="docs-muted" style={{ margin: 0 }}>
          All motion durations are tokens. They drop to 0ms when the OS requests reduced motion, or when you pass <code>reducedMotion</code> to
          ThemeProvider. Spinners and progress indicators slow down instead of stopping so state remains perceivable.
        </p>
      </section>
    </Page>
  );
}
