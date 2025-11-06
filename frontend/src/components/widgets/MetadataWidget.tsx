import React from 'react';
import type { MetadataWidgetConfig } from '../../types/widget.types';

interface MetadataWidgetProps {
  config: MetadataWidgetConfig;
}

export const MetadataWidget: React.FC<MetadataWidgetProps> = ({ config }) => (
  <div className="widget-card flex flex-col h-auto">
    <h3 className="text-lg font-semibold mb-1">{config.title}</h3>
    <ul className="text-sm leading-relaxed opacity-75">
      {config.fields.map((field, idx) => (
        <li key={idx}>
          <span className="font-medium">{field.label}: </span>
          <span>{field.value}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default MetadataWidget;
