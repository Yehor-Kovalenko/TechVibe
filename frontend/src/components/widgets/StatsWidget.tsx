import React from 'react';
import type { StatsWidgetConfig } from '@/types/widget.types';

interface StatsWidgetProps {
  config: StatsWidgetConfig;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ config }) => {
  const { title, value, change, changeLabel, icon } = config;
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="widget-card h-full flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-60 mb-1">{title}</p>
          <h3 className="text-4xl font-bold tracking-tight">{value}</h3>
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-2xl">
            {icon}
          </div>
        )}
      </div>
      
      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`text-sm font-semibold ${
              isPositive
                ? 'text-green-400'
                : isNegative
                ? 'text-red-400'
                : 'text-gray-400'
            }`}
          >
            {isPositive && '↑'}
            {isNegative && '↓'}
            {Math.abs(change)}%
          </span>
          {changeLabel && (
            <span className="text-sm opacity-50">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsWidget