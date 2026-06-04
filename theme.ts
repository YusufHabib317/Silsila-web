import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [
      '#ebf8ff',
      '#dbeafe',
      '#bfdbfe',
      '#93c5fd',
      '#60a5fa',
      '#3b82f6',
      '#2563eb',
      '#1d4ed8',
      '#1e40af',
      '#1e3a8a',
    ],
    // Red / danger
    danger: [
      '#fdf2f2',
      '#fbe5e5',
      '#f7cbcb',
      '#f0a0a0',
      '#e87272',
      '#eb7d7d',
      '#E53E3E',
      '#bf3434',
      '#9a2525',
      '#7a1818',
    ],
    // Green / success
    success: [
      '#f0fdf4',
      '#dcfce7',
      '#bbf7d0',
      '#86efac',
      '#4ade80',
      '#22c55e',
      '#16a34a',
      '#15803d',
      '#166534',
      '#14532d',
    ],
  },
});
