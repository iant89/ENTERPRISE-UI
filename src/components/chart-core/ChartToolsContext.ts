import { createContext, useContext } from 'react';
import type { ChartTable } from './ChartFrame';

/** Set by ChartContainer and DashboardCard so the charts inside follow the toolbar. */
export interface ChartToolsContextValue {
  /** Whether charts show the plot or their data table. */
  view: 'chart' | 'table';
  /** Whether charts show their legend. */
  showLegend: boolean;
  /** Charts report their data so the container can export it. Returns an unregister function. */
  register: (id: string, entry: { label: string; table: ChartTable }) => () => void;
  /** Plot height to use while the container is full screen, shared between its charts. */
  fullscreenHeight?: number;
}

export const ChartToolsContext = createContext<ChartToolsContextValue | null>(null);

export const useChartTools = () => useContext(ChartToolsContext);

/** A chart's plot height: its own height, or more while its container is full screen. */
export function useChartHeight(height: number): number {
  const tools = useContext(ChartToolsContext);
  return tools?.fullscreenHeight ? Math.max(height, tools.fullscreenHeight) : height;
}
