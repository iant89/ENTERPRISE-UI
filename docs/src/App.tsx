import { useEffect, useMemo, useRef, type ReactElement } from 'react';
import {
  Accessibility, BookOpen, Boxes, Code2, Component, LayoutDashboard, LayoutTemplate, Palette, Rocket, SwatchBook, Workflow,
  Moon, Sun, Contrast, Monitor, Rows3, Columns3, FormInput, MousePointerClick, Navigation, PanelsTopLeft, Table2, MessageSquareWarning,
} from 'lucide-react';
import {
  AppShell, ApplicationHeader, ComboBox, DropdownMenu, IconButton, NavigationGroup, NavigationItem, SideNavigation, ThemeProvider,
  ToastProvider, ToggleButton, Tooltip, type ThemePreference,
} from '@enterprise-ui/react';
import { categories, docs } from './registry';
import { href, navigate, usePath } from './router';
import { useDocsSettings } from './settings';
import { Overview } from './pages/Overview';
import { GettingStarted } from './pages/GettingStarted';
import { Tokens } from './pages/Tokens';
import { Themes } from './pages/Themes';
import { ComponentsIndex } from './pages/ComponentsIndex';
import { ComponentPage } from './pages/ComponentPage';
import { Gallery } from './pages/Gallery';
import { Layouts } from './pages/Layouts';
import { Patterns } from './pages/Patterns';
import { AccessibilityPage } from './pages/Accessibility';
import { ApiReference } from './pages/ApiReference';
import { NotFound } from './pages/NotFound';
import { PlaygroundPage } from './pages/PlaygroundPage';
import InventoryApp from '../../examples/apps/InventoryApp';

const PAGES = [
  { path: '/', label: 'Overview', icon: <BookOpen /> },
  { path: '/getting-started', label: 'Getting started', icon: <Rocket /> },
  { path: '/tokens', label: 'Design tokens', icon: <SwatchBook /> },
  { path: '/themes', label: 'Themes', icon: <Palette /> },
  { path: '/components', label: 'Components', icon: <Component /> },
  { path: '/gallery', label: 'Component gallery', icon: <LayoutDashboard /> },
  { path: '/layouts', label: 'Layouts', icon: <LayoutTemplate /> },
  { path: '/patterns', label: 'Enterprise patterns', icon: <Workflow /> },
  { path: '/accessibility', label: 'Accessibility', icon: <Accessibility /> },
  { path: '/api', label: 'API reference', icon: <Code2 /> },
];

const THEME_ICONS: Record<ThemePreference, ReactElement> = { light: <Sun />, dark: <Moon />, 'high-contrast': <Contrast />, system: <Monitor /> };

function renderPage(path: string) {
  if (path === '/') return <Overview />;
  if (path === '/getting-started') return <GettingStarted />;
  if (path === '/tokens') return <Tokens />;
  if (path === '/themes') return <Themes />;
  if (path === '/components') return <ComponentsIndex />;
  if (path.startsWith('/components/')) return <ComponentPage slug={path.slice('/components/'.length)} />;
  if (path === '/gallery') return <Gallery />;
  if (path === '/layouts') return <Layouts />;
  if (path === '/patterns') return <Patterns />;
  if (path === '/accessibility') return <AccessibilityPage />;
  if (path === '/api') return <ApiReference />;
  return <NotFound />;
}

const titleFor = (path: string) =>
  PAGES.find((p) => p.path === path)?.label ?? docs.find((d) => path === `/components/${d.slug}`)?.name ?? 'Not found';

