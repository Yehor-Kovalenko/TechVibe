import React from 'react';
import type { SummaryByComponentsWidgetConfig } from '../../types/widget.types';

interface SummaryWidgetProps {
  config: SummaryByComponentsWidgetConfig;
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

export const SummaryByComponentWidget: React.FC<SummaryWidgetProps> = ({
  config,
}) => {
  const { title, features_verdict, overallRating = 0 } = config;

  const avgRating =
    overallRating ||
    (features_verdict.display.score +
      features_verdict.design.score +
      features_verdict.connectivity.score +
      features_verdict.software.score +
      features_verdict.audio.score +
      features_verdict.performance.score +
      features_verdict.battery.score +
      features_verdict.camera.score) /
      8;

  return (
    <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
      {/* Header */}
      <h3 className="text-2xl font-bold mb-6 text-white">{title}</h3>

      {/* Overall Rating - Large Circular Display */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {/* Outer glow ring */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${getRatingBg(avgRating)} opacity-20 blur-xl ${getRatingGlow(avgRating)}`}
          />

          {/* Main circle */}
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border-4 border-slate-700/50">
            <div className="text-center">
              <div
                className={`text-4xl font-bold ${getRatingColor(avgRating)}`}
              >
                {avgRating.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Overall</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Mini Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 overflow-hidden group">
          {/* Gradient background on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getRatingBg(features_verdict.design.score || 0)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          />

          <div className="relative flex items-center gap-3">
            <div className="text-2xl">{componentIcons['design'] || '📦'}</div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-lg font-bold ${getRatingColor(features_verdict.design.score || 0)}`}
              >
                {features_verdict.design.score?.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400 truncate">Design</div>
            </div>
          </div>

          {/* Rating bar at bottom */}
          <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getRatingBg(features_verdict.design.score || 0)} transition-all duration-500`}
              style={{
                width: `${((features_verdict.design.score || 0) / 10) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="relative bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 overflow-hidden group">
          {/* Gradient background on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getRatingBg(features_verdict.display.score || 0)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          />

          <div className="relative flex items-center gap-3">
            <div className="text-2xl">{componentIcons['display'] || '📦'}</div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-lg font-bold ${getRatingColor(features_verdict.display.score || 0)}`}
              >
                {features_verdict.display.score?.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400 truncate">Display</div>
            </div>
          </div>

          {/* Rating bar at bottom */}
          <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getRatingBg(features_verdict.display.score || 0)} transition-all duration-500`}
              style={{
                width: `${((features_verdict.display.score || 0) / 10) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="relative bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 overflow-hidden group">
          {/* Gradient background on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getRatingBg(features_verdict.camera.score || 0)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          />

          <div className="relative flex items-center gap-3">
            <div className="text-2xl">{componentIcons['camera'] || '📦'}</div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-lg font-bold ${getRatingColor(features_verdict.camera.score || 0)}`}
              >
                {features_verdict.camera.score?.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400 truncate">Camera</div>
            </div>
          </div>

          {/* Rating bar at bottom */}
          <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getRatingBg(features_verdict.camera.score || 0)} transition-all duration-500`}
              style={{
                width: `${((features_verdict.camera.score || 0) / 10) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="relative bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 overflow-hidden group">
          {/* Gradient background on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getRatingBg(features_verdict.audio.score || 0)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          />

          <div className="relative flex items-center gap-3">
            <div className="text-2xl">{componentIcons['audio'] || '📦'}</div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-lg font-bold ${getRatingColor(features_verdict.audio.score || 0)}`}
              >
                {features_verdict.audio.score?.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400 truncate">Audio</div>
            </div>
          </div>

          {/* Rating bar at bottom */}
          <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getRatingBg(features_verdict.audio.score || 0)} transition-all duration-500`}
              style={{
                width: `${((features_verdict.audio.score || 0) / 10) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="relative bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 overflow-hidden group">
          {/* Gradient background on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getRatingBg(features_verdict.performance.score || 0)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          />

          <div className="relative flex items-center gap-3">
            <div className="text-2xl">
              {componentIcons['performance'] || '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-lg font-bold ${getRatingColor(features_verdict.performance.score || 0)}`}
              >
                {features_verdict.performance.score?.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400 truncate">Performance</div>
            </div>
          </div>

          {/* Rating bar at bottom */}
          <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getRatingBg(features_verdict.performance.score || 0)} transition-all duration-500`}
              style={{
                width: `${((features_verdict.performance.score || 0) / 10) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="relative bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 overflow-hidden group">
          {/* Gradient background on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getRatingBg(features_verdict.battery.score || 0)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          />

          <div className="relative flex items-center gap-3">
            <div className="text-2xl">{componentIcons['battery'] || '📦'}</div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-lg font-bold ${getRatingColor(features_verdict.battery.score || 0)}`}
              >
                {features_verdict.battery.score?.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400 truncate">Battery</div>
            </div>
          </div>

          {/* Rating bar at bottom */}
          <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getRatingBg(features_verdict.battery.score || 0)} transition-all duration-500`}
              style={{
                width: `${((features_verdict.battery.score || 0) / 10) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="relative bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 overflow-hidden group">
          {/* Gradient background on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getRatingBg(features_verdict.connectivity.score || 0)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          />

          <div className="relative flex items-center gap-3">
            <div className="text-2xl">
              {componentIcons['connectivity'] || '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-lg font-bold ${getRatingColor(features_verdict.connectivity.score || 0)}`}
              >
                {features_verdict.connectivity.score?.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400 truncate">
                Connectivity
              </div>
            </div>
          </div>

          {/* Rating bar at bottom */}
          <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getRatingBg(features_verdict.connectivity.score || 0)} transition-all duration-500`}
              style={{
                width: `${((features_verdict.connectivity.score || 0) / 10) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="relative bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 overflow-hidden group">
          {/* Gradient background on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getRatingBg(features_verdict.software.score || 0)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          />

          <div className="relative flex items-center gap-3">
            <div className="text-2xl">{componentIcons['software'] || '📦'}</div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-lg font-bold ${getRatingColor(features_verdict.software.score || 0)}`}
              >
                {features_verdict.software.score?.toFixed(1)}
              </div>
              <div className="text-xs text-slate-400 truncate">Software</div>
            </div>
          </div>

          {/* Rating bar at bottom */}
          <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getRatingBg(features_verdict.software.score || 0)} transition-all duration-500`}
              style={{
                width: `${((features_verdict.software.score || 0) / 10) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryByComponentWidget;
