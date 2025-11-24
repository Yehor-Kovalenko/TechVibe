import type { DashboardConfig } from '../types/widget.types';

export const defaultDashboardConfig: DashboardConfig = {
  columns: 3,
  widgets: [
    {
      id: 'overall-summary-by-components',
      type: 'summary-components',
      title: 'Component Ratings',
      height: 3,
      width: 1,
      features_verdict: {
        design: {
          score: 2.6,
          label: 'POSITIVE',
        },
        display: {
          score: 2.8,
          label: 'POSITIVE',
        },
        camera: {
          score: 2.0,
          label: 'POSITIVE',
        },
        audio: {
          score: 2.0,
          label: 'POSITIVE',
        },
        performance: {
          score: 2.0,
          label: 'POSITIVE',
        },
        battery: {
          score: 2.0,
          label: 'POSITIVE',
        },
        connectivity: {
          score: 2.1,
          label: 'POSITIVE',
        },
        software: {
          score: 2.9,
          label: 'POSITIVE',
        },
      },
      dataKey: 'sentiment_by_part',
    },
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
      dataKey: 'verdict',
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
      dataKey: 'sentiment_series_chart',
    },
    {
      id: 'widget-metadata',
      type: 'metadata',
      title: 'Metadata',
      height: 2,
      width: 2,
      duration: 58,
      uploader: 'John Doe',
      upload_date: '23.01.2025',
      view_count: 300000,
      subtitle_type: 'AI Generated',
      dataKey: 'video-metadata',
    },
    // Review Text Widget
    {
      id: 'review-text-1',
      type: 'review-text',
      title: 'Review Full Text',
      height: 2,
      width: 2,
      // order: 8,
      transcript:
        'This product has an outstanding performance that exceeds expectations. The design is sleek and modern, making it a pleasure to use daily. However, the features are somewhat lacking compared to competitors, which is a downside. Overall, it offers great value for its price point and is user-friendly for all experience levels. Highly recommended for those seeking reliability and efficiency in their tech devices.',
      dataKey: 'full-text',
    },
  ],
  summary: {
    sentiment_series: [0.9, 0.0, 0.3, -0.4, 0.2, 0.0, 1.0],
    overall_score: 0.5,
    overall_label: 'NEUTRAL',
  },
};
