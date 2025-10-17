/**
 * @file SpendChart.tsx
 * @summary A component to visualize grocery spending, toggleable between daily and monthly views.
 */
import React, { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { GroceryItem } from '../types';
import { useTheme } from '../App';
import { formatCurrencyShort } from '../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SpendChartProps {
  groceries: GroceryItem[];
}

const SpendChart: React.FC<SpendChartProps> = ({ groceries }) => {
  const { theme } = useTheme();
  const [view, setView] = useState<'daily' | 'monthly'>('daily');

  const monthlyChartData = useMemo(() => {
    const monthlyTotals = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    groceries.forEach(item => {
      const itemDate = new Date(item.date);
      if (itemDate.getFullYear() === currentYear) {
        const month = itemDate.getMonth(); // 0-11
        monthlyTotals[month] += item.amount;
      }
    });

    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Monthly Grocery Spend',
          data: monthlyTotals,
          backgroundColor: 'rgba(79, 70, 229, 0.8)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [groceries]);

  const dailyChartData = useMemo(() => {
    const dailyTotals = new Map<string, number>();
    const labels: string[] = [];
    const data: number[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize map and labels for the last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today.valueOf());
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        dailyTotals.set(dateString, 0);
    }
    
    // Populate totals from grocery data
    groceries.forEach(item => {
        const itemDateStr = item.date.split('T')[0];
        if (dailyTotals.has(itemDateStr)) {
            dailyTotals.set(itemDateStr, (dailyTotals.get(itemDateStr) || 0) + item.amount);
        }
    });

    // Extract data in the correct order
    for (const total of dailyTotals.values()) {
        data.push(total);
    }
    
    return {
        labels,
        datasets: [
             {
                label: 'Daily Grocery Spend',
                data: data,
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ]
    };
  }, [groceries]);

  const chartData = view === 'daily' ? dailyChartData : monthlyChartData;

  const chartOptions: ChartOptions<'bar'> = useMemo(() => {
    const textColor = theme === 'dark' ? 'rgba(229, 231, 235, 0.8)' : 'rgba(55, 65, 81, 1)';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(200, 200, 200, 0.2)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: view === 'daily' 
            ? 'Daily Spending (Last 30 Days)'
            : `Monthly Spending for ${new Date().getFullYear()}`,
          color: textColor,
          font: {
              size: 18,
              weight: 'bold',
          },
          padding: {
              bottom: 20,
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += formatCurrencyShort(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            callback: function(value) {
              if (typeof value === 'number') {
                  return formatCurrencyShort(value);
              }
              return value;
            }
          },
          grid: {
              color: gridColor,
          }
        },
        x: {
           ticks: {
             color: textColor
           },
           grid: {
              display: false,
          }
        }
      },
    };
  }, [theme, view]);


  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="flex justify-end mb-4 space-x-2">
            <button
                onClick={() => setView('daily')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    view === 'daily' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
                Day to Day
            </button>
            <button
                onClick={() => setView('monthly')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    view === 'monthly' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
                Month to Month
            </button>
        </div>
        <div style={{ height: '350px' }}>
             <Bar options={chartOptions} data={chartData} />
        </div>
    </div>
  );
};

export default SpendChart;