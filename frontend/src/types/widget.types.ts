export type WidgetType =
| 'stats' 
| 'summary-components'
| 'verdict'
| 'chart'

export interface BaseWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  height: number; // in grid units (1 unit = ~100px)
  width?: number; // optional, defaults to full width or auto
  order?: number; // for ordering widgets
}

// Stats Widget - for individual technical aspects
export interface StatsWidgetConfig extends BaseWidgetConfig {
  type: 'stats';
  description?: string;
  value?: string | number;
  rating?: number; // 0-10 scale
  icon?: string;
}

// Summary Widget - overall product evaluation (battery-style display)
export interface SummaryByComponentsWidgetConfig extends BaseWidgetConfig {
  type: 'summary-components';
  overallRating?: number; // 0-10 scale
  categories: Array<{
    id: string;
    label: string;
    rating?: number; // 0-10 scale
    icon?: string;
  }>;
}

// Verdict Widget - final recommendation
export interface VerdictWidgetConfig extends BaseWidgetConfig {
  type: 'verdict';
  verdict: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score?: number;
}

// Single line chart based on series of values
export interface CharWidgetConfig extends BaseWidgetConfig {
  type: 'chart',
  x?: Array<number>,
  xAxisName?: string,
  y: Array<number>,
  yAxisName?: string,
  labels?: Array<string>
}

export type WidgetConfig = 
  | StatsWidgetConfig 
  | SummaryByComponentsWidgetConfig
  | VerdictWidgetConfig
  | CharWidgetConfig

export interface DashboardConfig {
  widgets: WidgetConfig[];
  layout?: 'grid' | 'masonry';
  columns?: number;
}
