export type WidgetType =
  | 'stats'
  | 'summary-components'
  | 'verdict'
  | 'chart'
  | 'metadata'
  | 'review-text';

export interface BaseWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  height: number; // in grid units (1 unit = ~100px)
  width?: number; // optional, defaults to full width or auto
  order?: number; // for ordering widgets
  dataKey: string; // for the key to look into the backend file, essential for the backend communication
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
export interface ChartWidgetConfig extends BaseWidgetConfig {
  type: 'chart';
  x?: Array<number>;
  xAxisName?: string;
  y: Array<number>;
  yAxisName?: string;
}

export interface ReviewTextWidgetConfig extends BaseWidgetConfig {
  type: 'review-text';
  text: string;
  dataKey: string;
}

export interface MetadataWidgetConfig extends BaseWidgetConfig {
  type: 'metadata';
  title: string;
  duration: number;
  uploader: string;
  upload_date: string;
  view_count: number;
  subtitle_type: string;
}

export type WidgetConfig =
  | StatsWidgetConfig
  | SummaryByComponentsWidgetConfig
  | VerdictWidgetConfig
  | ChartWidgetConfig
  | MetadataWidgetConfig
  | ReviewTextWidgetConfig;

export interface DashboardConfig {
  widgets: WidgetConfig[];
  layout?: 'grid' | 'masonry';
  columns?: number;
  // to disable errors related to using 'any' keyword
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  summary?: Record<string, any>
}
