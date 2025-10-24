export type WidgetType = 'stats' | 'chart' | 'activity' | 'progress' | 'calendar';

export interface BaseWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  height: number; // in grid units (1 unit = ~100px)
  width?: number; // optional, defaults to full width or auto
  order?: number; // for ordering widgets
}

export interface StatsWidgetConfig extends BaseWidgetConfig {
  type: 'stats';
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: string;
}

export interface ChartWidgetConfig extends BaseWidgetConfig {
  type: 'chart';
  chartType?: 'line' | 'bar' | 'area';
  data: any[];
}

export interface ActivityWidgetConfig extends BaseWidgetConfig {
  type: 'activity';
  items: Array<{
    id: string;
    title: string;
    timestamp: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
}

export interface ProgressWidgetConfig extends BaseWidgetConfig {
  type: 'progress';
  tasks: Array<{
    id: string;
    label: string;
    progress: number;
    status: 'active' | 'completed' | 'pending';
  }>;
}

export interface CalendarWidgetConfig extends BaseWidgetConfig {
  type: 'calendar';
  events: Array<{
    id: string;
    title: string;
    date: string;
    color?: string;
  }>;
}

export type WidgetConfig = 
  | StatsWidgetConfig 
  | ChartWidgetConfig 
  | ActivityWidgetConfig 
  | ProgressWidgetConfig
  | CalendarWidgetConfig;

export interface DashboardConfig {
  widgets: WidgetConfig[];
  layout?: 'grid' | 'masonry';
  columns?: number;
}

export type {
    BaseWidgetConfig,
    StatsWidgetConfig,
    ChartWidgetConfig,
    ActivityWidgetConfig,
    ProgressWidgetConfig,
    CalendarWidgetConfig,
    WidgetConfig,
    DashboardConfig,
    WidgetType
  };