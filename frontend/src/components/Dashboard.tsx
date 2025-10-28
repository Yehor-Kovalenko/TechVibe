import React from 'react';
import type { DashboardConfig, WidgetConfig } from '../types/widget.types';
import { StatsWidget } from './widgets/StatsWidget';
import { ProsConsWidget } from './widgets/ProsConsWidget';
import { SummaryWidget } from './widgets/SummaryWidget';

interface DashboardProps {
  config: DashboardConfig;
}

const WidgetRenderer: React.FC<{ config: WidgetConfig }> = ({ config }) => {
  switch (config.type) {
    case 'stats':
      return <StatsWidget config={config} />;
    case 'proscons':
      return <ProsConsWidget config={config} />;
    case 'summary': {
      // calculating overall rating overallRating
      let overallRatingNumber = 0.0;
      config.categories.forEach(c => overallRatingNumber += c?.rating)
      overallRatingNumber /= config.categories.length;
      config.overallRating = overallRatingNumber;
      return <SummaryWidget config={config} />;
    }
    default:
      return null;
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ config }) => {
  const { widgets, columns = 3 } = config;

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
          className="masonry-container grid gap-6 auto-rows-min"
          style={{
            columnCount: columns,
            gridTemplateColumns: `repeat(1, minmax(0, 1fr))`,
          }}
        >
          {sortedWidgets.map((widget) => (
            <div
              key={widget.id}
              className='widget-masonry-item mb-6'
              style={{
                breakInside: 'avoid',
                gridColumn: widget.width ? `span ${widget.width}` : 'span 1',
                minHeight: `${widget.height * 100}px`
              }}
            >
              <WidgetRenderer config={widget} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
