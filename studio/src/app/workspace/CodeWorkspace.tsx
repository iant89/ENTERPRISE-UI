import { useEffect, useState, type Dispatch, type ReactNode } from 'react';
import { Button, IconButton } from '@enterprise-ui/react';
import { cx } from '../../../../src/utilities/cx';
import { ActivityTabs, ACTIVITY_META, ACTIVITY_PANEL_ID, activityTabId } from './ActivityTabs';
import { EditorTabs } from './EditorTabs';
import { Splitter } from './Splitter';
import { StatusBar, type StatusBarProps } from './StatusBar';
import type { ReferenceSet } from '../../panels/bottom/ReferencesPanel';
import { BottomPanel, type Problem } from '../../panels/bottom/BottomPanel';
import type { ConsoleEntry } from '../../preview/console';
import { SIZE_LIMITS, type Activity, type Breakpoint, type LayoutAction, type LayoutState, type MobileTab, type TabletLayout } from './layout';
import styles from './CodeWorkspace.module.css';
import addSvg from '../../../../src/assets/icons/add.svg?raw';
import closeCommandFieldSvg from '../../../../src/assets/icons/close-command-field.svg?raw';
import commandLineInterfacesSvg from '../../../../src/assets/icons/command-line-interfaces.svg?raw';
import documentsSvg from '../../../../src/assets/icons/documents.svg?raw';
import openCommandFieldSvg from '../../../../src/assets/icons/open-command-field.svg?raw';
import pushpinOffSvg from '../../../../src/assets/icons/pushpin-off.svg?raw';
import pushpinOnSvg from '../../../../src/assets/icons/pushpin-on.svg?raw';
import screenSplitTwoSvg from '../../../../src/assets/icons/screen-split-two.svg?raw';
import showSvg from '../../../../src/assets/icons/show.svg?raw';
import sourceCodeSvg from '../../../../src/assets/icons/source-code.svg?raw';
import toasterUpSvg from '../../../../src/assets/icons/toaster-up.svg?raw';
import { svgIcon } from '../../../../src/icons/svgIcon';

export interface CodeWorkspaceProps {
  breakpoint: Breakpoint;
  layout: LayoutState;
  dispatchLayout: Dispatch<LayoutAction>;
  menuBar: ReactNode;
  /** Messages shown above the editor (storage, example, migration). */
  strips?: ReactNode;
  /** The Explorer (FileTree). */
  explorer: ReactNode;
  /** The Search activity (C2). */
  search?: ReactNode;
  /** Overlays: Quick Open and rename/move feedback (C2). */
  overlays?: ReactNode;
  editor: ReactNode;
  /**
   * C3 desktop: the editor groups, each with its own tab strip. Gets the sidebar toggle and the
   * show-preview button to place in the first and last group's strip. Replaces the single tab row.
   */
  groupsEditor?: (chrome: { leading: ReactNode; trailing: ReactNode }) => ReactNode;
  /** C3: references pinned to the bottom panel. */
  references?: ReferenceSet | null;
  onOpenReference?: (path: string, line: number, column: number) => void;
  onClearReferences?: () => void;
  /** PreviewPane with the iframe; always mounted. */
  preview: ReactNode;
  tabs: readonly string[];
  activePath: string;
  dirty: ReadonlySet<string>;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
  problems: Problem[];
  onGoToProblem: (p: Problem) => void;
  /** C4: preview console. */
  consoleEntries?: readonly ConsoleEntry[];
  onClearConsole?: () => void;
  consoleDropped?: number;
  onOpenSource?: (path: string, line: number | null, column: number | null) => void;
  status: StatusBarProps;
  /** C5: the Components activity header "+" (Create component). */
  onCreateComponent?: () => void;
  /** C5 decision 5a: actions at the end of the editor tab row (single-row layouts). */
  tabActions?: ReactNode;
  /** C6: the Components activity (catalog). */
  components?: ReactNode;
  /** C6 seam for C7: the component whose docs page is open (placeholder heading until C7). */
  docsTitle?: string | null;
  /** C7: the real Docs panel, rendered in the sidebar (pinned=false) or the pinned column. */
  docs?: (pinned: boolean) => ReactNode;
  /** C7: Component Docs bottom tab content. */
  componentDocs?: ReactNode;
}

