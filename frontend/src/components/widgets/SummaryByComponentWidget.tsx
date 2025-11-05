import React from 'react';
import type { SummaryByComponentsWidgetConfig } from '../../types/widget.types';

interface SummaryWidgetProps {
  config: SummaryByComponentsWidgetConfig;
}

const getRatingColor = (rating: number) => {
  if (rating >= 8.5) return 'text-emerald-400';
  if (rating >= 7) return 'text-green-400';
  if (rating >= 5.5) return 'text-yellow-400';
  if (rating >= 4) return 'text-orange-400';
  return 'text-red-400';
};

const getRatingBg = (rating: number) => {
  if (rating >= 8.5) return 'from-emerald-500 to-green-500';
  if (rating >= 7) return 'from-green-500 to-lime-500';
  if (rating >= 5.5) return 'from-yellow-500 to-amber-500';
  if (rating >= 4) return 'from-orange-500 to-red-500';
  return 'from-red-500 to-rose-500';
};

const getRatingGlow = (rating: number) => {
  if (rating >= 8.5) return 'shadow-emerald-500/50';
  if (rating >= 7) return 'shadow-green-500/50';
  if (rating >= 5.5) return 'shadow-yellow-500/50';
  if (rating >= 4) return 'shadow-orange-500/50';
  return 'shadow-red-500/50';
};

export const SummaryByComponentWidget: React.FC<SummaryWidgetProps> = ({ config }) => {
  const { title, categories, overallRating = 0 } = config;

  return (
    <div className="widget-card h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold opacity-80">{title}</h3>
      </div>

      {/* Overall Rating - Large Circular Display */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          {/* Outer glow ring */}
          <div className={`absolute inset-0 rounded-full blur-xl ${getRatingGlow(overallRating)}`}
               style={{
                 background: `conic-gradient(from 0deg, transparent ${100 - (overallRating * 10)}%, rgba(74, 222, 128, 0.3) ${100 - (overallRating * 10)}%)`
               }}
          ></div>
          
          {/* Main circle */}
          <div className="relative w-40 h-40 rounded-full flex items-center justify-center"
               style={{
                 background: `conic-gradient(from -90deg, 
                   ${overallRating >= 8.5 ? '#10b981' : overallRating >= 7 ? '#22c55e' : overallRating >= 5.5 ? '#eab308' : overallRating >= 4 ? '#f97316' : '#ef4444'} 
                   ${(overallRating / 10) * 100}%, 
                   rgba(255,255,255,0.05) ${(overallRating / 10) * 100}%)`
               }}>
            <div className="w-[90%] h-[90%] rounded-full bg-[#0f0f14] flex flex-col items-center justify-center">
              <div className={`text-5xl font-bold ${getRatingColor(overallRating)} mb-1`}>
                {overallRating.toFixed(1)}
              </div>
              <div className="text-xs opacity-50 tracking-wider">OUT OF 10</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Mini Cards */}
      <div className="grid grid-cols-5 gap-2 mt-auto">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group relative overflow-hidden rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
          >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${getRatingBg(category.rating)}`}
                 style={{ opacity: 0.1 }}
            ></div>
            
            <div className="relative p-3 flex flex-col items-center gap-2">
              <span className="text-2xl">{category.icon}</span>
              <div className={`text-lg font-bold ${getRatingColor(category.rating)}`}>
                {category.rating.toFixed(1)}
              </div>
              <div className="text-[10px] opacity-60 text-center leading-tight">
                {category.label}
              </div>
            </div>

            {/* Rating bar at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
              <div
                className={`h-full bg-gradient-to-r ${getRatingBg(category.rating)} transition-all duration-500`}
                style={{ width: `${(category.rating / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryByComponentWidget;