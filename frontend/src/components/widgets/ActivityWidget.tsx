import React from 'react';
import type { ActivityWidgetConfig } from '@/types/widget.types';

interface ActivityWidgetProps {
  config: ActivityWidgetConfig;
}

const typeColors = {
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const typeIcons = {
  info: '●',
  success: '✓',
  warning: '⚠',
  error: '✕',
};

export const ActivityWidget: React.FC<ActivityWidgetProps> = ({ config }) => {
  const { title, items } = config;

  return (
    <div className="widget-card h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                typeColors[item.type]
              }`}
            >
              {typeIcons[item.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs opacity-50 mt-1">{item.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityWidget;