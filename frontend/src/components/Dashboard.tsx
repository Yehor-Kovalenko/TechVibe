import React from 'react';
import type { DashboardConfig, WidgetConfig } from '@/types/widget.types';
import { StatsWidget } from './widgets/StatsWidget';
import { ActivityWidget } from './widgets/ActivityWidget';
import { ProgressWidget } from './widgets/ProgressWidget';

interface DashboardProps {
  config: DashboardConfig;
}

const WidgetRenderer: React.FC<{ config: WidgetConfig }> = ({ config }) => {
  switch (config.type) {
    case 'stats':
      return <StatsWidget config={config} />;
    case 'activity':
      return <ActivityWidget config={config} />;
    case 'progress':
      return <ProgressWidget config={config} />;
    // Add other widget types here
    default:
      return null;
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ config }) => {
  const { widgets, columns = 3 } = config;
  
  // Sort widgets by order if specified
  const sortedWidgets = [...widgets].sort((a, b) => 
    (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm opacity-50 mt-2">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </header>

        <div 
          className="grid gap-6 auto-rows-min"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {sortedWidgets.map((widget) => (
            <div
              key={widget.id}
              style={{
                gridColumn: widget.width ? `span ${widget.width}` : 'span 1',
                minHeight: `${widget.height * 100}px`,
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