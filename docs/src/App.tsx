import { useEffect, useMemo, useRef, type ReactElement } from 'react';
import { AppShell, ApplicationHeader, ComboBox, DropdownMenu, IconButton, NavigationGroup, NavigationItem, SideNavigation, ThemeProvider, ToastProvider, ToggleButton, Tooltip, type ThemePreference, IconProvider } from '@enterprise-ui/react';
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
import { IconsPage } from './pages/Icons';
import { Layouts } from './pages/Layouts';
import { Patterns } from './pages/Patterns';
import { AccessibilityPage } from './pages/Accessibility';
import { ApiReference } from './pages/ApiReference';
import { NotFound } from './pages/NotFound';
import { PlaygroundPage } from './pages/PlaygroundPage';
import InventoryApp from '../../examples/apps/InventoryApp';

const PAGES = [
  { path: '/', label: 'Overview', icon: IconProvider.getIcon('course-book') },
  { path: '/getting-started', label: 'Getting started', icon: IconProvider.getIcon('begin') },
  { path: '/tokens', label: 'Design tokens', icon: IconProvider.getIcon('palette') },
  { path: '/themes', label: 'Themes', icon: IconProvider.getIcon('palette') },
  { path: '/icons', label: 'Icons', icon: IconProvider.getIcon('grid') },
  { path: '/components', label: 'Components', icon: IconProvider.getIcon('puzzle') },
  { path: '/gallery', label: 'Component gallery', icon: IconProvider.getIcon('grid') },
  { path: '/layouts', label: 'Layouts', icon: IconProvider.getIcon('screen-split-one') },
  { path: '/patterns', label: 'Enterprise patterns', icon: IconProvider.getIcon('process') },
  { path: '/accessibility', label: 'Accessibility', icon: IconProvider.getIcon('accessibility') },
  { path: '/api', label: 'API reference', icon: IconProvider.getIcon('source-code') },
];

const THEME_ICONS: Record<ThemePreference, ReactElement> = {
  light: IconProvider.getIcon('light-mode'),
  dark: IconProvider.getIcon('dark-mode'),
  'high-contrast': IconProvider.getIcon('color-fill'),
  'sap-horizon': IconProvider.getIcon('light-mode'),
  'sap-horizon-dark': IconProvider.getIcon('dark-mode'),
  'sap-fiori-3': IconProvider.getIcon('light-mode'),
  'sap-fiori-3-dark': IconProvider.getIcon('dark-mode'),
  system: IconProvider.getIcon('sys-monitor'),
};

function renderPage(path: string) {
  if (path === '/') return <Overview />;
  if (path === '/getting-started') return <GettingStarted />;
  if (path === '/tokens') return <Tokens />;
  if (path === '/themes') return <Themes />;
  if (path === '/icons') return <IconsPage />;
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
  path === '/demo' || path.startsWith('/demo/') ? 'Northwind Inventory demo' :
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

  if (path === '/demo' || path.startsWith('/demo/')) {
    // Each demo page has its own sub-route (#/demo/<page>) so reload and back keep it; #/demo opens Products.
    const demoPage = path.split('/')[2] || 'products';
    return (
      <ThemeProvider theme={theme} density={density} style={{ height: '100%' }}>
        <ToastProvider>
          <InventoryApp
            fullHeight
            page={demoPage}
            onPageChange={(next) => navigate(`/demo/${next}`)}
            theme={theme}
            onThemeChange={setTheme}
            density={density}
            onDensityChange={setDensity}
          />
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
              logo={IconProvider.getIcon('sap-box', { color: "var(--eui-color-primary)" })}
              homeHref={href('/')}
              user={{ name: 'Guest' }}
              userMenuItems={[{ id: '/getting-started', label: 'Getting started' }, { id: 'studio', label: 'Open Studio' }]}
              onUserAction={(id) => (id === 'studio' ? window.location.assign('studio/') : navigate(id))}
              helpItems={[{ id: '/getting-started', label: 'Getting started' }, { id: '/accessibility', label: 'Accessibility' }, { id: '/api', label: 'API reference' }]}
              onHelpAction={(id) => navigate(id)}
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
                      icon={IconProvider.getIcon('table-row')}
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
                      { id: 'light', label: 'Light', icon: IconProvider.getIcon('light-mode'), checked: theme === 'light' },
                      { id: 'dark', label: 'Dark', icon: IconProvider.getIcon('dark-mode'), checked: theme === 'dark' },
                      { id: 'high-contrast', label: 'High contrast', icon: IconProvider.getIcon('color-fill'), checked: theme === 'high-contrast' },
                      { type: 'separator' },
                      { type: 'label', label: 'SAP Fiori' },
                      { id: 'sap-horizon', label: 'Morning Horizon', icon: IconProvider.getIcon('light-mode'), checked: theme === 'sap-horizon' },
                      { id: 'sap-horizon-dark', label: 'Evening Horizon', icon: IconProvider.getIcon('dark-mode'), checked: theme === 'sap-horizon-dark' },
                      { id: 'sap-fiori-3', label: 'Quartz Light', icon: IconProvider.getIcon('light-mode'), checked: theme === 'sap-fiori-3' },
                      { id: 'sap-fiori-3-dark', label: 'Quartz Dark', icon: IconProvider.getIcon('dark-mode'), checked: theme === 'sap-fiori-3-dark' },
                      { type: 'separator' },
                      { id: 'system', label: 'Match system', icon: IconProvider.getIcon('sys-monitor'), checked: theme === 'system' },
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
                {PAGES.slice(2, 5).map((p) => (
                  <NavigationItem key={p.path} id={p.path} label={p.label} icon={p.icon} href={href(p.path)} />
                ))}
                <NavigationItem id="/accessibility" label="Accessibility" icon={IconProvider.getIcon('accessibility')} href={href('/accessibility')} />
              </NavigationGroup>
              <NavigationGroup label="Components">
                <NavigationItem id="/components" label="All components" icon={IconProvider.getIcon('puzzle')} href={href('/components')} />
                <NavigationItem id="/playground" label="Playground" icon={IconProvider.getIcon('source-code')} href={href('/playground')} />
                <NavigationItem id="studio" label="Studio" icon={IconProvider.getIcon('draw-rectangle')} href="studio/" />
                <NavigationItem id="/gallery" label="Gallery" icon={IconProvider.getIcon('grid')} href={href('/gallery')} />
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
                <NavigationItem id="/layouts" label="Layouts" icon={IconProvider.getIcon('screen-split-one')} href={href('/layouts')} />
                <NavigationItem id="/patterns" label="Enterprise patterns" icon={IconProvider.getIcon('process')} href={href('/patterns')} />
                <NavigationItem id="/api" label="API reference" icon={IconProvider.getIcon('source-code')} href={href('/api')} />
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
  Layout: IconProvider.getIcon('header'),
  Navigation: IconProvider.getIcon('locate-me'),
  Buttons: IconProvider.getIcon('cursor-arrow'),
  Forms: IconProvider.getIcon('form'),
  'Data display': IconProvider.getIcon('table-view'),
  Charts: IconProvider.getIcon('vertical-bar-chart-2'),
  Feedback: IconProvider.getIcon('message-warning'),
  Patterns: IconProvider.getIcon('screen-split-three'),
} as const;

