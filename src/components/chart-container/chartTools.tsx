import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { ChartColumn, Download, List, Maximize2, Minimize2, Table2 } from 'lucide-react';
import { useControllableState } from '../../hooks/useControllableState';
import type { ChartTable } from '../chart-core/ChartFrame';
import type { ChartToolsContextValue } from '../chart-core/ChartToolsContext';
import { IconButton } from '../icon-button';
import { SegmentedButton } from '../segmented-button';
import styles from './ChartContainer.module.css';

/** Which toolbar tools to show. Each defaults to `true`. */
export interface ChartToolOptions {
  /** Switch between the chart and its data table. */
  view?: boolean;
  /** Show or hide the legend. */
  legend?: boolean;
  /** Expand to full screen. */
  fullscreen?: boolean;
  /** Download the data as CSV. */
  download?: boolean;
}

export interface ChartToolbarLabels {
  toolbar: string;
  chartView: string;
  tableView: string;
  legend: string;
  enterFullscreen: string;
  exitFullscreen: string;
  download: string;
}

export const defaultToolbarLabels: ChartToolbarLabels = {
  toolbar: 'Chart tools',
  chartView: 'Chart view',
  tableView: 'Table view',
  legend: 'Show legend',
  enterFullscreen: 'Enter full screen',
  exitFullscreen: 'Exit full screen',
  download: 'Download as CSV',
};

/** Controlled/uncontrolled state shared by ChartContainer and DashboardCard. */
export interface ChartToolsStateProps {
  /** Current view. Providing it makes the view controlled. */
  view?: 'chart' | 'table';
  /** Initial view when uncontrolled. @default 'chart' */
  defaultView?: 'chart' | 'table';
  /** Called with the new view. */
  onViewChange?: (view: 'chart' | 'table') => void;
  /** Whether legends are shown. Providing it makes the legend toggle controlled. */
  showLegend?: boolean;
  /** Initial legend visibility when uncontrolled. @default true */
  defaultShowLegend?: boolean;
  /** Called with the new legend visibility. */
  onShowLegendChange?: (show: boolean) => void;
  /** Called instead of the built-in file download, e.g. to export server-side. Receives the CSV text. */
  onDownload?: (csv: string, fileName: string) => void;
  /** File name of the CSV download (without extension). Defaults to the title or chart label. */
  downloadFileName?: string;
}

/** Quotes a CSV cell and neutralizes spreadsheet formulas (CSV injection). */
function csvCell(value: string): string {
  const safe = /^[=+@\t\r]/.test(value) || /^-[^\d.]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** Converts the registered chart tables to CSV. Several charts are separated by their labels. */
export function tablesToCsv(entries: { label: string; table: ChartTable }[]): string {
  const block = ({ table }: { table: ChartTable }) => [table.headers, ...table.rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  if (entries.length === 1) return block(entries[0]);
  return entries.map((e) => `${csvCell(e.label)}\r\n${block(e)}`).join('\r\n\r\n');
}

function saveFile(csv: string, fileName: string) {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
  // A byte-order mark lets spreadsheet apps detect UTF-8.
  const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

const slug = (text: string) => text.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase() || 'chart-data';

/** Shared state, chart registry and full-screen handling for chart toolbars. */
export function useChartToolsState(props: ChartToolsStateProps, target: RefObject<HTMLElement | null>, fallbackName: string) {
  const [view, setView] = useControllableState(props.view, props.defaultView ?? 'chart', props.onViewChange);
  const [showLegend, setShowLegend] = useControllableState(props.showLegend, props.defaultShowLegend ?? true, props.onShowLegendChange);
  const entries = useRef(new Map<string, { label: string; table: ChartTable }>());
  const [count, setCount] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const native = useRef(false);

  const register = useCallback<ChartToolsContextValue['register']>((id, entry) => {
    entries.current.set(id, entry);
    setCount(entries.current.size);
    return () => {
      entries.current.delete(id);
      setCount(entries.current.size);
    };
  }, []);

  // Full screen shares the viewport between the registered charts (leaving room for header and legends).
  const fullscreenHeight = fullscreen && typeof window !== 'undefined' ? Math.max(240, Math.floor((window.innerHeight - 160) / Math.max(count, 1)) - 80) : undefined;
  const context = useMemo<ChartToolsContextValue>(() => ({ view, showLegend, register, fullscreenHeight }), [view, showLegend, register, fullscreenHeight]);

  // The browser leaves native full screen on its own (Escape, F11); follow it.
  useEffect(() => {
    const onChange = () => {
      if (native.current && document.fullscreenElement !== target.current) {
        native.current = false;
        setFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [target]);

  // The in-page fallback (no Fullscreen API) closes on Escape.
  useEffect(() => {
    if (!fullscreen || native.current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  const toggleFullscreen = async () => {
    const el = target.current;
    if (fullscreen) {
      if (native.current && document.fullscreenElement) await document.exitFullscreen?.();
      native.current = false;
      setFullscreen(false);
      return;
    }
    if (el?.requestFullscreen) {
      try {
        await el.requestFullscreen();
        native.current = true;
        setFullscreen(true);
        return;
      } catch {
        // Fall through to the in-page expansion (e.g. inside an iframe without permission).
      }
    }
    native.current = false;
    setFullscreen(true);
  };

  const download = () => {
    const list = [...entries.current.values()];
    if (!list.length) return;
    const csv = tablesToCsv(list);
    const name = props.downloadFileName ?? slug(fallbackName || list[0].label);
    if (props.onDownload) props.onDownload(csv, name);
    else saveFile(csv, name);
  };

  return { view, setView, showLegend, setShowLegend, context, fullscreen, toggleFullscreen, download, hasData: count > 0, inPageFullscreen: fullscreen && !native.current };
}

export type ChartToolsState = ReturnType<typeof useChartToolsState>;

/** The toolbar buttons. Rendered inside a `role="toolbar"` group. */
export function ChartToolbar({ state, tools, labels }: { state: ChartToolsState; tools: ChartToolOptions; labels: ChartToolbarLabels }) {
  const { view: showView = true, legend = true, fullscreen = true, download = true } = tools;
  return (
    <div className={styles.toolbar} role="toolbar" aria-label={labels.toolbar}>
      {showView && (
        <SegmentedButton
          size="sm"
          aria-label={labels.toolbar}
          items={[
            { value: 'chart', label: <ChartColumn aria-hidden="true" />, ariaLabel: labels.chartView },
            { value: 'table', label: <Table2 aria-hidden="true" />, ariaLabel: labels.tableView },
          ]}
          value={[state.view]}
          onChange={(v) => v[0] && state.setView(v[0] as 'chart' | 'table')}
        />
      )}
      {legend && state.view === 'chart' && (
        <IconButton icon={<List />} label={labels.legend} size="sm" aria-pressed={state.showLegend} onClick={() => state.setShowLegend(!state.showLegend)} />
      )}
      {download && <IconButton icon={<Download />} label={labels.download} size="sm" disabled={!state.hasData} onClick={state.download} />}
      {fullscreen && (
        <IconButton
          icon={state.fullscreen ? <Minimize2 /> : <Maximize2 />}
          label={state.fullscreen ? labels.exitFullscreen : labels.enterFullscreen}
          size="sm"
          onClick={() => void state.toggleFullscreen()}
        />
      )}
    </div>
  );
}
