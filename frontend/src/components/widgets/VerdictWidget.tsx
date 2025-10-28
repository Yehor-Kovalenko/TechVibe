import React from 'react';
import type { VerdictWidgetConfig } from '../../types/widget.types';

interface VerdictWidgetProps {
  config: VerdictWidgetConfig;
}

const getVerdictColor = (verdict: string) => {
  if (verdict === 'yes') return 'text-emerald-400';
  if (verdict === 'no') return 'text-red-400';
};

const getVerdictGlow = (verdict: string) => {
    if (verdict === 'yes') return 'shadow-emerald-400/50';
    if (verdict === 'no') return 'shadow-red-400/50';
};

const getVerdictIcon = (verdict: string) => {
    if (verdict === 'yes') return '✔';
    if (verdict === 'no') return '❌';
}

export const VerdictWidget: React.FC<VerdictWidgetProps> = ({ config }) => {
  const { title, verdict } = config;

  return (
    <div className="widget-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold opacity-80">{title}</h3>
      </div>

      {/* Overall Rating - Large Circular Display */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          {/* Outer glow ring */}
          <div className={`absolute inset-0 rounded-full blur-xl ${getVerdictGlow(verdict)}`}
          ></div>
          
          {/* Main circle */}
          <div className="relative w-40 h-40 rounded-full flex items-center justify-center"
               style={{
               }}>
            <div className="w-[90%] h-[90%] rounded-full bg-[#0f0f14] flex flex-col items-center justify-center">
              <div className={`text-5xl font-bold ${getVerdictColor(verdict)} mb-1`}>
                {getVerdictIcon(verdict)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerdictWidget;