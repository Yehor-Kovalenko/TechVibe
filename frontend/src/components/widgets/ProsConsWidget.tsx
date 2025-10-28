import React from 'react';
import type { ProsConsWidgetConfig } from '../../types/widget.types';

interface ProsConsWidgetProps {
  config: ProsConsWidgetConfig;
}

export const ProsConsWidget: React.FC<ProsConsWidgetProps> = ({ config }) => {
  const { title, pros, cons } = config;

  return (
    <div className="widget-card h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      
      <div className="grid md:grid-cols-2 gap-4 flex-1">
        {/* Pros Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 font-bold">✓</span>
            </div>
            <h4 className="font-semibold text-green-400">Pros</h4>
          </div>
          <ul className="space-y-2">
            {pros.map((pro, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-green-400 mt-0.5">•</span>
                <span className="opacity-80">{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-red-400 font-bold">✕</span>
            </div>
            <h4 className="font-semibold text-red-400">Cons</h4>
          </div>
          <ul className="space-y-2">
            {cons.map((con, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-red-400 mt-0.5">•</span>
                <span className="opacity-80">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProsConsWidget;