import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../utils';
import { ThemeProvider } from '../../src';
import { EditorTabs } from '../../studio/src/app/workspace/EditorTabs';
import { PreviewToolbar } from '../../studio/src/preview/PreviewToolbar';
import { PreviewPane } from '../../studio/src/preview/PreviewPane';
import { WorkspaceSwitch } from '../../studio/src/app/workspace/WorkspaceSwitch';
import { Splitter } from '../../studio/src/app/workspace/Splitter';

describe('EditorTabs', () => {
  const tabs = ['src/App.tsx', 'src/OrderTable.tsx', 'src/styles.css'];
  const setup = (dirty: string[] = [], extra = {}) => {
    const onClose = vi.fn();
    const onSelect = vi.fn();
    renderWithTheme(<EditorTabs tabs={tabs} active="src/App.tsx" dirty={new Set(dirty)} onSelect={onSelect} onClose={onClose} {...extra} />);
    return { onClose, onSelect };
  };

  it('announces unsaved tabs and shows a dot only on dirty tabs', () => {
    setup(['src/OrderTable.tsx']);
    expect(screen.getByRole('button', { name: 'OrderTable.tsx, unsaved' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'App.tsx' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getAllByTestId('dirty-dot')).toHaveLength(1);
    const dirtyTab = screen.getByRole('button', { name: 'OrderTable.tsx, unsaved' }).parentElement!;
    expect(within(dirtyTab).getByTestId('dirty-dot')).toBeInTheDocument();
  });

  it('every tab has a named close button; dirty tabs mark the class that swaps dot and close', () => {
    const { onClose } = setup(['src/styles.css']);
    fireEvent.click(screen.getByRole('button', { name: 'Close styles.css' }));
    expect(onClose).toHaveBeenCalledWith('src/styles.css');
    const tab = screen.getByRole('button', { name: 'styles.css, unsaved' }).parentElement!;
    expect(tab.className).toMatch(/dirtyTab/);
    expect(screen.getByRole('button', { name: 'App.tsx' }).parentElement!.className).toMatch(/activeTab/);
  });

  it('the dot disappears once the file is saved', () => {
    const { rerender } = renderWithTheme(<EditorTabs tabs={tabs} active="src/App.tsx" dirty={new Set(['src/App.tsx'])} onSelect={() => {}} onClose={() => {}} />);
    expect(screen.getByRole('button', { name: 'App.tsx, unsaved' })).toBeInTheDocument();
    rerender(<EditorTabs tabs={tabs} active="src/App.tsx" dirty={new Set()} onSelect={() => {}} onClose={() => {}} />);
    expect(screen.queryByTestId('dirty-dot')).toBeNull();
    expect(screen.getByRole('button', { name: 'App.tsx' })).toBeInTheDocument();
  });

  it('moves between tabs with the arrow keys and collapses overflow into +N', () => {
    const { onSelect } = setup([], { maxVisible: 2 });
    fireEvent.keyDown(screen.getByRole('button', { name: 'App.tsx' }), { key: 'ArrowRight' });
    expect(onSelect).toHaveBeenCalledWith('src/OrderTable.tsx');
    const more = screen.getByRole('button', { name: '1 more open file' });
    expect(more).toHaveTextContent('+1');
    fireEvent.click(more);
    fireEvent.click(screen.getByRole('menuitem', { name: 'styles.css' }));
    expect(onSelect).toHaveBeenCalledWith('src/styles.css');
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<EditorTabs tabs={tabs} active="src/App.tsx" dirty={new Set(['src/styles.css'])} onSelect={() => {}} onClose={() => {}} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('PreviewToolbar', () => {
  it('changes only the preview theme and offers all seven themes', () => {
    const onTheme = vi.fn();
    renderWithTheme(
      <PreviewToolbar viewport="desktop" onViewport={() => {}} scale={0.62} theme="sap-horizon" onTheme={onTheme} density="cozy" onDensity={() => {}}
        paused={false} onPause={() => {}} onRefresh={() => {}} onFullscreen={() => {}} stale={false} />,
    );
    expect(screen.getByText('1280 × 800 · Fit (62%)')).toBeInTheDocument();
    const select = screen.getByRole('combobox', { name: /Preview theme/ });
    fireEvent.click(select);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(7);
    fireEvent.click(screen.getByRole('option', { name: 'Evening Horizon' }));
    expect(onTheme).toHaveBeenCalledWith('sap-horizon-dark');
    expect(screen.queryByText('Stale')).toBeNull();
  });
});

describe('PreviewPane stale state', () => {
  const pane = (stale: { message: string; file: string; line: number | null } | null, handlers = { onGoToError: vi.fn(), onRetry: vi.fn() }) => (
    <PreviewPane theme="light" onTheme={() => {}} density="cozy" onDensity={() => {}} viewport="desktop" onViewport={() => {}} paused={false}
      onPause={() => {}} onRefresh={() => {}} stale={stale} {...handlers}>
      <iframe title="Page preview" />
    </PreviewPane>
  );

  it('dims the frame, shows the warning strip and badge, and keeps the iframe mounted', () => {
    const handlers = { onGoToError: vi.fn(), onRetry: vi.fn() };
    const { rerender } = renderWithTheme(pane(null, handlers));
    const frame = screen.getByTitle('Page preview');
    expect(screen.getByTestId('preview-frame-box').className).not.toMatch(/staleFrame/);
    rerender(<ThemeProvider>{pane({ message: 'Unexpected token (5:3)', file: 'src/App.tsx', line: 5 }, handlers)}</ThemeProvider>);
    expect(screen.getByTitle('Page preview')).toBe(frame);
    expect(screen.getByTestId('preview-frame-box').className).toMatch(/staleFrame/);
    expect(screen.getByText('Preview is stale')).toBeInTheDocument();
    expect(screen.getAllByText('Stale').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('link', { name: 'src/App.tsx:5' }));
    fireEvent.click(screen.getByRole('button', { name: 'Go to error' }));
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(handlers.onGoToError).toHaveBeenCalledTimes(2);
    expect(handlers.onRetry).toHaveBeenCalledOnce();
  });
});

describe('WorkspaceSwitch and Splitter', () => {
  it('switches workspaces with arrow keys', () => {
    const onChange = vi.fn();
    renderWithTheme(<WorkspaceSwitch value="design" onChange={onChange} />);
    expect(screen.getByRole('radiogroup', { name: 'Workspace' })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('radio', { name: 'Design Studio' }), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('code');
  });

  it('resizes with the keyboard and exposes its value', () => {
    const onChange = vi.fn();
    renderWithTheme(<Splitter label="Resize sidebar" orientation="vertical" value={240} min={160} max={480} onChange={onChange} />);
    const sep = screen.getByRole('separator', { name: 'Resize sidebar' });
    expect(sep).toHaveAttribute('aria-valuenow', '240');
    fireEvent.keyDown(sep, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(256);
    fireEvent.keyDown(sep, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith(160);
  });
});
