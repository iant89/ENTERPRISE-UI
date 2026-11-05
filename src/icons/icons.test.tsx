import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../tests/utils';
import { Icon } from '../components/icon';
import { Button } from '../components/button';
import { IconButton } from '../components/icon-button';
import { Menu } from '../components/menu';
import { SideNavigation, NavigationItem } from '../components/side-navigation';
import { CommandToolbar } from '../patterns/command-toolbar';
import { FooterToolbar } from '../components/footer-toolbar';
import { IconRegistry } from './core/IconRegistry';
import { parseIconId } from './core/identifier';
import { icons } from './registry';
import { fontAwesomeIconProvider, fontIconProvider, materialIconProvider, svgIconProvider } from './providers/providers';
import { sanitizeSvg } from './providers/sanitizeSvg';
import { fontAwesomeCollection, materialCollection } from './collections/fontCollections';
import type { IconDefinition, IconRenderContext } from './core/types';

const PATH = 'M0 0h16v16H0z';

function freshRegistry() {
  return new IconRegistry()
    .addProvider('svg', svgIconProvider)
    .addProvider('font', fontIconProvider)
    .addProvider('fontawesome', fontAwesomeIconProvider)
    .addProvider('material', materialIconProvider)
    .registerCollection({ name: 'enterprise', icons: [{ name: 'edit', source: PATH, aliases: ['pencil'], metadata: { category: 'action', keywords: ['change'], codePoint: 0xe001 } }, { name: 'delete', source: PATH }] });
}

const context = (extra: Partial<IconRenderContext> = {}): IconRenderContext => ({ className: '', accessibility: { 'aria-hidden': true }, attributes: {}, ...extra });

describe('parseIconId', () => {
  it('parses names, URIs and code points', () => {
    expect(parseIconId('Edit')).toEqual({ kind: 'name', collection: undefined, name: 'edit' });
    expect(parseIconId('material://edit')).toEqual({ kind: 'name', collection: 'material', name: 'edit' });
    expect(parseIconId('&#xe08d;')).toEqual({ kind: 'codePoint', codePoint: 0xe08d });
    expect(parseIconId('U+E08D')).toEqual({ kind: 'codePoint', codePoint: 0xe08d });
    expect(parseIconId(0xe08d)).toEqual({ kind: 'codePoint', codePoint: 0xe08d });
    expect(parseIconId('  ')).toBeUndefined();
  });
});

