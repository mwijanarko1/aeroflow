'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import '../lib/chartConfig';
import { Coordinates } from '../types/xfoil';

interface AirfoilVisualizerProps {
  coordinates: Coordinates;
  title?: string;
}

export default function AirfoilVisualizer({ coordinates, title = 'Airfoil Geometry' }: AirfoilVisualizerProps) {
  // Calculate chart bounds to maintain proper scaling
  const xMin = coordinates.length > 0 ? Math.min(...coordinates.map(([x]) => x)) : 0;
  const xMax = coordinates.length > 0 ? Math.max(...coordinates.map(([x]) => x)) : 1;
  const yMin = coordinates.length > 0 ? Math.min(...coordinates.map(([_, y]) => y)) : -0.2;
  const yMax = coordinates.length > 0 ? Math.max(...coordinates.map(([_, y]) => y)) : 0.2;
  
  // Calculate padding to maintain aspect ratio
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  const padding = Math.max(xRange, yRange) * 0.1;

  // Ensure equal scaling on both axes for proper airfoil visualization
  // This is important to avoid distortion of the airfoil shape
  const aspectRatio = xRange / yRange;
  const equalScaling = {
    x: {
      min: xMin - padding,
      max: xMax + padding,
    },
    y: {
      min: yMin - padding * aspectRatio,
      max: yMax + padding * aspectRatio,
    }
  };

  const chartData = {
    datasets: [
      {
        label: 'Airfoil Profile',
        data: coordinates.map(([x, y]) => ({ x, y })),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear' as const,
        position: 'center' as const,
        min: equalScaling.x.min,
        max: equalScaling.x.max,
        title: {
          display: true,
          text: 'x/c',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawTicks: true,
        }
      },
      y: {
        type: 'linear' as const,
        position: 'center' as const,
        min: equalScaling.y.min,
        max: equalScaling.y.max,
        title: {
          display: true,
          text: 'y/c',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawTicks: true,
        }
      },
    },
    plugins: {
      title: {
        display: true,
        text: title,
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false // Disable tooltips for cleaner visualization
      }
    },
  };

  return (
    <div className="h-[400px] w-full">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
} 