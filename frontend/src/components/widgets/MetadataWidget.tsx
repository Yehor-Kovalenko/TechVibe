import React from 'react';
import type { MetadataWidgetConfig } from '../../types/widget.types';

interface MetadataWidgetProps {
  config: MetadataWidgetConfig;
}

function formatDate(uploadDate: string) {
  // ожидает строку вида "yyyymmdd"
  if (!uploadDate || uploadDate.length !== 8) return uploadDate;
  const year = uploadDate.slice(0, 4);
  const month = uploadDate.slice(4, 6);
  const day = uploadDate.slice(6, 8);
  return `${day}.${month}.${year}`;
}

function formatDuration(seconds: number) {
  if (typeof seconds !== 'number' || isNaN(seconds)) return seconds;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min} min ${sec} sec`;
}

export const MetadataWidget: React.FC<MetadataWidgetProps> = ({ config }) => (
  <div className="widget-card flex flex-col h-auto">
    <h3 className="text-lg font-semibold mb-1">{config.title}</h3>
    <ul className="text-sm leading-relaxed opacity-75">
      <li>
        <span className="font-medium">Duration: </span>
        <span>{formatDuration(config.duration)}</span>
      </li>
      <li>
        <span className="font-medium">Uploader: </span>
        <span>{config.uploader}</span>
      </li>
      <li>
        <span className="font-medium">Upload Date: </span>
        <span>{formatDate(config.upload_date)}</span>
      </li>
      <li>
        <span className="font-medium">View Count: </span>
        <span>{config.view_count}</span>
      </li>
      <li>
        <span className="font-medium">Subtitle Type: </span>
        <span>{config.subtitle_type}</span>
      </li>
    </ul>
  </div>
);

export default MetadataWidget;
