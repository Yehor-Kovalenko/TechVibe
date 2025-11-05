import React from 'react';
import type { ChartWidgetConfig } from "../../types/widget.types.ts";

interface ChartWidgetProps {
  config: ChartWidgetConfig;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ config }) => {
  const { title, x, y, xAxisName, yAxisName, labels } = config;

  // Generate x values if not provided
  const xValues = x || Array.from({ length: y.length }, (_, i) => i);

  // Calculate bounds with padding
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...y);
  const maxY = Math.max(...y);

  // Add 10% padding to bounds
  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;
  const xPadding = xRange * 0.1;
  const yPadding = yRange * 0.1;

  const chartMinX = minX - xPadding;
  const chartMaxX = maxX + xPadding;
  const chartMinY = minY - yPadding;
  const chartMaxY = maxY + yPadding;

  // SVG dimensions
  const width = 600;
  const height = 400;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scale functions
  const scaleX = (val: number) =>
    padding.left + ((val - chartMinX) / (chartMaxX - chartMinX)) * chartWidth;
  const scaleY = (val: number) =>
    padding.top + chartHeight - ((val - chartMinY) / (chartMaxY - chartMinY)) * chartHeight;

  // Generate path for line
  const linePath = xValues
    .map((xVal, i) => {
      const x1 = scaleX(xVal);
      const y1 = scaleY(y[i]);
      return `${i === 0 ? 'M' : 'L'} ${x1} ${y1}`;
    })
    .join(' ');

  // Generate grid lines
  const gridLinesY = Array.from({ length: 5 }, (_, i) => {
    const value = chartMinY + (chartMaxY - chartMinY) * (i / 4);
    const yPos = scaleY(value);
    return { yPos, value };
  });

  const gridLinesX = Array.from({ length: 5 }, (_, i) => {
    const value = chartMinX + (chartMaxX - chartMinX) * (i / 4);
    const xPos = scaleX(value);
    return { xPos, value };
  });

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 border border-white/10 shadow-xl">
      {title && (
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      )}

      <div className="flex items-center justify-center h-[calc(100%-3rem)]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          style={{ maxHeight: '100%' }}
        >
          {/* Grid lines */}
          {gridLinesY.map((line, i) => (
            <line
              key={`grid-y-${i}`}
              x1={padding.left}
              y1={line.yPos}
              x2={width - padding.right}
              y2={line.yPos}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}
          {gridLinesX.map((line, i) => (
            <line
              key={`grid-x-${i}`}
              x1={line.xPos}
              y1={padding.top}
              x2={line.xPos}
              y2={height - padding.bottom}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Axes */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />

          {/* Y-axis labels */}
          {gridLinesY.map((line, i) => (
            <text
              key={`label-y-${i}`}
              x={padding.left - 10}
              y={line.yPos}
              textAnchor="end"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.6)"
              fontSize="12"
            >
              {line.value.toFixed(1)}
            </text>
          ))}

          {/* X-axis labels */}
          {gridLinesX.map((line, i) => (
            <text
              key={`label-x-${i}`}
              x={line.xPos}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fill="rgba(255,255,255,0.6)"
              fontSize="12"
            >
              {line.value.toFixed(1)}
            </text>
          ))}

          {/* Axis names */}
          {yAxisName && (
            <text
              x={20}
              y={height / 2}
              textAnchor="middle"
              fill="rgba(255,255,255,0.8)"
              fontSize="14"
              fontWeight="500"
              transform={`rotate(-90 20 ${height / 2})`}
            >
              {yAxisName}
            </text>
          )}
          {xAxisName && (
            <text
              x={width / 2}
              y={height - 15}
              textAnchor="middle"
              fill="rgba(255,255,255,0.8)"
              fontSize="14"
              fontWeight="500"
            >
              {xAxisName}
            </text>
          )}

          {/* Line with gradient */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points and labels */}
          {xValues.map((xVal, i) => {
            const cx = scaleX(xVal);
            const cy = scaleY(y[i]);

            return (
              <g key={`point-${i}`}>
                {/* Outer glow */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="8"
                  fill="rgba(16, 185, 129, 0.2)"
                />
                {/* Point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill="#10b981"
                  stroke="#fff"
                  strokeWidth="2"
                />
                {/* Label above point */}
                {labels && labels[i] && (
                  <>
                    <rect
                      x={cx - 25}
                      y={cy - 30}
                      width="50"
                      height="20"
                      rx="4"
                      fill="rgba(0,0,0,0.8)"
                      stroke="rgba(16, 185, 129, 0.5)"
                      strokeWidth="1"
                    />
                    <text
                      x={cx}
                      y={cy - 17}
                      textAnchor="middle"
                      fill="#10b981"
                      fontSize="12"
                      fontWeight="600"
                    >
                      {labels[i]}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};