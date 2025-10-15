/**
 * @file BalanceChart.tsx
 * @summary A reusable chart component for visualizing data, e.g., using Chart.js.
 */
import React, { useEffect, useRef } from 'react';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
Chart.register(...registerables);

interface ChartProps {
  type: 'bar' | 'line';
  data: ChartConfiguration['data'];
  title: string;
}

const BalanceChart: React.FC<ChartProps> = ({ type, data, title }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstanceRef.current = new Chart(ctx, {
          type: type,
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: title,
                font: {
                    size: 16
                }
              },
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          },
        });
      }
    }

    // Cleanup function to destroy chart on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [type, data, title]);

  return (
    <div className="bg-white shadow rounded-lg p-6 relative h-96">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default BalanceChart;
