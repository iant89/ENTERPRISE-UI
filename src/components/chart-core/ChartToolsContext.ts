import { createContext, useContext } from 'react';
import type { ChartLegendItem, ChartTable } from './ChartFrame';

/** What a chart reports to its container for export. */
export interface ChartRegistration {
  label: string;
  table: ChartTable;
  legend: ChartLegendItem[];
  /** The rendered plot, or `null` while the table view is shown. */
  getSvg: () => SVGSVGElement | null;
}

/** Set by ChartContainer and DashboardCard so the charts inside follow the toolbar. */
export interface ChartToolsContextValue {
  /** Whether charts show the plot or their data table. */
  view: 'chart' | 'table';
  /** Whether charts show their legend. */
  showLegend: boolean;
  /** Charts report their data so the container can export it. Returns an unregister function. */
  register: (id: string, entry: ChartRegistration) => () => void;
  /** The container is full screen: charts grow to fill the space they are given. */
  fullscreen?: boolean;
}

export const ChartToolsContext = createContext<ChartToolsContextValue | null>(null);

export const useChartTools = () => useContext(ChartToolsContext);

