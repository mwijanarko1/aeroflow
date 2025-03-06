'use client';

import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register the components we need
Chart.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Set default options
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.color = '#6B7280';
Chart.defaults.scale.grid.color = 'rgba(0, 0, 0, 0.1)';

// Export the Chart instance for use in components
export default Chart; 