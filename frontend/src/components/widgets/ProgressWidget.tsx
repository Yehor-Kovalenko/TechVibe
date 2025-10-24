import React from 'react';
import type { ProgressWidgetConfig } from '../../types/widget.types';

interface ProgressWidgetProps {
  config: ProgressWidgetConfig;
}

const statusColors: Record<string, string> = {
  active: 'bg-blue-500',
  completed: 'bg-green-500',
  pending: 'bg-gray-500',
};

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({ config }) => {
  const { title, tasks } = config;

  return (
    <div className="widget-card h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>

      <div className="space-y-4 flex-1">
        {tasks.map((task) => (
          <div key={task.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{task.label}</span>
              <span className="text-sm opacity-60">{task.progress}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full ${statusColors[task.status]} transition-all duration-500`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressWidget;