describe('IconRegistry', () => {
  let registry: IconRegistry;
  beforeEach(() => { registry = freshRegistry(); });

  it('registers and retrieves normalized, read-only definitions', () => {
    registry.register({ collection: 'enterprise', name: 'Inventory', provider: 'svg', source: '/icons/inventory.svg' });
    const def = registry.get('enterprise://inventory')!;
    expect(def).toMatchObject({ collection: 'enterprise', name: 'inventory', uri: 'enterprise://inventory', provider: 'svg', source: { type: 'svg-url', url: '/icons/inventory.svg' } });
    expect(Object.isFrozen(def)).toBe(true);
    expect(registry.get('inventory')).toBe(def);
  });

  it('infers source types from the string shorthand', () => {
    registry.register({ name: 'a', source: PATH }).register({ name: 'b', source: '<svg viewBox="0 0 8 8"><path d="M0 0"/></svg>' });
    expect(registry.get('a')!.source.type).toBe('svg-path');
    expect(registry.get('b')!.source.type).toBe('svg-markup');
  });

  it('rejects duplicates unless override is set, with a useful error', () => {
    expect(() => registry.register({ name: 'edit', source: PATH })).toThrow('[ENTERPRISE-UI] Icon "enterprise://edit" is already registered. Pass { override: true } to replace it.');
    registry.register({ name: 'edit', source: 'M1 1', }, { override: true });
    expect(registry.get('edit')!.source).toEqual({ type: 'svg-path', d: 'M1 1' });
    expect(() => registry.registerCollection({ name: 'enterprise' })).toThrow(/already registered/);
  });

  it('unregisters icons and their aliases', () => {
    expect(registry.unregister('enterprise://edit')).toBe(true);
    expect(registry.has('edit')).toBe(false);
    expect(registry.has('pencil')).toBe(false);
    expect(registry.unregister('edit')).toBe(false);
  });

  it('registers, lists and removes collections', () => {
    registry.registerCollection({ name: 'my-app', provider: 'svg', label: 'My app', icons: [{ name: 'truck', source: PATH }] });
    expect(registry.listCollections().map((c) => c.name)).toEqual(['enterprise', 'my-app']);
    expect(registry.listCollections()[1]).toMatchObject({ label: 'My app', size: 1, loaded: true, open: false });
    expect(registry.list({ collection: 'my-app' }).map((d) => d.uri)).toEqual(['my-app://truck']);
    expect(registry.unregisterCollection('my-app')).toBe(true);
    expect(registry.has('my-app://truck')).toBe(false);
  });

  it('resolves aliases inside and across collections', () => {
    registry.registerAlias('enterprise://modify', 'enterprise://edit');
    registry.registerCollection({ name: 'brand', icons: [{ name: 'logo', source: PATH }] });
    registry.registerAlias('company-logo', 'brand://logo');
    expect(registry.get('modify')!.uri).toBe('enterprise://edit');
    expect(registry.get('enterprise://pencil')!.uri).toBe('enterprise://edit');
    expect(registry.get('company-logo')!.uri).toBe('brand://logo');
    expect(registry.get('edit')!.aliases).toEqual(['pencil', 'modify']);
    expect(() => registry.registerAlias('edit', 'delete')).toThrow(/already an icon or alias/);
  });

  it('notifies subscribers and bumps the version on changes', () => {
    const listener = vi.fn();
    const off = registry.subscribe(listener);
    const before = registry.getVersion();
    registry.register({ name: 'x', source: PATH });
    expect(listener).toHaveBeenCalledOnce();
    expect(registry.getVersion()).toBeGreaterThan(before);
    off();
  });

  it('searches names, aliases and metadata, ranked', () => {
    registry.register({ name: 'edit-document', source: PATH });
    expect(registry.search('edit').map((d) => d.name)).toEqual(['edit', 'edit-document']);
    expect(registry.search('pencil')[0].name).toBe('edit');
    expect(registry.search('change')[0].name).toBe('edit');
    expect(registry.search('nothing-like-this')).toEqual([]);
  });
});

describe('IconResolver', () => {
  let registry: IconRegistry;
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => { registry = freshRegistry(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
  afterEach(() => warn.mockRestore());

  it('resolves simple names, URIs, collections, aliases and code points to a definition and provider', () => {
    for (const id of ['edit', 'enterprise://edit', 'enterprise://pencil', '&#xe001;']) {
      const r = registry.resolve(id);
      expect(r.status).toBe('resolved');
      if (r.status === 'resolved') { expect(r.definition.uri).toBe('enterprise://edit'); expect(r.provider).toBe(svgIconProvider); }
    }
    registry.registerCollection({ name: 'brand', icons: [{ name: 'logo', source: PATH }] });
    expect(registry.resolve('logo', { collection: 'brand' }).status).toBe('resolved');
  });

  it('reports unknown icons and collections, warning once', () => {
    const unknown = registry.resolve('enterprise://does-not-exist');
    expect(unknown).toMatchObject({ status: 'missing', requested: 'enterprise://does-not-exist' });
    registry.resolve('enterprise://does-not-exist');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('[ENTERPRISE-UI] Unknown icon: enterprise://does-not-exist');
    expect(registry.resolve('nope://edit')).toMatchObject({ status: 'missing', reason: 'unknown collection "nope"' });
  });

  it('uses a configurable fallback', () => {
    registry.setFallback('enterprise://delete');
    const r = registry.resolve('missing-icon');
    expect(r.status).toBe('resolved');
    if (r.status === 'resolved') expect(r.definition.name).toBe('delete');
    expect(registry.get('missing-icon')).toBeUndefined();
  });

  it('loads lazy collections on first use', async () => {
    let finish!: () => void;
    registry.registerCollection({ name: 'lazy', load: () => new Promise((resolve) => { finish = () => resolve({ icons: [{ name: 'star', source: PATH }] }); }) });
    expect(registry.resolve('lazy://star').status).toBe('pending');
    finish();
    await registry.preload('lazy');
    expect(registry.resolve('lazy://star').status).toBe('resolved');
  });

  it('resolves open collections for any valid name', () => {
    registry.registerCollection(materialCollection());
    registry.registerCollection(fontAwesomeCollection({ aliases: { edit: 'pen' } }));
    expect(registry.get('material://arrow-back')!.source).toEqual({ type: 'material', ligature: 'arrow_back', className: undefined });
    expect(registry.get('fontawesome://edit')!.source).toMatchObject({ type: 'fontawesome', icon: 'pen' });
    expect(registry.get('fa://trash')!.uri).toBe('fontawesome://trash');
  });
});

describe('providers', () => {
  const def = (source: IconDefinition['source'], extra: Partial<IconDefinition> = {}): IconDefinition =>
    ({ collection: 'test', name: 'x', uri: 'test://x', provider: 'svg', source, aliases: [], metadata: {}, ...extra });

  it('SVG: draws paths with currentColor and a view box', () => {
    const { container } = render(svgIconProvider.render(def({ type: 'svg-path', d: [PATH, 'M1 1'] }), context({ size: 20, title: 'Tip' })));
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('fill', 'currentColor');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg.querySelectorAll('path')).toHaveLength(2);
    expect(svg.querySelector('title')).toHaveTextContent('Tip');
  });

  it('SVG: sanitizes markup (no scripts, handlers, links or styles)', () => {
    const markup = '<svg viewBox="0 0 10 10" onload="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)"><path d="M0 0"/></a><path d="M1 1" onclick="x()" style="fill:red" fill="url(http://evil)"/><circle cx="5" cy="5" r="2"/><foreignObject><div/></foreignObject></svg>';
    const safe = sanitizeSvg(markup);
    expect(safe.viewBox).toBe('0 0 10 10');
    expect(safe.nodes).toEqual([{ tag: 'path', attributes: { d: 'M1 1' }, children: [] }, { tag: 'circle', attributes: { cx: '5', cy: '5', r: '2' }, children: [] }]);
    const { container } = render(svgIconProvider.render(def({ type: 'svg-markup', markup }), context()));
    expect(container.innerHTML).not.toMatch(/script|onload|onclick|javascript|foreignObject|style=/i);
  });

  it('SVG: fetches a URL once and caches it', async () => {
    const fetchMock = vi.fn(async () => new Response('<svg viewBox="0 0 16 16"><path d="M2 2"/></svg>'));
    vi.stubGlobal('fetch', fetchMock);
    const d = def({ type: 'svg-url', url: '/icons/once.svg' });
    expect(svgIconProvider.isReady!(d)).toBe(false);
    await Promise.all([svgIconProvider.load!(d), svgIconProvider.load!(d)]);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(svgIconProvider.isReady!(d)).toBe(true);
    const { container } = render(svgIconProvider.render(d, context()));
    expect(container.querySelector('path')).toHaveAttribute('d', 'M2 2');
    vi.unstubAllGlobals();
  });

  it('font: draws a glyph in the given font', () => {
    const { container } = render(fontIconProvider.render(def({ type: 'glyph', glyph: '', fontFamily: 'SAP-icons' }, { provider: 'font' }), context()));
    const span = container.querySelector('span')!;
    expect(span).toHaveTextContent('');
    expect(span.style.fontFamily).toBe('SAP-icons');
    expect(span).toHaveAttribute('aria-hidden', 'true');
  });

  it('Font Awesome: uses Font Awesome classes', () => {
    const { container } = render(fontAwesomeIconProvider.render(def({ type: 'fontawesome', icon: 'pen', style: 'regular' }), context()));
    expect(container.firstElementChild!.className).toContain('fa-regular fa-pen');
  });

  it('Material: uses the ligature and font class', () => {
    const { container } = render(materialIconProvider.render(def({ type: 'material', ligature: 'edit' }), context()));
    expect(container.firstElementChild).toHaveTextContent('edit');
    expect(container.firstElementChild!.className).toContain('material-symbols-outlined');
  });

  it('custom providers render without changing the Icon component', () => {
    const registry = freshRegistry();
    registry.addProvider('emoji', {
      canRender: (d) => d.provider === 'emoji',
      render: (d, ctx) => <span className={ctx.className} {...ctx.accessibility}>{String((d.source as { data: unknown }).data)}</span>,
    });
    registry.register({ collection: 'emoji', name: 'truck', provider: 'emoji', source: '🚚' });
    const r = registry.resolve('emoji://truck');
    expect(r.status).toBe('resolved');
    if (r.status === 'resolved') expect(render(r.provider.render(r.definition, context())).container).toHaveTextContent('🚚');
  });
});

describe('<Icon>', () => {
  afterEach(() => { icons.setFallback(null); });

  it('renders the enterprise icon for a name, URI, alias or sap-icon:// URI', () => {
    const { container } = render(<><Icon name="edit" /><Icon name="enterprise://edit" /><Icon name="pencil" /><Icon name="sap-icon://edit" /></>);
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(4);
    svgs.forEach((svg) => expect(svg).toHaveAttribute('data-icon', 'enterprise://edit'));
  });

  it('updates when name, size, color or collection change', () => {
    icons.registerCollection({ name: 'test-brand', icons: [{ name: 'edit', source: 'M3 3' }] }, { override: true });
    const { container, rerender } = render(<Icon name="edit" size="sm" />);
    const svg = () => container.querySelector('svg')!;
    expect(svg().getAttribute('class')).toContain('eui-icon-size-sm');
    expect(svg()).toHaveAttribute('width', '14');
    rerender(<Icon name="delete" size={18} color="red" />);
    expect(svg()).toHaveAttribute('data-icon', 'enterprise://delete');
    expect(svg()).toHaveAttribute('width', '18');
    expect(svg().style.color).toBe('red');
    rerender(<Icon name="edit" collection="test-brand" size="2rem" />);
    expect(svg()).toHaveAttribute('data-icon', 'test-brand://edit');
    expect(svg()).toHaveAttribute('width', '2rem');
    icons.unregisterCollection('test-brand');
  });

  it('is decorative without a label and an image with one; a title alone is only a tooltip', async () => {
    const { container, rerender } = renderWithTheme(<Icon name="warning" title="Careful" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('title')).toHaveTextContent('Careful');
    rerender(<Icon name="warning" label="Warning" />);
    expect(screen.getByRole('img', { name: 'Warning' })).toBeInTheDocument();
    rerender(<Icon name="warning" aria-label="Warning" decorative />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    rerender(<Icon name="warning" label="Warning" />);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('forwards refs and attributes, and marks disabled and mirrored icons', () => {
    const ref = createRef<Element>();
    const { container } = render(<Icon ref={ref} name="nav-back" id="back" data-testid="b" disabled />);
    const svg = container.querySelector('svg')!;
    expect(ref.current).toBe(svg);
    expect(svg).toHaveAttribute('id', 'back');
    expect(svg.getAttribute('class')).toMatch(/eui-icon-disabled/);
    expect(svg.getAttribute('class')).toMatch(/eui-icon-rtl-flip/);
  });

  it('keeps its space for unknown icons, warns once, and uses the fallback when set', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container, rerender } = render(<Icon name={'enterprise://does-not-exist' as never} label="Thing" />);
    const placeholder = container.firstElementChild!;
    expect(placeholder).toHaveAttribute('data-icon-status', 'missing');
    expect(placeholder).toHaveAttribute('aria-label', 'Thing');
    expect(warn.mock.calls.some((c) => String(c[0]).includes('Unknown icon: enterprise://does-not-exist'))).toBe(true);
    icons.setFallback('enterprise://sys-help');
    rerender(<Icon name={'enterprise://also-missing' as never} />);
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'enterprise://sys-help');
    warn.mockRestore();
  });

  it('re-renders when a lazy collection finishes loading', async () => {
    let finish!: () => void;
    icons.registerCollection({ name: 'later', load: () => new Promise((resolve) => { finish = () => resolve({ icons: [{ name: 'star', source: PATH }] }); }) });
    const { container } = render(<Icon name="later://star" />);
    expect(container.firstElementChild).toHaveAttribute('data-icon-status', 'pending');
    await act(async () => { finish(); });
    await waitFor(() => expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'later://star'));
    icons.unregisterCollection('later');
  });

  it('draws icons from other providers through the same API', () => {
    icons.registerCollection(materialCollection(), { override: true });
    const { container } = render(<Icon name="material://edit" label="Edit" />);
    expect(screen.getByRole('img', { name: 'Edit' })).toHaveTextContent('edit');
    expect(container.firstElementChild!.className).toContain('material-symbols-outlined');
    icons.unregisterCollection('material');
  });
});

