import React from 'react';
import type {
  DashboardConfig,
  MetadataWidgetConfig,
  WidgetConfig,
  ReviewTextWidgetConfig,
} from '../types/widget.types';
import { StatsWidget } from './widgets/StatsWidget';
import { SummaryByComponentWidget } from './widgets/SummaryByComponentWidget.tsx';
import { VerdictWidget } from './widgets/VerdictWidget';
import { ChartWidget } from './widgets/ChartWidget.tsx';
import { MetadataWidget } from './widgets/MetadataWidget';
import { ReviewTextWidget } from './widgets/ReviewTextWidget.tsx';

interface DashboardProps {
  config: DashboardConfig;
}

const componentIcons: Record<string, string> = {
  design: '🎨',
  display: '📺',
  camera: '📷',
  audio: '🔊',
  performance: '⚡',
  battery: '🔋',
  connectivity: '📡',
  software: '💻',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformSentimentByPart(sentimentData: any) {
  if (!sentimentData) return [];
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  return Object.entries(sentimentData).map(([key, value]: [string, any]) => ({
    id: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    rating: value.score,
    icon: componentIcons[key] || '📦'
  }));
}


// any should be preserved
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const WidgetRenderer: React.FC<{ config: WidgetConfig, backendData: Record<string, any> | undefined }> = ({ config, backendData }) => {
  const widgetData = config.dataKey ? backendData?.[config.dataKey] : null;

  // exchange with data from the backend
  if (widgetData) {
    config = {...config, ...widgetData};
  }

  switch (config.type) {
    case 'stats':
      return <StatsWidget config={config} />;
    case 'summary-components': {
      if (widgetData && !config.categories?.length) {
        config.categories = transformSentimentByPart(widgetData);
      }

      // calculating overall rating overallRating
      let overallRatingNumber: number = 0.0;
      if (config.categories && config.categories.length > 0) {
        config.categories.forEach((c) => (overallRatingNumber += c.rating ?? 0));
        overallRatingNumber /= config.categories.length;
        config.overallRating = overallRatingNumber;
      }
      return <SummaryByComponentWidget config={config} />;
    }
    case 'verdict':
      return <VerdictWidget config={config} />;
    case 'chart':
      return <ChartWidget config={config} />;
    case 'metadata':
      return <MetadataWidget config={config as MetadataWidgetConfig} />;
    case 'review-text':
      return <ReviewTextWidget config={config as ReviewTextWidgetConfig} />;
    default:
      return null;
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ config }) => {
  const { widgets, columns = 3, summary } = config;

  // Sort widgets by order if specified
  const sortedWidgets = [...widgets].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Dashboard Summary
          </h1>
          <p className="text-sm opacity-50 mt-2">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </header>

        <div
          className="masonry-container grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gridAutoRows: '100px', // base dimension unit
            gridAutoFlow: 'dense',
          }}
        >
          {sortedWidgets.map((widget) => (
            <div
              key={widget.id}
              className="widget-masonry-item mb-6"
              style={{
                gridColumn: widget.width
                  ? `span ${Math.min(widget.width, columns)}`
                  : 'span 1',
                gridRow: widget.height ? `span ${widget.height}` : 'span 2',
              }}
            >
              <WidgetRenderer config={widget} backendData={summary} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