const MOBILE_TABS: { id: MobileTab; label: string; icon: ReactNode }[] = [
  { id: 'files', label: 'Files', icon: svgIcon(documentsSvg, 'documents', { 'aria-hidden': "true" }) },
  { id: 'code', label: 'Code', icon: svgIcon(sourceCodeSvg, 'source-code', { 'aria-hidden': "true" }) },
  { id: 'preview', label: 'Preview', icon: svgIcon(showSvg, 'show', { 'aria-hidden': "true" }) },
  { id: 'panel', label: 'Panel', icon: svgIcon(commandLineInterfacesSvg, 'command-line-interfaces', { 'aria-hidden': "true" }) },
];
const TABLET_LAYOUTS: { id: TabletLayout; label: string; icon: ReactNode }[] = [
  { id: 'split', label: 'Split', icon: svgIcon(screenSplitTwoSvg, 'screen-split-two', { 'aria-hidden': "true" }) },
  { id: 'editor', label: 'Editor', icon: svgIcon(sourceCodeSvg, 'source-code', { 'aria-hidden': "true" }) },
  { id: 'preview', label: 'Preview', icon: svgIcon(showSvg, 'show', { 'aria-hidden': "true" }) },
];
/** Keeps focus where it is (the editor) when a control is clicked (decision 3). */
const keepFocus = (e: { preventDefault(): void }) => e.preventDefault();

function DocsPanel({ pinned, onPin, title }: { pinned: boolean; onPin: (pinned: boolean) => void; title?: string | null }) {
  return (
    <div className={styles.docs} data-testid={pinned ? 'docs-pinned' : 'docs-sidebar'}>
      <div className={styles.docsHead}>
        <h2 className={styles.paneTitle}>Docs</h2>
        <IconButton size="sm" variant="tertiary" icon={pinned ? svgIcon(pushpinOffSvg, 'pushpin-off') : svgIcon(pushpinOnSvg, 'pushpin-on')} label={pinned ? 'Unpin Docs' : 'Pin Docs beside the editor'}
          aria-pressed={pinned} onMouseDown={keepFocus} onClick={() => onPin(!pinned)} />
      </div>
      {title && <h3 className={styles.docsPage} data-testid="docs-page-title">{title}</h3>}
      <p className={styles.empty}>{title ? 'The documentation page arrives in C7.' : 'Component documentation appears here: search, live examples and props for the component under the cursor (C7).'}</p>
    </div>
  );
}

function SidebarBody({ activity, explorer, search, docsPinned, onPin, onCreateComponent, components, docsTitle, docs }: { activity: Activity; explorer: ReactNode; search?: ReactNode; docsPinned: boolean; onPin: (p: boolean) => void; onCreateComponent?: () => void; components?: ReactNode; docsTitle?: string | null; docs?: (pinned: boolean) => ReactNode }) {
  return (
    <div role="tabpanel" id={ACTIVITY_PANEL_ID} aria-labelledby={activityTabId(activity)} className={styles.sidebarBody}>
      {activity === 'explorer' && explorer}
      {activity === 'search' && (search ?? <p className={styles.empty}>Search is unavailable.</p>)}
      {activity === 'components' && components}
      {activity === 'components' && !components && (
        <div className={styles.docs} data-testid="components-panel">
          <div className={styles.docsHead}>
            <h2 className={styles.paneTitle}>Components</h2>
            {onCreateComponent && <IconButton size="sm" variant="tertiary" icon={svgIcon(addSvg, 'add')} label="Create component" onClick={onCreateComponent} />}
          </div>
          <p className={styles.empty}>The component catalog arrives in C6.</p>
        </div>
      )}
      {activity === 'docs' && (docsPinned
        ? <div className={styles.docs}><p className={styles.empty}>Docs is pinned beside the editor.</p><Button size="sm" onMouseDown={keepFocus} onClick={() => onPin(false)}>Unpin Docs</Button></div>
        : docs ? docs(false) : <DocsPanel pinned={false} onPin={onPin} title={docsTitle} />)}
    </div>
  );
}