describe('components consume icon identifiers', () => {
  it('Button and IconButton', () => {
    const { container } = renderWithTheme(<><Button icon="enterprise://save">Save</Button><IconButton icon="delete" label="Delete" /></>);
    expect(screen.getByRole('button', { name: 'Save' }).querySelector('svg')).toHaveAttribute('data-icon', 'enterprise://save');
    expect(screen.getByRole('button', { name: 'Delete' }).querySelector('svg')).toHaveAttribute('data-icon', 'enterprise://delete');
    expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(2);
  });

  it('keeps the Button API when the icon comes from another provider', () => {
    icons.registerCollection(fontAwesomeCollection(), { override: true });
    renderWithTheme(<Button icon="fontawesome://pen">Edit</Button>);
    expect(screen.getByRole('button', { name: 'Edit' }).querySelector('.fa-pen')).not.toBeNull();
    icons.unregisterCollection('fontawesome');
  });

  it('toolbars, menus and navigation', () => {
    renderWithTheme(
      <>
        <CommandToolbar title="Orders" actions={[{ id: 'add', label: 'Add', icon: 'add' }]} />
        <FooterToolbar actions={[{ id: 'del', label: 'Delete', display: 'icon', icon: 'delete' }]} />
        <Menu aria-label="Row" items={[{ id: 'copy', label: 'Copy', icon: 'copy' }]} />
        <SideNavigation aria-label="Main"><NavigationItem id="home" label="Home" icon="home" href="#" /></SideNavigation>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Add' }).querySelector('[data-icon="enterprise://add"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Delete' }).querySelector('[data-icon="enterprise://delete"]')).not.toBeNull();
    expect(screen.getByRole('menuitem', { name: 'Copy' }).querySelector('[data-icon="enterprise://copy"]')).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Home' }).querySelector('[data-icon="enterprise://home"]')).not.toBeNull();
  });

  it('elements still work', () => {
    renderWithTheme(<Button icon={<Icon name="add" />}>Create</Button>);
    expect(screen.getByRole('button', { name: 'Create' }).querySelector('svg')).toHaveAttribute('data-icon', 'enterprise://add');
  });
});

describe('the enterprise collection', () => {
  it('is loaded lazily with every SVG in src/assets/icons plus the standard aliases', () => {
    const info = icons.listCollections().find((c) => c.name === 'enterprise')!;
    expect(info).toMatchObject({ provider: 'svg', schemes: ['sap-icon'], loaded: true });
    expect(info.size).toBe(704);
    for (const name of ['add', 'remove', 'delete', 'edit', 'save', 'cancel', 'close', 'check', 'search', 'settings', 'menu', 'more', 'filter', 'sort', 'refresh', 'download', 'upload', 'copy', 'open', 'external-link', 'warning', 'error', 'information', 'success', 'help', 'home', 'user', 'calendar', 'clock', 'folder', 'file', 'dashboard', 'back', 'forward', 'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right']) {
      expect(icons.has(name), name).toBe(true);
    }
    expect(icons.get('&#xe08d;')!.name).toBe('bar-code');
  });

  it('loads categories and keywords for search on request', async () => {
    await icons.preload('enterprise', { metadata: true });
    expect(icons.get('bar-code')!.metadata.keywords).toContain('scan');
    expect(icons.search('barcode')[0].name).toBe('bar-code');
  });
});
