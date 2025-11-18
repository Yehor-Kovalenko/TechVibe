import type { DashboardConfig } from '../types/widget.types';

export const defaultDashboardConfig: DashboardConfig = {
  columns: 3,
  widgets: [
    // // Overall Summary - Battery style display
    // {
    //   id: 'overall-summary-by-components',
    //   type: 'summary-components',
    //   title: 'Overall Score',
    //   height: 3,
    //   width: 1,
    //   order: 1,
    //   categories: [
    //     { id: 'performance', label: 'Performance', rating: 8.5, icon: '⚡' },
    //     { id: 'design', label: 'Design & Build', rating: 9.0, icon: '🎨' },
    //     { id: 'features', label: 'Features', rating: 2, icon: '⭐' },
    //     { id: 'value', label: 'Value', rating: 10, icon: '💰' },
    //     { id: 'usability', label: 'Usability', rating: 8.5, icon: '👤' },
    //   ],
    // },

    // // Individual Stats Widgets
    // {
    //   id: 'stats-performance',
    //   type: 'stats',
    //   title: 'Performance',
    //   description: 'Excellent processing power with minimal lag during intensive tasks',
    //   value: '9.2 GHz',
    //   rating: 8.5,
    //   icon: '⚡',
    //   height: 1,
    //   width: 1,
    //   order: 2,
    // },
    // {
    //   id: 'stats-battery',
    //   type: 'stats',
    //   title: 'Battery Life',
    //   description: 'Impressive endurance with up to 12 hours of mixed usage',
    //   value: '12h',
    //   rating: 9.0,
    //   icon: '🔋',
    //   height: 2,
    //   width: 1,
    //   order: 3,
    // },
    // {
    //   id: 'stats-display',
    //   type: 'stats',
    //   title: 'Display Quality',
    //   description: 'Vibrant OLED panel with excellent color accuracy and brightness',
    //   value: '4K OLED',
    //   rating: 9.5,
    //   icon: '📺',
    //   height: 1,
    //   width: 1,
    //   order: 4,
    // },
    // {
    //   id: 'stats-camera',
    //   type: 'stats',
    //   title: 'Camera System',
    //   description: 'Worse than security in the museum',
    //   value: '0.1px',
    //   rating: 2.0,
    //   icon: '📷',
    //   height: 1,
    //   width: 1,
    //   order: 5,
    // },
    // {
    //   id: 'stats-connectivity',
    //   type: 'stats',
    //   title: 'Connectivity',
    //   description: '5G support with Wi-Fi 6E and Bluetooth 5.3',
    //   value: '5G',
    //   rating: 6,
    //   icon: '📡',
    //   height: 1,
    //   width: 1,
    //   order: 6,
    // },
    // Final Verdict
    {
      id: 'verdict',
      type: 'verdict',
      title: 'Final Verdict',
      height: 1,
      width: 1,
      // order: 2,
      verdict: 'NEUTRAL',
      score: 0.9,
      dataKey: "verdict"
    },
    // overall sentiment series chart
    {
      id: 'chart-overall-sentiment-series',
      type: 'chart',
      title: 'Sentiment over time',
      // order: 1,
      y: [-1, 1, 0.3, -0.2, 0.0, 0.74, -0.46, 1.0],
      yAxisName: 'Sentiment',
      width: 2,
      height: 4,
      dataKey: "sentiment_series_chart"
    },
    {
      id: 'widget-metadata',
      type: 'metadata',
      title: 'Metadata',
      height: 2,
      width: 2,
      // order: 10,
      fields: [
        { label: 'Uploader', value: 'John Doe' },
        { label: 'Duration', value: '58 min' },
        { label: 'Upload Date', value: '23.01.2025' },
        { label: 'View Count', value: '300000'},
        { label: 'Subtitle Type', value: 'AI Generated'},
      ],
      dataKey: "video-metadata"
    },
    // Review Text Widget
    {
      id: 'review-text-1',
      type: 'review-text',
      title: 'Review Full Text',
      height: 2,
      width: 2,
      // order: 8,
      text: 'This product has an outstanding performance that exceeds expectations. The design is sleek and modern, making it a pleasure to use daily. However, the features are somewhat lacking compared to competitors, which is a downside. Overall, it offers great value for its price point and is user-friendly for all experience levels. Highly recommended for those seeking reliability and efficiency in their tech devices.',
      dataKey: 'full-text'
    },
  ],
  summary: {
    sentiment_series: [0.9, 0.0, 0.3, -0.4, 0.2, 0.0, 1.0],
    overall_score: 0.5,
    overall_label: 'NEUTRAL',
  },
};