export function CodeWorkspace(props: CodeWorkspaceProps) {
  const { breakpoint, layout, dispatchLayout: d, menuBar, strips, explorer, search, overlays, editor, groupsEditor, references, onOpenReference, onClearReferences, preview, tabs, activePath, dirty, onSelectTab, onCloseTab, problems, onGoToProblem, consoleEntries, onClearConsole, consoleDropped, onOpenSource, status, onCreateComponent, tabActions, components, docsTitle, docs, componentDocs } = props;
  const [overlay, setOverlay] = useState(false);
  const desktop = breakpoint === 'desktop';
  const tablet = breakpoint === 'tablet';
  const mobile = breakpoint === 'mobile';
  useEffect(() => { if (desktop) setOverlay(false); }, [desktop]);
  const { sizes, collapsed } = layout;
  const pin = (pinned: boolean) => d({ type: 'pinDocs', pinned });
  const docsColumn = desktop && layout.docsPinned;
  const showSidebar = desktop ? !collapsed.sidebar : mobile ? layout.mobileTab === 'files' : overlay;
  const showEditor = mobile ? layout.mobileTab === 'code' : !(tablet && layout.tabletLayout === 'preview');
  const showPreview = mobile ? layout.mobileTab === 'preview' : tablet ? layout.tabletLayout !== 'editor' : !collapsed.preview;
  const showBottom = mobile ? layout.mobileTab === 'panel' : tablet ? true : !collapsed.bottom;

  const onActivity = (a: Activity) => {
    if (tablet) { setOverlay((o) => (a === layout.activity ? !o : true)); }
    d({ type: 'setActivity', activity: a });
  };

  const columns = desktop
    ? [showSidebar && `${sizes.sidebar}px`, showSidebar && 'auto', 'minmax(12rem, 1fr)', docsColumn && 'auto', docsColumn && `${sizes.docs}px`, showPreview && 'auto', showPreview && `${sizes.preview}px`].filter(Boolean).join(' ')
    : undefined;

  const tabletSwitch = tablet && (
    <div className={styles.layoutSwitch} role="radiogroup" aria-label="Layout">
      <span aria-hidden="true">Layout</span>
      {TABLET_LAYOUTS.map((l) => (
        <button key={l.id} type="button" role="radio" aria-checked={layout.tabletLayout === l.id} aria-label={l.label} title={l.label}
          className={cx(styles.viewportButton, layout.tabletLayout === l.id && styles.viewportOn)} onClick={() => d({ type: 'setTabletLayout', layout: l.id })}>
          {l.icon}
        </button>
      ))}
    </div>
  );

  return (
    <div className={styles.codeStudio} data-breakpoint={breakpoint}>
      {menuBar}
      {mobile && (
        <div role="tablist" aria-label="Code Studio views" className={styles.mobileTabs}>
          {MOBILE_TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={layout.mobileTab === t.id}
              aria-label={t.id === 'code' && dirty.size ? 'Code, unsaved changes' : t.label}
              className={styles.mobileTab} onClick={() => d({ type: 'setMobileTab', tab: t.id })}>
              <span className={styles.mobileIcon}>{t.icon}{t.id === 'code' && dirty.size > 0 && <span className={styles.mobileDot} data-testid="mobile-dirty-dot" />}</span>
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div className={styles.body} style={{ gridTemplateColumns: columns }} data-tablet-layout={tablet ? layout.tabletLayout : undefined}>
        {tablet && (
          <div className={styles.tabletTop}>
            <ActivityTabs value={layout.activity} onChange={onActivity} compact />
            {tabletSwitch}
            <EditorTabs tabs={tabs} active={activePath} dirty={dirty} onSelect={onSelectTab} onClose={onCloseTab} maxVisible={3} />
            {tabActions}
            <span className={styles.breadcrumb}>{activePath.split('/').join(' › ')}</span>
          </div>
        )}
        {showSidebar && (
          <aside className={cx(styles.sidebar, tablet && styles.overlay)} aria-label={ACTIVITY_META[layout.activity].label}
            onKeyDown={(e) => { if (tablet && e.key === 'Escape') setOverlay(false); }}>
            {!tablet && (
              <div className={styles.sidebarHead}>
                {!mobile && <ActivityTabs value={layout.activity} onChange={onActivity} />}
                {mobile && <ActivityTabs value={layout.activity} onChange={onActivity} compact />}
              </div>
            )}
            <SidebarBody activity={layout.activity} explorer={explorer} search={search} docsPinned={docsColumn} onPin={pin} onCreateComponent={onCreateComponent} components={components} docsTitle={docsTitle} docs={docs} />
          </aside>
        )}
        {desktop && showSidebar && (
          <Splitter label="Resize sidebar" orientation="vertical" value={sizes.sidebar} min={SIZE_LIMITS.sidebar[0]} max={SIZE_LIMITS.sidebar[1]}
            onChange={(size) => d({ type: 'resize', key: 'sidebar', size })} />
        )}
        <main className={styles.editorCol} aria-label="Editor" hidden={!showEditor}>
          {!tablet && !(desktop && groupsEditor) && (
            <div className={styles.tabRow}>
              {desktop && <IconButton size="sm" variant="tertiary" icon={collapsed.sidebar ? svgIcon(openCommandFieldSvg, 'open-command-field') : svgIcon(closeCommandFieldSvg, 'close-command-field')} label={collapsed.sidebar ? 'Show sidebar' : 'Hide sidebar'} onClick={() => d({ type: 'toggle', panel: 'sidebar' })} />}
              <EditorTabs tabs={tabs} active={activePath} dirty={dirty} onSelect={onSelectTab} onClose={onCloseTab} maxVisible={mobile ? 2 : undefined} />
              {tabActions}
              {!mobile && <span className={styles.breadcrumb}>{activePath.split('/').join(' › ')}</span>}
              {desktop && collapsed.preview && <IconButton size="sm" variant="tertiary" icon={svgIcon(closeCommandFieldSvg, 'close-command-field')} label="Show preview" onClick={() => d({ type: 'toggle', panel: 'preview', collapsed: false })} />}
            </div>
          )}
          {strips}
          <div className={styles.editorBody}>
            {desktop && groupsEditor
              ? groupsEditor({
                leading: <IconButton size="sm" variant="tertiary" icon={collapsed.sidebar ? svgIcon(openCommandFieldSvg, 'open-command-field') : svgIcon(closeCommandFieldSvg, 'close-command-field')} label={collapsed.sidebar ? 'Show sidebar' : 'Hide sidebar'} onClick={() => d({ type: 'toggle', panel: 'sidebar' })} />,
                trailing: collapsed.preview ? <IconButton size="sm" variant="tertiary" icon={svgIcon(closeCommandFieldSvg, 'close-command-field')} label="Show preview" onClick={() => d({ type: 'toggle', panel: 'preview', collapsed: false })} /> : null,
              })
              : editor}
          </div>
        </main>
        {docsColumn && (
          <>
            <Splitter label="Resize Docs" orientation="vertical" direction={-1} value={sizes.docs} min={SIZE_LIMITS.docs[0]} max={SIZE_LIMITS.docs[1]}
              onChange={(size) => d({ type: 'resize', key: 'docs', size })} />
            <aside className={styles.docsColumn} aria-label="Docs">{docs ? docs(true) : <DocsPanel pinned onPin={pin} title={docsTitle} />}</aside>
          </>
        )}
        {desktop && showPreview && (
          <Splitter label="Resize preview" orientation="vertical" direction={-1} value={sizes.preview} min={SIZE_LIMITS.preview[0]} max={SIZE_LIMITS.preview[1]}
            onChange={(size) => d({ type: 'resize', key: 'preview', size })} />
        )}
        <div className={styles.previewCol} hidden={!showPreview}>
          {desktop && <IconButton className={styles.previewHide} size="sm" variant="tertiary" icon={svgIcon(openCommandFieldSvg, 'open-command-field')} label="Hide preview" onClick={() => d({ type: 'toggle', panel: 'preview', collapsed: true })} />}
          {preview}
        </div>
      </div>
      {desktop && showBottom && (
        <Splitter label="Resize bottom panel" orientation="horizontal" direction={-1} value={sizes.bottom} min={SIZE_LIMITS.bottom[0]} max={SIZE_LIMITS.bottom[1]}
          onChange={(size) => d({ type: 'resize', key: 'bottom', size })} />
      )}
      {showBottom && (
        <div className={styles.bottomWrap} style={desktop ? { blockSize: sizes.bottom } : tablet && layout.bottomExpanded ? { blockSize: 200 } : undefined}
          data-fill={mobile || undefined}>
          <BottomPanel
            tab={layout.bottomTab} onTab={(tab) => d({ type: 'setBottomTab', tab })}
            problems={problems} onGoTo={onGoToProblem}
            consoleEntries={consoleEntries} consoleDropped={consoleDropped} componentDocs={componentDocs} onClearConsole={onClearConsole} onOpenSource={onOpenSource}
            references={references} onOpenReference={onOpenReference} onClearReferences={onClearReferences}
            onCollapse={() => d({ type: 'toggle', panel: 'bottom', collapsed: true })}
            summary={tablet} expanded={layout.bottomExpanded} onExpanded={(expanded) => d({ type: 'setBottomExpanded', expanded })}
          />
        </div>
      )}
      {desktop && collapsed.bottom && (
        <div className={styles.bottomRestore}>
          <Button size="sm" variant="tertiary" icon={svgIcon(toasterUpSvg, 'toaster-up')} onClick={() => d({ type: 'toggle', panel: 'bottom', collapsed: false })}>Show panel</Button>
        </div>
      )}
      {!mobile && <StatusBar {...status} />}
      {overlays}
    </div>
  );
}
