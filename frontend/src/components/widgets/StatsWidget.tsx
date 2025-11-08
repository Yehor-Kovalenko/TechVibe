import React from 'react';
import type { StatsWidgetConfig } from '../../types/widget.types';

interface StatsWidgetProps {
  config: StatsWidgetConfig;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ config }) => {
  const { title, description, rating, icon } = config;

  // Rating color based on score
  const getRatingColor = (rating?: number) => {
    if (!rating) return 'text-gray-400';
    if (rating >= 8) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    if (rating >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRatingBg = (rating?: number) => {
    if (!rating) return 'bg-gray-500/20';
    if (rating >= 8) return 'bg-green-500/20';
    if (rating >= 6) return 'bg-yellow-500/20';
    if (rating >= 4) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="widget-card flex flex-col h-auto">
      <div className="flex items-start gap-4 mb-3">
        {icon && (
          <div
            className={`w-12 h-12 rounded-xl ${getRatingBg(rating)} flex items-center justify-center text-2xl flex-shrink-0`}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          {description && (
            <p className="text-sm opacity-60 leading-relaxed">{description}</p>
          )}
        </div>
        {rating !== undefined && (
          <div className="text-right">
            <p className="text-sm opacity-70 mb-1">Rating</p>
            <div className={`text-3xl font-bold ${getRatingColor(rating)}`}>
              {rating.toFixed(1)}/10
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
