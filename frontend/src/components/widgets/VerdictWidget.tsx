import React from 'react';
import type { VerdictWidgetConfig } from '../../types/widget.types';

interface VerdictWidgetProps {
  config: VerdictWidgetConfig;
}

const getVerdictColor = (verdict: string) => {
  if (verdict === 'POSITIVE') return 'text-emerald-400';
  if (verdict === 'NEGATIVE') return 'text-red-400';
  if (verdict === 'NEUTRAL') return 'text-yellow-400';
};

const getVerdictGlow = (verdict: string) => {
    if (verdict === 'POSITIVE') return 'shadow-emerald-400/50';
    if (verdict === 'NEGATIVE') return 'shadow-red-400/50';
    if (verdict === 'NEUTRAL') return 'shadow-yellow-400/50';
};

const getVerdictIcon = (verdict: string) => {
    if (verdict === 'POSITIVE') return '✔';
    if (verdict === 'NEGATIVE') return '❌';
    if (verdict === 'NEUTRAL') return '❔';
}

export const VerdictWidget: React.FC<VerdictWidgetProps> = ({ config }) => {
  const { title, verdict, score } = config;

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
               style={{
                   background: `conic-gradient(from 0deg, transparent ${100 - (score * 10)}%, rgba(74, 222, 128, 0.3) ${100 - (score * 10)}%)`
               }}>
          ></div>
          
          {/* Main circle */}
          <div className="relative w-40 h-40 rounded-full flex items-center justify-center"
               style={{
                 background: `conic-gradient(from -90deg, 
                   ${verdict === "POSITIVE" ? '#10b981' : verdict === "NEGATIVE" ? '#ef4444' : '#eab308'} 
                   ${(score / 10) * 100}%, 
                   rgba(255,255,255,0.05) ${(score / 10) * 100}%)`
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