import type { DashboardConfig } from '../types/widget.types';

export const defaultDashboardConfig: DashboardConfig = {
  columns: 3,
  widgets: [
    // Overall Summary - Battery style display
    {
      id: 'overall-summary-by-components',
      type: 'summary-components',
      title: 'Overall Score',
      height: 3,
      width: 1,
      order: 1,
      categories: [
        { id: 'performance', label: 'Performance', rating: 8.5, icon: '⚡' },
        { id: 'design', label: 'Design & Build', rating: 9.0, icon: '🎨' },
        { id: 'features', label: 'Features', rating: 2, icon: '⭐' },
        { id: 'value', label: 'Value', rating: 10, icon: '💰' },
        { id: 'usability', label: 'Usability', rating: 8.5, icon: '👤' },
      ],
    },

    // Individual Stats Widgets
    {
      id: 'stats-performance',
      type: 'stats',
      title: 'Performance',
      description: 'Excellent processing power with minimal lag during intensive tasks',
      value: '9.2 GHz',
      rating: 8.5,
      icon: '⚡',
      height: 1,
      width: 1,
      order: 2,
    },
    {
      id: 'stats-battery',
      type: 'stats',
      title: 'Battery Life',
      description: 'Impressive endurance with up to 12 hours of mixed usage',
      value: '12h',
      rating: 9.0,
      icon: '🔋',
      height: 2,
      width: 1,
      order: 3,
    },
    {
      id: 'stats-display',
      type: 'stats',
      title: 'Display Quality',
      description: 'Vibrant OLED panel with excellent color accuracy and brightness',
      value: '4K OLED',
      rating: 9.5,
      icon: '📺',
      height: 1,
      width: 1,
      order: 4,
    },
    {
      id: 'stats-camera',
      type: 'stats',
      title: 'Camera System',
      description: 'Worse than security in the museum',
      value: '0.1px',
      rating: 2.0,
      icon: '📷',
      height: 1,
      width: 1,
      order: 5,
    },
    {
      id: 'stats-connectivity',
      type: 'stats',
      title: 'Connectivity',
      description: '5G support with Wi-Fi 6E and Bluetooth 5.3',
      value: '5G',
      rating: 6,
      icon: '📡',
      height: 1,
      width: 1,
      order: 6,
    },
    // Final Verdict
    {
      id: 'verdict',
      type: 'verdict',
      title: 'Final Verdict',
      height: 1,
      width: 1,
      order: 9,
      verdict: 'NEUTRAL',
      score: 0.9
    },
      // overall sentiment series chart
    {
      id: 'chart-overall-sentiment-series',
      type: 'chart',
      title: 'Sentiment over time',
      y: [2.5, 4.2, 3.8, 5.5, 6.2, 5.8, 7.5, 8.2],
      yAxisName: 'Sentiment',
      labels: ['Start', 'Good', 'Drop', 'Rise', 'Peak', 'Stable', 'High', 'Max'],
      width: 2,
      height: 4
    }
  ],
  summary: {
    sentiment_series: [0.9, 0.0, 0.3, -0.4, 0.2, 0.0, 1.0],
    overall_score: 0.5,
    overall_label: "NEUTRAL"
  }
}