export function App() {
  const path = usePath();
  const { theme, setTheme, density, setDensity } = useDocsSettings();
  const firstRender = useRef(true);

  // Route change: reset scroll, update the title and move focus to the new page heading.
  useEffect(() => {
    document.title = `${titleFor(path)} · Enterprise UI Kit`;
    const main = document.getElementById('main-content');
    main?.scrollTo?.({ top: 0 });
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    requestAnimationFrame(() => {
      const h1 = main?.querySelector<HTMLElement>('h1');
      if (h1) {
        h1.tabIndex = -1;
        h1.focus({ preventScroll: true });
      }
    });
  }, [path]);

  const searchOptions = useMemo(
    () => [
      ...PAGES.map((p) => ({ value: p.path, label: p.label, group: 'Pages' })),
      ...docs.map((d) => ({ value: `/components/${d.slug}`, label: d.name, description: d.category, group: 'Components' })),
    ],
    [],
  );

  if (path === '/playground' || path.startsWith('/playground/')) {
    return <ThemeProvider theme={theme} density={density} style={{ height: '100%' }}><PlaygroundPage initialSlug={path.split('/')[2] || 'button'} theme={theme} density={density} /></ThemeProvider>;
  }

  if (path === '/demo') {
    return (
      <ThemeProvider theme={theme} density={density} style={{ height: '100%' }}>
        <ToastProvider>
          <InventoryApp fullHeight />
        </ToastProvider>
      </ThemeProvider>
    );
  }

  const activeId = path;

  return (
    <ThemeProvider theme={theme} density={density} style={{ height: '100%' }}>
      <ToastProvider>
        <AppShell
          header={
            <ApplicationHeader
              productName="Enterprise UI Kit"
              secondaryTitle="v0.1"
              logo={<Boxes color="var(--eui-color-primary)" />}
              homeHref={href('/')}
              search={
                <ComboBox
                  aria-label="Search documentation"
                  placeholder="Search components and pages…"
                  size="sm"
                  options={searchOptions}
                  value={null}
                  clearable={false}
                  onChange={(value) => value && navigate(value)}
                />
              }
              actions={
                <>
                  <Tooltip content={density === 'compact' ? 'Compact density' : 'Cozy density'}>
                    <ToggleButton
                      variant="tertiary"
                      aria-label="Compact density"
                      icon={<Rows3 />}
                      pressed={density === 'compact'}
                      onPressedChange={(on) => setDensity(on ? 'compact' : 'cozy')}
                    />
                  </Tooltip>
                  <DropdownMenu
                    placement="bottom-end"
                    aria-label="Theme"
                    onAction={(id) => setTheme(id as ThemePreference)}
                    items={[
                      { type: 'label', label: 'Theme' },
                      { id: 'light', label: 'Light', icon: <Sun />, checked: theme === 'light' },
                      { id: 'dark', label: 'Dark', icon: <Moon />, checked: theme === 'dark' },
                      { id: 'high-contrast', label: 'High contrast', icon: <Contrast />, checked: theme === 'high-contrast' },
                      { id: 'system', label: 'Match system', icon: <Monitor />, checked: theme === 'system' },
                    ]}
                    trigger={<IconButton icon={THEME_ICONS[theme]} label="Change theme" neutral hideTitle />}
                  />
                </>
              }
            />
          }
          navigation={
            <SideNavigation activeId={activeId} aria-label="Documentation">
              {PAGES.slice(0, 2).map((p) => (
                <NavigationItem key={p.path} id={p.path} label={p.label} icon={p.icon} href={href(p.path)} />
              ))}
              <NavigationGroup label="Foundations">
                {PAGES.slice(2, 4).map((p) => (
                  <NavigationItem key={p.path} id={p.path} label={p.label} icon={p.icon} href={href(p.path)} />
                ))}
                <NavigationItem id="/accessibility" label="Accessibility" icon={<Accessibility />} href={href('/accessibility')} />
              </NavigationGroup>
              <NavigationGroup label="Components">
                <NavigationItem id="/components" label="All components" icon={<Component />} href={href('/components')} />
                <NavigationItem id="/playground" label="Playground" icon={<Code2 />} href={href('/playground')} />
                <NavigationItem id="/gallery" label="Gallery" icon={<LayoutDashboard />} href={href('/gallery')} />
                {categories.map((c) => (
                  <NavigationItem key={c.id} id={`cat-${c.id}`} label={c.id} icon={CATEGORY_ICONS[c.id]}>
                    {docs
                      .filter((d) => d.category === c.id)
                      .map((d) => (
                        <NavigationItem key={d.slug} id={`/components/${d.slug}`} label={d.name} href={href(`/components/${d.slug}`)} />
                      ))}
                  </NavigationItem>
                ))}
              </NavigationGroup>
              <NavigationGroup label="Guides">
                <NavigationItem id="/layouts" label="Layouts" icon={<LayoutTemplate />} href={href('/layouts')} />
                <NavigationItem id="/patterns" label="Enterprise patterns" icon={<Workflow />} href={href('/patterns')} />
                <NavigationItem id="/api" label="API reference" icon={<Code2 />} href={href('/api')} />
              </NavigationGroup>
            </SideNavigation>
          }
        >
          {renderPage(path)}
        </AppShell>
      </ToastProvider>
    </ThemeProvider>
  );
}

const CATEGORY_ICONS = {
  Layout: <PanelsTopLeft />,
  Navigation: <Navigation />,
  Buttons: <MousePointerClick />,
  Forms: <FormInput />,
  'Data display': <Table2 />,
  Feedback: <MessageSquareWarning />,
  Patterns: <Columns3 />,
} as const;

