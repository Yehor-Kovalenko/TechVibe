export type WidgetType =
| 'stats' 
| 'summary' 
| 'proscons' 
| 'specs'
| 'verdict'

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
export interface SummaryWidgetConfig extends BaseWidgetConfig {
  type: 'summary';
  overallRating?: number; // 0-10 scale
  categories: Array<{
    id: string;
    label: string;
    rating: number; // 0-10 scale
    icon?: string;
  }>;
}

// Pros & Cons Widget
export interface ProsConsWidgetConfig extends BaseWidgetConfig {
  type: 'proscons';
  pros: string[];
  cons: string[];
}

// Specifications Widget
export interface SpecsWidgetConfig extends BaseWidgetConfig {
  type: 'specs';
  specs: Array<{
    id: string;
    label: string;
    value: string;
    icon?: string;
    description?: string;
  }>;
}

// Verdict Widget - final recommendation
export interface VerdictWidgetConfig extends BaseWidgetConfig {
  type: 'verdict';
  verdict: string;
  recommendation?: string;
  targetAudience?: string;
}

export type WidgetConfig = 
  | StatsWidgetConfig 
  | SummaryWidgetConfig
  | ProsConsWidgetConfig
  | SpecsWidgetConfig
  | VerdictWidgetConfig

export interface DashboardConfig {
  widgets: WidgetConfig[];
  layout?: 'grid' | 'masonry';
  columns?: number;
}