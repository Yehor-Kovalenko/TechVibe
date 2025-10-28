import type { DashboardConfig } from '../types/widget.types';

export const defaultDashboardConfig: DashboardConfig = {
  columns: 3,
  widgets: [
    // Overall Summary - Battery style display
    {
      id: 'overall-summary',
      type: 'summary',
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

    // // Specifications
    // {
    //   id: 'specs-technical',
    //   type: 'specs',
    //   title: 'Technical Specifications',
    //   height: 5,
    //   width: 1,
    //   order: 7,
    //   specs: [
    //     { id: '1', label: 'Processor', value: 'Snapdragon 8 Gen 3', icon: '🔧' },
    //     { id: '2', label: 'RAM', value: '12GB LPDDR5X', icon: '💾' },
    //     { id: '3', label: 'Storage', value: '256GB UFS 4.0', icon: '💿' },
    //     { id: '4', label: 'Display', value: '6.7" AMOLED 120Hz', icon: '📱' },
    //     { id: '5', label: 'Battery', value: '5000mAh', icon: '🔋' },
    //     { id: '6', label: 'Charging', value: '65W Fast Charge', icon: '⚡' },
    //     { id: '7', label: 'OS', value: 'Android 14', icon: '🤖' },
    //     { id: '8', label: 'Weight', value: '195g', icon: '⚖️' },
    //   ],
    // },

    // Pros & Cons
    {
      id: 'pros-cons',
      type: 'proscons',
      title: 'Pros & Cons',
      height: 4,
      width: 2,
      order: 8,
      pros: [
        'Outstanding display quality with vivid colors',
        'Excellent battery life for all-day usage',
        'Premium build quality with attention to detail',
        'Fast and responsive performance',
        'Comprehensive 5G connectivity',
      ],
      cons: [
        'No expandable storage option',
        'Camera struggles in extreme low light',
        'Higher price point than competitors',
        'No headphone jack included',
      ],
    },

    // Final Verdict
    {
      id: 'verdict',
      type: 'verdict',
      title: 'Final Verdict',
      height: 1,
      width: 1,
      order: 9,
      verdict: 'yes'
    }
  ]
}
